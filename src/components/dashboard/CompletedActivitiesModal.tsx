import React, { useMemo } from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '../ui/Card';
import { useTheme } from '../../context/ThemeContext';
import { BorderRadius, Spacing } from '../../theme';
import type { TeamActivityCompletion } from '../../stores/selectors/leaderboard';

interface CompletedActivitiesModalProps {
  visible: boolean;
  completions: TeamActivityCompletion[];
  onClose: () => void;
  onActivityPress?: (activityId: string) => void;
}

export function CompletedActivitiesModal({
  visible,
  completions,
  onClose,
  onActivityPress,
}: CompletedActivitiesModalProps) {
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
        closeBtn: {
          padding: Spacing.sm,
          borderRadius: BorderRadius.full,
          backgroundColor: colors.surface,
        },
        scroll: { flex: 1 },
        content: {
          padding: Spacing.lg,
          paddingBottom: Spacing.xxxl,
          gap: Spacing.sm,
        },
        activityCard: { padding: Spacing.md },
        activityRow: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: Spacing.md,
        },
        activityName: { ...typography.body, color: colors.text, fontWeight: '600', flex: 1 },
        empty: { ...typography.bodySmall, color: colors.textMuted, textAlign: 'center' },
      }),
    [colors, typography]
  );

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.title}>{t('dashboard.completedListTitle')}</Text>
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
            {completions.length === 0 ? (
              <Text style={styles.empty}>{t('leaderboard.teamDetail.noCompleted')}</Text>
            ) : (
              completions.map((item) => {
                const name = t(`data.activities.${item.activityId}.name`, {
                  defaultValue: item.activityName,
                });
                const card = (
                  <Card key={item.activityId} style={styles.activityCard} variant="outlined">
                    <View style={styles.activityRow}>
                      <Ionicons name="checkmark-circle" size={22} color={colors.secondary} />
                      <Text style={styles.activityName}>{name}</Text>
                      {onActivityPress ? (
                        <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
                      ) : null}
                    </View>
                  </Card>
                );

                if (!onActivityPress) return card;

                return (
                  <Pressable
                    key={item.activityId}
                    onPress={() => onActivityPress(item.activityId)}
                    accessibilityRole="button"
                    accessibilityLabel={name}
                    {...(Platform.OS === 'web' ? ({ style: { cursor: 'pointer' } } as object) : {})}
                  >
                    {card}
                  </Pressable>
                );
              })
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}
