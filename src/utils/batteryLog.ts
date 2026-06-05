import type { TFunction } from 'i18next';

export type BatteryLogReading = {
  levelPercent: number;
  isCharging: boolean;
};

export type ParsedBatteryLog = {
  reading: BatteryLogReading;
  notes: string;
};

/** Stored in the log book (pipe-separated; notes appended on save as `\\nNotes: …`). */
export function formatBatteryLogData(reading: BatteryLogReading): string {
  const status = reading.isCharging ? 'Charging' : 'Not charging';
  return `Level: ${reading.levelPercent}%|Status: ${status}`;
}

export function parseBatteryLogData(data: string): ParsedBatteryLog {
  const raw = String(data).trim();
  const splitIdx = raw.indexOf('\nNotes: ');
  const mainPart = splitIdx >= 0 ? raw.substring(0, splitIdx) : raw;
  const notes = splitIdx >= 0 ? raw.substring(splitIdx + '\nNotes: '.length).trim() : '';

  if (mainPart.startsWith('{')) {
    try {
      const json = JSON.parse(mainPart) as {
        levelPercent?: number;
        level?: number;
        isCharging?: boolean;
        state?: string;
      };
      const levelPercent =
        typeof json.levelPercent === 'number'
          ? Math.round(json.levelPercent)
          : Math.round((json.level ?? 0) * 100);
      const isCharging =
        json.isCharging === true ||
        json.state === 'CHARGING' ||
        json.state === 'FULL';
      return { reading: { levelPercent, isCharging }, notes };
    } catch {
      /* fall through to text parse */
    }
  }

  let levelPercent = 0;
  let isCharging = false;

  for (const segment of mainPart.split('|')) {
    const part = segment.trim();
    const levelMatch = part.match(/^Level:\s*(\d+)\s*%?$/i);
    if (levelMatch) {
      levelPercent = Number(levelMatch[1]);
      continue;
    }
    const statusMatch = part.match(/^Status:\s*(.+)$/i);
    if (statusMatch) {
      const status = statusMatch[1].toLowerCase();
      isCharging = status.includes('charg') && !status.includes('not');
    }
  }

  return { reading: { levelPercent, isCharging }, notes };
}

/** Lines for log book / forum (translated labels). */
export function getBatteryLogDisplayLines(
  data: string,
  t: TFunction
): { stats: string[]; notes: string } {
  const { reading, notes } = parseBatteryLogData(data);
  const chargingLabel = reading.isCharging
    ? t('sensors.battery.charging', { defaultValue: 'Charging' })
    : t('sensors.battery.notCharging', { defaultValue: 'Not charging' });

  return {
    stats: [
      t('sensors.battery.levelLine', {
        defaultValue: 'Level: {{pct}}%',
        pct: reading.levelPercent,
      }),
      t('sensors.battery.statusLine', {
        defaultValue: 'Status: {{status}}',
        status: chargingLabel,
      }),
    ],
    notes,
  };
}
