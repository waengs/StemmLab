import type { TFunction } from 'i18next';
import type { SensorLog } from '../types';
import { getSensorChipLabel } from './sensorChip';
import { getBatteryLogDisplayLines } from './batteryLog';
import { parseSlowMoLogData, parseVibrationLogData } from './slowMoLog';
import { matchesSearch } from './search';

/** Searchable text for a log (sensor name, chip, notes, readings — not raw video URLs). */
export function getSensorLogSearchText(log: SensorLog, t: TFunction): string {
  const sensorName = t(`data.sensors.${log.sensorType}.name`, { defaultValue: log.sensorType });
  const chip = getSensorChipLabel(log.sensorType, t);
  const data = String(log.data);
  const parts: string[] = [sensorName, chip];

  if (log.sensorType === 'slow-mo') {
    const { notes } = parseSlowMoLogData(data);
    if (notes.trim()) parts.push(notes.trim());
  } else if (log.sensorType === 'vibration') {
    const { stats, notes } = parseVibrationLogData(data);
    parts.push(...stats);
    if (notes.trim()) parts.push(notes.trim());
  } else if (log.sensorType === 'battery') {
    const { stats, notes } = getBatteryLogDisplayLines(data, t);
    parts.push(...stats);
    if (notes.trim()) parts.push(notes.trim());
  } else if (data.includes('\nNotes: ')) {
    const splitIdx = data.indexOf('\nNotes: ');
    const main = data.substring(0, splitIdx);
    const notePart = data.substring(splitIdx + '\nNotes: '.length);
    if (main.trim()) parts.push(main.trim());
    if (notePart?.trim()) parts.push(notePart.trim());
  } else if (data.trim()) {
    parts.push(data.trim());
  }

  return parts.join(' ');
}

export function filterSensorLogsBySearch(
  logs: SensorLog[],
  query: string,
  t: TFunction
): SensorLog[] {
  return logs.filter((log) => matchesSearch(getSensorLogSearchText(log, t), query));
}
