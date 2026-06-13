import type { TFunction } from 'i18next';

export type MovementId = 'circle' | 'figure8' | 'upDown' | 'sideToSide';

export const MOVEMENT_IDS: MovementId[] = ['circle', 'figure8', 'upDown', 'sideToSide'];

export function getMovementLabel(id: MovementId | string, t: TFunction): string {
  if (id === '1' || id === 'circle') return t(`data.activities.human-performance.movements.circle`, { defaultValue: 'Circle' });
  if (id === '2' || id === 'figure8') return t(`data.activities.human-performance.movements.figure8`, { defaultValue: 'Figure of 8' });
  if (id === '3' || id === 'upDown') return t(`data.activities.human-performance.movements.upDown`, { defaultValue: 'Up and down' });
  if (id === '4' || id === 'sideToSide') return t(`data.activities.human-performance.movements.sideToSide`, { defaultValue: 'Side to side' });
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
