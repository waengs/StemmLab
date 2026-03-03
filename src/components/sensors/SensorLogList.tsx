import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Card } from '../ui/Card';
import { Chip } from '../ui/Chip';
import { useTheme } from '../../context/ThemeContext';
import { matchesSearch } from '../../utils/search';
import { Spacing } from '../../theme';
import type { SensorLog } from '../../types';

interface SensorLogListProps {
  logs: SensorLog[];
  searchQuery?: string;
}

export function SensorLogList({ logs, searchQuery = '' }: SensorLogListProps) {
  const { t } = useTranslation();
  const { colors, typography } = useTheme();

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const sensorName = t(`data.sensors.${log.sensorType}.name`, { defaultValue: log.sensorType });
      return matchesSearch(`${sensorName} ${log.data}`, searchQuery);
    });
  }, [logs, searchQuery, t]);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        section: { marginTop: Spacing.xl },
        title: { ...typography.h3, marginBottom: Spacing.md },
        logCard: { marginBottom: Spacing.sm, padding: Spacing.md },
        row: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: Spacing.md,
        },
        info: {
          flex: 1,
          flexDirection: 'row',
          alignItems: 'center',
          gap: Spacing.sm,
          flexWrap: 'wrap',
        },
        data: { ...typography.bodySmall, flex: 1, minWidth: 120 },
        date: { ...typography.caption, flexShrink: 0 },
        empty: { ...typography.bodySmall, color: colors.textMuted, textAlign: 'center' },
      }),
    [colors, typography]
  );

  if (logs.length === 0) return null;

  return (
    <View style={styles.section}>
      <Text style={styles.title}>{t('sensors.recentLogs')}</Text>
      {filteredLogs.length === 0 ? (
        <Text style={styles.empty}>{t('common.noSearchResults')}</Text>
      ) : (
        filteredLogs.map((log) => (
          <Card key={log.id} style={styles.logCard} variant="outlined">
            <View style={styles.row}>
              <View style={styles.info}>
                <Chip
                  label={t(`data.sensors.${log.sensorType}.name`, { defaultValue: log.sensorType })}
                  variant="filled"
                  color={colors.primary}
                  size="sm"
                />
                <Text style={styles.data} numberOfLines={2}>
                  {log.data}
                </Text>
              </View>
              <Text style={styles.date}>{new Date(log.timestamp).toLocaleString()}</Text>
            </View>
          </Card>
        ))
      )}
    </View>
  );
}
