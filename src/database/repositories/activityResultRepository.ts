import { getDatabase } from '../client';
import type { ActivityResultRow } from '../rows';
import { rowToActivityResult } from '../mappers';
import type { ActivityResult } from '../../types';

export async function upsertActivityResult(result: ActivityResult): Promise<void> {
  const db = await getDatabase();
  const now = Date.now();
  await db.runAsync(
    `INSERT INTO activity_results (
      id, activity_id, activity_name, team_discriminator, submitted_by_uid,
      timestamp, data_json, score, created_at, updated_at, deleted_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL)
    ON CONFLICT(id) DO UPDATE SET
      activity_id = excluded.activity_id,
      activity_name = excluded.activity_name,
      team_discriminator = excluded.team_discriminator,
      submitted_by_uid = excluded.submitted_by_uid,
      timestamp = excluded.timestamp,
      data_json = excluded.data_json,
      score = excluded.score,
      updated_at = excluded.updated_at,
      deleted_at = NULL`,
    result.id,
    result.activityId,
    result.activityName,
    result.teamDiscriminator,
    result.submittedByUid ?? null,
    result.timestamp,
    JSON.stringify(result.data),
    result.score ?? null,
    now,
    now
  );
}

export async function getAllActivityResults(): Promise<ActivityResult[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<ActivityResultRow>(
    `SELECT * FROM activity_results WHERE deleted_at IS NULL ORDER BY timestamp DESC`
  );
  return rows.map(rowToActivityResult);
}

export async function deleteActivityResult(id: string): Promise<void> {
  const db = await getDatabase();
  const now = Date.now();
  await db.runAsync(
    `UPDATE activity_results SET deleted_at = ?, updated_at = ? WHERE id = ?`,
    now,
    now,
    id
  );
}

export async function markActivityResultsSynced(ids: string[]): Promise<void> {
  if (ids.length === 0) return;
  const db = await getDatabase();
  const now = Date.now();
  const placeholders = ids.map(() => '?').join(',');
  await db.runAsync(
    `UPDATE activity_results SET synced_at = ? WHERE id IN (${placeholders})`,
    now,
    ...ids
  );
}
