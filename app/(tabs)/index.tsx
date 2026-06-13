import React, { useState, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import {
  Screen,
  SettingsButton,
  DashboardHeader,
  QuickActionsGrid,
  ProgressBanner,
} from '../../src/components';
import { CompletedActivitiesModal } from '../../src/components/dashboard/CompletedActivitiesModal';
import { Spacing } from '../../src/theme';
import { useRequireAuth } from '../../src/stores';
import { useCompletedActivities } from '../../src/stores/activityResultsStore';

export default function Dashboard() {
  const router = useRouter();
  const { user, team, isHydrated } = useRequireAuth();
  const discriminator = user?.teamDiscriminator ?? undefined;
  const completedActivities = useCompletedActivities(discriminator);
  const completedCount = completedActivities.length;
  const [completedModalVisible, setCompletedModalVisible] = useState(false);

  const openCompletedList = useCallback(() => setCompletedModalVisible(true), []);
  const closeCompletedList = useCallback(() => setCompletedModalVisible(false), []);

  const openActivity = useCallback(
    (activityId: string) => {
      setCompletedModalVisible(false);
      router.push(`/(tabs)/activities/${activityId}?ts=${Date.now()}`);
    },
    [router]
  );

  if (!isHydrated || !user || !team) return null;

  return (
    <Screen>
      <View style={styles.settingsRow}>
        <SettingsButton />
      </View>
      <DashboardHeader
        user={user}
        team={team}
        onProfilePress={() => router.push('/(tabs)/profile')}
      />
      <QuickActionsGrid />
      <ProgressBanner
        completedCount={completedCount}
        onPress={completedCount > 0 ? openCompletedList : undefined}
      />
      <CompletedActivitiesModal
        visible={completedModalVisible}
        completions={completedActivities}
        onClose={closeCompletedList}
        onActivityPress={openActivity}
      />
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
