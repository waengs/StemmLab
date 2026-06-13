import React from 'react';
import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useThemedStyles } from '../../hooks/useThemedStyles';
import { Spacing, BorderRadius } from '../../theme';
import { getMovementLabel, resolveMovementLabel } from '../../utils/humanPerformanceMovements';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import type { HumanPerformanceData, MovementId } from './HumanPerformanceForm';

interface HumanPerformanceResultsProps {
  data: Record<string, unknown>;
}

export function HumanPerformanceResults({ data }: HumanPerformanceResultsProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const hpData = data as unknown as HumanPerformanceData;
  if (!hpData || !hpData.trials) return null;
  const rt = 'data.activities.human-performance.resultsTable';

  const styles = useThemedStyles(({ colors, typography }) => ({
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
      marginBottom: 2,
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
    metricsBox: {
      marginTop: Spacing.lg,
      padding: Spacing.md,
      backgroundColor: colors.background,
      borderRadius: BorderRadius.sm,
    },
    metricsTitle: {
      ...typography.label,
      marginBottom: Spacing.sm,
    },
  }));

  const hardestLabel = hpData.predictedHardestMovement
    ? resolveMovementLabel(hpData.predictedHardestMovement, t)
    : t(`${rt}.none`);

  return (
    <View>
      <View style={styles.predictionsBox}>
        <Text style={styles.predictionsTitle}>{t(`${rt}.predictionsSummary`)}</Text>
        <Text style={styles.text}>{t(`${rt}.hardestMovement`, { value: hardestLabel })}</Text>
      </View>

      {hpData.usedInstantCalc && (
        <View style={styles.penaltyBox}>
          <Text style={styles.penaltyText}>{t(`${rt}.instantCalcPenalty`)}</Text>
        </View>
      )}

      <Text style={styles.tableTitle}>{t(`${rt}.movementResults`)}</Text>

      <View style={styles.tableRowHeader}>
        <Text style={[styles.tableCell, styles.flex2]}>{t(`${rt}.movement`)}</Text>
        <Text style={[styles.tableCell, styles.flex1]}>{t("activities.predicted", { defaultValue: "Pred." })}</Text>
        <Text style={[styles.tableCell, styles.flex1]}>{t(`${rt}.round1`)}</Text>
        <Text style={[styles.tableCell, styles.flex1]}>{t("activities.difference", { defaultValue: "Diff." })}</Text>
        <Text style={[styles.tableCell, styles.flex1]}>{t(`${rt}.round2`)}</Text>
      </View>

      {hpData.trials?.map((trial) => {
        const pred = parseFloat(trial.predictedVibration || '');
        const r1 = parseFloat(trial.vibrationAvg || '');
        const diff = !isNaN(pred) && !isNaN(r1) ? Math.abs(pred - r1).toFixed(1) : '—';
        return (
          <View key={trial.id} style={styles.tableRow}>
            <Text style={[styles.tableCell, styles.flex2]}>
              {getMovementLabel(trial.id as MovementId, t)}
            </Text>
            <Text style={[styles.tableCell, styles.flex1]}>{trial.predictedVibration ? `${trial.predictedVibration} cm` : '—'}</Text>
            <Text style={[styles.tableCell, styles.flex1]}>{trial.vibrationAvg ? `${trial.vibrationAvg} cm` : '—'}</Text>
            <Text style={[styles.tableCell, styles.flex1, { color: diff !== '—' && parseFloat(diff) > 2 ? colors.danger : colors.textSecondary }]}>{diff}</Text>
            <Text style={[styles.tableCell, styles.flex1]}>{trial.vibrationAvgWithFeedback ? `${trial.vibrationAvgWithFeedback} cm` : '—'}</Text>
          </View>
        );
      })}

      {hpData.trials?.some((tr) => tr.smoothness) && (
        <View style={styles.metricsBox}>
          <Text style={styles.metricsTitle}>{t('data.activities.human-performance.sensorTitle')}</Text>
          {hpData.trials.map((trial) =>
            trial.smoothness ? (
              <Text key={trial.id} style={styles.text}>
                {getMovementLabel(trial.id as MovementId, t)}: {t(`${rt}.round1`)} {trial.smoothness}/10, ROM{' '}
                {trial.rangeOfMotion} cm
              </Text>
            ) : null
          )}
        </View>
      )}

      <View style={{ marginTop: Spacing.lg, padding: Spacing.md, borderRadius: BorderRadius.sm, backgroundColor: colors.primaryLight + '10', borderWidth: 1, borderColor: colors.primary }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.sm }}>
          <Ionicons name="bulb-outline" size={24} color={colors.primary} style={{ marginRight: Spacing.xs }} />
          <Text style={{ ...styles.tableTitle, marginBottom: 0, color: colors.primary }}>{t("data.activities.human-performance.conclusionTitle")}</Text>
        </View>
        {(() => {
          let bestTrial = hpData.trials[0];
          let maxSmooth = -Infinity;
          hpData.trials.forEach((t: any) => {
            const val = parseFloat(t.smoothness);
            if (!isNaN(val) && val > maxSmooth) {
              maxSmooth = val;
              bestTrial = t;
            }
          });
          const bestLabel = bestTrial ? getMovementLabel(bestTrial.id as MovementId, t) : 'your attempt';
          return (
            <View>
              <Text style={{ ...styles.text, fontWeight: '700', marginBottom: Spacing.sm, fontSize: 14 }}>
                {t("data.activities.human-performance.conclusionBest", { movement: bestLabel, score: maxSmooth !== -Infinity ? maxSmooth : "?" })}
              </Text>
              {hpData.predictedHardestMovement && (
                <Text style={{ ...styles.text, color: colors.secondary, marginBottom: Spacing.sm, fontSize: 14 }}>
                  {t("data.activities.human-performance.conclusionPred", { movement: getMovementLabel(hpData.predictedHardestMovement as any, t) || hpData.predictedHardestMovement, match: hpData.predictedHardestMovement === bestTrial?.id ? t("data.activities.human-performance.conclusionMatch") : t("data.activities.human-performance.conclusionMismatch") })}
                </Text>
              )}
              <Text style={{ ...styles.text, color: colors.textSecondary, fontStyle: 'italic' }}>
                {t("data.activities.human-performance.conclusionScience")}
              </Text>
            </View>
          );
        })()}
      </View>
    </View>
  );
}
