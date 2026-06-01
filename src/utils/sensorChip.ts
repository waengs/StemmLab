import type { TFunction } from 'i18next';

/** Default hardware-type labels (aligned with activity list chips). */
export const SENSOR_CHIP_DEFAULTS: Record<string, string> = {
  'slow-mo': 'Camera',
  'sound-meter': 'Microphone',
  location: 'GPS',
  vibration: 'Accelerometer',
  'reaction-timer': 'Touchscreen',
  'phone-vibration': 'Vibration motor',
};

export function getSensorChipLabel(sensorId: string, t: TFunction): string {
  return t(`data.sensors.${sensorId}.chip`, {
    defaultValue: SENSOR_CHIP_DEFAULTS[sensorId] ?? sensorId.replace(/-/g, ' '),
  });
}
