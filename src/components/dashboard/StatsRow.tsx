import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { Spacing, BorderRadius } from '../../theme';

interface StatsRowProps {
  completedCount: number;
}

export function StatsRow({ completedCount }: StatsRowProps) {
  const { t } = useTranslation();
  const { colors, typography } = useTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        row: {
          flexDirection: 'row',
          marginTop: Spacing.xl,
          gap: Spacing.md,
          width: '100%',
        },
        stat: {
          flex: 1,
          backgroundColor: colors.background,
          borderRadius: BorderRadius.md,
          padding: Spacing.lg,
          alignItems: 'center',
        },
        value: { ...typography.h2, color: colors.primary },
        label: { ...typography.caption, marginTop: Spacing.xs },
      }),
    [colors, typography]
  );

  return (
    <View style={styles.row}>
      <View style={styles.stat}>
        <Text style={styles.value}>{completedCount}</Text>
        <Text style={styles.label}>{t('dashboard.completed')}</Text>
      </View>
    </View>
  );
}
