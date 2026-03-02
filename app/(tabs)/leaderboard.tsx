import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import {
  Screen,
  PageTitle,
  LeaderboardTabs,
  LeaderboardEntryCard,
  EmptyState,
  type LeaderboardEntry,
} from '../../src/components';
import { getActivityResults } from '../../src/utils/storage';
import type { ActivityResult } from '../../src/types';

export default function Leaderboard() {
  const { t } = useTranslation();
  const [selectedTab, setSelectedTab] = useState(0);
  const [leaderboards, setLeaderboards] = useState<Record<string, LeaderboardEntry[]>>({});

  const categories = [
    { label: t('leaderboard.overall'), key: 'overall' },
    { label: t('data.activities.parachute-drop.name', { defaultValue: 'Parachute Drop' }), key: 'parachute-drop' },
    { label: t('data.activities.sound-pollution.name', { defaultValue: 'Sound Pollution' }), key: 'sound-pollution' },
    { label: t('data.activities.hand-fan.name', { defaultValue: 'Hand Fan' }), key: 'hand-fan' },
    { label: t('data.activities.earthquake.name', { defaultValue: 'Earthquake' }), key: 'earthquake' },
    { label: t('data.activities.human-performance.name', { defaultValue: 'Human Performance' }), key: 'human-performance' },
    { label: t('data.activities.reaction-board.name', { defaultValue: 'Reaction Board' }), key: 'reaction-board' },
    { label: t('data.activities.breathing-pace.name', { defaultValue: 'Breathing Pace' }), key: 'breathing-pace' },
  ];

  useEffect(() => {
    (async () => {
      const results = await getActivityResults();
      const boards: Record<string, LeaderboardEntry[]> = {
        overall: [],
        'parachute-drop': [],
        'sound-pollution': [],
        'hand-fan': [],
        earthquake: [],
        'human-performance': [],
        'reaction-board': [],
        'breathing-pace': [],
      };

      const teamStats: Record<string, { count: number; totalScore: number }> = {};

      results.forEach((result: ActivityResult) => {
        if (!teamStats[result.teamDiscriminator]) {
          teamStats[result.teamDiscriminator] = { count: 0, totalScore: 0 };
        }
        teamStats[result.teamDiscriminator].count += 1;

        const score = calculateScore(result);
        teamStats[result.teamDiscriminator].totalScore += score;

        const existingEntry = boards[result.activityId]?.find(
          (e) => e.teamDiscriminator === result.teamDiscriminator
        );

        if (existingEntry) {
          existingEntry.score = Math.max(existingEntry.score, score);
          existingEntry.count += 1;
        } else {
          if (!boards[result.activityId]) {
            boards[result.activityId] = [];
          }
          boards[result.activityId].push({
            teamDiscriminator: result.teamDiscriminator,
            teamName: `Team ${result.teamDiscriminator}`,
            score,
            count: 1,
          });
        }
      });

      Object.entries(teamStats).forEach(([discriminator, stats]) => {
        boards.overall.push({
          teamDiscriminator: discriminator,
          teamName: `Team ${discriminator}`,
          score: stats.totalScore,
          count: stats.count,
        });
      });

      Object.keys(boards).forEach((key) => {
        boards[key].sort((a, b) => b.score - a.score);
      });

      setLeaderboards(boards);
    })();
  }, []);

  const calculateScore = (result: ActivityResult): number => {
    switch (result.activityId) {
      case 'parachute-drop':
        return Math.max(0, 100 - (parseFloat(result.data.gForce) || 0) * 10);
      case 'sound-pollution':
        return parseFloat(result.data.maxDecibels) || 0;
      case 'hand-fan':
        return parseFloat(result.data.windSpeed) || 0;
      case 'earthquake':
        return result.data.survived === 'Yes' ? 100 : 0;
      case 'human-performance':
        return (
          (parseFloat(result.data.bendAngle) || 0) +
          (parseFloat(result.data.speed) || 0) * 2 +
          (parseFloat(result.data.gracefulness) || 0) * 3
        );
      case 'reaction-board':
        return (parseFloat(result.data.accuracy) || 0) - (parseFloat(result.data.reactionTime) || 1000) / 100;
      case 'breathing-pace':
        return (parseFloat(result.data.consistency) || 0) * 10;
      default:
        return 0;
    }
  };

  const currentBoard = leaderboards[categories[selectedTab].key] || [];

  return (
    <Screen>
      <PageTitle>{t('leaderboard.pageTitle')}</PageTitle>

      <LeaderboardTabs
        tabs={categories}
        selectedIndex={selectedTab}
        onSelect={setSelectedTab}
      />

      {currentBoard.length === 0 ? (
        <EmptyState message={t('leaderboard.noResults')} />
      ) : (
        <View>
          {currentBoard.map((entry, index) => (
            <LeaderboardEntryCard
              key={entry.teamDiscriminator}
              entry={entry}
              rank={index}
            />
          ))}
        </View>
      )}
    </Screen>
  );
}
