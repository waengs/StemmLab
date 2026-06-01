import { withDatabase } from '../client';
import type { SensorLogRow } from '../rows';
import { rowToSensorLog } from '../mappers';
import type { SensorLog } from '../../types';

export async function upsertSensorLog(log: SensorLog): Promise<void> {
  const now = Date.now();
  await withDatabase((db) =>
    db.runAsync(
      `INSERT INTO sensor_logs (
        id, sensor_type, team_discriminator, recorded_by_uid, timestamp, data_json, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        sensor_type = excluded.sensor_type,
        team_discriminator = excluded.team_discriminator,
        recorded_by_uid = excluded.recorded_by_uid,
        timestamp = excluded.timestamp,
        data_json = excluded.data_json,
        updated_at = excluded.updated_at`,
      log.id,
      log.sensorType,
      log.teamDiscriminator,
      log.recordedByUid ?? null,
      log.timestamp,
      JSON.stringify(log.data),
      now,
      now
    )
  );
}

export async function getAllSensorLogs(): Promise<SensorLog[]> {
  return withDatabase(async (db) => {
    const rows = await db.getAllAsync<SensorLogRow>(
      `SELECT * FROM sensor_logs ORDER BY timestamp DESC`
    );
    return rows.map(rowToSensorLog);
  });
}

export async function deleteSensorLog(id: string): Promise<void> {
  await withDatabase((db) => db.runAsync(`DELETE FROM sensor_logs WHERE id = ?`, id));
}
