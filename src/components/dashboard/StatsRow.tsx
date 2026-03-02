import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Colors, Spacing, BorderRadius, Shadows, Typography } from '../../theme';

interface StatsRowProps {
  memberCount: number;
  completedCount: number;
}

export function StatsRow({ memberCount, completedCount }: StatsRowProps) {
  const { t } = useTranslation();

  return (
    <View style={styles.row}>
      <View style={styles.stat}>
        <Text style={styles.number}>{memberCount}</Text>
        <Text style={styles.label}>{t('dashboard.members')}</Text>
      </View>
      <View style={styles.divider} />
      <View style={styles.stat}>
        <Text style={styles.number}>{completedCount}</Text>
        <Text style={styles.label}>{t('dashboard.completed')}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.xl,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xxxl,
    ...Shadows.sm,
  },
  stat: {
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  number: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.primary,
  },
  label: {
    ...Typography.caption,
    marginTop: 2,
  },
  divider: {
    width: 1,
    height: 32,
    backgroundColor: Colors.border,
  },
});
