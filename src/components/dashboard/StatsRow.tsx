import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { Spacing, BorderRadius } from '../../theme';

interface StatsRowProps {
  completedCount: number;
  onCompletedPress?: () => void;
}

export function StatsRow({ completedCount, onCompletedPress }: StatsRowProps) {
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

  const statContent = (
    <>
      <Text style={styles.value}>{completedCount}</Text>
      <Text style={styles.label}>{t('dashboard.completed')}</Text>
    </>
  );

  const canOpenList = completedCount > 0 && onCompletedPress;

  return (
    <View style={styles.row}>
      {canOpenList ? (
        <Pressable
          style={styles.stat}
          onPress={onCompletedPress}
          accessibilityRole="button"
          accessibilityLabel={t('dashboard.completedStatHint', { count: completedCount })}
          android_ripple={{ color: colors.border }}
        >
          {statContent}
        </Pressable>
      ) : (
        <View style={styles.stat}>{statContent}</View>
      )}
    </View>
  );
}
