import React from 'react';
import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useThemedStyles } from '../../hooks/useThemedStyles';
import { useTheme } from '../../context/ThemeContext';
import { Spacing, BorderRadius } from '../../theme';
import type { ReactionBoardData } from './ReactionBoardForm';
import { actT } from '../../utils/activityContent';
import { Ionicons } from '@expo/vector-icons';

interface ReactionBoardResultsProps {
  data: ReactionBoardData;
}

export function ReactionBoardResults({ data }: ReactionBoardResultsProps) {
  const { t } = useTranslation();
  if (!data) return null;
  const rt = 'data.activities.reaction-board.resultsTable';
  const { colors } = useTheme();

  const styles = useThemedStyles(({ colors, typography }) => ({
    container: {
      marginTop: Spacing.sm,
    },
    tableRowHeader: {
      flexDirection: 'row',
      backgroundColor: colors.background,
      padding: Spacing.sm,
      borderTopLeftRadius: BorderRadius.sm,
      borderTopRightRadius: BorderRadius.sm,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    tableRow: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: Spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    tableCell: { ...typography.bodySmall },
    notesContainer: {
      marginTop: Spacing.md,
      padding: Spacing.sm,
      backgroundColor: colors.background,
      borderRadius: BorderRadius.sm,
    },
    notesTitle: {
      ...typography.label,
      marginBottom: Spacing.xs,
    },
    notesText: {
      ...typography.bodySmall,
      color: colors.textSecondary,
      fontStyle: 'italic',
    },
  }));

  return (
    <View style={styles.container}>
      <View style={styles.tableRowHeader}>
        <Text style={[styles.tableCell, { flex: 2 }]}>{t(`${rt}.metric`)}</Text>
        <Text style={[styles.tableCell, { flex: 1, textAlign: 'center', fontWeight: 'bold' }]}>{t("activities.predicted", { defaultValue: "Pred." })}</Text>
        <Text style={[styles.tableCell, { flex: 1, textAlign: 'center', fontWeight: 'bold' }]}>{t("activities.actual", { defaultValue: "Act." })}</Text>
        <Text style={[styles.tableCell, { flex: 1, textAlign: 'center', fontWeight: 'bold' }]}>{t("activities.difference", { defaultValue: "Diff." })}</Text>
      </View>

      <View style={styles.tableRow}>
        <Text style={[styles.tableCell, { flex: 2 }]}>{t(`${rt}.reactionTime`)}</Text>
        <Text style={[styles.tableCell, { flex: 1, textAlign: 'center' }]}>{data.predictedReactionTime || '—'} ms</Text>
        <Text style={[styles.tableCell, { flex: 1, textAlign: 'center' }]}>
          {data.reactionTime !== null ? `${data.reactionTime} ms` : '—'}
        </Text>
        <Text style={[styles.tableCell, { flex: 1, textAlign: 'center', color: data.reactionTime !== null ? (Math.abs(parseFloat(data.predictedReactionTime || '0') - data.reactionTime) < 50 ? colors.secondary : colors.danger) : colors.textSecondary }]}>
          {data.reactionTime !== null && data.predictedReactionTime ? Math.abs(parseFloat(data.predictedReactionTime) - data.reactionTime).toFixed(0) : '—'}
        </Text>
      </View>

      <View style={styles.tableRow}>
        <Text style={[styles.tableCell, { flex: 2 }]}>{t(`${rt}.tracingAccuracy`)}</Text>
        <Text style={[styles.tableCell, { flex: 1, textAlign: 'center' }]}>{data.predictedAccuracy || '—'}%</Text>
        <Text style={[styles.tableCell, { flex: 1, textAlign: 'center' }]}>
          {data.accuracy !== null ? `${data.accuracy}%` : '—'}
        </Text>
        <Text style={[styles.tableCell, { flex: 1, textAlign: 'center', color: data.accuracy !== null ? (Math.abs(parseFloat(data.predictedAccuracy || '0') - data.accuracy) <= 10 ? colors.secondary : colors.danger) : colors.textSecondary }]}>
          {data.accuracy !== null && data.predictedAccuracy ? Math.abs(parseFloat(data.predictedAccuracy) - data.accuracy).toFixed(0) : '—'}
        </Text>
      </View>

      {data.notes ? (
        <View style={styles.notesContainer}>
          <Text style={styles.notesTitle}>{actT('shared.reflectionNotes')}:</Text>
          <Text style={styles.notesText}>{data.notes}</Text>
        </View>
      ) : null}

      <View style={{ marginTop: Spacing.lg, padding: Spacing.md, borderRadius: BorderRadius.sm, backgroundColor: 'rgba(0,0,0,0.05)', borderWidth: 1, borderColor: '#ccc' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.sm }}>
          <Ionicons name="bulb-outline" size={24} color="#000" style={{ marginRight: Spacing.xs }} />
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 0 }}>{t("data.activities.reaction-board.conclusionTitle")}</Text>
        </View>
        <View>
          <Text style={{ fontSize: 14, fontWeight: '700', marginBottom: Spacing.sm }}>
            {t("data.activities.reaction-board.conclusionBest", { time: data.reactionTime !== null ? data.reactionTime : "?", accuracy: data.accuracy !== null ? data.accuracy : "?" })}
          </Text>
          {data.predictedReactionTime && data.reactionTime && (
            <Text style={{ fontSize: 14, color: '#005500', marginBottom: Spacing.sm }}>
              {t("data.activities.reaction-board.conclusionPred", { time: data.predictedReactionTime, match: Math.abs(parseFloat(data.predictedReactionTime) - data.reactionTime) < 50 ? t("data.activities.reaction-board.conclusionMatch") : t("data.activities.reaction-board.conclusionMismatch") })}
            </Text>
          )}
          <Text style={{ fontSize: 12, color: '#666', fontStyle: 'italic' }}>
            "{t("data.activities.reaction-board.conclusionScience")}"
          </Text>
        </View>
      </View>
    </View>
  );
}