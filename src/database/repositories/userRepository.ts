import { getDatabase } from '../client';
import type { AppUser } from '../../types';

interface UserRow {
  uid: string;
  display_name: string;
  email: string;
  team_discriminator: string | null;
  created_at: number;
  updated_at: number;
}

function rowToUser(row: UserRow): AppUser {
  return {
    uid: row.uid,
    displayName: row.display_name,
    email: row.email,
    teamDiscriminator: row.team_discriminator,
  };
}

export async function upsertUser(user: AppUser): Promise<void> {
  const db = await getDatabase();
  const now = Date.now();
  await db.runAsync(
    `INSERT INTO users (uid, display_name, email, team_discriminator, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?)
     ON CONFLICT(uid) DO UPDATE SET
       display_name = excluded.display_name,
       email = excluded.email,
       team_discriminator = excluded.team_discriminator,
       updated_at = excluded.updated_at`,
    user.uid,
    user.displayName,
    user.email,
    user.teamDiscriminator,
    now,
    now
  );
}

export async function getUserByUid(uid: string): Promise<AppUser | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<UserRow>(`SELECT * FROM users WHERE uid = ?`, uid);
  return row ? rowToUser(row) : null;
}
