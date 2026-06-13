import React, { useMemo } from 'react';
import { View, Text, Image, StyleSheet, Pressable, type ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { TrialVideoPlayer } from '../sensors/TrialVideoPlayer';
import { ZoomableImage } from '../ui/ZoomableImage';
import { BorderRadius, Spacing } from '../../theme';

interface ForumMediaAttachmentProps {
  uri: string;
  type: 'image' | 'video' | 'raw';
  name?: string;
  /** Small preview in composer / reply bar */
  variant?: 'thumbnail' | 'inline';
  thumbnailSize?: 60 | 80;
  style?: ViewStyle;
  onRawPress?: () => void;
}

export function ForumMediaAttachment({
  uri,
  type,
  name,
  variant = 'inline',
  thumbnailSize = 80,
  style,
  onRawPress,
}: ForumMediaAttachmentProps) {
  const { t } = useTranslation();
  const { colors, typography } = useTheme();

  const thumbnailStyles = useMemo(
    () =>
      StyleSheet.create({
        thumb: {
          width: thumbnailSize,
          height: thumbnailSize,
          borderRadius: BorderRadius.md,
          backgroundColor: colors.text,
          alignItems: 'center',
          justifyContent: 'center',
          gap: 4,
          overflow: 'hidden',
        },
        thumbLabel: {
          ...typography.caption,
          color: colors.white,
          fontWeight: '600',
        },
      }),
    [colors, typography, thumbnailSize]
  );

  const rawStyles = useMemo(
    () =>
      StyleSheet.create({
        raw: {
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: colors.borderLight,
          padding: Spacing.sm,
          borderRadius: BorderRadius.md,
        },
        rawName: {
          ...typography.body,
          color: colors.primary,
          marginLeft: Spacing.xs,
          flex: 1,
        },
      }),
    [colors, typography]
  );

  if (type === 'image') {
    const imageStyle =
      variant === 'thumbnail'
        ? { width: thumbnailSize, height: thumbnailSize, borderRadius: BorderRadius.md }
        : { width: '100%' as any, aspectRatio: 1.5, borderRadius: BorderRadius.md };

    return (
      <ZoomableImage
        source={{ uri }}
        style={[imageStyle, style as any]}
        resizeMode="cover"
        accessibilityLabel={t('forum.imageAttachment')}
      />
    );
  }

  if (type === 'video') {
    if (variant === 'thumbnail') {
      return (
        <View style={[thumbnailStyles.thumb, style]} accessibilityLabel={t('forum.videoAttachment')}>
          <Ionicons name="play-circle" size={thumbnailSize >= 80 ? 36 : 28} color={colors.white} />
          <Text style={thumbnailStyles.thumbLabel}>{t('forum.videoAttachment')}</Text>
        </View>
      );
    }

    return (
      <View style={[{ width: '100%' }, style]}>
        <TrialVideoPlayer videoUri={uri} compact />
      </View>
    );
  }

  if (variant === 'thumbnail') {
    return (
      <View
        style={[
          {
            width: thumbnailSize,
            height: thumbnailSize,
            borderRadius: BorderRadius.md,
            backgroundColor: colors.borderLight,
            alignItems: 'center',
            justifyContent: 'center',
            padding: Spacing.xs,
          },
          style,
        ]}
      >
        <Ionicons name="document-text" size={28} color={colors.textSecondary} />
        <Text
          numberOfLines={2}
          style={{ ...typography.caption, marginTop: 4, textAlign: 'center', fontSize: 10 }}
        >
          {name ?? t('forum.fileAttachment')}
        </Text>
      </View>
    );
  }

  const raw = (
    <View style={[rawStyles.raw, style]}>
      <Ionicons name="document-text" size={24} color={colors.primary} />
      <Text style={rawStyles.rawName} numberOfLines={1}>
        {name ?? t('forum.fileAttachment')}
      </Text>
    </View>
  );

  if (onRawPress) {
    return <Pressable onPress={onRawPress}>{raw}</Pressable>;
  }

  return raw;
}
