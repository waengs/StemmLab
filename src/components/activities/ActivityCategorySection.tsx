import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SectionHeader } from '../layout/SectionHeader';
import { ActivityListCard } from './ActivityListCard';
import { Spacing, BorderRadius } from '../../theme';
import { ACTIVITIES } from '../../types';
import { useTheme } from '../../context/ThemeContext';

type ActivityItem = (typeof ACTIVITIES)[keyof typeof ACTIVITIES];
type IoniconsName = React.ComponentProps<typeof import('@expo/vector-icons').Ionicons>['name'];

interface ActivityCategorySectionProps {
  title: string;
  description?: string;
  activities: ActivityItem[];
  icon: IoniconsName;
  iconColor: string;
}

export function ActivityCategorySection({
  title,
  description,
  activities,
  icon,
  iconColor,
}: ActivityCategorySectionProps) {
  const router = useRouter();
  const { colors, typography, isDark } = useTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        section: { marginBottom: Spacing.xxl },
        headerBlock: {
          backgroundColor: isDark ? colors.surface : iconColor + '12',
          borderRadius: BorderRadius.lg,
          padding: Spacing.lg,
          marginBottom: Spacing.md,
          borderWidth: 1,
          borderColor: isDark ? colors.border : iconColor + '33',
        },
        description: { marginTop: Spacing.sm, lineHeight: 22 },
      }),
    [colors, iconColor, isDark]
  );

  return (
    <View style={styles.section}>
      <View style={styles.headerBlock}>
        <SectionHeader title={title} icon={icon} iconColor={iconColor} compact />
        {description ? (
          <Text style={[typography.body, styles.description, { color: colors.textSecondary }]}>
            {description}
          </Text>
        ) : null}
      </View>
      {activities.map((activity) => (
        <ActivityListCard
          key={activity.id}
          id={activity.id}
          name={activity.name}
          description={activity.description}
          sensors={activity.sensors}
          accentColor={iconColor}
          onPress={() => router.push(`/(tabs)/activities/${activity.id}?ts=${Date.now()}`)}
        />
      ))}
    </View>
  );
}
