import { useActivityResultsStore } from './activityResultsStore';
import { useForumStore } from './forumStore';
import { useSensorStore } from './sensorStore';

/** Clears in-memory app data after logout (AsyncStorage session key is cleared separately). */
export function resetDataStores() {
  useActivityResultsStore.getState().reset();
  useForumStore.getState().reset();
  useSensorStore.getState().reset();
}
