import { doc, getDoc } from 'firebase/firestore';
import { getFirestoreDb } from '../../config/firebase';
import { FS } from '../../firebase/collections';
import * as userRepo from '../../database/repositories/userRepository';
import * as teamRepo from '../../database/repositories/teamRepository';
import * as sessionRepo from '../../database/repositories/sessionRepository';
import { useAuthStore } from '../../stores/authStore';
import type { AppUser, Team } from '../../types';

/** Pulls user + team from Firestore into SQLite and updates the auth store. */
export async function refreshAuthProfile(uid: string): Promise<{ user: AppUser; team: Team | null }> {
  const db = getFirestoreDb();
  const userSnap = await getDoc(doc(db, FS.users, uid));
  if (!userSnap.exists()) {
    const local = await userRepo.getUserByUid(uid);
    if (!local) throw new Error('User profile not found');
    return { user: local, team: null };
  }

  const data = userSnap.data();
  const user: AppUser = {
    uid,
    displayName: (data.displayName as string) ?? 'Student',
    email: (data.email as string) ?? '',
    teamDiscriminator: (data.teamDiscriminator as string | null) ?? null,
  };

  await userRepo.upsertUser(user);

  let team: Team | null = null;
  if (user.teamDiscriminator) {
    const teamSnap = await getDoc(doc(db, FS.teams, user.teamDiscriminator));
    if (teamSnap.exists()) {
      const td = teamSnap.data();
      team = {
        discriminator: user.teamDiscriminator,
        name: (td.name as string) ?? user.teamDiscriminator,
        gradeLevel: (td.gradeLevel as string) ?? '',
        joinPassword: (td.joinPassword as string) ?? '',
        createdByUid: (td.createdByUid as string) ?? '',
      };
      await teamRepo.upsertTeam(team);
    } else {
      team = await teamRepo.getTeamByDiscriminator(user.teamDiscriminator);
    }
  }

  await sessionRepo.setSession(uid, user.teamDiscriminator);

  const state = useAuthStore.getState();
  if (state.user?.uid === uid) {
    useAuthStore.setState({
      user,
      team,
      needsTeam: Boolean(user && !user.teamDiscriminator),
    });
  }

  return { user, team };
}
