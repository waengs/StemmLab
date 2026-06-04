import { useMemo } from 'react';
import { create } from 'zustand';
import { useShallow } from 'zustand/react/shallow';
import {
  getActivityResults,
  saveActivityResult,
  deleteActivityResult,
} from '../utils/storage';
import type { ActivityResult } from '../types';
import {
  getTeamActivityCompletions,
  type TeamActivityCompletion,
} from './selectors/leaderboard';

interface ActivityResultsState {
  results: ActivityResult[];
  isHydrated: boolean;
  hydrate: () => Promise<void>;
  reset: () => void;
  addResult: (result: ActivityResult) => Promise<void>;
  updateResult: (id: string, updates: Partial<ActivityResult>) => Promise<void>;
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

  updateResult: async (id, updates) => {
    set((state) => {
      const results = state.results.map((r) =>
        r.id === id ? { ...r, ...updates } : r
      );
      // Ideally, we'd also save this to persistent storage:
      const updatedResult = results.find((r) => r.id === id);
      if (updatedResult) {
        saveActivityResult(updatedResult);
      }
      return { results };
    });
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

/** Distinct completed activity IDs (stable primitive array for useShallow). */
export function useCompletedActivityIds(discriminator: string | undefined): string[] {
  return useActivityResultsStore(
    useShallow((state) => {
      if (!discriminator) return [];
      const code = discriminator.toUpperCase();
      const lastById = new Map<string, number>();
      for (const r of state.results) {
        if (r.teamDiscriminator.toUpperCase() !== code) continue;
        const prev = lastById.get(r.activityId);
        if (prev === undefined || r.timestamp > prev) {
          lastById.set(r.activityId, r.timestamp);
        }
      }
      return Array.from(lastById.entries())
        .sort((a, b) => b[1] - a[1])
        .map(([id]) => id);
    })
  );
}

/** Full completion rows for UI lists — derive from IDs to avoid useShallow loops. */
export function useCompletedActivities(
  discriminator: string | undefined
): TeamActivityCompletion[] {
  const activityIds = useCompletedActivityIds(discriminator);
  const results = useActivityResultsStore((state) => state.results);
  return useMemo(() => {
    if (!discriminator) return [];
    return getTeamActivityCompletions(results, discriminator);
  }, [discriminator, results, activityIds]);
}

export function useCompletedCount(discriminator: string | undefined): number {
  return useActivityResultsStore((state) => {
    if (!discriminator) return 0;
    const code = discriminator.toUpperCase();
    const ids = new Set<string>();
    for (const r of state.results) {
      if (r.teamDiscriminator.toUpperCase() === code) ids.add(r.activityId);
    }
    return ids.size;
  });
}
