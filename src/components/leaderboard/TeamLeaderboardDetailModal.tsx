import React, { useMemo } from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '../ui/Card';
import { Chip } from '../ui/Chip';
import { TeamMembersList } from '../team/TeamMembersList';
import { useTheme } from '../../context/ThemeContext';
import { BorderRadius, Spacing } from '../../theme';
import type { TeamActivityCompletion } from '../../stores/selectors/leaderboard';
import type { LeaderboardEntry } from './LeaderboardEntryCard';
import type { TeamMemberSummary } from '../../types';

interface TeamLeaderboardDetailModalProps {
  visible: boolean;
  entry: LeaderboardEntry | null;
  gradeLevel?: string;
  completions: TeamActivityCompletion[];
  members: TeamMemberSummary[];
  loadingMembers: boolean;
  onClose: () => void;
}

export function TeamLeaderboardDetailModal({
  visible,
  entry,
  gradeLevel,
  completions,
  members,
  loadingMembers,
  onClose,
}: TeamLeaderboardDetailModalProps) {
  const { t } = useTranslation();
  const { colors, typography } = useTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        safe: { flex: 1, backgroundColor: colors.background },
        header: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: Spacing.lg,
          paddingVertical: Spacing.md,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        },
        headerText: { flex: 1, paddingRight: Spacing.md },
        title: { ...typography.h2, color: colors.text },
        meta: { ...typography.caption, color: colors.textMuted, marginTop: 4 },
        closeBtn: {
          padding: Spacing.sm,
          borderRadius: BorderRadius.full,
          backgroundColor: colors.surface,
        },
        scroll: { flex: 1 },
        content: {
          padding: Spacing.lg,
          paddingBottom: Spacing.xxxl,
          gap: Spacing.md,
        },
        sectionTitle: {
          ...typography.label,
          color: colors.textSecondary,
          marginBottom: Spacing.sm,
        },
        activityCard: {
          marginBottom: Spacing.sm,
          padding: Spacing.md,
        },
        activityRow: {
          flexDirection: 'row',
          alignItems: 'flex-start',
          gap: Spacing.md,
        },
        activityInfo: { flex: 1 },
        activityName: { ...typography.body, color: colors.text, fontWeight: '600' },
        activityMeta: { ...typography.caption, color: colors.textMuted, marginTop: 4 },
        empty: { ...typography.bodySmall, color: colors.textMuted },
      }),
    [colors, typography]
  );

  if (!entry) return null;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <KeyboardAvoidingView style={styles.safe} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.header}>
            <View style={styles.headerText}>
              <Text style={styles.title}>{entry.teamName}</Text>
              <Text style={styles.meta}>
                {t('dashboard.teamId', { id: entry.teamDiscriminator })}
                {gradeLevel ? ` • ${gradeLevel}` : ''}
              </Text>
            </View>
            <Pressable
              style={styles.closeBtn}
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel={t('common.close', { defaultValue: 'Close' })}
            >
              <Ionicons name="close" size={24} color={colors.text} />
            </Pressable>
          </View>

          <ScrollView style={styles.scroll} keyboardShouldPersistTaps="handled">
            <View style={styles.content}>
              <TeamMembersList
                title={t('leaderboard.teamDetail.members')}
                members={members}
                loading={loadingMembers}
                emptyText={t('setup.noMembersYet')}
                loadingText={t('setup.loadingMembers')}
              />

              <View>
                <Text style={styles.sectionTitle}>{t('leaderboard.teamDetail.completed')}</Text>
                {completions.length === 0 ? (
                  <Text style={styles.empty}>{t('leaderboard.teamDetail.noCompleted')}</Text>
                ) : (
                  completions.map((item) => (
                    <Card key={item.activityId} style={styles.activityCard} variant="outlined">
                      <View style={styles.activityRow}>
                        <Ionicons name="checkmark-circle" size={22} color={colors.secondary} />
                        <View style={styles.activityInfo}>
                          <Text style={styles.activityName}>
                            {t(`data.activities.${item.activityId}.name`, {
                              defaultValue: item.activityName,
                            })}
                          </Text>
                          <Text style={styles.activityMeta}>
                            {t('leaderboard.teamDetail.attempts', { count: item.attempts })} •{' '}
                            {t('leaderboard.teamDetail.lastActivity', {
                              date: new Date(item.lastTimestamp).toLocaleDateString(),
                            })}
                          </Text>
                        </View>
                        <Chip
                          label={`${item.bestScore.toFixed(1)} ${t('leaderboard.pts')}`}
                          variant="outlined"
                          color={colors.primary}
                          size="sm"
                        />
                      </View>
                    </Card>
                  ))
                )}
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}
