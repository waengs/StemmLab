import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from '../ui/Card';
import { Colors, Spacing, Typography, BorderRadius } from '../../theme';
import type { ActivityResult } from '../../types';
import type { HumanPerformanceData } from './HumanPerformanceForm';

interface HumanPerformanceResultsProps {
  data: Record<string, unknown>;
}

export function HumanPerformanceResults({ data }: HumanPerformanceResultsProps) {
  const hpData = data as HumanPerformanceData;

  return (
    <View>
      <View style={styles.predictionsBox}>
        <Text style={styles.predictionsTitle}>Predictions</Text>
        <Text style={styles.text}>Hardest movement: {hpData.predictedHardestMovement || 'None'}</Text>
      </View>

      {hpData.usedInstantCalc && (
        <View style={styles.penaltyBox}>
          <Text style={styles.penaltyText}>Instant Calc Penalty Applied (-20 pts)</Text>
        </View>
      )}

      <Text style={styles.tableTitle}>Movement Results</Text>

      <View style={styles.tableRowHeader}>
        <Text style={[styles.tableCell, styles.flex2]}>Movement</Text>
        <Text style={[styles.tableCell, styles.flex1]}>Pred.</Text>
        <Text style={[styles.tableCell, styles.flex1]}>Round 1</Text>
        <Text style={[styles.tableCell, styles.flex1]}>Round 2</Text>
      </View>

      {hpData.trials?.map((trial) => (
        <View key={trial.id} style={styles.tableRow}>
          <Text style={[styles.tableCell, styles.flex2]}>{trial.label}</Text>
          <Text style={[styles.tableCell, styles.flex1]}>{trial.predictedVibration} cm</Text>
          <Text style={[styles.tableCell, styles.flex1]}>{trial.vibrationAvg} cm</Text>
          <Text style={[styles.tableCell, styles.flex1]}>{trial.vibrationAvgWithFeedback} cm</Text>
        </View>
      ))}

      {hpData.trials?.some((t) => t.smoothness) && (
        <View style={styles.metricsBox}>
          <Text style={styles.metricsTitle}>Sensor Metrics</Text>
          {hpData.trials.map((trial) =>
            trial.smoothness ? (
              <Text key={trial.id} style={styles.text}>
                {trial.label}: smoothness {trial.smoothness}/10, ROM {trial.rangeOfMotion} cm
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
  predictionsTitle: {
    ...Typography.label,
    marginBottom: Spacing.xs,
  },
  text: {
    ...Typography.bodySmall,
    marginBottom: 2,
  },
  penaltyBox: {
    backgroundColor: Colors.danger + '20',
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.danger,
  },
  penaltyText: {
    ...Typography.bodySmall,
    color: Colors.danger,
    fontWeight: '600',
    textAlign: 'center',
  },
  tableTitle: {
    ...Typography.h3,
    marginBottom: Spacing.sm,
  },
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
  tableCell: {
    ...Typography.bodySmall,
  },
  flex1: { flex: 1 },
  flex2: { flex: 2 },
  metricsBox: {
    marginTop: Spacing.lg,
    padding: Spacing.md,
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.sm,
  },
  metricsTitle: {
    ...Typography.label,
    marginBottom: Spacing.sm,
  },
});
