import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '../../../src/components/Card';
import { Chip } from '../../../src/components/Chip';
import { ACTIVITIES } from '../../../src/types';
import { Colors, Spacing, BorderRadius, Typography } from '../../../src/theme';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

export default function Activities() {
  const router = useRouter();

  const engineeringActivities = Object.values(ACTIVITIES).filter(a => a.category === 'Engineering');
  const healthActivities = Object.values(ACTIVITIES).filter(a => a.category === 'Health/Medical');

  const CategorySection = ({
    title,
    activities,
    icon,
    color,
  }: {
    title: string;
    activities: typeof engineeringActivities;
    icon: IoniconsName;
    color: string;
  }) => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Ionicons name={icon} size={22} color={color} />
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      {activities.map((activity) => (
        <TouchableOpacity
          key={activity.id}
          activeOpacity={0.7}
          onPress={() => router.push(`/(tabs)/activities/${activity.id}`)}
        >
          <Card style={styles.activityCard}>
            <View style={styles.activityRow}>
              <View style={styles.activityInfo}>
                <Text style={styles.activityName}>{activity.name}</Text>
                <Text style={styles.activityDesc}>{activity.description}</Text>
                <View style={styles.sensorChips}>
                  {activity.sensors.map((sensor: string) => (
                    <Chip
                      key={sensor}
                      label={sensor.replace('-', ' ')}
                      size="sm"
                    />
                  ))}
                </View>
              </View>
              <Ionicons name="chevron-forward" size={22} color={Colors.textMuted} />
            </View>
          </Card>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.pageTitle}>STEM Activities</Text>

        <CategorySection
          title="Engineering Challenges"
          activities={engineeringActivities}
          icon="construct"
          color={Colors.engineering}
        />

        <CategorySection
          title="Health & Medical"
          activities={healthActivities}
          icon="medkit"
          color={Colors.health}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
  },
  content: {
    padding: Spacing.xl,
    paddingBottom: Spacing.xxxl,
  },
  pageTitle: {
    ...Typography.h1,
    marginBottom: Spacing.xxl,
  },
  section: {
    marginBottom: Spacing.xxl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    ...Typography.h2,
  },
  activityCard: {
    marginBottom: Spacing.md,
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activityInfo: {
    flex: 1,
  },
  activityName: {
    ...Typography.h3,
    marginBottom: 2,
  },
  activityDesc: {
    ...Typography.bodySmall,
    marginBottom: Spacing.sm,
  },
  sensorChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
});
