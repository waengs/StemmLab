import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useShallow } from 'zustand/react/shallow';
import '../src/i18n';
import { StoreHydrator } from '../src/components/StoreHydrator';
import { useAuthStore } from '../src/stores/authStore';
import { useTheme } from '../src/stores/themeStore';
import { Colors } from '../src/theme';

function RootNavigator() {
  const { isDark } = useTheme();
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
        <ActivityIndicator size="large" color={Colors.white} />
      </View>
    );
  }

  const canUseApp = Boolean(user && team && !needsTeam);

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false, animation: 'none' }}>
        <Stack.Protected guard={!canUseApp}>
          <Stack.Screen name="index" />
        </Stack.Protected>
        <Stack.Protected guard={canUseApp}>
          <Stack.Screen name="(tabs)" />
        </Stack.Protected>
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <StoreHydrator>
      <RootNavigator />
    </StoreHydrator>
  );
}

const styles = StyleSheet.create({
  boot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
  },
});
