import { create } from 'zustand';
import { useShallow } from 'zustand/react/shallow';
import type { User as FirebaseUser } from 'firebase/auth';
import {
  registerUser,
  signInUser,
  createTeam,
  joinTeam,
  leaveTeam,
  clearSession,
  updateProfile,
  generateDiscriminator,
} from '../utils/storage';
import { isSigningOut, setSigningOut } from '../auth/sessionFlags';
import { subscribeToAuthState, resolveUserAfterAuth } from '../services/auth/authService';
import { resetDataStores } from './resetDataStores';
import { rehydrateAppData } from './rehydrateAppData';
import type { AppUser, Team } from '../types';

interface AuthState {
  user: AppUser | null;
  team: Team | null;
  firebaseUser: FirebaseUser | null;
  isHydrated: boolean;
  needsTeam: boolean;
  hydrate: () => Promise<void>;
  register: (input: { displayName: string; email: string; password: string }) => Promise<AppUser>;
  signIn: (email: string, password: string) => Promise<boolean>;
  createTeam: (input: {
    name: string;
    gradeLevel: string;
    joinPassword: string;
    discriminator?: string;
  }) => Promise<Team>;
  joinTeam: (teamDiscriminator: string, joinPassword: string) => Promise<boolean>;
  leaveTeam: () => Promise<void>;
  updateUser: (options: { displayName?: string; newPassword?: string }) => Promise<void>;
  signOut: () => Promise<void>;
}

let authSubscription: (() => void) | null = null;

function applyAuthState(
  set: (partial: Partial<AuthState>) => void,
  user: AppUser | null,
  team: Team | null
) {
  set({
    user,
    team,
    needsTeam: Boolean(user && !team),
  });
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  team: null,
  firebaseUser: null,
  isHydrated: false,
  needsTeam: false,

  hydrate: async () => {
    const { getFirebaseAuth } = await import('../config/firebase');
    const auth = getFirebaseAuth();
    await auth.authStateReady();

    if (!authSubscription) {
      authSubscription = subscribeToAuthState(async (firebaseUser) => {
        if (isSigningOut()) return;
        try {
          set({ firebaseUser });
          const { user, team } = await resolveUserAfterAuth(firebaseUser);
          applyAuthState(set, user, team);
          if (firebaseUser) {
            void import('../services/app/parallelFeedLoad')
              .then(({ loadAppDataParallel }) => loadAppDataParallel(firebaseUser.uid))
              .then(() => rehydrateAppData())
              .catch((err) => {
                console.warn('[auth] sync after sign-in failed:', err);
              });
          }
        } catch (err) {
          console.warn('[auth] auth state handler failed:', err);
        }
      });
    }

    set({ firebaseUser: auth.currentUser });
    const { user, team } = await resolveUserAfterAuth(auth.currentUser);
    applyAuthState(set, user, team);
    set({ isHydrated: true });
  },

  register: async (input) => {
    const user = await registerUser(input);
    applyAuthState(set, user, null);
    return user;
  },

  signIn: async (email, password) => {
    const signedInUser = await signInUser(email, password);
    if (!signedInUser) return false;
    const { getFirebaseAuth } = await import('../config/firebase');
    const { user, team } = await resolveUserAfterAuth(getFirebaseAuth().currentUser);
    applyAuthState(set, user, team);
    if (team) {
      await rehydrateAppData();
    }
    return true;
  },

  createTeam: async (input) => {
    const uid = get().user?.uid;
    if (!uid) throw new Error('Not signed in');
    const { user, team } = await createTeam(uid, {
      ...input,
      discriminator: input.discriminator ?? generateDiscriminator(),
    });
    applyAuthState(set, user, team);
    await rehydrateAppData();
    return team;
  },

  joinTeam: async (teamDiscriminator, joinPassword) => {
    const uid = get().user?.uid;
    if (!uid) return false;
    const result = await joinTeam(uid, teamDiscriminator, joinPassword);
    if (!result) return false;
    applyAuthState(set, result.user, result.team);
    await rehydrateAppData();
    return true;
  },

  leaveTeam: async () => {
    const uid = get().user?.uid;
    if (!uid) return;
    const user = await leaveTeam(uid);
    resetDataStores();
    applyAuthState(set, user, null);
  },

  updateUser: async (options) => {
    const { user } = get();
    if (!user) return;
    const updated = await updateProfile(user, options);
    applyAuthState(set, updated, get().team);
  },

  signOut: async () => {
    setSigningOut(true);
    resetDataStores();
    set({ user: null, team: null, firebaseUser: null, needsTeam: false, isHydrated: true });
    try {
      await clearSession();
    } catch (err) {
      console.warn('[auth] signOut failed:', err);
    } finally {
      setSigningOut(false);
    }
  },
}));

export function useRequireAuth() {
  return useAuthStore(
    useShallow((s) => ({
      user: s.user,
      team: s.team,
      isHydrated: s.isHydrated,
      needsTeam: s.needsTeam,
    }))
  );
}
