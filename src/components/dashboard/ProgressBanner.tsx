import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
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
      <Ionicons name="flash" size={28} color={colors.white} />
      <View style={styles.text}>
        <Text style={[styles.title, { color: colors.white }]}>{t('dashboard.progressTitle')}</Text>
        <Text style={styles.subtitle}>
          {t('dashboard.progressSubtitle', { count: completedCount })}
        </Text>
      </View>
    </>
  );

  if (onPress) {
    return (
      <Pressable
        style={[styles.banner, { backgroundColor: colors.gradientCool[0] }]}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={t('dashboard.completedStatHint', { count: completedCount })}
      >
        {content}
      </Pressable>
    );
  }

  return <View style={[styles.banner, { backgroundColor: colors.gradientCool[0] }]}>{content}</View>;
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
  },
  text: { flex: 1 },
  title: { fontSize: 17, fontWeight: '700' },
  subtitle: { fontSize: 13, color: 'rgba(255,255,255,0.85)', marginTop: 2 },
});
