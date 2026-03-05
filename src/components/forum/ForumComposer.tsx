import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from '../ui/Card';
import { Avatar } from '../ui/Avatar';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { useTheme } from '../../context/ThemeContext';
import { Spacing } from '../../theme';
import type { AppUser } from '../../types';
import { useTranslation } from 'react-i18next';

interface ForumComposerProps {
  user: AppUser;
  value: string;
  onChangeText: (text: string) => void;
  onSubmit: () => void;
}

export function ForumComposer({ user, value, onChangeText, onSubmit }: ForumComposerProps) {
  const { t } = useTranslation();
  const { typography } = useTheme();

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
        <Avatar name={user.displayName} size={36} />
        <Text style={styles.label}>{t('forum.shareAs', { name: user.displayName })}</Text>
      </View>
      <Input
        value={value}
        onChangeText={onChangeText}
        placeholder={t('forum.askPlaceholder')}
        multiline
        numberOfLines={3}
        containerStyle={{ marginBottom: Spacing.md }}
      />
      <Button title={t('forum.postBtn')} onPress={onSubmit} fullWidth disabled={!value.trim()} />
    </Card>
  );
}
