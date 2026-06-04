import * as Haptics from 'expo-haptics';
import i18n from '../i18n';

export const PRE_COUNTDOWN_SEC = 3;
export const RECORD_SEC = 10;
export const DEFAULT_RECORD_SEC = 10;
export const MIN_RECORD_SEC = 5;
export const MAX_RECORD_SEC = 60;

async function speak(text: string) {
  try {
    const Speech = await import('expo-speech');
    const lang = i18n.language?.startsWith('id') ? 'id-ID' : 'en-US';
    await new Promise<void>((resolve) => {
      Speech.speak(text, {
        language: lang,
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

function countdownWord(count: number): string {
  const keys: Record<number, string> = {
    3: 'sounds.countThree',
    2: 'sounds.countTwo',
    1: 'sounds.countOne',
  };
  const key = keys[count];
  return key ? i18n.t(key) : String(count);
}

/** Short tick during 3-2-1 countdown */
export async function playCountdownBeep(count: number) {
  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  await speak(countdownWord(count));
}

/** Recording starts */
export async function playStartBeep() {
  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  await speak(i18n.t('sounds.go'));
}

/** Quick cue when movement is too shaky (feedback round) */
export async function playShakyAlert() {
  await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  await speak(i18n.t('sounds.slow'));
}

/** Recording finished — success haptic + spoken cue */
export async function playFinishDone() {
  await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  await speak(i18n.t('sounds.done'));
}

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
