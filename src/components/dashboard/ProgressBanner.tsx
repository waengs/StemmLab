import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Colors, Spacing, BorderRadius } from '../../theme';

interface ProgressBannerProps {
  completedCount: number;
}

export function ProgressBanner({ completedCount }: ProgressBannerProps) {
  const { t } = useTranslation();

  if (completedCount <= 0) return null;

  return (
    <View style={styles.banner}>
      <Ionicons name="flash" size={28} color={Colors.white} />
      <View style={styles.text}>
        <Text style={styles.title}>{t('dashboard.progressTitle')}</Text>
        <Text style={styles.subtitle}>
          {t('dashboard.progressSubtitle', { count: completedCount })}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    backgroundColor: '#667EEA',
  },
  text: { flex: 1 },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.white,
  },
  subtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 2,
  },
});
