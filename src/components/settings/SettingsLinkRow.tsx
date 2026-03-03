import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../ui/Card';
import { Avatar } from '../ui/Avatar';
import { useTheme } from '../../context/ThemeContext';
import { Spacing } from '../../theme';

interface SettingsLinkRowProps {
  title: string;
  subtitle?: string;
  avatarName?: string;
  onPress: () => void;
}

export function SettingsLinkRow({ title, subtitle, avatarName, onPress }: SettingsLinkRowProps) {
  const { colors, typography } = useTheme();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        card: { marginBottom: Spacing.lg },
        row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
        text: { flex: 1 },
        title: { ...typography.h3 },
        subtitle: { ...typography.bodySmall, marginTop: 2 },
      }),
    [typography]
  );

  return (
    <Card onPress={onPress} style={styles.card}>
      <View style={styles.row}>
        {avatarName && <Avatar name={avatarName} size={44} />}
        <View style={styles.text}>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
      </View>
    </Card>
  );
}
