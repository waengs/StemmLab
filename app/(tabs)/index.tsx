import React, { useState, useCallback } from 'react';
import { useRouter, useFocusEffect } from 'expo-router';
import {
  Screen,
  DashboardHeader,
  QuickActionsGrid,
  ProgressBanner,
} from '../../src/components';
import { getTeam, getActivityResults } from '../../src/utils/storage';
import type { Team } from '../../src/types';

export default function Dashboard() {
  const router = useRouter();
  const [team, setTeam] = useState<Team | null>(null);
  const [completedCount, setCompletedCount] = useState(0);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const teamData = await getTeam();
        if (!teamData) {
          router.replace('/');
          return;
        }
        setTeam(teamData);

        const results = await getActivityResults();
        const teamResults = results.filter((r) => r.teamDiscriminator === teamData.discriminator);
        setCompletedCount(teamResults.length);
      })();
    }, [router])
  );

  if (!team) return null;

  return (
    <Screen>
      <DashboardHeader team={team} completedCount={completedCount} />
      <QuickActionsGrid />
      <ProgressBanner completedCount={completedCount} />
    </Screen>
  );
}
