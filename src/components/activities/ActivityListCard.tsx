import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Card } from '../ui/Card';
import { Chip } from '../ui/Chip';
import { Colors, Spacing, Typography } from '../../theme';

interface ActivityListCardProps {
  id: string;
  name: string;
  description: string;
  sensors: string[];
  onPress: () => void;
}

export function ActivityListCard({ id, name, description, sensors, onPress }: ActivityListCardProps) {
  const { t } = useTranslation();

  return (
    <Card onPress={onPress} style={styles.card}>
      <View style={styles.row}>
        <View style={styles.info}>
          <Text style={styles.name}>{t(`data.activities.${id}.name`, { defaultValue: name })}</Text>
          <Text style={styles.desc} numberOfLines={2}>
            {t(`data.activities.${id}.desc`, { defaultValue: description })}
          </Text>
          <View style={styles.chips}>
            {sensors.map((sensor) => (
              <Chip
                key={sensor}
                label={t(`data.sensors.${sensor}.name`, { defaultValue: sensor.replace('-', ' ') })}
                size="sm"
              />
            ))}
          </View>
        </View>
        <Ionicons name="chevron-forward" size={22} color={Colors.textMuted} />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: Spacing.md },
  row: { flexDirection: 'row', alignItems: 'center' },
  info: { flex: 1, paddingRight: Spacing.sm },
  name: { ...Typography.h3, marginBottom: 2 },
  desc: { ...Typography.bodySmall, marginBottom: Spacing.sm },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs },
});
