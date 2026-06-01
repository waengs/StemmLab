import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../ui/Card';
import { IconBadge } from '../ui/IconBadge';
import { Chip } from '../ui/Chip';
import { useTheme } from '../../context/ThemeContext';
import { Spacing } from '../../theme';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

interface FeatureCardProps {
  title: string;
  description: string;
  icon: IoniconsName;
  iconColor: string;
  chipLabel?: string;
  onPress: () => void;
}

export function FeatureCard({ title, description, icon, iconColor, chipLabel, onPress }: FeatureCardProps) {
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
      {chipLabel ? (
        <View style={styles.chips}>
          <Chip label={chipLabel} size="sm" />
        </View>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { justifyContent: 'flex-start' },
  title: { marginTop: Spacing.md, marginBottom: Spacing.xs },
  description: { flex: 1 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs, marginTop: Spacing.sm },
});
