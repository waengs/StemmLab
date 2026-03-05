import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updatePassword,
  updateProfile,
  onAuthStateChanged,
  type User as FirebaseUser,
} from 'firebase/auth';
import { doc, getDoc, setDoc, query, where, getDocs, collection } from 'firebase/firestore';
import { getFirebaseAuth, getFirestoreDb } from '../../config/firebase';
import { FS } from '../../firebase/collections';
import * as userRepo from '../../database/repositories/userRepository';
import * as teamRepo from '../../database/repositories/teamRepository';
import * as sessionRepo from '../../database/repositories/sessionRepository';
import { normalizeTeamName } from '../../database/mappers';
import type { AppUser, Team } from '../../types';

export function subscribeToAuthState(callback: (user: FirebaseUser | null) => void): () => void {
  return onAuthStateChanged(getFirebaseAuth(), callback);
}

export async function registerAccount(input: {
  displayName: string;
  email: string;
  password: string;
}): Promise<AppUser> {
  const auth = getFirebaseAuth();
  const db = getFirestoreDb();
  const credential = await createUserWithEmailAndPassword(
    auth,
    input.email.trim().toLowerCase(),
    input.password
  );
  await updateProfile(credential.user, { displayName: input.displayName.trim() });

  const appUser: AppUser = {
    uid: credential.user.uid,
    displayName: input.displayName.trim(),
    email: input.email.trim().toLowerCase(),
    teamDiscriminator: null,
  };

  await auth.authStateReady();

  const now = Date.now();
  await setDoc(doc(db, FS.users, appUser.uid), {
    displayName: appUser.displayName,
    email: appUser.email,
    teamDiscriminator: null,
    createdAt: now,
    updatedAt: now,
  });

  await userRepo.upsertUser(appUser);
  await sessionRepo.setSession(appUser.uid, null);
  return appUser;
}

export async function signInWithEmail(email: string, password: string): Promise<AppUser | null> {
  const auth = getFirebaseAuth();
  await signInWithEmailAndPassword(auth, email.trim().toLowerCase(), password);
  const { user } = await resolveUserAfterAuth(auth.currentUser);
  return user;
}

export async function createTeamForUser(
  uid: string,
  input: { name: string; gradeLevel: string; joinPassword: string; discriminator: string }
): Promise<{ user: AppUser; team: Team }> {
  const db = getFirestoreDb();
  const team: Team = {
    discriminator: input.discriminator,
    name: input.name.trim(),
    gradeLevel: input.gradeLevel,
    joinPassword: input.joinPassword,
    createdByUid: uid,
  };

  const now = Date.now();
  await setDoc(doc(db, FS.teams, team.discriminator), {
    name: team.name,
    nameLower: normalizeTeamName(team.name),
    gradeLevel: team.gradeLevel,
    joinPassword: team.joinPassword,
    createdByUid: team.createdByUid,
    createdAt: now,
    updatedAt: now,
  });

  await teamRepo.upsertTeam(team);

  const user = await attachUserToTeam(uid, team.discriminator);
  return { user, team };
}

export async function joinTeamForUser(
  uid: string,
  input: { teamDiscriminator: string; joinPassword: string }
): Promise<{ user: AppUser; team: Team } | null> {
  const code = input.teamDiscriminator.trim().toUpperCase();
  let team = await teamRepo.getTeamByDiscriminator(code);
  if (!team) {
    team = await fetchTeamFromFirestoreByCode(code);
  }
  if (!team || team.joinPassword !== input.joinPassword) {
    return null;
  }

  const user = await attachUserToTeam(uid, team.discriminator);
  return { user, team };
}

export async function leaveTeamForUser(uid: string): Promise<AppUser> {
  const db = getFirestoreDb();
  const existing = await userRepo.getUserByUid(uid);
  if (!existing) throw new Error('User profile not found');

  const user: AppUser = { ...existing, teamDiscriminator: null };
  await setDoc(
    doc(db, FS.users, uid),
    { teamDiscriminator: null, updatedAt: Date.now() },
    { merge: true }
  );
  await userRepo.upsertUser(user);
  await sessionRepo.setSession(uid, null);
  return user;
}

async function attachUserToTeam(uid: string, teamDiscriminator: string): Promise<AppUser> {
  const db = getFirestoreDb();
  const existing = await userRepo.getUserByUid(uid);
  if (!existing) throw new Error('User profile not found');

  const user: AppUser = { ...existing, teamDiscriminator };
  await setDoc(
    doc(db, FS.users, uid),
    { teamDiscriminator, updatedAt: Date.now() },
    { merge: true }
  );
  await userRepo.upsertUser(user);
  await sessionRepo.setSession(uid, teamDiscriminator);
  return user;
}

