import { withDatabase } from '../client';
import { normalizeTeamName } from '../mappers';
import type { Team } from '../../types';

interface TeamRow {
  discriminator: string;
  name: string;
  name_lower: string;
  grade_level: string;
  join_password: string;
  created_by_uid: string;
  created_at: number;
  updated_at: number;
  synced_at: number | null;
}

function rowToTeam(row: TeamRow): Team {
  return {
    discriminator: row.discriminator,
    name: row.name,
    gradeLevel: row.grade_level,
    joinPassword: row.join_password,
    createdByUid: row.created_by_uid,
  };
}

export async function upsertTeam(team: Team): Promise<void> {
  const now = Date.now();
  await withDatabase((db) =>
    db.runAsync(
      `INSERT INTO teams (
        discriminator, name, name_lower, grade_level, join_password, created_by_uid,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(discriminator) DO UPDATE SET
        name = excluded.name,
        name_lower = excluded.name_lower,
        grade_level = excluded.grade_level,
        join_password = excluded.join_password,
        created_by_uid = excluded.created_by_uid,
        updated_at = excluded.updated_at`,
      team.discriminator,
      team.name,
      normalizeTeamName(team.name),
      team.gradeLevel,
      team.joinPassword,
      team.createdByUid,
      now,
      now
    )
  );
}

export async function getTeamByDiscriminator(discriminator: string): Promise<Team | null> {
  return withDatabase(async (db) => {
    const row = await db.getFirstAsync<TeamRow>(
      `SELECT * FROM teams WHERE discriminator = ?`,
      discriminator.toUpperCase()
    );
    return row ? rowToTeam(row) : null;
  });
}

export async function getTeamByName(name: string): Promise<Team | null> {
  return withDatabase(async (db) => {
    const row = await db.getFirstAsync<TeamRow>(
      `SELECT * FROM teams WHERE name_lower = ?`,
      normalizeTeamName(name)
    );
    return row ? rowToTeam(row) : null;
  });
}

export async function upsertTeamFromListing(listing: {
  discriminator: string;
  name: string;
  gradeLevel: string;
}): Promise<void> {
  const existing = await getTeamByDiscriminator(listing.discriminator);
  if (existing) {
    await upsertTeam({
      ...existing,
      name: listing.name,
      gradeLevel: listing.gradeLevel,
    });
    return;
  }
  await upsertTeam({
    discriminator: listing.discriminator,
    name: listing.name,
    gradeLevel: listing.gradeLevel,
    joinPassword: '',
    createdByUid: '',
  });
}

export async function listAllTeamListings(): Promise<
  { discriminator: string; name: string; gradeLevel: string }[]
> {
  return withDatabase(async (db) => {
    const rows = await db.getAllAsync<Pick<TeamRow, 'discriminator' | 'name' | 'grade_level'>>(
      `SELECT discriminator, name, grade_level FROM teams ORDER BY name COLLATE NOCASE ASC`
    );
    return rows.map((r) => ({
      discriminator: r.discriminator,
      name: r.name,
      gradeLevel: r.grade_level,
    }));
  });
}
