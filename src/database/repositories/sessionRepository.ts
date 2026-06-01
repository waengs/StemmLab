import { withDatabase } from '../client';

export async function setSession(
  userUid: string,
  teamDiscriminator: string | null
): Promise<void> {
  const now = Date.now();
  await withDatabase((db) =>
    db.runAsync(
      `INSERT INTO session (id, user_uid, team_discriminator, updated_at)
       VALUES (1, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         user_uid = excluded.user_uid,
         team_discriminator = excluded.team_discriminator,
         updated_at = excluded.updated_at`,
      userUid,
      teamDiscriminator,
      now
    )
  );
}

export async function clearSession(): Promise<void> {
  await withDatabase((db) => db.runAsync(`DELETE FROM session WHERE id = 1`));
}

export async function getSession(): Promise<{
  userUid: string;
  teamDiscriminator: string | null;
} | null> {
  return withDatabase(async (db) => {
    const row = await db.getFirstAsync<{
      user_uid: string;
      team_discriminator: string | null;
    }>(`SELECT user_uid, team_discriminator FROM session WHERE id = 1`);
    if (!row) return null;
    return {
      userUid: row.user_uid,
      teamDiscriminator: row.team_discriminator,
    };
  });
}
