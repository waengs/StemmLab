import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from '../ui/Card';
import { Avatar } from '../ui/Avatar';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import { useTheme } from '../../context/ThemeContext';
import { Spacing } from '../../theme';
import type { AppUser } from '../../types';
import { useTranslation } from 'react-i18next';

interface ForumComposerProps {
  user: AppUser;
  topicTitle: string;
  onTopicTitleChange: (text: string) => void;
  categoryLabel: string;
  categoryOptions: string[];
  onCategoryChange: (label: string) => void;
  value: string;
  onChangeText: (text: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

export function ForumComposer({
  user,
  topicTitle,
  onTopicTitleChange,
  categoryLabel,
  categoryOptions,
  onCategoryChange,
  value,
  onChangeText,
  onSubmit,
  onCancel,
}: ForumComposerProps) {
  const { t } = useTranslation();
  const { typography } = useTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        card: { marginBottom: 0 },
        header: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: Spacing.md,
          marginBottom: Spacing.md,
        },
        label: { ...typography.bodySmall, fontWeight: '600' },
        actionRow: { flexDirection: 'row', gap: Spacing.sm },
        actionBtn: { flex: 1 },
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
        value={topicTitle}
        onChangeText={onTopicTitleChange}
        placeholder={t('forum.topicTitlePlaceholder')}
        containerStyle={{ marginBottom: Spacing.md }}
      />
      <Input
        value={value}
        onChangeText={onChangeText}
        placeholder={t('forum.askPlaceholder')}
        multiline
        numberOfLines={3}
        containerStyle={{ marginBottom: Spacing.md }}
      />
      <Select
        label={t('forum.categoryLabel')}
        value={categoryLabel}
        options={categoryOptions}
        onValueChange={onCategoryChange}
        placeholder={t('forum.categoryPlaceholder')}
        containerStyle={{ marginBottom: Spacing.md }}
      />
      <View style={styles.actionRow}>
        <Button
          title={t('common.cancel')}
          onPress={onCancel}
          variant="outlined"
          fullWidth
          style={styles.actionBtn}
        />
        <Button
          title={t('forum.postBtn')}
          onPress={onSubmit}
          fullWidth
          disabled={!topicTitle.trim() || !value.trim()}
          style={styles.actionBtn}
        />
      </View>
    </Card>
  );
}
