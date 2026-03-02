import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Card } from '../ui/Card';
import { Avatar } from '../ui/Avatar';
import { Chip } from '../ui/Chip';
import { Colors, Spacing, Typography } from '../../theme';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

export interface LeaderboardEntry {
  teamDiscriminator: string;
  teamName: string;
  score: number;
  count: number;
}

interface LeaderboardEntryCardProps {
  entry: LeaderboardEntry;
  rank: number;
}

function getRankIcon(rank: number): { name: IoniconsName; color: string } | null {
  switch (rank) {
    case 0:
      return { name: 'trophy', color: Colors.gold };
    case 1:
      return { name: 'medal', color: Colors.silver };
    case 2:
      return { name: 'ribbon', color: Colors.bronze };
    default:
      return null;
  }
}

function getRankColor(rank: number) {
  switch (rank) {
    case 0:
      return Colors.gold;
    case 1:
      return Colors.silver;
    case 2:
      return Colors.bronze;
    default:
      return Colors.primary;
  }
}

export function LeaderboardEntryCard({ entry, rank }: LeaderboardEntryCardProps) {
  const { t } = useTranslation();
  const rankIcon = getRankIcon(rank);

  return (
    <Card style={[styles.card, rank === 0 && styles.cardFirst]}>
      <View style={styles.row}>
        <View style={styles.rank}>
          {rankIcon ? (
            <Ionicons name={rankIcon.name} size={24} color={rankIcon.color} />
          ) : (
            <Text style={styles.rankNumber}>#{rank + 1}</Text>
          )}
        </View>
        <Avatar name={entry.teamName} size={40} backgroundColor={getRankColor(rank)} />
        <View style={styles.info}>
          <Text style={styles.name}>{entry.teamName}</Text>
          <Text style={styles.attempts}>
            {entry.count}{' '}
            {entry.count === 1 ? t('leaderboard.attempt') : t('leaderboard.attempt_plural')}
          </Text>
        </View>
        <Chip
          label={`${entry.score.toFixed(1)} ${t('leaderboard.pts')}`}
          variant={rank === 0 ? 'filled' : 'outlined'}
          color={Colors.primary}
          size="md"
        />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: Spacing.sm },
  cardFirst: { borderWidth: 2, borderColor: Colors.gold },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  rank: { width: 32, alignItems: 'center' },
  rankNumber: { ...Typography.h3, color: Colors.textMuted },
  info: { flex: 1 },
  name: { ...Typography.h3 },
  attempts: { ...Typography.caption },
});
