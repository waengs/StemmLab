import type { TFunction } from 'i18next';
import type { ForumAttachment, SensorLog } from '../types';
import { getSensorChipLabel } from './sensorChip';
import { getBatteryLogDisplayLines } from './batteryLog';
import { parseSlowMoLogData, parseVibrationLogData } from './slowMoLog';

export type SensorLogForumSharePayload = {
  title: string;
  content: string;
  categoryId: string;
  attachments?: ForumAttachment[];
};

function isRemoteUrl(value: string): boolean {
  return /^https?:\/\//i.test(value.trim());
}

export function buildSensorLogForumShare(log: SensorLog, t: TFunction): SensorLogForumSharePayload {
  const sensorName = t(`data.sensors.${log.sensorType}.name`, { defaultValue: log.sensorType });
  const chip = getSensorChipLabel(log.sensorType, t);
  const recordedAt = new Date(log.timestamp).toLocaleString();

  const title = t('sensors.shareForum.title', { sensor: sensorName });
  const lines: string[] = [
    t('sensors.shareForum.intro'),
    '',
    t('sensors.shareForum.sensorLine', { sensor: sensorName, chip }),
    t('sensors.shareForum.timeLine', { time: recordedAt }),
    '',
  ];

  let attachments: ForumAttachment[] | undefined;
  const data = String(log.data);

  if (log.sensorType === 'slow-mo') {
    const { videoUrl, notes } = parseSlowMoLogData(data);
    if (videoUrl && isRemoteUrl(videoUrl)) {
      attachments = [{ url: videoUrl, type: 'video', name: 'sensor-slow-mo.mp4' }];
    }
    if (notes.trim()) {
      lines.push(t('sensors.shareForum.notesLine', { notes: notes.trim() }), '');
    }
    if (videoUrl && !isRemoteUrl(videoUrl)) {
      lines.push(t('sensors.shareForum.localVideoLine'), '');
    }
  } else if (log.sensorType === 'vibration') {
    const { stats, notes } = parseVibrationLogData(data);
    if (stats.length > 0) {
      lines.push(t('sensors.shareForum.measurementsHeader'));
      stats.forEach((stat) => lines.push(`• ${stat}`));
      lines.push('');
    }
    if (notes.trim()) {
      lines.push(t('sensors.shareForum.notesLine', { notes: notes.trim() }), '');
    }
  } else if (log.sensorType === 'battery') {
    const { stats, notes } = getBatteryLogDisplayLines(data, t);
    if (stats.length > 0) {
      lines.push(t('sensors.shareForum.measurementsHeader'));
      stats.forEach((stat) => lines.push(`• ${stat}`));
      lines.push('');
    }
    if (notes.trim()) {
      lines.push(t('sensors.shareForum.notesLine', { notes: notes.trim() }), '');
    }
  } else if (data.includes('\nNotes: ')) {
    const splitIdx = data.indexOf('\nNotes: ');
    const main = data.substring(0, splitIdx);
    const notePart = data.substring(splitIdx + '\nNotes: '.length);
    lines.push(t('sensors.shareForum.resultLine', { result: main.trim() }));
    if (notePart.trim()) {
      lines.push(t('sensors.shareForum.notesLine', { notes: notePart.trim() }), '');
    }
  } else {
    lines.push(t('sensors.shareForum.resultLine', { result: data.trim() }), '');
  }

  lines.push(t('sensors.shareForum.footer'));

  return {
    title,
    content: lines.join('\n').trim(),
    categoryId: 'sensors',
    attachments,
  };
}
