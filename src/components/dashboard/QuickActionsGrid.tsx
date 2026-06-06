import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Grid } from '../layout/Grid';
import { FeatureCard } from '../cards/FeatureCard';
import { useTheme } from '../../context/ThemeContext';
import { Spacing } from '../../theme';

export function QuickActionsGrid() {
  const { t } = useTranslation();
  const router = useRouter();
  const { colors } = useTheme();

  const actions = [
    {
      title: t('dashboard.startActivity'),
      description: t('dashboard.startActivityDesc'),
      icon: 'flask' as const,
      color: colors.science,
      path: '/(tabs)/activities',
    },
    {
      title: t('dashboard.useSensors'),
      description: t('dashboard.useSensorsDesc'),
      icon: 'radio' as const,
      color: colors.technology,
      path: '/(tabs)/sensors',
    },
    {
      title: t('dashboard.viewLeaderboard'),
      description: t('dashboard.viewLeaderboardDesc'),
      icon: 'trophy' as const,
      color: colors.accent,
      path: '/(tabs)/leaderboard',
    },
    {
      title: t('dashboard.forum'),
      description: t('dashboard.forumDesc'),
      icon: 'chatbubbles' as const,
      color: colors.maths,
      path: '/(tabs)/forum',
    },
  ];

  return (
    <View style={styles.wrapper}>
      <Grid gap={Spacing.md} rowMinHeight={156}>
        {actions.map((action) => (
          <FeatureCard
            key={action.path}
            title={action.title}
            description={action.description}
            icon={action.icon}
            iconColor={action.color}
            onPress={() => router.push(action.path as never)}
          />
        ))}
      </Grid>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: Spacing.xl,
  },
});
