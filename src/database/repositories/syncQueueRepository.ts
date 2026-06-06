import { withDatabase } from '../client';

export type SyncEntityType =
  | 'team'
  | 'activity_result'
  | 'sensor_log'
  | 'forum_post'
  | 'forum_reply';

export type SyncOperation = 'upsert' | 'delete';

export async function enqueueSync(
  entityType: SyncEntityType,
  entityId: string,
  operation: SyncOperation,
  payload: unknown
): Promise<void> {
  await withDatabase((db) =>
    db.runAsync(
      `INSERT INTO sync_queue (entity_type, entity_id, operation, payload_json, created_at)
       VALUES (?, ?, ?, ?, ?)`,
      entityType,
      entityId,
      operation,
      JSON.stringify(payload),
      Date.now()
    )
  );
}

export async function getPendingSyncItems(): Promise<
  Array<{
    id: number;
    entityType: SyncEntityType;
    entityId: string;
    operation: SyncOperation;
    payload: unknown;
    retryCount: number;
  }>
> {
  return withDatabase(async (db) => {
    const rows = await db.getAllAsync<{
      id: number;
      entity_type: SyncEntityType;
      entity_id: string;
      operation: SyncOperation;
      payload_json: string;
      retry_count: number;
    }>(`SELECT * FROM sync_queue ORDER BY created_at ASC`);

    return rows.map((row) => ({
      id: row.id,
      entityType: row.entity_type,
      entityId: row.entity_id,
      operation: row.operation,
      payload: JSON.parse(row.payload_json),
      retryCount: row.retry_count,
    }));
  });
}

export async function removeSyncItem(id: number): Promise<void> {
  await withDatabase((db) => db.runAsync(`DELETE FROM sync_queue WHERE id = ?`, id));
}

export async function incrementSyncRetry(id: number): Promise<void> {
  await withDatabase((db) =>
    db.runAsync(`UPDATE sync_queue SET retry_count = retry_count + 1 WHERE id = ?`, id)
  );
}

/** Drops queued forum post upserts for ids that no longer exist on the server. */
export async function removePendingForumPostUpsertsNotIn(keepIds: Set<string>): Promise<void> {
  await withDatabase(async (db) => {
    const rows = await db.getAllAsync<{ id: number; entity_id: string }>(
      `SELECT id, entity_id FROM sync_queue WHERE entity_type = 'forum_post' AND operation = 'upsert'`
    );
    for (const row of rows) {
      if (!keepIds.has(row.entity_id)) {
        await db.runAsync(`DELETE FROM sync_queue WHERE id = ?`, row.id);
      }
    }
  });
}
