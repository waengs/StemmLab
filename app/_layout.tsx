import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import '../src/i18n';
import { StoreHydrator } from '../src/components/StoreHydrator';
import { AuthRedirect } from '../src/components/AuthRedirect';
import { useTheme } from '../src/stores/themeStore';

function RootNavigator() {
  const { isDark } = useTheme();

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
      <AuthRedirect />
      <RootNavigator />
    </StoreHydrator>
  );
}
