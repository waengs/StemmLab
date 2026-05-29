import { Accelerometer } from 'expo-sensors';

export const BREATH_RECORD_SEC = 60;
const SAMPLE_INTERVAL_MS = 100;
const GRAVITY_MS2 = 9.81;
const MOVEMENT_CM_SCALE = 2.2;
const MIN_PEAK_DISTANCE_MS = 1100;
const SMOOTH_WINDOW = 5;

export interface BreathingSample {
  timestamp: number;
  amplitude: number;
}

export interface BreathingRecordingResult {
  breathsPerMinute: string;
  sensorBreathCount: string;
  movementAvg: string;
  movementPeak: string;
  recordingDuration: string;
}

export async function isBreathingSensorAvailable(): Promise<boolean> {
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

function smooth(values: number[], window: number): number[] {
  return values.map((_, index) => {
    const start = Math.max(0, index - window + 1);
    const slice = values.slice(start, index + 1);
    return slice.reduce((sum, value) => sum + value, 0) / slice.length;
  });
}

function countBreathPeaks(amplitudes: number[]): number {
  if (amplitudes.length < 10) return 0;

  const smoothed = smooth(amplitudes, SMOOTH_WINDOW);
  const average = smoothed.reduce((sum, value) => sum + value, 0) / smoothed.length;
  const threshold = average * 1.12 + 0.02;

  let peaks = 0;
  let lastPeakAt = -MIN_PEAK_DISTANCE_MS;

  for (let i = 2; i < smoothed.length - 2; i += 1) {
    const current = smoothed[i];
    const isPeak =
      current > threshold &&
      current > smoothed[i - 1] &&
      current >= smoothed[i + 1] &&
      current > smoothed[i - 2] &&
      current >= smoothed[i + 2];

    if (!isPeak) continue;

    const timestampMs = i * SAMPLE_INTERVAL_MS;
    if (timestampMs - lastPeakAt >= MIN_PEAK_DISTANCE_MS) {
      peaks += 1;
      lastPeakAt = timestampMs;
    }
  }

  return peaks;
}

function processBreathingSamples(samples: BreathingSample[], durationSec: number): BreathingRecordingResult {
  if (samples.length === 0) {
    return {
      breathsPerMinute: '0',
      sensorBreathCount: '0',
      movementAvg: '0.0',
      movementPeak: '0.0',
      recordingDuration: String(Math.max(durationSec, 1)),
    };
  }

  const amplitudes = samples.map((sample) => sample.amplitude);
  const avg = amplitudes.reduce((sum, value) => sum + value, 0) / amplitudes.length;
  const peak = Math.max(...amplitudes);
  const sensorBreathCount = countBreathPeaks(amplitudes);
  const minutes = Math.max(durationSec / 60, 1 / 60);
  const breathsPerMinute = Math.round(sensorBreathCount / minutes);

  return {
    breathsPerMinute: String(breathsPerMinute),
    sensorBreathCount: String(sensorBreathCount),
    movementAvg: (avg * MOVEMENT_CM_SCALE).toFixed(1),
    movementPeak: (peak * MOVEMENT_CM_SCALE).toFixed(1),
    recordingDuration: durationSec.toFixed(0),
  };
}

export async function recordBreathing(
  durationSec: number,
  onTick: (remainingSec: number) => void,
  onLiveReading?: (movementCm: number) => void
): Promise<{ stop: () => BreathingRecordingResult; complete: Promise<BreathingRecordingResult> }> {
  const available = await isBreathingSensorAvailable();
  if (!available) {
    throw new Error('Accelerometer is not available on this device.');
  }

  Accelerometer.setUpdateInterval(SAMPLE_INTERVAL_MS);

  const samples: BreathingSample[] = [];
  let elapsedSec = 0;
  let finished = false;
  let countdownTimer: ReturnType<typeof setInterval> | null = null;
  let resolveComplete: ((result: BreathingRecordingResult) => void) | null = null;

  const completePromise = new Promise<BreathingRecordingResult>((resolve) => {
    resolveComplete = resolve;
  });

  const subscription = Accelerometer.addListener(({ x, y, z }) => {
    if (finished) return;
    const amplitude = deviationFromRest(x, y, z);
    samples.push({ timestamp: Date.now(), amplitude });
    onLiveReading?.(amplitude * MOVEMENT_CM_SCALE);
  });

  const finish = () => {
    if (finished) return processBreathingSamples(samples, Math.max(elapsedSec, 1));
    finished = true;
    subscription.remove();
    if (countdownTimer) clearInterval(countdownTimer);
    const result = processBreathingSamples(samples, Math.max(elapsedSec, 1));
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
