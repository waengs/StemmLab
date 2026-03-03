import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Card } from '../ui/Card';
import { Avatar } from '../ui/Avatar';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { useTheme } from '../../context/ThemeContext';
import { Spacing } from '../../theme';
import type { Team } from '../../types';

interface ForumComposerProps {
  team: Team;
  value: string;
  onChangeText: (text: string) => void;
  onSubmit: () => void;
}

export function ForumComposer({ team, value, onChangeText, onSubmit }: ForumComposerProps) {
  const { t } = useTranslation();
  const { colors, typography } = useTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        card: { marginBottom: Spacing.xl },
        header: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: Spacing.md,
          marginBottom: Spacing.md,
        },
        label: { ...typography.bodySmall, fontWeight: '600' },
      }),
    [typography]
  );

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <Avatar name={team.name} size={36} />
        <Text style={styles.label}>{t('forum.shareCommunity')}</Text>
      </View>
      <Input
        value={value}
        onChangeText={onChangeText}
        placeholder={t('forum.askPlaceholder')}
        multiline
        numberOfLines={3}
        containerStyle={{ marginBottom: Spacing.sm }}
      />
      <Button
        title={t('forum.post')}
        onPress={onSubmit}
        disabled={!value.trim()}
        icon={<Ionicons name="send" size={16} color={colors.white} />}
      />
    </Card>
  );
}
