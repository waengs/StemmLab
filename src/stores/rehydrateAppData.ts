import { useActivityResultsStore } from './activityResultsStore';
import { useForumStore } from './forumStore';
import { useSensorStore } from './sensorStore';

/** Reloads shared app data after sign-in or team registration. */
export async function rehydrateAppData(): Promise<void> {
  await Promise.all([
    useActivityResultsStore.getState().hydrate(),
    useForumStore.getState().hydrate(),
    useSensorStore.getState().hydrate(),
  ]);
}
