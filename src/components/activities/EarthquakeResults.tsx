import React from 'react';
import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { useThemedStyles } from '../../hooks/useThemedStyles';
import { Spacing, BorderRadius } from '../../theme';
import type { EarthquakeData, EarthquakeTrial } from './EarthquakeForm';
import { actT } from '../../utils/activityContent';
import { resolveEarthquakeDesign } from '../../utils/earthquakeLabels';

interface Props {
  results: { data: EarthquakeData }[];
}

function isAffirmative(value: string | undefined, t: (key: string) => string): boolean {
  if (!value) return false;
  return value === t('common.yes') || value === 'Yes' || value === 'Ya';
}

export function EarthquakeResults({ results }: Props) {
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

  return (
    <View style={styles.container}>
      {data.predictedBestDesign ? (
        <Text style={styles.predictionHighlight}>
          {t('data.activities.earthquake.predictedBestSummary', {
            value: resolveEarthquakeDesign(data.predictedBestDesign, t),
          })}
        </Text>
      ) : null}

      <View style={styles.tableCard}>
        <Text style={styles.tableTitle}>{t('data.activities.earthquake.experimentResultsTitle')}</Text>
        <View style={styles.tableRowHeader}>
          <Text style={[styles.tableCell, styles.flex3]}>{t('data.activities.earthquake.resultsDesign')}</Text>
          <Text style={[styles.tableCell, styles.flex2]}>{t('data.activities.earthquake.resultsMovement')}</Text>
          <Text style={[styles.tableCell, styles.flex2]}>{t('data.activities.earthquake.resultsRight')}</Text>
        </View>

        {data.trials?.map((trial: EarthquakeTrial) => (
          <View key={trial.id} style={styles.tableRow}>
            <Text style={[styles.tableCell, styles.flex3, { fontWeight: '700' }]}>
              {resolveEarthquakeDesign(trial.design, t)}
            </Text>
            <Text style={[styles.tableCell, styles.flex2]}>{trial.outcomeMovement || '—'}</Text>
            <Text
              style={[
                styles.tableCell,
                styles.flex2,
                { color: isAffirmative(trial.wereYouRight, t) ? colors.secondary : colors.danger },
              ]}
            >
              {trial.wereYouRight || '—'}
            </Text>
          </View>
        ))}
      </View>

      {data.surprises ? (
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
    </View>
  );
}
