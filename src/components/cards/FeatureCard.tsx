import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../ui/Card';
import { IconBadge } from '../ui/IconBadge';
import { useTheme } from '../../context/ThemeContext';
import { Spacing } from '../../theme';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

interface FeatureCardProps {
  title: string;
  description: string;
  icon: IoniconsName;
  iconColor: string;
  onPress: () => void;
}

export function FeatureCard({ title, description, icon, iconColor, onPress }: FeatureCardProps) {
  const { typography } = useTheme();

  return (
    <Card fill onPress={onPress} style={styles.card}>
      <IconBadge name={icon} color={iconColor} />
      <Text style={[typography.h3, styles.title]} numberOfLines={2}>
        {title}
      </Text>
      <Text style={[typography.caption, styles.description]} numberOfLines={2}>
        {description}
      </Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { justifyContent: 'flex-start' },
  title: { marginTop: Spacing.md, marginBottom: Spacing.xs },
  description: { flex: 1 },
});
