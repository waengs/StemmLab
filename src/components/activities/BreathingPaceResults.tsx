import React from 'react';
import { View, Text } from 'react-native';
import { useThemedStyles } from '../../hooks/useThemedStyles';
import { Spacing, BorderRadius } from '../../theme';
import type { BreathingPaceData } from './BreathingPaceForm';

interface BreathingPaceResultsProps {
  data: Record<string, unknown>;
}

export function BreathingPaceResults({ data }: BreathingPaceResultsProps) {
  const bpData = data as BreathingPaceData;

  const styles = useThemedStyles(({ colors, typography }) => ({
    predictionsBox: {
      backgroundColor: colors.background,
      padding: Spacing.md,
      borderRadius: BorderRadius.sm,
      marginBottom: Spacing.lg,
    },
    predictionsTitle: { ...typography.label, marginBottom: Spacing.xs },
    text: { ...typography.bodySmall, marginBottom: 2 },
    tableTitle: { ...typography.h3, marginBottom: Spacing.sm },
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
      padding: Spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    tableCell: { ...typography.bodySmall },
    flex1: { flex: 1 },
    flex2: { flex: 2 },
    notesBox: {
      marginTop: Spacing.lg,
      padding: Spacing.md,
      backgroundColor: colors.background,
      borderRadius: BorderRadius.sm,
    },
    notesTitle: { ...typography.label, marginBottom: Spacing.sm },
  }));

  return (
    <View>
      <View style={styles.predictionsBox}>
        <Text style={styles.predictionsTitle}>Predictions</Text>
        <Text style={styles.text}>Most movement after exercise: {bpData.predictedMostMovement || 'None'}</Text>
      </View>

      <Text style={styles.tableTitle}>Breathing Results</Text>

      <View style={styles.tableRowHeader}>
        <Text style={[styles.tableCell, styles.flex2]}>Condition</Text>
        <Text style={[styles.tableCell, styles.flex1]}>Pred.</Text>
        <Text style={[styles.tableCell, styles.flex1]}>Actual</Text>
        <Text style={[styles.tableCell, styles.flex1]}>Movement</Text>
      </View>

      {bpData.trials?.map((trial) => (
        <View key={trial.id} style={styles.tableRow}>
          <Text style={[styles.tableCell, styles.flex2]}>{trial.label}</Text>
          <Text style={[styles.tableCell, styles.flex1]}>{trial.predictedBpm || '—'}</Text>
          <Text style={[styles.tableCell, styles.flex1]}>{trial.breathsPerMinute || '—'}</Text>
          <Text style={[styles.tableCell, styles.flex1]}>{trial.movementAvg ? `${trial.movementAvg} cm` : '—'}</Text>
        </View>
      ))}

      {bpData.trials?.some((trial) => trial.notes) && (
        <View style={styles.notesBox}>
          <Text style={styles.notesTitle}>Notes</Text>
          {bpData.trials.map((trial) =>
            trial.notes ? (
              <Text key={`${trial.id}-notes`} style={styles.text}>
                {trial.label}: {trial.notes}
              </Text>
            ) : null
          )}
        </View>
      )}
    </View>
  );
}
