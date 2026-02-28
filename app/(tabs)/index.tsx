import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useFocusEffect } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '../../src/components/Card';
import { Avatar } from '../../src/components/Avatar';
import { getTeam, getActivityResults } from '../../src/utils/storage';
import { Colors, Spacing, BorderRadius, Shadows, Typography } from '../../src/theme';
import type { Team } from '../../src/types';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

export default function Dashboard() {
  const { t } = useTranslation();
  const router = useRouter();
  const [team, setTeam] = useState<Team | null>(null);
  const [completedCount, setCompletedCount] = useState(0);

  const quickActions: {
    title: string;
    description: string;
    icon: IoniconsName;
    color: string;
    path: string;
  }[] = [
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

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const teamData = await getTeam();
        if (!teamData) {
          router.replace('/');
          return;
        }
        setTeam(teamData);

        const results = await getActivityResults();
        const teamResults = results.filter(r => r.teamDiscriminator === teamData.discriminator);
        setCompletedCount(teamResults.length);
      })();
    }, [])
  );

  if (!team) return null;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Avatar name={team.name} size={72} backgroundColor={Colors.primary} />
          <Text style={styles.welcomeText}>{t('dashboard.welcome', { name: team.name })}</Text>
          <Text style={styles.teamInfo}>
            {t('dashboard.teamId', { id: team.discriminator })} • {team.gradeLevel}
          </Text>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{team.members.length}</Text>
              <Text style={styles.statLabel}>{t('dashboard.members')}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{completedCount}</Text>
              <Text style={styles.statLabel}>{t('dashboard.completed')}</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.grid}>
          {quickActions.map((action) => (
            <TouchableOpacity
              key={action.title}
              style={styles.actionCard}
              onPress={() => router.push(action.path as any)}
              activeOpacity={0.7}
            >
              <Card style={styles.actionCardInner}>
                <View style={[styles.actionIcon, { backgroundColor: action.color + '18' }]}>
                  <Ionicons name={action.icon} size={24} color={action.color} />
                </View>
                <Text style={styles.actionTitle}>{action.title}</Text>
                <Text style={styles.actionDescription}>{action.description}</Text>
              </Card>
            </TouchableOpacity>
          ))}
        </View>

        {/* Progress card */}
        {completedCount > 0 && (
          <View style={styles.progressCard}>
            <Ionicons name="flash" size={28} color={Colors.white} />
            <View style={styles.progressText}>
              <Text style={styles.progressTitle}>{t('dashboard.progressTitle')}</Text>
              <Text style={styles.progressSubtitle}>
                {t('dashboard.progressSubtitle', { count: completedCount })}
              </Text>
            </View>
          </View>
        )}
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
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xxl,
  },
  welcomeText: {
    ...Typography.h1,
    marginTop: Spacing.lg,
    textAlign: 'center',
  },
  teamInfo: {
    ...Typography.bodySmall,
    marginTop: Spacing.xs,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.xl,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xxxl,
    ...Shadows.sm,
  },
  statItem: {
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.primary,
  },
  statLabel: {
    ...Typography.caption,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: Colors.border,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  actionCard: {
    width: '48%',
    flexGrow: 1,
  },
  actionCardInner: {
    alignItems: 'flex-start',
  },
  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  actionTitle: {
    ...Typography.h3,
    marginBottom: 2,
  },
  actionDescription: {
    ...Typography.caption,
  },
  progressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    backgroundColor: '#667EEA',
  },
  progressText: {
    flex: 1,
  },
  progressTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.white,
  },
  progressSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 2,
  },
});
