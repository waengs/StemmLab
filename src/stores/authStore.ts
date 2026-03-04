import { create } from 'zustand';
import {
  getTeam,
  saveTeam,
  signInTeam as signInTeamStorage,
  clearTeam,
  generateDiscriminator,
} from '../utils/storage';
import { resetDataStores } from './resetDataStores';
import { rehydrateAppData } from './rehydrateAppData';
import type { Team } from '../types';

interface AuthState {
  team: Team | null;
  isHydrated: boolean;
  hydrate: () => Promise<void>;
  registerTeam: (team: Omit<Team, 'discriminator'> & { discriminator?: string }) => Promise<Team>;
  signIn: (name: string, password: string) => Promise<boolean>;
  updateTeam: (team: Team) => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  team: null,
  isHydrated: false,

  hydrate: async () => {
    const team = await getTeam();
    set({ team, isHydrated: true });
  },

  registerTeam: async (input) => {
    const team: Team = {
      ...input,
      discriminator: input.discriminator ?? generateDiscriminator(),
    };
    await saveTeam(team);
    set({ team });
    await rehydrateAppData();
    return team;
  },

  signIn: async (name, password) => {
    const success = await signInTeamStorage(name, password);
    if (!success) return false;
    const team = await getTeam();
    set({ team });
    await rehydrateAppData();
    return true;
  },

  updateTeam: async (team) => {
    await saveTeam(team);
    set({ team });
  },

  signOut: async () => {
    await clearTeam();
    set({ team: null });
    resetDataStores();
  },
}));

export function useRequireTeam() {
  return useAuthStore((s) => ({ team: s.team, isHydrated: s.isHydrated }));
}
