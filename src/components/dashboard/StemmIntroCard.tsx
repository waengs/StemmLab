import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Card } from '../ui/Card';
import { IconBadge } from '../ui/IconBadge';
import { Chip } from '../ui/Chip';
import { GradientBox } from '../ui/GradientBox';
import { useTheme } from '../../context/ThemeContext';
import { Spacing } from '../../theme';

const STEMM_LETTERS = [
  { letter: 'S', labelKey: 'dashboard.introScience', colorKey: 'science' as const },
  { letter: 'T', labelKey: 'dashboard.introTechnology', colorKey: 'technology' as const },
  { letter: 'E', labelKey: 'dashboard.introEngineering', colorKey: 'accent' as const },
  { letter: 'M', labelKey: 'dashboard.introMaths', colorKey: 'maths' as const },
  { letter: 'M', labelKey: 'dashboard.introMedicine', colorKey: 'medicine' as const },
] as const;

export function StemmIntroCard() {
  const { t } = useTranslation();
  const { colors, typography, isDark } = useTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        card: {
          alignSelf: 'stretch',
          marginTop: Spacing.lg,
          marginBottom: Spacing.md,
          padding: 0,
          overflow: 'hidden',
        },
        headerStrip: {
          paddingHorizontal: Spacing.lg,
          paddingVertical: Spacing.md,
        },
        header: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: Spacing.md,
        },
        title: {
          flex: 1,
          color: isDark ? colors.text : colors.white,
        },
        bodyWrap: {
          paddingHorizontal: Spacing.lg,
          paddingBottom: Spacing.lg,
        },
        letters: {
          flexDirection: 'row',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          gap: Spacing.sm,
          marginBottom: Spacing.md,
          marginTop: Spacing.md,
        },
        letterItem: {
          alignItems: 'center',
          minWidth: 56,
          gap: Spacing.xs,
        },
        letterLabel: {
          textAlign: 'center',
          fontSize: 10,
        },
        body: {
          lineHeight: 22,
        },
      }),
    [colors, isDark]
  );

  return (
    <Card variant="elevated" style={styles.card}>
      <GradientBox colors={colors.gradientCool} style={styles.headerStrip}>
        <View style={styles.header}>
          <IconBadge name="flask" color={isDark ? colors.primary : colors.white} />
          <Text style={[typography.h3, styles.title]}>{t('dashboard.introTitle')}</Text>
        </View>
      </GradientBox>

      <View style={styles.bodyWrap}>
        <View style={styles.letters}>
          {STEMM_LETTERS.map((item, index) => {
            const letterColor = colors[item.colorKey];
            return (
              <View key={`${item.letter}-${index}`} style={styles.letterItem}>
                <Chip label={item.letter} variant="filled" color={letterColor} size="md" />
                <Text style={[typography.caption, styles.letterLabel, { color: colors.textSecondary }]}>
                  {t(item.labelKey)}
                </Text>
              </View>
            );
          })}
        </View>

        <Text style={[typography.body, styles.body, { color: colors.textSecondary }]}>
          {t('dashboard.introBody')}
        </Text>
      </View>
    </Card>
  );
}
