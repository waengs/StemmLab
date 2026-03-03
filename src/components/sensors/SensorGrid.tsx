import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Grid } from '../layout/Grid';
import { FeatureCard } from '../cards/FeatureCard';
import { SENSORS } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import { matchesSearch } from '../../utils/search';
import { Spacing } from '../../theme';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

interface SensorGridProps {
  onSensorPress: (sensorId: string) => void;
  searchQuery?: string;
}

export function SensorGrid({ onSensorPress, searchQuery = '' }: SensorGridProps) {
  const { t } = useTranslation();
  const { colors, typography } = useTheme();

  const sensors = useMemo(() => {
    return Object.values(SENSORS).filter((sensor) => {
      const name = t(`data.sensors.${sensor.id}.name`, { defaultValue: sensor.name });
      const desc = t(`data.sensors.${sensor.id}.desc`, { defaultValue: sensor.description });
      return matchesSearch(`${name} ${desc} ${sensor.id}`, searchQuery);
    });
  }, [searchQuery, t]);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        empty: { ...typography.body, color: colors.textMuted, textAlign: 'center', paddingVertical: Spacing.xxl },
      }),
    [colors, typography]
  );

  if (sensors.length === 0) {
    return <Text style={styles.empty}>{t('common.noSearchResults')}</Text>;
  }

  return (
    <Grid gap={Spacing.md} rowMinHeight={156}>
      {sensors.map((sensor) => (
        <FeatureCard
          key={sensor.id}
          title={t(`data.sensors.${sensor.id}.name`, { defaultValue: sensor.name })}
          description={t(`data.sensors.${sensor.id}.desc`, { defaultValue: sensor.description })}
          icon={sensor.icon as IoniconsName}
          iconColor={colors.primary}
          onPress={() => onSensorPress(sensor.id)}
        />
      ))}
    </Grid>
  );
}
