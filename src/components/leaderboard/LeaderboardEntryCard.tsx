import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Card } from '../ui/Card';
import { Avatar } from '../ui/Avatar';
import { Chip } from '../ui/Chip';
import { useTheme } from '../../context/ThemeContext';
import { Spacing } from '../../theme';

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
  onPress?: () => void;
}

function getRankIcon(rank: number, colors: ReturnType<typeof useTheme>['colors']): { name: IoniconsName; color: string } | null {
  switch (rank) {
    case 0:
      return { name: 'trophy', color: colors.gold };
    case 1:
      return { name: 'medal', color: colors.silver };
    case 2:
      return { name: 'ribbon', color: colors.bronze };
    default:
      return null;
  }
}

function getRankColor(rank: number, colors: ReturnType<typeof useTheme>['colors']) {
  switch (rank) {
    case 0:
      return colors.gold;
    case 1:
      return colors.silver;
    case 2:
      return colors.bronze;
    default:
      return colors.primary;
  }
}

export function LeaderboardEntryCard({ entry, rank, onPress }: LeaderboardEntryCardProps) {
  const { t } = useTranslation();
  const { colors, typography } = useTheme();
  const rankIcon = getRankIcon(rank, colors);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        card: { marginBottom: Spacing.sm },
        cardFirst: { borderWidth: 2, borderColor: colors.gold },
        row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
        rank: { width: 32, alignItems: 'center' },
        rankNumber: { ...typography.h3, color: colors.textMuted },
        info: { flex: 1 },
        name: { ...typography.h3 },
        attempts: { ...typography.caption },
      }),
    [colors, typography]
  );

  const content = (
    <Card style={[styles.card, rank === 0 && styles.cardFirst]}>
      <View style={styles.row}>
        <View style={styles.rank}>
          {rankIcon ? (
            <Ionicons name={rankIcon.name} size={24} color={rankIcon.color} />
          ) : (
            <Text style={styles.rankNumber}>#{rank + 1}</Text>
          )}
        </View>
        <Avatar name={entry.teamName} size={40} backgroundColor={getRankColor(rank, colors)} />
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
          color={colors.primary}
          size="md"
        />
      </View>
    </Card>
  );

  if (!onPress) return content;

  return (
    <Pressable onPress={onPress} accessibilityRole="button">
      {content}
    </Pressable>
  );
}