export async function fetchTeamFromFirestoreByName(name: string): Promise<Team | null> {
  const db = getFirestoreDb();
  const snap = await getDocs(
    query(collection(db, FS.teams), where('nameLower', '==', normalizeTeamName(name)))
  );
  if (snap.empty) return null;
  return firestoreDocToTeam(snap.docs[0]!.id, snap.docs[0]!.data());
}

export async function fetchTeamFromFirestoreByCode(discriminator: string): Promise<Team | null> {
  const db = getFirestoreDb();
  const snap = await getDoc(doc(db, FS.teams, discriminator.toUpperCase()));
  if (!snap.exists()) return null;
  return firestoreDocToTeam(snap.id, snap.data());
}

function firestoreDocToTeam(id: string, data: Record<string, unknown>): Team {
  const team: Team = {
    discriminator: id,
    name: data.name as string,
    gradeLevel: data.gradeLevel as string,
    joinPassword: data.joinPassword as string,
    createdByUid: data.createdByUid as string,
  };
  void teamRepo.upsertTeam(team);
  return team;
}

export async function getAuthSession(): Promise<{ user: AppUser; team: Team | null } | null> {
  const auth = getFirebaseAuth();
  if (!auth.currentUser) return null;

  const session = await sessionRepo.getSession();
  if (!session || session.userUid !== auth.currentUser.uid) return null;

  const user = await userRepo.getUserByUid(session.userUid);
  if (!user) return null;

  let team: Team | null = null;
  if (user.teamDiscriminator) {
    team = await teamRepo.getTeamByDiscriminator(user.teamDiscriminator);
    if (!team) {
      team = await fetchTeamFromFirestoreByCode(user.teamDiscriminator);
    }
  }

  return { user, team };
}

export async function updateUserProfile(
  user: AppUser,
  options?: { displayName?: string; newPassword?: string }
): Promise<AppUser> {
  const auth = getFirebaseAuth();
  const db = getFirestoreDb();
  let next = user;

  if (options?.displayName) {
    next = { ...next, displayName: options.displayName.trim() };
    if (auth.currentUser) {
      await updateProfile(auth.currentUser, { displayName: next.displayName });
    }
  }

  await setDoc(
    doc(db, FS.users, next.uid),
    {
      displayName: next.displayName,
      email: next.email,
      teamDiscriminator: next.teamDiscriminator,
      updatedAt: Date.now(),
    },
    { merge: true }
  );
  await userRepo.upsertUser(next);
  return next;
}

export async function signOut(): Promise<void> {
  await sessionRepo.clearSession();
  const auth = getFirebaseAuth();
  if (auth.currentUser) await firebaseSignOut(auth);
}

export async function resolveUserAfterAuth(firebaseUser: FirebaseUser | null): Promise<{
  user: AppUser | null;
  team: Team | null;
}> {
  if (!firebaseUser) {
    await sessionRepo.clearSession();
    return { user: null, team: null };
  }

  const db = getFirestoreDb();
  let user = await userRepo.getUserByUid(firebaseUser.uid);

  if (!user) {
    const snap = await getDoc(doc(db, FS.users, firebaseUser.uid));
    if (snap.exists()) {
      const data = snap.data();
      user = {
        uid: firebaseUser.uid,
        displayName: (data.displayName as string) ?? firebaseUser.displayName ?? 'Student',
        email: (data.email as string) ?? firebaseUser.email ?? '',
        teamDiscriminator: (data.teamDiscriminator as string | null) ?? null,
      };
      await userRepo.upsertUser(user);
    } else {
      user = {
        uid: firebaseUser.uid,
        displayName: firebaseUser.displayName ?? 'Student',
        email: firebaseUser.email ?? '',
        teamDiscriminator: null,
      };
      await userRepo.upsertUser(user);
      try {
        await getFirebaseAuth().authStateReady();
        await setDoc(
          doc(db, FS.users, user.uid),
          {
            displayName: user.displayName,
            email: user.email,
            teamDiscriminator: null,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          },
          { merge: true }
        );
      } catch (err) {
        console.warn('[auth] could not create users profile in Firestore:', err);
      }
    }
  }

  let team: Team | null = null;
  if (user.teamDiscriminator) {
    team =
      (await teamRepo.getTeamByDiscriminator(user.teamDiscriminator)) ??
      (await fetchTeamFromFirestoreByCode(user.teamDiscriminator));
  }

  await sessionRepo.setSession(user.uid, user.teamDiscriminator);
  return { user, team };
}
