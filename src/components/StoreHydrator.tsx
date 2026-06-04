import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { hydrateStores } from '../stores/hydrateStores';
import { useThemeStore } from '../stores/themeStore';
import { useTheme } from '../context/ThemeContext';
import { Spacing } from '../theme';

interface StoreHydratorProps {
  children: React.ReactNode;
}

/** Blocks the UI until persisted theme + app data are loaded into Zustand. */
export function StoreHydrator({ children }: StoreHydratorProps) {
  const [hydrated, setHydrated] = useState(false);
  const [startupError, setStartupError] = useState<string | null>(null);
  const isThemeReady = useThemeStore((s) => s.isReady);
  const { colors, typography } = useTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        boot: {
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: colors.primary,
        },
        errorWrap: {
          flex: 1,
          justifyContent: 'center',
          padding: Spacing.xl,
          backgroundColor: colors.background,
        },
        errorTitle: { ...typography.h2, color: colors.danger, marginBottom: Spacing.md },
        errorText: { ...typography.body, color: colors.textSecondary, lineHeight: 22 },
      }),
    [colors, typography]
  );

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
        <ActivityIndicator size="large" color={colors.white} />
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
