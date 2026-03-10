import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Avatar } from '../ui/Avatar';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import { useTheme } from '../../context/ThemeContext';
import { BorderRadius, Shadows, Spacing } from '../../theme';
import type { AppUser } from '../../types';
import { useTranslation } from 'react-i18next';

interface ForumComposerProps {
  visible: boolean;
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
  visible,
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
  const { colors, typography } = useTheme();

  // Track whether the category picker modal is open.
  // While it is open we disable KeyboardAvoidingView so its modal
  // mount/unmount events don't cause the sheet to jitter.
  const [selectOpen, setSelectOpen] = useState(false);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        kav: {
          flex: 1,
          justifyContent: 'flex-end',
        },
        backdrop: {
          ...StyleSheet.absoluteFillObject,
          backgroundColor: 'rgba(0,0,0,0.55)',
        },
        sheetOuter: {
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          backgroundColor: colors.surface,
          paddingBottom: Platform.OS === 'ios' ? 32 : 20,
          ...Shadows.lg,
        },
        handleBar: {
          alignSelf: 'center',
          width: 40,
          height: 4,
          borderRadius: BorderRadius.full,
          backgroundColor: colors.border,
          marginTop: Spacing.md,
          marginBottom: Spacing.sm,
        },
        header: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: Spacing.xl,
          paddingBottom: Spacing.md,
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: colors.border,
        },
        headerLeft: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: Spacing.sm,
        },
        closeBtn: {
          width: 32,
          height: 32,
          borderRadius: 16,
          backgroundColor: colors.borderLight,
          alignItems: 'center',
          justifyContent: 'center',
        },
        userName: {
          ...typography.label,
          color: colors.text,
        },
        postingAs: {
          ...typography.bodySmall,
          color: colors.textMuted,
        },
        body: {
          padding: Spacing.xl,
          gap: Spacing.md,
        },
        actionRow: {
          flexDirection: 'row',
          gap: Spacing.sm,
          marginTop: Spacing.xs,
        },
        actionBtn: { flex: 1 },
      }),
    [colors, typography]
  );

  const sheet = (
    <View style={styles.sheetOuter}>
      {/* Drag handle */}
      <View style={styles.handleBar} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Avatar name={user.displayName} size={32} />
          <View>
            <Text style={styles.userName}>{user.displayName}</Text>
            <Text style={styles.postingAs}>{t('forum.createPost')}</Text>
          </View>
        </View>
        <Pressable style={styles.closeBtn} onPress={onCancel} hitSlop={8}>
          <Ionicons name="close" size={18} color={colors.textSecondary} />
        </Pressable>
      </View>

      {/* Body */}
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.body}
      >
        <Input
          value={topicTitle}
          onChangeText={onTopicTitleChange}
          placeholder={t('forum.topicTitlePlaceholder')}
        />
        <Input
          value={value}
          onChangeText={onChangeText}
          placeholder={t('forum.askPlaceholder')}
          multiline
          numberOfLines={4}
        />
        {/* Wrap Select so we can track its open/close state */}
        <Select
          label={t('forum.categoryLabel')}
          value={categoryLabel}
          options={categoryOptions}
          onValueChange={(label) => {
            onCategoryChange(label);
            setSelectOpen(false);
          }}
          placeholder={t('forum.categoryPlaceholder')}
          onOpen={() => setSelectOpen(true)}
          onClose={() => setSelectOpen(false)}
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
      </ScrollView>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      statusBarTranslucent
      onRequestClose={onCancel}
    >
      {/*
       * When the category picker (Select) is open its own Modal fires keyboard
       * focus events that make KeyboardAvoidingView jitter continuously.
       * We disable KAV while the picker is open to prevent this.
       */}
      {selectOpen ? (
        <View style={styles.kav}>
          <Pressable style={styles.backdrop} onPress={onCancel} />
          {sheet}
        </View>
      ) : (
        <KeyboardAvoidingView
          style={styles.kav}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <Pressable style={styles.backdrop} onPress={onCancel} />
          {sheet}
        </KeyboardAvoidingView>
      )}
    </Modal>
  );
}
