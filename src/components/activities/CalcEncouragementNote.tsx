import React, { useMemo } from 'react';
import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { BorderRadius, Spacing } from '../../theme';

export function CalcEncouragementNote() {
  const { t } = useTranslation();
  const { colors, typography, isDark } = useTheme();

  const styles = useMemo(
    () =>
      ({
        box: {
          backgroundColor: isDark ? colors.primary + '18' : colors.primary + '10',
          borderLeftWidth: 4,
          borderLeftColor: colors.primaryLight,
          borderRadius: BorderRadius.md,
          padding: Spacing.md,
          marginBottom: Spacing.lg,
        },
        text: {
          ...typography.body,
          color: colors.text,
          lineHeight: 22,
        },
      }) as const,
    [colors, isDark, typography]
  );

  return (
    <View style={styles.box}>
      <Text style={styles.text}>{t('activities.calcEncouragement')}</Text>
    </View>
  );
}
