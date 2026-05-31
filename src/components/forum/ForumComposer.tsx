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
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { uploadFileToCloudinary, isCloudinaryConfigured } from '../../services/cloudinary';
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
  onSubmit: (attachments?: { url: string; type: 'image' | 'video' | 'raw'; name: string }[]) => void | Promise<void>;
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
  const [attachments, setAttachments] = useState<{ uri: string; type: 'image' | 'video' | 'raw'; name: string; mimeType: string }[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const handleCancel = () => {
    setAttachments([]);
    onCancel();
  };

  const pickImage = async () => {
    if (!isCloudinaryConfigured()) {
      Alert.alert(t('settings.cloudinaryNotConfiguredTitle', 'Cloudinary Not Configured'), t('settings.cloudinaryNotConfiguredMsg', 'Please configure Cloudinary in .env to upload images.'));
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images', 'videos'],
      allowsMultipleSelection: true,
      quality: 0.8,
    });
    if (!result.canceled && result.assets) {
      const newAttachments = result.assets.map((asset) => ({
        uri: asset.uri,
        type: asset.type === 'video' ? 'video' as const : 'image' as const,
        name: asset.fileName ?? `upload-${Date.now()}`,
        mimeType: asset.mimeType ?? (asset.type === 'video' ? 'video/mp4' : 'image/jpeg'),
      }));
      setAttachments((prev) => [...prev, ...newAttachments]);
    }
  };

  const pickDocument = async () => {
    if (!isCloudinaryConfigured()) {
      Alert.alert(t('settings.cloudinaryNotConfiguredTitle', 'Cloudinary Not Configured'), t('settings.cloudinaryNotConfiguredMsg', 'Please configure Cloudinary in .env to upload files.'));
      return;
    }
    const result = await DocumentPicker.getDocumentAsync({
      copyToCacheDirectory: false,
      multiple: true,
    });
    if (!result.canceled && result.assets) {
      const newAttachments = result.assets.map((asset) => ({
        uri: asset.uri,
        type: 'raw' as const,
        name: asset.name,
        mimeType: asset.mimeType ?? 'application/octet-stream',
      }));
      setAttachments((prev) => [...prev, ...newAttachments]);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    try {
      setIsUploading(true);
      const uploadedAttachments = [];
      for (const file of attachments) {
        const url = await uploadFileToCloudinary(file.uri, file.mimeType);
        uploadedAttachments.push({ url, type: file.type, name: file.name });
      }
      await onSubmit(uploadedAttachments.length > 0 ? uploadedAttachments : undefined);
      setAttachments([]);
    } catch (err: any) {
      Alert.alert(t('common.error', 'Error'), err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const styles = useMemo(
    () =>
      StyleSheet.create({
        kav: {
          flex: 1,
          justifyContent: 'flex-end',
        },
        backdrop: {
          ...StyleSheet.absoluteFill,
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
        
        {attachments.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: Spacing.md }}>
            {attachments.map((att, idx) => (
              <View key={idx} style={{ marginRight: Spacing.sm, position: 'relative' }}>
                {att.type === 'image' || att.type === 'video' ? (
                  <Image source={{ uri: att.uri }} style={{ width: 80, height: 80, borderRadius: BorderRadius.md }} />
                ) : (
                  <View style={{ width: 80, height: 80, borderRadius: BorderRadius.md, backgroundColor: colors.borderLight, alignItems: 'center', justifyContent: 'center', padding: Spacing.xs }}>
                    <Ionicons name="document-text" size={32} color={colors.textSecondary} />
                    <Text numberOfLines={1} style={{ ...typography.caption, marginTop: 4, textAlign: 'center' }}>{att.name}</Text>
                  </View>
                )}
                <Pressable 
                  onPress={() => removeAttachment(idx)} 
                  style={{ position: 'absolute', top: -8, right: -8, backgroundColor: colors.surface, borderRadius: 12, ...Shadows.sm }}
                  hitSlop={8}
                >
                  <Ionicons name="close-circle" size={24} color={colors.text} />
                </Pressable>
              </View>
            ))}
          </ScrollView>
        )}

        <View style={styles.actionRow}>
          <Pressable 
            style={{ padding: Spacing.sm }} 
            onPress={pickImage}
          >
            <Ionicons name="image-outline" size={24} color={colors.textSecondary} />
          </Pressable>
          <Pressable 
            style={{ marginRight: 'auto', padding: Spacing.sm }} 
            onPress={pickDocument}
          >
            <Ionicons name="document-attach-outline" size={24} color={colors.textSecondary} />
          </Pressable>

          <Button
            title={t('common.cancel')}
            onPress={handleCancel}
            variant="outlined"
            disabled={isUploading}
            style={[{ flex: 1, marginRight: Spacing.sm }]}
          />
          <Button
            title={isUploading ? '...' : t('forum.postBtn')}
            onPress={handleSubmit}
            disabled={!topicTitle.trim() || !value.trim() || isUploading}
            style={[{ flex: 1 }]}
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
      onRequestClose={handleCancel}
    >
      {/*
       * When the category picker (Select) is open its own Modal fires keyboard
       * focus events that make KeyboardAvoidingView jitter continuously.
       * We disable KAV while the picker is open to prevent this.
       */}
      {selectOpen ? (
        <View style={styles.kav}>
          <Pressable style={styles.backdrop} onPress={handleCancel} />
          {sheet}
        </View>
      ) : (
        <KeyboardAvoidingView
          style={styles.kav}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <Pressable style={styles.backdrop} onPress={handleCancel} />
          {sheet}
        </KeyboardAvoidingView>
      )}
    </Modal>
  );
}
