import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../ui/Card';
import { IconBadge } from '../ui/IconBadge';
import { Typography, Spacing } from '../../theme';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

interface FeatureCardProps {
  title: string;
  description: string;
  icon: IoniconsName;
  iconColor: string;
  onPress: () => void;
}

export function FeatureCard({ title, description, icon, iconColor, onPress }: FeatureCardProps) {
  return (
    <Card fill onPress={onPress} style={styles.card}>
      <IconBadge name={icon} color={iconColor} />
      <Text style={styles.title} numberOfLines={2}>
        {title}
      </Text>
      <Text style={styles.description} numberOfLines={2}>
        {description}
      </Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    justifyContent: 'flex-start',
  },
  title: {
    ...Typography.h3,
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
  },
  description: {
    ...Typography.caption,
    flex: 1,
  },
});
