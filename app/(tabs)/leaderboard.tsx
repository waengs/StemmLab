import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '../../src/components/Card';
import { Avatar } from '../../src/components/Avatar';
import { Chip } from '../../src/components/Chip';
import { getActivityResults } from '../../src/utils/storage';
import { Colors, Spacing, BorderRadius, Typography, Shadows } from '../../src/theme';
import type { ActivityResult } from '../../src/types';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

interface LeaderboardEntry {
  teamDiscriminator: string;
  teamName: string;
  score: number;
  count: number;
}

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
        'earthquake': [],
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
          e => e.teamDiscriminator === result.teamDiscriminator
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

      Object.keys(boards).forEach(key => {
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
        return (parseFloat(result.data.bendAngle) || 0) +
               (parseFloat(result.data.speed) || 0) * 2 +
               (parseFloat(result.data.gracefulness) || 0) * 3;
      case 'reaction-board':
        return (parseFloat(result.data.accuracy) || 0) -
               (parseFloat(result.data.reactionTime) || 1000) / 100;
      case 'breathing-pace':
        return (parseFloat(result.data.consistency) || 0) * 10;
      default:
        return 0;
    }
  };

  const currentBoard = leaderboards[categories[selectedTab].key] || [];

  const getRankIcon = (rank: number): { name: IoniconsName; color: string } | null => {
    switch (rank) {
      case 0: return { name: 'trophy', color: Colors.gold };
      case 1: return { name: 'medal', color: Colors.silver };
      case 2: return { name: 'ribbon', color: Colors.bronze };
      default: return null;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 0: return Colors.gold;
      case 1: return Colors.silver;
      case 2: return Colors.bronze;
      default: return Colors.primary;
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.pageTitle}>{t('leaderboard.pageTitle')}</Text>

        {/* Tab bar */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tabBar}
          contentContainerStyle={styles.tabBarContent}
        >
          {categories.map((cat, idx) => (
            <TouchableOpacity
              key={cat.key}
              style={[styles.tab, idx === selectedTab && styles.tabActive]}
              onPress={() => setSelectedTab(idx)}
              activeOpacity={0.7}
            >
              <Text style={[styles.tabText, idx === selectedTab && styles.tabTextActive]}>
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Leaderboard entries */}
        {currentBoard.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyText}>{t('leaderboard.noResults')}</Text>
          </Card>
        ) : (
          <View>
            {currentBoard.map((entry, index) => {
              const rankIcon = getRankIcon(index);
              return (
                <Card
                  key={entry.teamDiscriminator}
                  style={[
                    styles.entryCard,
                    index === 0 && styles.entryCardFirst,
                  ]}
                >
                  <View style={styles.entryRow}>
                    <View style={styles.rankContainer}>
                      {rankIcon ? (
                        <Ionicons name={rankIcon.name} size={24} color={rankIcon.color} />
                      ) : (
                        <Text style={styles.rankNumber}>#{index + 1}</Text>
                      )}
                    </View>
                    <Avatar
                      name={entry.teamName}
                      size={40}
                      backgroundColor={getRankColor(index)}
                    />
                    <View style={styles.entryInfo}>
                      <Text style={styles.entryName}>{entry.teamName}</Text>
                      <Text style={styles.entryAttempts}>
                        {entry.count} {entry.count === 1 ? t('leaderboard.attempt') : t('leaderboard.attempt_plural')}
                      </Text>
                    </View>
                    <Chip
                      label={`${entry.score.toFixed(1)} ${t('leaderboard.pts')}`}
                      variant={index === 0 ? 'filled' : 'outlined'}
                      color={Colors.primary}
                      size="md"
                    />
                  </View>
                </Card>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
  },
  content: {
    padding: Spacing.xl,
    paddingBottom: Spacing.xxxl,
  },
  pageTitle: {
    ...Typography.h1,
    marginBottom: Spacing.lg,
  },
  tabBar: {
    marginBottom: Spacing.xl,
    marginHorizontal: -Spacing.xl,
  },
  tabBarContent: {
    paddingHorizontal: Spacing.xl,
    gap: Spacing.sm,
  },
  tab: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tabActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  tabText: {
    ...Typography.bodySmall,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  tabTextActive: {
    color: Colors.white,
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: Spacing.xxxl,
  },
  emptyText: {
    ...Typography.body,
    color: Colors.textMuted,
  },
  entryCard: {
    marginBottom: Spacing.sm,
  },
  entryCardFirst: {
    borderWidth: 2,
    borderColor: Colors.gold,
  },
  entryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  rankContainer: {
    width: 32,
    alignItems: 'center',
  },
  rankNumber: {
    ...Typography.h3,
    color: Colors.textMuted,
  },
  entryInfo: {
    flex: 1,
  },
  entryName: {
    ...Typography.h3,
  },
  entryAttempts: {
    ...Typography.caption,
  },
});
