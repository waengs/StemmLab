import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Colors, Spacing, Typography, BorderRadius } from '../../theme';
import type { EarthquakeData, EarthquakeTrial } from './EarthquakeForm';

interface Props {
  results: { data: EarthquakeData }[];
}

export function EarthquakeResults({ results }: Props) {
  const { t } = useTranslation();

  if (!results || results.length === 0) return null;

  // We primarily show the most recent result if there are multiple.
  const data = results[0].data;

  return (
    <View style={styles.container}>
      {data.predictedBestDesign ? (
        <Text style={styles.predictionHighlight}>
          <Text style={{fontWeight: '700'}}>Predicted Best Design: </Text>
          {data.predictedBestDesign}
        </Text>
      ) : null}

      <View style={styles.tableCard}>
        <Text style={styles.tableTitle}>Experiment Results</Text>
        <View style={styles.tableRowHeader}>
          <Text style={[styles.tableCell, styles.flex3]}>Design</Text>
          <Text style={[styles.tableCell, styles.flex2]}>Movement</Text>
          <Text style={[styles.tableCell, styles.flex2]}>Right?</Text>
        </View>
        
        {data.trials?.map((trial: EarthquakeTrial) => (
          <View key={trial.id} style={styles.tableRow}>
            <Text style={[styles.tableCell, styles.flex3, { fontWeight: '700' }]}>{trial.design}</Text>
            <Text style={[styles.tableCell, styles.flex2]}>{trial.outcomeMovement || '-'}</Text>
            <Text style={[styles.tableCell, styles.flex2, { color: trial.wereYouRight === 'Yes' ? Colors.secondary : Colors.danger }]}>
              {trial.wereYouRight || '-'}
            </Text>
          </View>
        ))}
      </View>

      {data.surprises ? (
        <View style={styles.tableCard}>
          <Text style={styles.tableTitle}>Reflection</Text>
          <View style={{ marginBottom: Spacing.sm }}>
            <Text style={{ ...Typography.bodySmall, fontWeight: '700' }}>Surprises:</Text>
            <Text style={{...Typography.bodySmall, color: Colors.textSecondary, fontStyle: 'italic'}}>{data.surprises}</Text>
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: Spacing.sm,
  },
  predictionHighlight: {
    ...Typography.body,
    color: Colors.primary,
    marginBottom: Spacing.lg,
    padding: Spacing.sm,
    backgroundColor: Colors.primaryLight + '20',
    borderRadius: BorderRadius.sm,
  },
  tableCard: {
    marginBottom: Spacing.lg,
    padding: Spacing.md,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  tableTitle: {
    ...Typography.bodySmall,
    fontWeight: '700',
    color: '#334155',
    marginBottom: Spacing.md,
  },
  tableRowHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingBottom: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.xs,
  },
  tableCell: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  flex2: { flex: 2 },
  flex3: { flex: 3 }
});
