import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Grid } from '../layout/Grid';
import { FeatureCard } from '../cards/FeatureCard';
import { Spacing } from '../../theme';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

interface QuickAction {
  title: string;
  description: string;
  icon: IoniconsName;
  color: string;
  path: string;
}

export function QuickActionsGrid() {
  const { t } = useTranslation();
  const router = useRouter();

  const actions: QuickAction[] = [
    {
      title: t('dashboard.startActivity'),
      description: t('dashboard.startActivityDesc'),
      icon: 'flask',
      color: '#3B82F6',
      path: '/(tabs)/activities',
    },
    {
      title: t('dashboard.useSensors'),
      description: t('dashboard.useSensorsDesc'),
      icon: 'radio',
      color: '#10B981',
      path: '/(tabs)/sensors',
    },
    {
      title: t('dashboard.viewLeaderboard'),
      description: t('dashboard.viewLeaderboardDesc'),
      icon: 'trophy',
      color: '#F59E0B',
      path: '/(tabs)/leaderboard',
    },
    {
      title: t('dashboard.forum'),
      description: t('dashboard.forumDesc'),
      icon: 'chatbubbles',
      color: '#8B5CF6',
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
