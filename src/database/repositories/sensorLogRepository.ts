import { getDatabase } from '../client';
import type { SensorLogRow } from '../rows';
import { rowToSensorLog } from '../mappers';
import type { SensorLog } from '../../types';

export async function upsertSensorLog(log: SensorLog): Promise<void> {
  const db = await getDatabase();
  const now = Date.now();
  await db.runAsync(
    `INSERT INTO sensor_logs (
      id, sensor_type, team_discriminator, timestamp, data_json, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      sensor_type = excluded.sensor_type,
      team_discriminator = excluded.team_discriminator,
      timestamp = excluded.timestamp,
      data_json = excluded.data_json,
      updated_at = excluded.updated_at`,
    log.id,
    log.sensorType,
    log.teamDiscriminator,
    log.timestamp,
    JSON.stringify(log.data),
    now,
    now
  );
}

export async function getAllSensorLogs(): Promise<SensorLog[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<SensorLogRow>(
    `SELECT * FROM sensor_logs ORDER BY timestamp DESC`
  );
  return rows.map(rowToSensorLog);
}
