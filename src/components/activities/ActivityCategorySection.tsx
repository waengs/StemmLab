import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SectionHeader } from '../layout/SectionHeader';
import { ActivityListCard } from './ActivityListCard';
import { Spacing } from '../../theme';
import { ACTIVITIES } from '../../types';

type ActivityItem = (typeof ACTIVITIES)[keyof typeof ACTIVITIES];
type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

interface ActivityCategorySectionProps {
  title: string;
  activities: ActivityItem[];
  icon: IoniconsName;
  iconColor: string;
}

export function ActivityCategorySection({
  title,
  activities,
  icon,
  iconColor,
}: ActivityCategorySectionProps) {
  const router = useRouter();

  return (
    <View style={styles.section}>
      <SectionHeader title={title} icon={icon} iconColor={iconColor} />
      {activities.map((activity) => (
        <ActivityListCard
          key={activity.id}
          id={activity.id}
          name={activity.name}
          description={activity.description}
          sensors={activity.sensors}
          onPress={() => router.push(`/(tabs)/activities/${activity.id}`)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginBottom: Spacing.xxl },
});
