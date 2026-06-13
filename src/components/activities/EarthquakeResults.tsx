import React from 'react';
import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { useThemedStyles } from '../../hooks/useThemedStyles';
import { Spacing, BorderRadius } from '../../theme';
import type { EarthquakeData, EarthquakeTrial } from './EarthquakeForm';
import { actT } from '../../utils/activityContent';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  results: { data: EarthquakeData }[];
  hideReflection?: boolean;
}

function isAffirmative(value: string | undefined, t: (key: string) => string): boolean {
  if (!value) return false;
  return value === t('common.yes') || value === 'Yes' || value === 'Ya';
}

export function EarthquakeResults({ results, hideReflection }: Props) {
  const { t } = useTranslation();
  const { colors, typography } = useTheme();

  const styles = useThemedStyles(({ colors: c, typography: typ }) => ({
    container: {
      marginTop: Spacing.sm,
    },
    predictionHighlight: {
      ...typ.body,
      color: c.primary,
      marginBottom: Spacing.lg,
      padding: Spacing.sm,
      backgroundColor: c.primaryLight + '20',
      borderRadius: BorderRadius.sm,
    },
    tableCard: {
      marginBottom: Spacing.lg,
      padding: Spacing.md,
      backgroundColor: c.surface,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: c.border,
    },
    tableTitle: {
      ...typ.bodySmall,
      fontWeight: '700',
      color: c.text,
      marginBottom: Spacing.md,
    },
    tableRowHeader: {
      flexDirection: 'row',
      borderBottomWidth: 1,
      borderBottomColor: c.border,
      paddingBottom: Spacing.xs,
      marginBottom: Spacing.sm,
    },
    tableRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: Spacing.xs,
    },
    tableCell: {
      ...typ.bodySmall,
      color: c.textSecondary,
    },
    flex2: { flex: 2 },
    flex3: { flex: 3 },
  }));

  if (!results || results.length === 0) return null;

  const data = results[0].data;
  if (!data || !data.trials) return null;

  return (
    <View style={styles.container}>
      {data.predictedBestDesign ? (
        <Text style={styles.predictionHighlight}>
          {t('data.activities.earthquake.predictedBestSummary', {
            value: data.trials.find(t => t.id === data.predictedBestDesign)?.design || data.predictedBestDesign,
          })}
        </Text>
      ) : null}

      <View style={styles.tableCard}>
        <Text style={styles.tableTitle}>{t('data.activities.earthquake.experimentResultsTitle')}</Text>
        <View style={styles.tableRowHeader}>
          <Text style={[styles.tableCell, { flex: 2, fontWeight: '700' }]}>{t('data.activities.earthquake.resultsDesign')}</Text>
          <Text style={[styles.tableCell, { flex: 1.5, fontWeight: '700' }]}>{t('data.activities.earthquake.resultsPredicted', { defaultValue: 'Predicted' })}</Text>
          <Text style={[styles.tableCell, { flex: 1.5, fontWeight: '700' }]}>{t('data.activities.earthquake.resultsActual', { defaultValue: 'Actual' })}</Text>
          <Text style={[styles.tableCell, { flex: 1, fontWeight: '700' }]}>{t("activities.difference", { defaultValue: "Diff" })}</Text>
        </View>

        {data.trials?.map((trial: EarthquakeTrial) => {
          const predDeg = parseFloat(trial.predictedMovement || '');
          const actDeg = parseFloat(trial.outcomeMovement || '');
          const diffDeg = !isNaN(predDeg) && !isNaN(actDeg) ? Math.abs(predDeg - actDeg).toFixed(1) : '—';

          const predCm = parseFloat(trial.predictedMovementCm || '');
          const actCm = parseFloat(trial.outcomeMovementCm || '');
          const diffCm = !isNaN(predCm) && !isNaN(actCm) ? Math.abs(predCm - actCm).toFixed(1) : '—';

          return (
            <View key={trial.id} style={[styles.tableRow, { borderBottomWidth: 1, borderBottomColor: colors.border + '40', paddingBottom: Spacing.xs, marginBottom: Spacing.sm }]}>
              <Text style={[styles.tableCell, { flex: 2, fontWeight: '700' }]}>
                {trial.design}
              </Text>
              <View style={{ flex: 1.5 }}>
                <Text style={styles.tableCell}>{trial.predictedMovement ? `${trial.predictedMovement}°` : '—'}</Text>
                <Text style={styles.tableCell}>{trial.predictedMovementCm ? `${trial.predictedMovementCm}cm` : '—'}</Text>
              </View>
              <View style={{ flex: 1.5 }}>
                <Text style={styles.tableCell}>{trial.outcomeMovement ? `${trial.outcomeMovement}` : '—'}</Text>
                <Text style={styles.tableCell}>{trial.outcomeMovementCm ? `${trial.outcomeMovementCm}cm` : '—'}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.tableCell, { color: diffDeg !== '—' && parseFloat(diffDeg) > 5 ? colors.danger : colors.textSecondary }]}>{diffDeg !== '—' ? `${diffDeg}°` : '—'}</Text>
                <Text style={[styles.tableCell, { color: diffCm !== '—' && parseFloat(diffCm) > 2 ? colors.danger : colors.textSecondary }]}>{diffCm !== '—' ? `${diffCm}cm` : '—'}</Text>
              </View>
            </View>
          );
        })}
      </View>

      {!hideReflection && data.surprises ? (
        <View style={styles.tableCard}>
          <Text style={styles.tableTitle}>{actT('shared.reflectionTitle')}</Text>
          <View style={{ marginBottom: Spacing.sm }}>
            <Text style={{ ...typography.bodySmall, fontWeight: '700' }}>
              {t('data.activities.earthquake.surprisesLabel')}
            </Text>
            <Text style={{ ...typography.bodySmall, color: colors.textSecondary, fontStyle: 'italic' }}>
              {data.surprises}
            </Text>
          </View>
        </View>
      ) : null}

      <View style={[styles.tableCard, { borderColor: colors.primary, backgroundColor: colors.primaryLight + '10' }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.sm }}>
          <Ionicons name="bulb-outline" size={24} color={colors.primary} style={{ marginRight: Spacing.xs }} />
          <Text style={[styles.tableTitle, { marginBottom: 0, color: colors.primary }]}>{t("data.activities.earthquake.conclusionTitle")}</Text>
        </View>
        {(() => {
          let bestTrial = data.trials[0];
          data.trials.forEach((t: EarthquakeTrial) => {
            const valDeg = parseFloat(t.outcomeMovement);
            const valCm = parseFloat(t.outcomeMovementCm || '');
            const totalScore = (isNaN(valDeg) ? 1000 : valDeg) + (isNaN(valCm) ? 1000 : valCm * 10);
            
            const currentBestDeg = parseFloat(bestTrial?.outcomeMovement || '');
            const currentBestCm = parseFloat(bestTrial?.outcomeMovementCm || '');
            const currentBestScore = (isNaN(currentBestDeg) ? 1000 : currentBestDeg) + (isNaN(currentBestCm) ? 1000 : currentBestCm * 10);

            if (totalScore < currentBestScore) {
              bestTrial = t;
            }
          });
          const bestLabel = bestTrial ? bestTrial.design : 'your design';
          const finalDeg = parseFloat(bestTrial?.outcomeMovement || '');
          const finalCm = parseFloat(bestTrial?.outcomeMovementCm || '');
          return (
            <View>
              <Text style={{ ...typography.body, fontWeight: '700', marginBottom: Spacing.sm }}>
                {t("data.activities.earthquake.conclusionBest", { design: bestLabel, deg: isNaN(finalDeg) ? "?" : finalDeg, cm: isNaN(finalCm) ? "?" : finalCm })}
              </Text>
              {data.predictedBestDesign && (() => {
                const predictedDesignText = data.trials.find(t => t.id === data.predictedBestDesign)?.design || data.predictedBestDesign;
                return (
                  <Text style={{ ...typography.body, color: colors.secondary, marginBottom: Spacing.sm }}>
                    {t("data.activities.earthquake.conclusionPred", { design: predictedDesignText, match: data.predictedBestDesign === bestTrial?.id ? t("data.activities.earthquake.conclusionMatch") : t("data.activities.earthquake.conclusionMismatch") })}
                  </Text>
                );
              })()}
              <Text style={{ ...typography.bodySmall, color: colors.textSecondary, fontStyle: 'italic' }}>
                {t("data.activities.earthquake.conclusionScience")}
              </Text>
            </View>
          );
        })()}
      </View>
    </View>
  );
}