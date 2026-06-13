import React from 'react';
import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { useThemedStyles } from '../../hooks/useThemedStyles';
import { Spacing, BorderRadius } from '../../theme';
import { useRequireAuth } from '../../stores';
import { resolveParachuteTrialLabel } from '../../utils/parachuteTrialLabel';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  results: any[];
  hideReflection?: boolean;
}

export function ParachuteDropResults({ results, hideReflection }: Props) {
  const { colors } = useTheme();
  const data = results[0]?.data;
  const styles = useThemedStyles(({ colors: c, typography }) => ({
    container: { marginTop: Spacing.sm },
    penaltyAlert: {
      backgroundColor: c.danger + '20',
      padding: Spacing.md,
      borderRadius: BorderRadius.md,
      marginBottom: Spacing.md,
      borderWidth: 1,
      borderColor: c.danger,
    },
    penaltyText: { ...typography.bodySmall, color: c.danger, fontWeight: '700' },
    setupText: { ...typography.bodySmall, color: c.textMuted, marginBottom: Spacing.sm, fontStyle: 'italic' },
    predictionHighlight: {
      ...typography.body,
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
    tableTitle: { ...typography.bodySmall, fontWeight: '700', color: c.text, marginBottom: Spacing.md },
    tableRowHeader: {
      flexDirection: 'row',
      borderBottomWidth: 1,
      borderBottomColor: c.border,
      paddingBottom: Spacing.sm,
      marginBottom: Spacing.sm,
    },
    tableRow: { 
      flexDirection: 'row', 
      alignItems: 'center', 
      paddingVertical: Spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: c.border + '30',
    },
    tableHeaderCell: {
      ...typography.bodySmall,
      color: c.text,
      fontWeight: '700',
      paddingRight: Spacing.sm,
    },
    tableBodyCell: {
      ...typography.bodySmall,
      color: c.textSecondary,
      fontWeight: '400',
      paddingRight: Spacing.sm,
    },
    flex2: { flex: 2 },
    hsCalcBlock: {
      marginBottom: Spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: c.border,
      paddingBottom: Spacing.sm,
    },
    hsCalcTitle: { ...typography.bodySmall, fontWeight: '400', color: c.text, marginBottom: 4 },
    calcLabel: { fontWeight: '700', color: c.text },
    calcText: { ...typography.bodySmall, color: c.textSecondary, marginBottom: 2 },
  }));
  const { t } = useTranslation();
  const { team } = useRequireAuth();
  
  const isHighSchool = team?.gradeLevel === t('setup.gradeLowerHigh') || 
                       team?.gradeLevel === 'Lower High School (Grades 7–9)' || 
                       team?.gradeLevel?.includes('High');

  const getTrialName = (trial: any) => trial.customName || resolveParachuteTrialLabel(trial.label, t);

  const getRiskLevel = (gForceStr: string) => {
    const gf = parseFloat(gForceStr);
    if (isNaN(gf)) return '-';
    if (gf <= 5) return t('data.activities.parachute-drop.riskLevels.noInjury');
    if (gf <= 10) return t('data.activities.parachute-drop.riskLevels.bruising');
    if (gf <= 30) return t('data.activities.parachute-drop.riskLevels.serious');
    if (gf <= 50) return t('data.activities.parachute-drop.riskLevels.severe');
    return t('data.activities.parachute-drop.riskLevels.lifeThreatening');
  };

  if (!data || !data.trials) return null;

  return (
    <View style={styles.container}>
      {!hideReflection && data.usedInstantCalc && (
        <View style={styles.penaltyAlert}>
          <Text style={styles.penaltyText}>
            {t('data.activities.parachute-drop.instantCalcPenalty')}
          </Text>
        </View>
      )}

      <Text style={styles.setupText}>
        {t('data.activities.parachute-drop.dropHeight')}: {data.dropHeight || '?'} | {' '}
        {t('data.activities.parachute-drop.toyMass')}: {data.toyMass || '?'}
      </Text>
      
      {data.predictedDesign ? (
        <Text style={styles.predictionHighlight}>
          <Text style={{ fontWeight: '700' }}>Best Design Prediction: </Text>
          {data.trials?.find((t: any) => t.label === data.predictedDesign) 
            ? getTrialName(data.trials.find((t: any) => t.label === data.predictedDesign))
            : resolveParachuteTrialLabel(data.predictedDesign, t)}
        </Text>
      ) : null}

      <View style={styles.tableCard}>
        <Text style={styles.tableTitle}>{t('data.activities.parachute-drop.actualTableTitle')}</Text>
        <View style={styles.tableRowHeader}>
          <Text style={[styles.tableHeaderCell, styles.flex2]}>{t('data.activities.parachute-drop.headerDesign')}</Text>
          <Text style={[styles.tableHeaderCell, styles.flex2]}>{t("activities.predicted", { defaultValue: "Pred." })}</Text>
          <Text style={[styles.tableHeaderCell, styles.flex2]}>{t("activities.actual", { defaultValue: "Act." })}</Text>
          <Text style={[styles.tableHeaderCell, styles.flex2]}>{t("activities.difference", { defaultValue: "Diff." })}</Text>
        </View>
        
        {data.trials.map((trial: any) => {
          const p = parseFloat(trial.predictedTime) || 0;
          const a = parseFloat(trial.actualTime) || 0;
          const absDiff = Math.abs(p - a);
          const hasActual = Boolean(trial.actualTime);
          const diffColor = !hasActual
            ? colors.textSecondary
            : absDiff < 0.01
              ? colors.secondary
              : colors.danger;
          return (
            <View key={trial.id} style={styles.tableRow}>
              <Text style={[styles.tableBodyCell, styles.flex2]}>
                {getTrialName(trial)}
              </Text>
              <Text style={[styles.tableBodyCell, styles.flex2]}>{trial.predictedTime || '-'}</Text>
              <Text style={[styles.tableBodyCell, styles.flex2]}>{trial.actualTime || '-'}</Text>
              <Text style={[styles.tableBodyCell, styles.flex2, { color: diffColor }]}>
                {hasActual ? absDiff.toFixed(2) : '-'}
              </Text>
            </View>
          );
        })}
      </View>

      <View style={styles.tableCard}>
        <Text style={styles.tableTitle}>{t('data.activities.parachute-drop.calculationsTableTitle')}</Text>
        {!isHighSchool ? (
          <>
            <View style={styles.tableRowHeader}>
              <Text style={[styles.tableHeaderCell, styles.flex2]}>{t('data.activities.parachute-drop.headerDesign')}</Text>
              <Text style={[styles.tableHeaderCell, styles.flex2]}>{t('data.activities.parachute-drop.headerSpeed')}</Text>
            </View>
            {data.trials.map((trial: any) => (
              <View key={`calc-${trial.id}`} style={styles.tableRow}>
                <Text style={[styles.tableBodyCell, styles.flex2]}>
                  {getTrialName(trial)}
                </Text>
                <Text style={[styles.tableBodyCell, styles.flex2]}>{trial.manualSpeed || '-'} m/s</Text>
              </View>
            ))}
          </>
        ) : (
          <>
            {data.trials.map((trial: any) => (
              <View key={`calc-hs-${trial.id}`} style={styles.hsCalcBlock}>
                <Text style={styles.hsCalcTitle}>{getTrialName(trial)}</Text>
                <Text style={styles.calcText}>
                  <Text style={styles.calcLabel}>{t('data.activities.parachute-drop.headerVelocity')}: </Text>
                  {trial.manualVelocity || '-'} m/s
                </Text>
                <Text style={styles.calcText}>
                  <Text style={styles.calcLabel}>{t('data.activities.parachute-drop.headerAccel')}: </Text>
                  {trial.manualAcceleration || '-'} m/s²
                </Text>
                <Text style={styles.calcText}>
                  <Text style={styles.calcLabel}>{t('data.activities.parachute-drop.headerNetForce')}: </Text>
                  {trial.manualNetForce || '-'} N
                </Text>
                <Text style={styles.calcText}>
                  <Text style={styles.calcLabel}>{t('data.activities.parachute-drop.headerDragForce')}: </Text>
                  {trial.manualDragForce || '-'} N
                </Text>
                <Text style={styles.calcText}>
                  <Text style={styles.calcLabel}>{t('data.activities.parachute-drop.headerGForce')}: </Text>
                  {trial.manualGForce || '-'} g
                </Text>
                {trial.manualGForce ? (
                  <Text style={styles.calcText}>
                    <Text style={styles.calcLabel}>{t('data.activities.parachute-drop.riskLevels.riskLevelLabel')} </Text>
                    {getRiskLevel(trial.manualGForce)}
                  </Text>
                ) : null}
              </View>
            ))}
          </>
        )}
      </View>
      
      {data.trials.some((trial: any) => trial.notes) && (
        <View style={styles.tableCard}>
          <Text style={styles.tableTitle}>{t('common.notes')}</Text>
          {data.trials.filter((trial: any) => trial.notes).map((trial: any) => (
            <View key={`notes-${trial.id}`} style={{ marginBottom: Spacing.sm }}>
              <Text style={styles.tableBodyCell}>{getTrialName(trial)}</Text>
              <Text style={[styles.tableBodyCell, { fontStyle: 'italic' }]}>{trial.notes}</Text>
            </View>
          ))}
        </View>
      )}

      <View style={[styles.tableCard, { borderColor: colors.primary, backgroundColor: colors.primaryLight + '10' }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.sm }}>
          <Ionicons name="bulb-outline" size={24} color={colors.primary} style={{ marginRight: Spacing.xs }} />
          <Text style={[styles.tableTitle, { marginBottom: 0, color: colors.primary }]}>{t("data.activities.parachute-drop.conclusionTitle")}</Text>
        </View>
        {(() => {
          let bestTrial = data.trials[0];
          let maxTime = -Infinity;
          data.trials.forEach((t: any) => {
            const val = parseFloat(t.actualTime);
            if (!isNaN(val) && val > maxTime) {
              maxTime = val;
              bestTrial = t;
            }
          });
          const bestLabel = bestTrial ? getTrialName(bestTrial) : 'your design';
          return (
            <View>
              <Text style={{ fontWeight: '700', marginBottom: Spacing.sm }}>
                {t("data.activities.parachute-drop.conclusionBest", { design: bestLabel, time: maxTime !== -Infinity ? maxTime : "?" })}
              </Text>
              {data.predictedDesign && (
                <Text style={{ color: colors.secondary, marginBottom: Spacing.sm }}>
                  {t("data.activities.parachute-drop.conclusionPred", { design: data.trials.find((t: any) => t.label === data.predictedDesign) ? getTrialName(data.trials.find((t: any) => t.label === data.predictedDesign)) : resolveParachuteTrialLabel(data.predictedDesign, t), match: data.predictedDesign === bestTrial?.label ? t("data.activities.parachute-drop.conclusionMatch") : t("data.activities.parachute-drop.conclusionMismatch") })}
                </Text>
              )}
              <Text style={{ color: colors.textSecondary, fontStyle: 'italic' }}>
                "{t("data.activities.parachute-drop.conclusionScience")}"
              </Text>
            </View>
          );
        })()}
      </View>
    </View>
  );
}