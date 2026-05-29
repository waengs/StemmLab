import * as Haptics from 'expo-haptics';

export const PRE_COUNTDOWN_SEC = 3;
export const RECORD_SEC = 10;

async function speak(text: string) {
  try {
    const Speech = await import('expo-speech');
    await new Promise<void>((resolve) => {
      Speech.speak(text, {
        rate: 1.15,
        onDone: () => resolve(),
        onStopped: () => resolve(),
        onError: () => resolve(),
      });
      setTimeout(resolve, 900);
    });
  } catch {
    // Haptics-only fallback when speech module unavailable
  }
}

/** Short tick during 3-2-1 countdown */
export async function playCountdownBeep(count: number) {
  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  await speak(String(count));
}

/** Recording starts */
export async function playStartBeep() {
  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  await speak('Go');
}

/** Quick cue when movement is too shaky (feedback round) */
export async function playShakyAlert() {
  await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  await speak('Slow');
}

/** Recording finished — success haptic + spoken cue */
export async function playFinishDone() {
  await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  await speak('Done');
}

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
