import type { TFunction } from 'i18next';

export const HAND_FAN_MATERIALS = ['Paper', 'Cardboard'] as const;
export const HAND_FAN_DESIGNS = [
  'Paper, Wide Fold',
  'Paper, Narrow Fold',
  'Cardboard, Wide Fold',
  'Cardboard, Narrow Fold',
] as const;
export const HAND_FAN_DISTANCES = ['15cm', '30cm', '45cm'] as const;

export type HandFanMaterial = (typeof HAND_FAN_MATERIALS)[number];
export type HandFanDesign = (typeof HAND_FAN_DESIGNS)[number];

export function getHandFanMaterialLabels(t: TFunction): Record<string, string> {
  return {
    Paper: t('data.activities.hand-fan.materialPaper'),
    Cardboard: t('data.activities.hand-fan.materialCardboard'),
  };
}

export function getHandFanDesignLabels(t: TFunction): Record<string, string> {
  return {
    'Paper, Wide Fold': t('data.activities.hand-fan.designPaperWide'),
    'Paper, Narrow Fold': t('data.activities.hand-fan.designPaperNarrow'),
    'Cardboard, Wide Fold': t('data.activities.hand-fan.designCardboardWide'),
    'Cardboard, Narrow Fold': t('data.activities.hand-fan.designCardboardNarrow'),
  };
}

export function resolveHandFanMaterial(material: string, t: TFunction): string {
  return getHandFanMaterialLabels(t)[material] ?? material;
}

export function resolveHandFanDesign(design: string, t: TFunction): string {
  return getHandFanDesignLabels(t)[design] ?? design;
}
