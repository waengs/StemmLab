import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Card } from '../ui/Card';
import { Colors, Spacing, Typography, BorderRadius } from '../../theme';
import type { ActivityResult } from '../../types';
import type { HandFanData } from './HandFanForm';

interface HandFanResultsProps {
  results: ActivityResult[];
}

export function HandFanResults({ results }: HandFanResultsProps) {
  const { t } = useTranslation();

  if (!results.length) return null;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Past Results</Text>
      
      {results.map((result) => {
        const data = result.data as HandFanData;
        const date = new Date(result.timestamp).toLocaleDateString();
        
        return (
          <Card key={result.id} style={styles.card}>
            <View style={styles.headerRow}>
              <Text style={styles.date}>{date}</Text>
              <Text style={styles.score}>Score: {result.score ?? 100}</Text>
            </View>

            <View style={styles.predictionsBox}>
              <Text style={styles.predictionsTitle}>Predictions</Text>
              <Text style={styles.text}>Best Material: {data.predictedMaterial || 'None'}</Text>
              <Text style={styles.text}>Best Design: {data.predictedDesign || 'None'}</Text>
            </View>

            {data.usedInstantCalc && (
              <View style={styles.penaltyBox}>
                <Text style={styles.penaltyText}>Instant Calc Penalty Applied (-20 pts)</Text>
              </View>
            )}

            <Text style={styles.tableTitle}>Experiment Trials</Text>
            
            <View style={styles.tableRowHeader}>
              <Text style={[styles.tableCell, styles.flex2]}>Design</Text>
              <Text style={[styles.tableCell, styles.flex2]}>Materials</Text>
              <Text style={[styles.tableCell, styles.flex1]}>Dist</Text>
              <Text style={[styles.tableCell, styles.flex1]}>Bend°</Text>
            </View>

            {data.trials?.map((trial) => (
              <View key={trial.id} style={styles.tableRow}>
                <Text style={[styles.tableCell, styles.flex2]}>{trial.design}</Text>
                <Text style={[styles.tableCell, styles.flex2]}>{trial.fanMaterial} → {trial.targetMaterial}</Text>
                <Text style={[styles.tableCell, styles.flex1]}>{trial.distance}</Text>
                <Text style={[styles.tableCell, styles.flex1]}>{trial.maxBendAngle}</Text>
              </View>
            ))}
          </Card>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.md,
    gap: Spacing.md,
  },
  title: {
    ...Typography.h2,
    marginBottom: Spacing.sm,
  },
  card: {
    padding: Spacing.lg,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  date: {
    ...Typography.h3,
  },
  score: {
    ...Typography.h2,
    color: Colors.primary,
  },
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
});
