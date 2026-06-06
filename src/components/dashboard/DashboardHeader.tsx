import React, { useMemo } from 'react';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Avatar } from '../ui/Avatar';
import { StemmIntroCard } from './StemmIntroCard';
import { useTheme } from '../../context/ThemeContext';
import { Spacing } from '../../theme';
import type { AppUser, Team } from '../../types';

interface DashboardHeaderProps {
  user: AppUser;
  team: Team;
  onProfilePress: () => void;
}

export function DashboardHeader({ user, team, onProfilePress }: DashboardHeaderProps) {
  const { t } = useTranslation();
  const { typography, colors, isDark } = useTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        header: { alignItems: 'center', marginBottom: Spacing.xxl },
        welcome: {
          ...typography.h1,
          marginTop: Spacing.lg,
          textAlign: 'center',
          color: colors.primary,
        },
        teamInfo: {
          ...typography.bodySmall,
          marginTop: Spacing.xs,
          textAlign: 'center',
          color: colors.textSecondary,
        },
        avatarBtn: {
          borderRadius: 44,
          padding: 3,
          borderWidth: isDark ? 0 : 3,
          borderColor: colors.primaryLight,
          ...(Platform.OS === 'web' ? ({ outlineStyle: 'none' } as object) : {}),
        },
      }),
    [colors, isDark, typography]
  );

  return (
    <View style={styles.header}>
      <Pressable
        onPress={onProfilePress}
        accessibilityRole="button"
        accessibilityLabel={t('profile.openProfile')}
        style={styles.avatarBtn}
        android_ripple={{ color: 'transparent' }}
      >
        <Avatar name={user.displayName} size={72} />
      </Pressable>
      <Text style={styles.welcome}>{t('dashboard.welcome', { name: user.displayName })}</Text>
      <Text style={styles.teamInfo}>
        {team.name} • {t('dashboard.teamId', { id: team.discriminator })}
      </Text>
      <StemmIntroCard />
    </View>
  );
}
