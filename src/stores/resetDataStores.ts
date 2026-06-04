import { useActivityResultsStore } from './activityResultsStore';
import { useForumStore } from './forumStore';
import { useSensorStore } from './sensorStore';
import { useNotificationStore } from './notificationStore';

/** Clears in-memory app data after logout. */
export function resetDataStores() {
  useActivityResultsStore.getState().reset();
  useForumStore.getState().reset();
  useSensorStore.getState().reset();
  useNotificationStore.getState().reset();
}
