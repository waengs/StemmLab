import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { hydrateStores } from '../stores/hydrateStores';
import { useThemeStore } from '../stores/themeStore';
import { Colors, Spacing, Typography } from '../theme';

interface StoreHydratorProps {
  children: React.ReactNode;
}

/** Blocks the UI until persisted theme + app data are loaded into Zustand. */
export function StoreHydrator({ children }: StoreHydratorProps) {
  const [hydrated, setHydrated] = useState(false);
  const [startupError, setStartupError] = useState<string | null>(null);
  const isThemeReady = useThemeStore((s) => s.isReady);

  useEffect(() => {
    hydrateStores()
      .catch((error) => {
        setStartupError(error instanceof Error ? error.message : 'Failed to start the app.');
      })
      .finally(() => setHydrated(true));
  }, []);

  if (!hydrated || !isThemeReady) {
    return (
      <View style={styles.boot}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (startupError) {
    return (
      <View style={styles.errorWrap}>
        <Text style={styles.errorTitle}>Setup required</Text>
        <Text style={styles.errorText}>{startupError}</Text>
      </View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  boot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
  },
  errorWrap: {
    flex: 1,
    justifyContent: 'center',
    padding: Spacing.xl,
    backgroundColor: Colors.background,
  },
  errorTitle: { ...Typography.h2, color: Colors.danger, marginBottom: Spacing.md },
  errorText: { ...Typography.body, color: Colors.textSecondary, lineHeight: 22 },
});
