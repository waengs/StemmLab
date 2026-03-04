import { create } from 'zustand';
import { useShallow } from 'zustand/react/shallow';
import {
  getActivityResults,
  saveActivityResult,
  deleteActivityResult,
} from '../utils/storage';
import type { ActivityResult } from '../types';

interface ActivityResultsState {
  results: ActivityResult[];
  isHydrated: boolean;
  hydrate: () => Promise<void>;
  reset: () => void;
  addResult: (result: ActivityResult) => Promise<void>;
  removeResult: (id: string) => Promise<void>;
}

export const useActivityResultsStore = create<ActivityResultsState>((set) => ({
  results: [],
  isHydrated: false,

  hydrate: async () => {
    const results = await getActivityResults();
    set({ results, isHydrated: true });
  },

  reset: () => set({ results: [], isHydrated: false }),

  addResult: async (result) => {
    await saveActivityResult(result);
    set((state) => ({ results: [...state.results, result] }));
  },

  removeResult: async (id) => {
    await deleteActivityResult(id);
    set((state) => ({ results: state.results.filter((r) => r.id !== id) }));
  },
}));

/** Activity results for one team + activity (shallow-compared to avoid render loops). */
export function useResultsForActivity(
  discriminator: string | undefined,
  activityId: string | undefined
): ActivityResult[] {
  return useActivityResultsStore(
    useShallow((state) => {
      if (!discriminator || !activityId) return [];
      return state.results
        .filter(
          (r) =>
            r.teamDiscriminator === discriminator && r.activityId === activityId
        )
        .sort((a, b) => b.timestamp - a.timestamp);
    })
  );
}

export function useCompletedCount(discriminator: string | undefined): number {
  return useActivityResultsStore((state) => {
    if (!discriminator) return 0;
    return state.results.filter((r) => r.teamDiscriminator === discriminator).length;
  });
}
