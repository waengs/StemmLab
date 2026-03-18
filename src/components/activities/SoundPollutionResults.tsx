import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Colors, Spacing, Typography, BorderRadius } from '../../theme';
import type { SoundPollutionData, SoundPollutionTrial } from './SoundPollutionForm';

interface Props {
  results: { data: SoundPollutionData }[];
}

export function SoundPollutionResults({ results }: Props) {
  const { t } = useTranslation();

  if (!results || results.length === 0) return null;

  // We primarily show the most recent result if there are multiple.
  const data = results[0].data;

  return (
    <View style={styles.container}>
      {data.predictedLoudestAction ? (
        <Text style={styles.predictionHighlight}>
          <Text style={{fontWeight: '700'}}>Predicted Loudest Action: </Text>
          {data.predictedLoudestAction}
        </Text>
      ) : null}

      <View style={styles.tableCard}>
        <Text style={styles.tableTitle}>Experiment Results</Text>
        <View style={styles.tableRowHeader}>
          <Text style={[styles.tableCell, styles.flex3]}>Action</Text>
          <Text style={[styles.tableCell, styles.flex2]}>Outcome</Text>
          <Text style={[styles.tableCell, styles.flex2]}>Right?</Text>
        </View>
        
        {data.trials?.map((trial: SoundPollutionTrial) => (
          <View key={trial.id} style={styles.trialRowBlock}>
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.flex3, { fontWeight: '700' }]}>{trial.action}</Text>
              <Text style={[styles.tableCell, styles.flex2]}>{trial.outcomeDb ? `${trial.outcomeDb} dB` : '-'}</Text>
              <Text style={[styles.tableCell, styles.flex2, { color: trial.wereYouRight === 'Yes' ? Colors.secondary : Colors.danger }]}>
                {trial.wereYouRight || '-'}
              </Text>
            </View>
            <View style={styles.subDetails}>
              <Text style={styles.detailText}>
                <Text style={{fontWeight: '600'}}>Prediction:</Text> {trial.predictionComparison} {trial.predictionTarget}
              </Text>
              <Text style={styles.detailText}>
                <Text style={{fontWeight: '600'}}>Location:</Text> {trial.location || 'Unknown'}
              </Text>
            </View>
          </View>
        ))}
      </View>

      {(data.surprises || data.needEarMuffs) && (
        <View style={styles.tableCard}>
          <Text style={styles.tableTitle}>Reflection</Text>
          {data.surprises ? (
            <View style={{ marginBottom: Spacing.sm }}>
              <Text style={{ ...Typography.bodySmall, fontWeight: '700' }}>Surprises:</Text>
              <Text style={{...Typography.bodySmall, color: Colors.textSecondary, fontStyle: 'italic'}}>{data.surprises}</Text>
            </View>
          ) : null}
          {data.needEarMuffs ? (
            <View style={{ marginBottom: Spacing.sm }}>
              <Text style={{ ...Typography.bodySmall, fontWeight: '700' }}>Do we need ear muffs?</Text>
              <Text style={{...Typography.bodySmall, color: Colors.textSecondary, fontStyle: 'italic'}}>{data.needEarMuffs}</Text>
            </View>
          ) : null}
        </View>
      )}
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
  flex3: { flex: 3 },
  trialRowBlock: {
    marginBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border + '50',
    paddingBottom: Spacing.sm,
  },
  subDetails: {
    paddingLeft: Spacing.sm,
    borderLeftWidth: 2,
    borderLeftColor: Colors.border,
    marginTop: 2,
  },
  detailText: {
    ...Typography.caption,
    color: Colors.textMuted,
  }
});
