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
import { useRequireAuth } from '../../src/stores';
import { useCompletedCount } from '../../src/stores/activityResultsStore';
import { useAuthStore } from '../../src/stores';

export default function Dashboard() {
  const router = useRouter();
  const { user, team, isHydrated } = useRequireAuth();
  const completedCount = useCompletedCount(user?.teamDiscriminator ?? undefined);

  if (!isHydrated || !user || !team) return null;

  return (
    <Screen>
      <View style={styles.settingsRow}>
        <SettingsButton />
      </View>
      <DashboardHeader
        user={user}
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
