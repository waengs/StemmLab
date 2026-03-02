import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Grid } from '../layout/Grid';
import { FeatureCard } from '../cards/FeatureCard';
import { SENSORS } from '../../types';
import { Colors, Spacing } from '../../theme';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

interface SensorGridProps {
  onSensorPress: (sensorId: string) => void;
}

export function SensorGrid({ onSensorPress }: SensorGridProps) {
  const { t } = useTranslation();

  return (
    <Grid gap={Spacing.md} rowMinHeight={156}>
      {Object.values(SENSORS).map((sensor) => (
        <FeatureCard
          key={sensor.id}
          title={t(`data.sensors.${sensor.id}.name`, { defaultValue: sensor.name })}
          description={t(`data.sensors.${sensor.id}.desc`, { defaultValue: sensor.description })}
          icon={sensor.icon as IoniconsName}
          iconColor={Colors.primary}
          onPress={() => onSensorPress(sensor.id)}
        />
      ))}
    </Grid>
  );
}
