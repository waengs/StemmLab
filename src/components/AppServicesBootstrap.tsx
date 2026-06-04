import { useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { useAuthStore } from '../stores/authStore';
import { syncWhenOnline } from '../services/sync/syncService';
import { loadAppDataParallel } from '../services/app/parallelFeedLoad';
import { supportsCustomNativeModules } from '../utils/nativeFeatures';

/** Registers background sync, push tokens, and online reconnect sync. */
export function AppServicesBootstrap() {
  const uid = useAuthStore((s) => s.user?.uid);
  const isHydrated = useAuthStore((s) => s.isHydrated);

  useEffect(() => {
    if (!isHydrated || !uid) return;

    if (supportsCustomNativeModules()) {
      void import('../services/sync/backgroundSync').then((m) => m.registerBackgroundSync());
      void import('../services/notifications/pushRegistration').then((m) =>
        m.registerForPushNotifications(uid)
      );
    }

    void loadAppDataParallel(uid);

    const unsubscribe = NetInfo.addEventListener((state) => {
      if (state.isConnected && state.isInternetReachable !== false) {
        void syncWhenOnline();
      }
    });

    return () => unsubscribe();
  }, [isHydrated, uid]);

  return null;
}
