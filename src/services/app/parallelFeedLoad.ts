import { useAuthStore } from '../../stores/authStore';
import { useForumStore } from '../../stores/forumStore';
import { useNotificationStore } from '../../stores/notificationStore';
import { refreshAuthProfile } from '../auth/profileRefresh';
import {
  pullNotificationsForUser,
  seedSeenNotifications,
} from '../notifications/notificationService';

export type ParallelFeedLoadResult = {
  postsOk: boolean;
  profileOk: boolean;
  notificationsOk: boolean;
};

/** Loads forum posts (cloud pull), auth profile/team, and notifications in parallel. */
export async function loadForumFeedParallel(uid: string): Promise<ParallelFeedLoadResult> {
  const { refreshSharedData } = await import('../../utils/storage');
  const [postsResult, profileResult, notificationsResult] = await Promise.allSettled([
    (async () => {
      await refreshSharedData();
      await useForumStore.getState().fetchPosts();
    })(),
    refreshAuthProfile(uid),
    pullNotificationsForUser(uid),
  ]);

  if (notificationsResult.status === 'fulfilled') {
    useNotificationStore.getState().setNotifications(notificationsResult.value);
    await seedSeenNotifications(notificationsResult.value);
  }

  return {
    postsOk: postsResult.status === 'fulfilled',
    profileOk: profileResult.status === 'fulfilled',
    notificationsOk: notificationsResult.status === 'fulfilled',
  };
}

/** Refreshes remote data after sign-in (posts + profile + notifications). */
export async function loadAppDataParallel(uid: string): Promise<void> {
  const { refreshSharedData } = await import('../../utils/storage');
  const [, profileResult, notificationsResult] = await Promise.allSettled([
    refreshSharedData(),
    refreshAuthProfile(uid),
    pullNotificationsForUser(uid),
  ]);

  await useForumStore.getState().fetchPosts();

  if (notificationsResult.status === 'fulfilled') {
    useNotificationStore.getState().setNotifications(notificationsResult.value);
    await seedSeenNotifications(notificationsResult.value);
  }

  if (profileResult.status === 'rejected') {
    console.warn('[app] profile refresh failed:', profileResult.reason);
  }
}
