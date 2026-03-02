import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Card } from '../ui/Card';
import { Chip } from '../ui/Chip';
import { Colors, Spacing, Typography } from '../../theme';
import type { SensorLog } from '../../types';

interface SensorLogListProps {
  logs: SensorLog[];
}

export function SensorLogList({ logs }: SensorLogListProps) {
  const { t } = useTranslation();

  if (logs.length === 0) return null;

  return (
    <View style={styles.section}>
      <Text style={styles.title}>{t('sensors.recentLogs')}</Text>
      {logs.map((log) => (
        <Card key={log.id} style={styles.logCard} variant="outlined">
          <View style={styles.row}>
            <View style={styles.info}>
              <Chip
                label={t(`data.sensors.${log.sensorType}.name`, { defaultValue: log.sensorType })}
                variant="filled"
                color={Colors.primary}
                size="sm"
              />
              <Text style={styles.data} numberOfLines={2}>
                {log.data}
              </Text>
            </View>
            <Text style={styles.date}>{new Date(log.timestamp).toLocaleString()}</Text>
          </View>
        </Card>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginTop: Spacing.xl },
  title: { ...Typography.h3, marginBottom: Spacing.md },
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
  data: { ...Typography.bodySmall, flex: 1, minWidth: 120 },
  date: { ...Typography.caption, flexShrink: 0 },
});
