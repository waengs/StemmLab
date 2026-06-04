import React, { useMemo } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Card } from '../ui/Card';
import { useThemedStyles } from '../../hooks/useThemedStyles';
import { Spacing, BorderRadius } from '../../theme';
import type { ActivityResult } from '../../types';
import type { HandFanData } from './HandFanForm';
import { calculateScore } from '../../stores/selectors/leaderboard';
import { resolveHandFanDesign, resolveHandFanMaterial } from '../../utils/handFanLabels';

interface HandFanResultsProps {
  results: ActivityResult[];
}

export function HandFanResults({ results }: HandFanResultsProps) {
  const { t } = useTranslation();

  const displayMaterial = (material: string) => resolveHandFanMaterial(material, t);
  const displayDesign = (design: string) => resolveHandFanDesign(design, t);

  const styles = useThemedStyles(({ colors, typography }) => ({
    container: {
      padding: Spacing.md,
      gap: Spacing.md,
    },
    title: {
      ...typography.h2,
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
      borderBottomColor: colors.borderLight,
    },
    date: {
      ...typography.h3,
    },
    score: {
      ...typography.h2,
      color: colors.primary,
    },
    predictionsBox: {
      backgroundColor: colors.background,
      padding: Spacing.md,
      borderRadius: BorderRadius.sm,
      marginBottom: Spacing.lg,
    },
    predictionsTitle: {
      ...typography.label,
      marginBottom: Spacing.xs,
    },
    text: {
      ...typography.bodySmall,
    },
    penaltyBox: {
      backgroundColor: colors.danger + '20',
      padding: Spacing.md,
      borderRadius: BorderRadius.sm,
      marginBottom: Spacing.lg,
      borderWidth: 1,
      borderColor: colors.danger,
    },
    penaltyText: {
      ...typography.bodySmall,
      color: colors.danger,
      fontWeight: '600',
      textAlign: 'center',
    },
    tableTitle: {
      ...typography.h3,
      marginBottom: Spacing.sm,
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
      padding: Spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    tableCell: {
      ...typography.bodySmall,
    },
    flex1: { flex: 1 },
    flex2: { flex: 2 },
  }));

  if (!results.length) return null;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{t('activities.pastResultsCardTitle')}</Text>

      {results.map((result) => {
        const data = result.data as HandFanData;
        const date = new Date(result.timestamp).toLocaleDateString();

        return (
          <Card key={result.id} style={styles.card}>
            <View style={styles.headerRow}>
              <Text style={styles.date}>{date}</Text>
              <Text style={styles.score}>{t('activities.scoreLabel', { score: calculateScore(result) })}</Text>
            </View>

            <View style={styles.predictionsBox}>
              <Text style={styles.predictionsTitle}>{t('data.activities.hand-fan.predictionsSummary')}</Text>
              <Text style={styles.text}>
                {t('data.activities.hand-fan.bestMaterial', {
                  value: data.predictedMaterial
                    ? displayMaterial(data.predictedMaterial)
                    : t('data.activities.hand-fan.none'),
                })}
              </Text>
              <Text style={styles.text}>
                {t('data.activities.hand-fan.bestDesign', {
                  value: data.predictedDesign
                    ? displayDesign(data.predictedDesign)
                    : t('data.activities.hand-fan.none'),
                })}
              </Text>
            </View>

            {data.usedInstantCalc && (
              <View style={styles.penaltyBox}>
                <Text style={styles.penaltyText}>{t('data.activities.hand-fan.instantCalcPenalty')}</Text>
              </View>
            )}

            <Text style={styles.tableTitle}>{t('data.activities.hand-fan.experimentTrials')}</Text>

            <View style={styles.tableRowHeader}>
              <Text style={[styles.tableCell, styles.flex2]}>{t('data.activities.hand-fan.resultsDesign')}</Text>
              <Text style={[styles.tableCell, styles.flex2]}>{t('data.activities.hand-fan.resultsMaterials')}</Text>
              <Text style={[styles.tableCell, styles.flex1]}>{t('data.activities.hand-fan.resultsDistance')}</Text>
              <Text style={[styles.tableCell, styles.flex1]}>{t('data.activities.hand-fan.resultsBend')}</Text>
            </View>

            {data.trials?.map((trial) => (
              <View key={trial.id} style={styles.tableRow}>
                <Text style={[styles.tableCell, styles.flex2]}>{displayDesign(trial.design)}</Text>
                <Text style={[styles.tableCell, styles.flex2]}>
                  {displayMaterial(trial.fanMaterial)} → {displayMaterial(trial.targetMaterial)}
                </Text>
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
