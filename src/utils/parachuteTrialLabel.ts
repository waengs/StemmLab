import type { TFunction } from 'i18next';

/** Resolve stored trial label (any locale) to the current UI language. */
export function resolveParachuteTrialLabel(label: string | undefined, t: TFunction): string {
  if (!label) return '';
  const baselineEn = 'Baseline (No Parachute)';
  const baselineIdPrefix = 'Dasar';
  if (label === baselineEn || label.startsWith(baselineIdPrefix)) {
    return t('data.activities.parachute-drop.baseline');
  }

  const enMatch = label.match(/^Design\s+(\d+)$/i);
  if (enMatch) {
    return t('data.activities.parachute-drop.designN', { n: Number(enMatch[1]) });
  }

  const idMatch = label.match(/^Desain\s+(\d+)$/i);
  if (idMatch) {
    return t('data.activities.parachute-drop.designN', { n: Number(idMatch[1]) });
  }

  return label;
}

export function isParachuteBaselineTrial(label?: string): boolean {
  if (!label) return false;
  return (
    label === 'Baseline (No Parachute)' ||
    label.startsWith('Dasar') ||
    label === 'Baseline (No parachute)'
  );
}
