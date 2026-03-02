import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Avatar } from '../ui/Avatar';
import { StatsRow } from './StatsRow';
import { Colors, Spacing, Typography } from '../../theme';
import type { Team } from '../../types';

interface DashboardHeaderProps {
  team: Team;
  completedCount: number;
}

export function DashboardHeader({ team, completedCount }: DashboardHeaderProps) {
  const { t } = useTranslation();

  return (
    <View style={styles.header}>
      <Avatar name={team.name} size={72} backgroundColor={Colors.primary} />
      <Text style={styles.welcome}>{t('dashboard.welcome', { name: team.name })}</Text>
      <Text style={styles.teamInfo}>
        {t('dashboard.teamId', { id: team.discriminator })} • {team.gradeLevel}
      </Text>
      <StatsRow memberCount={team.members.length} completedCount={completedCount} />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xxl,
  },
  welcome: {
    ...Typography.h1,
    marginTop: Spacing.lg,
    textAlign: 'center',
  },
  teamInfo: {
    ...Typography.bodySmall,
    marginTop: Spacing.xs,
  },
});
