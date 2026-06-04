import type { TFunction } from 'i18next';

export type MovementId = 'circle' | 'figure8' | 'upDown' | 'sideToSide';

export const MOVEMENT_IDS: MovementId[] = ['circle', 'figure8', 'upDown', 'sideToSide'];

export function getMovementLabel(id: MovementId, t: TFunction): string {
  return t(`data.activities.human-performance.movements.${id}`);
}

export function getMovementDefinitions(t: TFunction): { id: MovementId; label: string }[] {
  return MOVEMENT_IDS.map((id) => ({ id, label: getMovementLabel(id, t) }));
}

/** Match stored label (English or Indonesian) back to movement id. */
export function movementIdFromLabel(label: string, t: TFunction): MovementId | undefined {
  for (const id of MOVEMENT_IDS) {
    if (label === id || label === getMovementLabel(id, t)) return id;
  }
  const legacy: Record<string, MovementId> = {
    Circle: 'circle',
    'Figure of 8': 'figure8',
    'Up and down': 'upDown',
    'Side to side': 'sideToSide',
  };
  return legacy[label];
}

export function resolveMovementLabel(label: string, t: TFunction): string {
  const id = movementIdFromLabel(label, t);
  return id ? getMovementLabel(id, t) : label;
}
