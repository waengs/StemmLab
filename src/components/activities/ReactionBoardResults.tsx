import React from 'react';
import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useThemedStyles } from '../../hooks/useThemedStyles';
import { Spacing, BorderRadius } from '../../theme';
import type { ReactionBoardData } from './ReactionBoardForm';
import { actT } from '../../utils/activityContent';

interface ReactionBoardResultsProps {
  data: ReactionBoardData;
}

export function ReactionBoardResults({ data }: ReactionBoardResultsProps) {
  const { t } = useTranslation();
  const rt = 'data.activities.reaction-board.resultsTable';

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
        <Text style={[styles.tableCell, { flex: 1, textAlign: 'center' }]}>{t(`${rt}.predicted`)}</Text>
        <Text style={[styles.tableCell, { flex: 1, textAlign: 'center' }]}>{t(`${rt}.actual`)}</Text>
      </View>

      <View style={styles.tableRow}>
        <Text style={[styles.tableCell, { flex: 2 }]}>{t(`${rt}.reactionTime`)}</Text>
        <Text style={[styles.tableCell, { flex: 1, textAlign: 'center' }]}>{data.predictedReactionTime || '—'} ms</Text>
        <Text style={[styles.tableCell, { flex: 1, textAlign: 'center' }]}>
          {data.reactionTime !== null ? `${data.reactionTime} ms` : '—'}
        </Text>
      </View>

      <View style={styles.tableRow}>
        <Text style={[styles.tableCell, { flex: 2 }]}>{t(`${rt}.tracingAccuracy`)}</Text>
        <Text style={[styles.tableCell, { flex: 1, textAlign: 'center' }]}>{data.predictedAccuracy || '—'}%</Text>
        <Text style={[styles.tableCell, { flex: 1, textAlign: 'center' }]}>
          {data.accuracy !== null ? `${data.accuracy}%` : '—'}
        </Text>
      </View>

      {data.notes ? (
        <View style={styles.notesContainer}>
          <Text style={styles.notesTitle}>{actT('shared.reflectionNotes')}:</Text>
          <Text style={styles.notesText}>{data.notes}</Text>
        </View>
      ) : null}
    </View>
  );
}
