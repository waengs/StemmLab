import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Spacing, Typography, BorderRadius } from '../../theme';
import type { BreathingPaceData } from './BreathingPaceForm';

interface BreathingPaceResultsProps {
  data: Record<string, unknown>;
}

export function BreathingPaceResults({ data }: BreathingPaceResultsProps) {
  const bpData = data as BreathingPaceData;

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

const styles = StyleSheet.create({
  predictionsBox: {
    backgroundColor: Colors.background,
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.lg,
  },
  predictionsTitle: { ...Typography.label, marginBottom: Spacing.xs },
  text: { ...Typography.bodySmall, marginBottom: 2 },
  tableTitle: { ...Typography.h3, marginBottom: Spacing.sm },
  tableRowHeader: {
    flexDirection: 'row',
    backgroundColor: Colors.background,
    padding: Spacing.sm,
    borderTopLeftRadius: BorderRadius.sm,
    borderTopRightRadius: BorderRadius.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tableRow: {
    flexDirection: 'row',
    padding: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tableCell: { ...Typography.bodySmall },
  flex1: { flex: 1 },
  flex2: { flex: 2 },
  notesBox: {
    marginTop: Spacing.lg,
    padding: Spacing.md,
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.sm,
  },
  notesTitle: { ...Typography.label, marginBottom: Spacing.sm },
});
