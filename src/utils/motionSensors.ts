import { Accelerometer } from 'expo-sensors';

const GRAVITY_MS2 = 9.81;
const VIBRATION_CM_SCALE = 1.8;
const ROM_CM_SCALE = 14;
const SHAKY_THRESHOLD_CM = 5.5;
const SHAKY_ALERT_COOLDOWN_MS = 900;
export interface MotionSample {
  timestamp: number;
  deviation: number;
}

export interface MotionRecordingResult {
  vibrationAvg: string;
  speedAvg: string;
  smoothness: string;
  rangeOfMotion: string;
  movementTime: string;
}

export async function isMotionSensorAvailable(): Promise<boolean> {
  try {
    return await Accelerometer.isAvailableAsync();
  } catch {
    return false;
  }
}

function deviationFromRest(x: number, y: number, z: number): number {
  const totalG = Math.sqrt(x * x + y * y + z * z);
  return Math.abs(totalG - 1) * GRAVITY_MS2;
}

function processSamples(samples: MotionSample[], durationSec: number): MotionRecordingResult {
  if (samples.length === 0) {
    return {
      vibrationAvg: '0.0',
      speedAvg: '0.00',
      smoothness: '0.0',
      rangeOfMotion: '0.0',
      movementTime: String(Math.max(durationSec, 1)),
    };
  }

  const deviations = samples.map((s) => s.deviation);
  const avg = deviations.reduce((a, b) => a + b, 0) / deviations.length;
  const variance = deviations.reduce((sum, d) => sum + (d - avg) ** 2, 0) / deviations.length;
  const smoothness = Math.max(1, Math.min(10, 10 - Math.sqrt(variance) * 0.45)).toFixed(1);
  const peak = Math.max(...deviations);
  const trough = Math.min(...deviations);
  const rangeOfMotion = ((peak - trough) * ROM_CM_SCALE).toFixed(1);
  const vibrationAvg = (avg * VIBRATION_CM_SCALE).toFixed(1);
  const speedAvg = (parseFloat(rangeOfMotion) / 100 / Math.max(durationSec, 0.1)).toFixed(2);

  return {
    vibrationAvg,
    speedAvg,
    smoothness,
    rangeOfMotion,
    movementTime: durationSec.toFixed(1),
  };
}

/**
 * Records phone accelerometer data for up to `durationSec` seconds.
 * Returns a stop function so the caller can end early.
 */
export async function recordMotion(
  durationSec: number,
  withFeedback: boolean,
  onTick: (remainingSec: number) => void,
  onLiveReading?: (vibrationCm: number, isShaky: boolean) => void,
  onShakyAlert?: () => void
): Promise<{  stop: () => MotionRecordingResult;
  complete: Promise<MotionRecordingResult>;
}> {
  const available = await isMotionSensorAvailable();
  if (!available) {
    throw new Error('Accelerometer is not available on this device.');
  }

  Accelerometer.setUpdateInterval(100);

  const samples: MotionSample[] = [];
  let elapsedSec = 0;
  let finished = false;
  let countdownTimer: ReturnType<typeof setInterval> | null = null;
  let lastShakyAlertAt = 0;
  let resolveComplete: ((result: MotionRecordingResult) => void) | null = null;

  const completePromise = new Promise<MotionRecordingResult>((resolve) => {
    resolveComplete = resolve;
  });

  const subscription = Accelerometer.addListener(({ x, y, z }) => {    if (finished) return;
    const deviation = deviationFromRest(x, y, z);
    samples.push({ timestamp: Date.now(), deviation });
    const vibrationCm = deviation * VIBRATION_CM_SCALE;
    const isShaky = vibrationCm > SHAKY_THRESHOLD_CM;
    onLiveReading?.(vibrationCm, isShaky);

    if (withFeedback && isShaky && Date.now() - lastShakyAlertAt > SHAKY_ALERT_COOLDOWN_MS) {
      lastShakyAlertAt = Date.now();
      onShakyAlert?.();
    }
  });
  const finish = () => {
    if (finished) return processSamples(samples, Math.max(elapsedSec, 1));
    finished = true;
    subscription.remove();
    if (countdownTimer) clearInterval(countdownTimer);
    const actualDuration = Math.max(elapsedSec, 1);
    const result = processSamples(samples, actualDuration);
    resolveComplete?.(result);
    return result;
  };

  onTick(durationSec);
  countdownTimer = setInterval(() => {
    elapsedSec += 1;
    const remaining = durationSec - elapsedSec;
    if (remaining <= 0) {
      finish();
    } else {
      onTick(remaining);
    }
  }, 1000);

  return {
    stop: finish,
    complete: completePromise,
  };
}
