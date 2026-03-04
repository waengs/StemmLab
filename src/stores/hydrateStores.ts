import { useThemeStore } from './themeStore';
import { useAuthStore } from './authStore';
import { useActivityResultsStore } from './activityResultsStore';
import { useForumStore } from './forumStore';
import { useSensorStore } from './sensorStore';

/** Loads persisted data into all Zustand stores. Call once at app startup. */
export async function hydrateStores(): Promise<void> {
  await Promise.all([
    useThemeStore.getState().hydrate(),
    useAuthStore.getState().hydrate(),
    useActivityResultsStore.getState().hydrate(),
    useForumStore.getState().hydrate(),
    useSensorStore.getState().hydrate(),
  ]);
}
