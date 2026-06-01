import type { TFunction } from 'i18next';
import { matchesSearch } from './search';
import { getSensorChipLabel } from './sensorChip';

function getSensorLabel(activityId: string, sensorId: string, t: TFunction): string {
  const chipLabel = t(`data.activities.${activityId}.chips.${sensorId}`, { defaultValue: '' });
  if (chipLabel) return chipLabel;

  return getSensorChipLabel(sensorId, t);
}

/** Text blob used to match activity list search (name, description, category, sensor types). */
export function getActivitySearchText(
  activityId: string,
  name: string,
  description: string,
  category: string,
  sensors: string[],
  t: TFunction
): string {
  const sensorLabels = sensors.map((sensorId) => getSensorLabel(activityId, sensorId, t));
  const sensorIds = sensors.join(' ');

  return [
    t(`data.activities.${activityId}.name`, { defaultValue: name }),
    t(`data.activities.${activityId}.desc`, { defaultValue: description }),
    t(`data.categories.${category}`, { defaultValue: category }),
    ...sensorLabels,
    sensorIds,
  ].join(' ');
}

export function activityMatchesSearch(
  activityId: string,
  name: string,
  description: string,
  category: string,
  sensors: string[],
  query: string,
  t: TFunction
): boolean {
  return matchesSearch(getActivitySearchText(activityId, name, description, category, sensors, t), query);
}
