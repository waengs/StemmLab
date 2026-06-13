import type { TFunction } from 'i18next';

/** Stored in form data / scoring (stable English keys). */
export const EARTHQUAKE_PRESET_DESIGNS = [
  '4 folds + 4 pillars',
  '10 folds + 4 pillars',
  '3 folds and 6 pillars',
] as const;

export type EarthquakePresetDesign = (typeof EARTHQUAKE_PRESET_DESIGNS)[number];

export const EARTHQUAKE_INTENSITY_KEYS = ['low', 'medium', 'high', 'extreme'] as const;
export type EarthquakeIntensityKey = (typeof EARTHQUAKE_INTENSITY_KEYS)[number];

const LEGACY_INTENSITY: Record<string, EarthquakeIntensityKey> = {
  Low: 'low',
  Medium: 'medium',
  High: 'high',
  Extreme: 'extreme',
};

export function normalizeEarthquakeIntensity(value: string): EarthquakeIntensityKey {
  if (EARTHQUAKE_INTENSITY_KEYS.includes(value as EarthquakeIntensityKey)) {
    return value as EarthquakeIntensityKey;
  }
  return LEGACY_INTENSITY[value] ?? 'medium';
}

export function getEarthquakeDesignLabels(t: TFunction): Record<string, string> {
  return {
    '4 folds + 4 pillars': t('data.activities.earthquake.designFolds4Pillars4'),
    '10 folds + 4 pillars': t('data.activities.earthquake.designFolds10Pillars4'),
    '3 folds and 6 pillars': t('data.activities.earthquake.designFolds3Pillars6'),
  };
}

export function getEarthquakeIntensityLabels(t: TFunction): Record<EarthquakeIntensityKey, string> {
  return {
    low: t('data.activities.earthquake.intensityLow'),
    medium: t('data.activities.earthquake.intensityMedium'),
    high: t('data.activities.earthquake.intensityHigh'),
    extreme: t('data.activities.earthquake.intensityExtreme'),
  };
}

export function resolveEarthquakeDesign(design: string, t: TFunction): string {
  const labels = getEarthquakeDesignLabels(t);
  if (labels[design]) return labels[design];

  const enMatch = design.match(/^Design\s+(\d+)$/i);
  if (enMatch) {
    return t('data.activities.earthquake.designN', { n: Number(enMatch[1]) });
  }

  const idMatch = design.match(/^Desain\s+(\d+)$/i);
  if (idMatch) {
    return t('data.activities.earthquake.designN', { n: Number(idMatch[1]) });
  }

  return design;
}

export function resolveEarthquakeIntensity(intensity: string, t: TFunction): string {
  const key = normalizeEarthquakeIntensity(intensity);
  return getEarthquakeIntensityLabels(t)[key];
}

export function newExtraEarthquakeDesignId(trialCount: number): string {
  return `Design ${trialCount}`;
}

export function getVibrationPattern(intensity: string): number[] {
  const key = normalizeEarthquakeIntensity(intensity);
  switch (key) {
    case 'low':
      return [0, 200, 200];
    case 'medium':
      return [0, 500, 200];
    case 'high':
      return [0, 2000, 100];
    case 'extreme':
      return [0, 5000, 50];
    default:
      return [0, 500, 200];
  }
}

export function designOptionsForTrial(design: string): string[] {
  const options: string[] = [...EARTHQUAKE_PRESET_DESIGNS];
  if (design && !options.includes(design as EarthquakePresetDesign)) {
    options.push(design);
  }
  return options;
}
