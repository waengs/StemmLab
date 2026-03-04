import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import {
  Screen,
  SettingsButton,
  DashboardHeader,
  QuickActionsGrid,
  ProgressBanner,
} from '../../src/components';
import { Spacing } from '../../src/theme';
import { useAuthRedirect } from '../../src/hooks/useAuthRedirect';
import { useCompletedCount } from '../../src/stores';

export default function Dashboard() {
  const router = useRouter();
  const { team, isHydrated } = useAuthRedirect();
  const completedCount = useCompletedCount(team?.discriminator);

  if (!isHydrated || !team) return null;

  return (
    <Screen>
      <View style={styles.settingsRow}>
        <SettingsButton />
      </View>
      <DashboardHeader
        team={team}
        completedCount={completedCount}
        onProfilePress={() => router.push('/(tabs)/profile')}
      />
      <QuickActionsGrid />
      <ProgressBanner completedCount={completedCount} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  settingsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: Spacing.sm,
  },
});
