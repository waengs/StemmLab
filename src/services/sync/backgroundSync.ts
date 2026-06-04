import { supportsCustomNativeModules } from '../../utils/nativeFeatures';

export const BACKGROUND_SYNC_TASK = 'stemmlab-background-sync';

let taskDefined = false;

async function ensureBackgroundTaskDefined(): Promise<void> {
  if (taskDefined) return;
  const TaskManager = await import('expo-task-manager');
  const BackgroundFetch = await import('expo-background-fetch');
  const { syncWhenOnline } = await import('./syncService');

  TaskManager.defineTask(BACKGROUND_SYNC_TASK, async () => {
    try {
      await syncWhenOnline({ waitForNetwork: true });
      return BackgroundFetch.BackgroundFetchResult.NewData;
    } catch (err) {
      console.warn('[background-sync] failed:', err);
      return BackgroundFetch.BackgroundFetchResult.Failed;
    }
  });
  taskDefined = true;
}

export async function registerBackgroundSync(): Promise<void> {
  if (!supportsCustomNativeModules()) return;

  await ensureBackgroundTaskDefined();
  const BackgroundFetch = await import('expo-background-fetch');
  const TaskManager = await import('expo-task-manager');

  const status = await BackgroundFetch.getStatusAsync();
  if (
    status === BackgroundFetch.BackgroundFetchStatus.Restricted ||
    status === BackgroundFetch.BackgroundFetchStatus.Denied
  ) {
    return;
  }

  const registered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_SYNC_TASK);
  if (!registered) {
    await BackgroundFetch.registerTaskAsync(BACKGROUND_SYNC_TASK, {
      minimumInterval: 15 * 60,
      stopOnTerminate: false,
      startOnBoot: true,
    });
  }
}

export async function unregisterBackgroundSync(): Promise<void> {
  if (!supportsCustomNativeModules()) return;
  const BackgroundFetch = await import('expo-background-fetch');
  const TaskManager = await import('expo-task-manager');
  const registered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_SYNC_TASK);
  if (registered) {
    await BackgroundFetch.unregisterTaskAsync(BACKGROUND_SYNC_TASK);
  }
}
