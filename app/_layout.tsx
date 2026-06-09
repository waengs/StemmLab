import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator } from 'react-native';
import { useEffect } from 'react';
import { useShallow } from 'zustand/react/shallow';
import '../src/i18n';
import { StoreHydrator } from '../src/components/StoreHydrator';
import { AppServicesBootstrap } from '../src/components/AppServicesBootstrap';
import { useAuthStore } from '../src/stores/authStore';
import { useTheme } from '../src/context/ThemeContext';
import { useThemedStyles } from '../src/hooks/useThemedStyles';

function RootNavigator() {
  const { isDark, colors } = useTheme();
  const styles = useThemedStyles(({ colors: c }) => ({
    boot: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: c.primary,
    },
  }));
  const { isHydrated, user, team, needsTeam } = useAuthStore(
    useShallow((s) => ({
      isHydrated: s.isHydrated,
      user: s.user,
      team: s.team,
      needsTeam: s.needsTeam,
    }))
  );

  if (!isHydrated) {
    return (
      <View style={styles.boot}>
        <StatusBar style="light" />
        <ActivityIndicator size="large" color={colors.white} />
      </View>
    );
  }

  const canUseApp = Boolean(user && team && !needsTeam);

  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!isHydrated) return;

    const inTabsGroup = segments[0] === '(tabs)';

    if (canUseApp && !inTabsGroup) {
      router.replace('/(tabs)');
    } else if (!canUseApp && inTabsGroup) {
      router.replace('/');
    }
  }, [isHydrated, canUseApp, segments[0], router]);

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false, animation: 'none' }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <StoreHydrator>
      <AppServicesBootstrap />
      <RootNavigator />
    </StoreHydrator>
  );
}

