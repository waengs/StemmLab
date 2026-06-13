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
  const { typography, colors } = useTheme();

  return (
    <Card fill onPress={onPress} accentColor={iconColor} variant="outlined" style={styles.card}>
      <IconBadge name={icon} color={iconColor} />
      <Text style={[typography.h3, styles.title, { color: colors.text }]} numberOfLines={2}>
        {title}
      </Text>
      <Text style={[typography.caption, styles.description, { color: colors.textSecondary }]} numberOfLines={2}>
        {description}
      </Text>
      <View style={styles.footer}>
        {chipLabel ? (
          <View style={styles.chips}>
            <Chip label={chipLabel} size="sm" color={iconColor} />
          </View>
        ) : <View style={{ flex: 1 }} />}
        <Ionicons name="arrow-forward-circle" size={22} color={iconColor} />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { justifyContent: 'space-between', flex: 1 },
  title: { marginTop: Spacing.md, marginBottom: Spacing.xs },
  description: { flex: 1, marginBottom: Spacing.md },
  footer: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 'auto' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs, flex: 1, paddingRight: Spacing.sm },
});
