import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Colors, Spacing, Typography, BorderRadius } from '../../theme';
import { useRequireAuth } from '../../stores';

interface Props {
  data: any;
}

export function ParachuteDropResults({ data }: Props) {
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
          <Text style={styles.penaltyText}>⚠️ Used Instant Calculations (Penalty Applied)</Text>
        </View>
      )}

      <Text style={styles.setupText}>
        {t('data.activities.parachute-drop.dropHeight')}: {data.dropHeight || '?'} | {' '}
        {t('data.activities.parachute-drop.toyMass')}: {data.toyMass || '?'}
      </Text>
      
      {data.predictedDesign ? (
        <Text style={styles.predictionHighlight}>
          <Text style={{fontWeight: '700'}}>Best Design Prediction: </Text>
          {data.predictedDesign}
        </Text>
      ) : null}

      {/* Actual Results Summary */}
      <View style={styles.tableCard}>
        <Text style={styles.tableTitle}>{t('data.activities.parachute-drop.actualTableTitle')}</Text>
        <View style={styles.tableRowHeader}>
          <Text style={[styles.tableCell, styles.flex2]}>{t('data.activities.parachute-drop.headerDesign')}</Text>
          <Text style={[styles.tableCell, styles.flex2]}>Pred.</Text>
          <Text style={[styles.tableCell, styles.flex2]}>Act.</Text>
          <Text style={[styles.tableCell, styles.flex2]}>Diff.</Text>
        </View>
        
        {data.trials.map((trial: any) => {
          const p = parseFloat(trial.predictedTime) || 0;
          const a = parseFloat(trial.actualTime) || 0;
          const absDiff = Math.abs(p - a);
          const hasActual = Boolean(trial.actualTime);
          const diffColor = !hasActual
            ? Colors.textSecondary
            : absDiff < 0.01
              ? Colors.secondary
              : Colors.danger;
          return (
            <View key={trial.id} style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.flex2, { fontWeight: '700' }]}>{trial.label}</Text>
              <Text style={[styles.tableCell, styles.flex2]}>{trial.predictedTime || '-'}</Text>
              <Text style={[styles.tableCell, styles.flex2]}>{trial.actualTime || '-'}</Text>
              <Text style={[styles.tableCell, styles.flex2, { color: diffColor }]}>
                {hasActual ? absDiff.toFixed(2) : '-'}
              </Text>
            </View>
          );
        })}
      </View>

      {/* Calculations Summary */}
      <View style={styles.tableCard}>
        <Text style={styles.tableTitle}>{t('data.activities.parachute-drop.calculationsTableTitle')}</Text>
        {!isHighSchool ? (
          <>
            <View style={styles.tableRowHeader}>
              <Text style={[styles.tableCell, styles.flex2]}>{t('data.activities.parachute-drop.headerDesign')}</Text>
              <Text style={[styles.tableCell, styles.flex2]}>{t('data.activities.parachute-drop.headerSpeed')}</Text>
            </View>
            {data.trials.map((trial: any) => (
              <View key={`calc-${trial.id}`} style={styles.tableRow}>
                <Text style={[styles.tableCell, styles.flex2]}>{trial.label}</Text>
                <Text style={[styles.tableCell, styles.flex2, { fontWeight: '700' }]}>{trial.manualSpeed || '-'} m/s</Text>
              </View>
            ))}
          </>
        ) : (
          <>
            {data.trials.map((trial: any) => (
              <View key={`calc-hs-${trial.id}`} style={styles.hsCalcBlock}>
                <Text style={styles.hsCalcTitle}>{trial.label}</Text>
                <Text style={styles.calcText}><Text style={{fontWeight: '700'}}>{t('data.activities.parachute-drop.headerVelocity')}: </Text>{trial.manualVelocity || '-'} m/s</Text>
                <Text style={styles.calcText}><Text style={{fontWeight: '700'}}>{t('data.activities.parachute-drop.headerAccel')}: </Text>{trial.manualAcceleration || '-'} m/s²</Text>
                <Text style={styles.calcText}><Text style={{fontWeight: '700'}}>{t('data.activities.parachute-drop.headerNetForce')}: </Text>{trial.manualNetForce || '-'} N</Text>
                <Text style={styles.calcText}><Text style={{fontWeight: '700'}}>{t('data.activities.parachute-drop.headerDragForce')}: </Text>{trial.manualDragForce || '-'} N</Text>
                <Text style={styles.calcText}><Text style={{fontWeight: '700'}}>{t('data.activities.parachute-drop.headerGForce')}: </Text>{trial.manualGForce || '-'} g</Text>
              </View>
            ))}
          </>
        )}
      </View>
      
      {/* Notes Summary */}
      {data.trials.some((t: any) => t.notes) && (
        <View style={styles.tableCard}>
          <Text style={styles.tableTitle}>{t('common.notes')}</Text>
          {data.trials.filter((t: any) => t.notes).map((trial: any) => (
            <View key={`notes-${trial.id}`} style={{ marginBottom: Spacing.sm }}>
              <Text style={{ ...Typography.bodySmall, fontWeight: '700' }}>{trial.label}</Text>
              <Text style={{...Typography.bodySmall, color: Colors.textSecondary, fontStyle: 'italic'}}>{trial.notes}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: Spacing.sm,
  },
  penaltyAlert: {
    backgroundColor: Colors.danger + '20',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.danger,
  },
  penaltyText: {
    ...Typography.bodySmall,
    color: Colors.danger,
    fontWeight: '700',
  },
  setupText: {
    ...Typography.bodySmall,
    color: Colors.textMuted,
    marginBottom: Spacing.sm,
    fontStyle: 'italic',
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
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  tableCell: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  flex2: { flex: 2 },
  hsCalcBlock: {
    marginBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingBottom: Spacing.sm,
  },
  hsCalcTitle: {
    ...Typography.bodySmall,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 4,
  },
  calcText: {
    ...Typography.bodySmall,
    color: '#475569',
    marginBottom: 2,
  }
});
