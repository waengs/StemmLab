import React, { useMemo } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Card } from '../ui/Card';
import { useThemedStyles } from '../../hooks/useThemedStyles';
import { useTheme } from '../../context/ThemeContext';
import { Spacing, BorderRadius } from '../../theme';
import type { ActivityResult } from '../../types';
import type { HandFanData } from './HandFanForm';
import { calculateScore } from '../../stores/selectors/leaderboard';
import { resolveHandFanDesign, resolveHandFanMaterial } from '../../utils/handFanLabels';
import { Ionicons } from '@expo/vector-icons';

interface HandFanResultsProps {
  results: any[];
  hideHeader?: boolean;
}

export function HandFanResults({ results, hideHeader }: HandFanResultsProps) {
  const { t } = useTranslation();
  const { colors, typography } = useTheme();

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
      {!hideHeader && <Text style={styles.title}>{t('activities.pastResultsCardTitle')}</Text>}

      {results.map((result) => {
        const data = result.data as HandFanData;
        if (!data || !data.trials) return null;
        const date = new Date(result.timestamp).toLocaleDateString();

        return (
          <Card key={result.id} style={styles.card}>
            {!hideHeader && (
              <View style={styles.headerRow}>
                <Text style={styles.date}>{date}</Text>
                <Text style={styles.score}>{t('activities.scoreLabel', { score: calculateScore(result) })}</Text>
              </View>
            )}

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
              <Text numberOfLines={2} adjustsFontSizeToFit style={[styles.tableCell, { flex: 1.6, fontWeight: '700', marginRight: 4 }]}>{t('data.activities.hand-fan.resultsDesign')}</Text>
              <Text numberOfLines={2} adjustsFontSizeToFit style={[styles.tableCell, { flex: 2.2, fontWeight: '700', marginRight: 4 }]}>{t('data.activities.hand-fan.resultsMaterials')}</Text>
              <Text numberOfLines={2} adjustsFontSizeToFit style={[styles.tableCell, { flex: 1.1, fontWeight: '700', marginRight: 4 }]}>{t('data.activities.hand-fan.resultsPredBend', { defaultValue: 'Pred. Bend' })}</Text>
              <Text numberOfLines={2} adjustsFontSizeToFit style={[styles.tableCell, { flex: 1.1, fontWeight: '700', marginRight: 4 }]}>{t('data.activities.hand-fan.resultsBend')}</Text>
              <Text numberOfLines={2} adjustsFontSizeToFit style={[styles.tableCell, { flex: 0.8, fontWeight: '700' }]}>{t("activities.difference", { defaultValue: "Diff" })}</Text>
            </View>

            {data.trials?.map((trial) => {
              const pred = parseFloat(trial.predictedBendAngle || '');
              const act = parseFloat(trial.maxBendAngle || '');
              const diff = !isNaN(pred) && !isNaN(act) ? Math.abs(pred - act).toFixed(1) : '—';
              return (
                <View key={trial.id}>
                  <View style={styles.tableRow}>
                    <Text style={[styles.tableCell, { flex: 1.6, marginRight: 4 }]}>{displayDesign(trial.design)}</Text>
                    <Text style={[styles.tableCell, { flex: 2.2, marginRight: 4 }]}>
                      {displayMaterial(trial.fanMaterial)} → {displayMaterial(trial.targetMaterial)}
                    </Text>
                    <Text style={[styles.tableCell, { flex: 1.1, marginRight: 4 }]}>{trial.predictedBendAngle ? `${trial.predictedBendAngle}°` : '—'}</Text>
                    <Text style={[styles.tableCell, { flex: 1.1, marginRight: 4 }]}>{trial.maxBendAngle ? `${trial.maxBendAngle}°` : '—'}</Text>
                    <Text style={[styles.tableCell, { flex: 0.8, color: diff !== '—' && parseFloat(diff) > 10 ? colors.danger : colors.textSecondary }]}>{diff}</Text>
                  </View>
                  {trial.manualForce ? (
                    <View style={{ flexDirection: 'row', paddingHorizontal: Spacing.sm, paddingBottom: Spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border }}>
                      <Text style={{ ...typography.bodySmall, color: colors.secondary, fontWeight: '600' }}>
                        {t('data.activities.hand-fan.calcAerodynamicForce', { defaultValue: 'Calculated Aerodynamic Force' })}: {trial.manualForce} N
                      </Text>
                    </View>
                  ) : null}
                </View>
              );
            })}

            <View style={{ marginTop: Spacing.lg, padding: Spacing.md, borderRadius: BorderRadius.sm, backgroundColor: colors.primaryLight + '10', borderWidth: 1, borderColor: colors.primary }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.sm }}>
                <Ionicons name="bulb-outline" size={24} color={colors.primary} style={{ marginRight: Spacing.xs }} />
                <Text style={{ ...typography.h3, marginBottom: 0, color: colors.primary }}>{t("data.activities.hand-fan.conclusionTitle")}</Text>
              </View>
              {(() => {
                let bestTrial = data.trials[0];
                let maxBend = -Infinity;
                data.trials.forEach((t: any) => {
                  const val = parseFloat(t.maxBendAngle);
                  if (!isNaN(val) && val > maxBend) {
                    maxBend = val;
                    bestTrial = t;
                  }
                });
                const bestLabel = bestTrial ? displayDesign(bestTrial.design) : 'your design';
                return (
                  <View>
                    <Text style={{ ...typography.body, fontWeight: '700', marginBottom: Spacing.sm }}>
                      {t("data.activities.hand-fan.conclusionBest", { design: bestLabel, angle: maxBend !== -Infinity ? maxBend : "?" })}
                    </Text>
                    {data.predictedDesign && (
                      <Text style={{ ...typography.body, color: colors.secondary, marginBottom: Spacing.sm }}>
                        {t("data.activities.hand-fan.conclusionPred", { design: displayDesign(data.predictedDesign), material: displayMaterial(data.predictedMaterial), match: data.predictedDesign === bestTrial?.design && data.predictedMaterial === bestTrial?.fanMaterial ? t("data.activities.hand-fan.conclusionMatch") : t("data.activities.hand-fan.conclusionMismatch") })}
                      </Text>
                    )}
                    <Text style={{ ...typography.bodySmall, color: colors.textSecondary, fontStyle: 'italic' }}>
                      "{t("data.activities.hand-fan.conclusionScience")}"
                    </Text>
                  </View>
                );
              })()}
            </View>
          </Card>
        );
      })}
    </ScrollView>
  );
}
