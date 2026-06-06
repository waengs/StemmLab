import React from 'react';
import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { useThemedStyles } from '../../hooks/useThemedStyles';
import { Spacing, BorderRadius } from '../../theme';
import { useRequireAuth } from '../../stores';
import { resolveParachuteTrialLabel } from '../../utils/parachuteTrialLabel';

interface Props {
  data: any;
}

export function ParachuteDropResults({ data }: Props) {
  const { colors } = useTheme();
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
      paddingBottom: Spacing.xs,
      marginBottom: Spacing.sm,
    },
    tableRow: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.sm },
    tableHeaderCell: {
      ...typography.bodySmall,
      color: c.text,
      fontWeight: '700',
    },
    tableBodyCell: {
      ...typography.bodySmall,
      color: c.textSecondary,
      fontWeight: '400',
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

  if (!data || !data.trials) return null;

  return (
    <View style={styles.container}>
      {data.usedInstantCalc && (
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
          {data.predictedDesign}
        </Text>
      ) : null}

      <View style={styles.tableCard}>
        <Text style={styles.tableTitle}>{t('data.activities.parachute-drop.actualTableTitle')}</Text>
        <View style={styles.tableRowHeader}>
          <Text style={[styles.tableHeaderCell, styles.flex2]}>{t('data.activities.parachute-drop.headerDesign')}</Text>
          <Text style={[styles.tableHeaderCell, styles.flex2]}>Pred.</Text>
          <Text style={[styles.tableHeaderCell, styles.flex2]}>Act.</Text>
          <Text style={[styles.tableHeaderCell, styles.flex2]}>Diff.</Text>
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
                {resolveParachuteTrialLabel(trial.label, t)}
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
                  {resolveParachuteTrialLabel(trial.label, t)}
                </Text>
                <Text style={[styles.tableBodyCell, styles.flex2]}>{trial.manualSpeed || '-'} m/s</Text>
              </View>
            ))}
          </>
        ) : (
          <>
            {data.trials.map((trial: any) => (
              <View key={`calc-hs-${trial.id}`} style={styles.hsCalcBlock}>
                <Text style={styles.hsCalcTitle}>{resolveParachuteTrialLabel(trial.label, t)}</Text>
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
              <Text style={styles.tableBodyCell}>{resolveParachuteTrialLabel(trial.label, t)}</Text>
              <Text style={[styles.tableBodyCell, { fontStyle: 'italic' }]}>{trial.notes}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}
