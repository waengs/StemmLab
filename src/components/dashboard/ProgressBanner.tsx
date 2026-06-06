import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { GradientBox } from '../ui/GradientBox';
import { Spacing, BorderRadius } from '../../theme';

interface ProgressBannerProps {
  completedCount: number;
  onPress?: () => void;
}

export function ProgressBanner({ completedCount, onPress }: ProgressBannerProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();

  if (completedCount <= 0) return null;

  const content = (
    <>
      <View style={styles.iconWrap}>
        <Ionicons name="flash" size={28} color={colors.white} />
      </View>
      <View style={styles.text}>
        <Text style={[styles.title, { color: colors.white }]}>{t('dashboard.progressTitle')}</Text>
        <Text style={styles.subtitle}>
          {t('dashboard.progressSubtitle', { count: completedCount })}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={22} color="rgba(255,255,255,0.85)" />
    </>
  );

  const bannerStyle = [styles.banner];

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={t('dashboard.completedStatHint', { count: completedCount })}
      >
        <GradientBox colors={colors.gradientCool} style={bannerStyle}>
          {content}
        </GradientBox>
      </Pressable>
    );
  }

  return (
    <GradientBox colors={colors.gradientCool} style={bannerStyle}>
      {content}
    </GradientBox>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { flex: 1 },
  title: { fontSize: 17, fontWeight: '700' },
  subtitle: { fontSize: 13, color: 'rgba(255,255,255,0.85)', marginTop: 2 },
});
