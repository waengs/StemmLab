import { collection, getDocs, query, where } from 'firebase/firestore';
import { getFirestoreDb } from '../../config/firebase';
import { FS } from '../../firebase/collections';
import * as teamRepo from '../../database/repositories/teamRepository';
import { normalizeTeamName } from '../../database/mappers';
import type { TeamListing, TeamMemberSummary } from '../../types';

export async function listAvailableTeams(): Promise<TeamListing[]> {
  const db = getFirestoreDb();
  try {
    const snap = await getDocs(collection(db, FS.teams));
    const teams = snap.docs.map((d) => {
      const data = d.data();
      return {
        discriminator: d.id,
        name: (data.name as string) ?? d.id,
        gradeLevel: (data.gradeLevel as string) ?? '',
      } satisfies TeamListing;
    });
    teams.sort((a, b) => a.name.localeCompare(b.name));
    for (const t of teams) {
      await teamRepo.upsertTeamFromListing(t);
    }
    return teams;
  } catch (err) {
    console.warn('[teams] Firestore list failed, using local cache:', err);
    return teamRepo.listAllTeamListings();
  }
}

export function filterTeamListings(teams: TeamListing[], search: string): TeamListing[] {
  const q = normalizeTeamName(search);
  if (!q) return teams;
  return teams.filter(
    (t) =>
      normalizeTeamName(t.name).includes(q) ||
      t.discriminator.toLowerCase().includes(q.toLowerCase()) ||
      normalizeTeamName(t.gradeLevel).includes(q)
  );
}

export async function fetchTeamMembers(teamDiscriminator: string): Promise<TeamMemberSummary[]> {
  const db = getFirestoreDb();
  const code = teamDiscriminator.toUpperCase();
  try {
    const snap = await getDocs(
      query(collection(db, FS.users), where('teamDiscriminator', '==', code))
    );
    const members = snap.docs
      .map((d) => ({
        uid: d.id,
        displayName: (d.data().displayName as string) ?? 'Student',
      }))
      .sort((a, b) => a.displayName.localeCompare(b.displayName));
    return members;
  } catch (err) {
    console.warn('[teams] member list failed:', err);
    return [];
  }
}
