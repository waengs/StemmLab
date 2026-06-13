import React from 'react';
import { View, Text } from 'react-native';
import { useThemedStyles } from '../../hooks/useThemedStyles';
import { Spacing, BorderRadius } from '../../theme';
import type { BreathingPaceData } from './BreathingPaceForm';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';

interface BreathingPaceResultsProps {
  data: Record<string, unknown>;
}

export function BreathingPaceResults({ data }: BreathingPaceResultsProps) {
  const { t } = useTranslation();
  const bpData = data as unknown as BreathingPaceData;


  const getPredictionLabel = (val: string | undefined) => {
    if (!val) return '';
    if (val === 'Jog one minute on the spot') return t('data.activities.breathing-pace.jogOnSpot', { defaultValue: 'Jog one minute on the spot' });
    if (val === '100 star jumps') return t('data.activities.breathing-pace.starJumps', { defaultValue: '100 star jumps' });
    return val;
  };

  const getTrialLabel = (id: string, defaultLabel: string) => {
    if (id === 'atRest') return t('data.activities.breathing-pace.experiment.atRestLabel', { defaultValue: 'Breathing at Rest' });
    if (id === 'afterJog') return t('data.activities.breathing-pace.experiment.afterJogLabel', { defaultValue: 'After Jog' });
    if (id === 'afterStarJump') return t('data.activities.breathing-pace.experiment.afterStarJumpLabel', { defaultValue: 'After Star Jumps' });
    return t(defaultLabel, { defaultValue: defaultLabel });
  };

  const { colors } = useTheme();
  if (!bpData || !bpData.trials) return null;

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
        <Text style={styles.predictionsTitle}>{t('data.activities.breathing-pace.predictionsTitle', { defaultValue: 'Predictions' })}</Text>
        <Text style={styles.text}>{t('data.activities.breathing-pace.mostMovementAfter', { defaultValue: 'Most movement after exercise:' })} {getPredictionLabel(bpData.predictedMostMovement) || 'None'}</Text>
      </View>

      <Text style={styles.tableTitle}>{t('data.activities.breathing-pace.breathingResultsTitle', { defaultValue: 'Breathing Results' })}</Text>

      <View style={styles.tableRowHeader}>
        <Text style={[styles.tableCell, { flex: 2, fontWeight: '700' }]}>{t('common.condition', { defaultValue: 'Condition' })}</Text>
        <Text style={[styles.tableCell, { flex: 1, fontWeight: '700' }]}>{t("activities.predicted", { defaultValue: "Pred." })}</Text>
        <Text style={[styles.tableCell, { flex: 1, fontWeight: '700' }]}>{t('data.activities.breathing-pace.actual', { defaultValue: 'Actual' })}</Text>
        <Text style={[styles.tableCell, { flex: 0.8, fontWeight: '700' }]}>{t("activities.difference", { defaultValue: "Diff" })}</Text>
        <Text style={[styles.tableCell, { flex: 1, fontWeight: '700' }]}>{t('data.activities.breathing-pace.movement', { defaultValue: 'Movement' })}</Text>
      </View>

      {bpData.trials?.map((trial) => {
        const pred = parseFloat(trial.predictedBpm || '');
        const act = parseFloat(trial.breathsPerMinute || '');
        const diff = !isNaN(pred) && !isNaN(act) ? Math.abs(pred - act).toFixed(1) : '—';
        return (
          <View key={trial.id} style={styles.tableRow}>
            <Text style={[styles.tableCell, { flex: 2 }]}>{getTrialLabel(trial.id, trial.label)}</Text>
            <Text style={[styles.tableCell, { flex: 1 }]}>{trial.predictedBpm || '—'}</Text>
            <Text style={[styles.tableCell, { flex: 1 }]}>{trial.breathsPerMinute || '—'}</Text>
            <Text style={[styles.tableCell, { flex: 0.8, color: diff !== '—' && parseFloat(diff) > 5 ? colors.danger : colors.textSecondary }]}>{diff}</Text>
            <Text style={[styles.tableCell, { flex: 1 }]}>{trial.movementAvg ? `${trial.movementAvg} cm` : '—'}</Text>
          </View>
        );
      })}

      {bpData.trials?.some((trial) => trial.notes) && (
        <View style={styles.notesBox}>
          <Text style={styles.notesTitle}>{t('common.notes', { defaultValue: 'Notes' })}</Text>
          {bpData.trials.map((trial) =>
            trial.notes ? (
              <Text key={`${trial.id}-notes`} style={styles.text}>
                {getTrialLabel(trial.id, trial.label)}: {trial.notes}
              </Text>
            ) : null
          )}
        </View>
      )}

      <View style={{ marginTop: Spacing.lg, padding: Spacing.md, borderRadius: BorderRadius.sm, backgroundColor: colors.primaryLight + '10', borderWidth: 1, borderColor: colors.primary }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.sm }}>
          <Ionicons name="bulb-outline" size={24} color={colors.primary} style={{ marginRight: Spacing.xs }} />
          <Text style={{ ...styles.tableTitle, marginBottom: 0, color: colors.primary }}>{t("data.activities.breathing-pace.conclusionTitle")}</Text>
        </View>
        {(() => {
          let restBpm = 0;
          let exerciseBpm = 0;
          let maxMovement = 0;
          let movementWinnerLabel = '';
          
          bpData.trials.forEach((t: any) => {
            const val = parseInt(t.breathsPerMinute || '0', 10);
            if (!isNaN(val)) {
              if (t.id === 'atRest') restBpm = val;
              else if (val > exerciseBpm) exerciseBpm = val;
            }
            if (t.id !== 'atRest') {
              const movement = parseFloat(t.movementAvg || '0');
              if (movement > maxMovement) {
                maxMovement = movement;
                movementWinnerLabel = getTrialLabel(t.id, t.label);
              }
            }
          });
          const increase = exerciseBpm - restBpm;
          const predictedLabel = getPredictionLabel(bpData.predictedMostMovement);
          const isMatch = predictedLabel === movementWinnerLabel;
          
          return (
            <View>
              <Text style={{ ...styles.text, fontWeight: '700', marginBottom: Spacing.sm, fontSize: 14 }}>
                {t('data.activities.breathing-pace.increaseFormat', { increase, defaultValue: `Your breathing rate increased by ${increase} breaths per minute after exercise!` })}
              </Text>
              {bpData.predictedMostMovement && (
                <Text style={{ ...styles.text, color: colors.secondary, marginBottom: Spacing.sm, fontSize: 14 }}>
                  {t("data.activities.breathing-pace.conclusionPred", { condition: predictedLabel, match: isMatch ? t("data.activities.breathing-pace.conclusionMatch", { defaultValue: 'Your prediction matched the results.' }) : t("data.activities.breathing-pace.conclusionMismatch", { defaultValue: 'Your prediction differed from the results.' }), defaultValue: `You predicted ${predictedLabel}. ${isMatch ? 'Your prediction matched.' : 'Your prediction differed.'}` })}
                </Text>
              )}
              <Text style={{ ...styles.text, color: colors.textSecondary, fontStyle: 'italic' }}>
                "{t("data.activities.breathing-pace.conclusionScience")}"
              </Text>
            </View>
          );
        })()}
      </View>
    </View>
  );
}
