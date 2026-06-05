import { useEffect } from 'react';
import { Redirect, Tabs } from 'expo-router';
import { useShallow } from 'zustand/react/shallow';
import { useTheme } from '../../src/context/ThemeContext';
import { CustomTabBar } from '../../src/components/layout/CustomTabBar';
import { useAuthStore } from '../../src/stores/authStore';
import { subscribeToNotifications, presentNewNotifications } from '../../src/services/notifications/notificationService';
import { useNotificationStore } from '../../src/stores/notificationStore';

export default function TabsLayout() {
  const { colors } = useTheme();
  const { user, team, isHydrated } = useAuthStore(
    useShallow((s) => ({
      user: s.user,
      team: s.team,
      isHydrated: s.isHydrated,
    }))
  );

  useEffect(() => {
    if (!user?.uid) return;
    const unsubscribe = subscribeToNotifications(user.uid, (notifications) => {
      useNotificationStore.getState().setNotifications(notifications);
      void presentNewNotifications(notifications);
    });
    return () => unsubscribe();
  }, [user?.uid]);

  if (isHydrated && (!user || !team)) {
    return <Redirect href="/" />;
  }

  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: colors.background },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="activities/index" options={{ title: 'Activities' }} />
      <Tabs.Screen name="sensors" options={{ title: 'Sensors' }} />
      <Tabs.Screen name="leaderboard" options={{ title: 'Leaderboard' }} />
      <Tabs.Screen name="forum" options={{ title: 'Forum' }} />

      <Tabs.Screen name="activities/[activityId]" options={{ href: null }} />
      <Tabs.Screen name="post/[id]" options={{ href: null }} />
      <Tabs.Screen name="profile" options={{ href: null }} />
      <Tabs.Screen name="settings" options={{ href: null }} />
    </Tabs>
  );
}
