import React, { useMemo } from 'react';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Card } from '../ui/Card';
import { Avatar } from '../ui/Avatar';
import { Input } from '../ui/Input';
import { useTheme } from '../../context/ThemeContext';
import { Spacing } from '../../theme';
import type { ForumPost } from '../../types';

interface ForumPostCardProps {
  post: ForumPost;
  currentUid?: string;
  replyText: string;
  expanded: boolean;
  onToggleReplies: () => void;
  onReplyChange: (text: string) => void;
  onReplySubmit: () => void;
  onDelete?: () => void;
  onDeleteReply?: (replyId: string) => void;
}

export function ForumPostCard({
  post,
  currentUid,
  replyText,
  expanded,
  onToggleReplies,
  onReplyChange,
  onReplySubmit,
  onDelete,
  onDeleteReply,
}: ForumPostCardProps) {
  const { t } = useTranslation();
  const { colors, typography } = useTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        card: { marginBottom: Spacing.lg },
        header: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: Spacing.md,
          marginBottom: Spacing.md,
        },
        meta: { flex: 1 },
        team: { ...typography.label },
        date: { ...typography.caption },
        deleteBtn: { padding: Spacing.xs },
        content: { ...typography.body, marginBottom: Spacing.md },
        repliesToggle: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: Spacing.xs,
          marginBottom: Spacing.md,
        },
        repliesToggleText: {
          ...typography.bodySmall,
          color: colors.primary,
          fontWeight: '600',
        },
        replies: {
          borderLeftWidth: 2,
          borderLeftColor: colors.border,
          paddingLeft: Spacing.lg,
          marginBottom: Spacing.md,
        },
        replyItem: { marginBottom: Spacing.md },
        replyHeader: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: Spacing.xs,
          marginBottom: Spacing.xs,
        },
        replyMeta: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
        replyTeam: { ...typography.bodySmall, fontWeight: '600' },
        replyDate: { ...typography.caption },
        replyDeleteBtn: { padding: Spacing.xs },
        replyContent: { ...typography.bodySmall, paddingLeft: 30 },
        replyRow: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: Spacing.sm,
          borderTopWidth: 1,
          borderTopColor: colors.borderLight,
          paddingTop: Spacing.md,
        },
        replyInput: { flex: 1 },
        sendBtn: {
          width: 38,
          height: 38,
          borderRadius: 19,
          backgroundColor: colors.primary,
          alignItems: 'center',
          justifyContent: 'center',
        },
        sendBtnDisabled: { opacity: 0.4 },
      }),
    [colors, typography]
  );

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <Avatar name={post.authorName} size={36} />
        <View style={styles.meta}>
          <Text style={styles.team}>
            {post.authorName} {post.teamName ? `• ${post.teamName}` : ''}
          </Text>
          <Text style={styles.date}>{new Date(post.timestamp).toLocaleString()}</Text>
        </View>
        {currentUid && post.authorUid === currentUid && onDelete && (
          <Pressable
            style={styles.deleteBtn}
            onPress={onDelete}
            hitSlop={8}
            android_ripple={Platform.OS === 'android' ? { color: 'transparent' } : undefined}
          >
            <Ionicons name="trash-outline" size={20} color={colors.danger} />
          </Pressable>
        )}
      </View>

      <Text style={styles.content}>{post.content}</Text>

      {post.replies.length > 0 && (
        <Pressable
          style={styles.repliesToggle}
          onPress={onToggleReplies}
          android_ripple={Platform.OS === 'android' ? { color: 'transparent' } : undefined}
        >
          <Text style={styles.repliesToggleText}>
            {post.replies.length}{' '}
            {post.replies.length === 1 ? t('forum.reply') : t('forum.reply_plural')}
          </Text>
          <Ionicons
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={16}
            color={colors.primary}
          />
        </Pressable>
      )}

      {expanded && post.replies.length > 0 && (
        <View style={styles.replies}>
          {post.replies.map((reply) => (
            <View key={reply.id} style={styles.replyItem}>
              <View style={styles.replyHeader}>
                <Avatar name={reply.authorName} size={22} backgroundColor={colors.primaryLight} />
                <View style={styles.replyMeta}>
                  <Text style={styles.replyTeam}>
                    {reply.authorName} {reply.teamName ? `• ${reply.teamName}` : ''}
                  </Text>
                  <Text style={styles.replyDate}>• {new Date(reply.timestamp).toLocaleString()}</Text>
                </View>
                {currentUid && reply.authorUid === currentUid && onDeleteReply && (
                  <Pressable
                    style={styles.replyDeleteBtn}
                    onPress={() => onDeleteReply(reply.id)}
                    hitSlop={8}
                    android_ripple={Platform.OS === 'android' ? { color: 'transparent' } : undefined}
                  >
                    <Ionicons name="trash-outline" size={16} color={colors.danger} />
                  </Pressable>
                )}
              </View>
              <Text style={styles.replyContent}>{reply.content}</Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.replyRow}>
        <View style={styles.replyInput}>
          <Input
            value={replyText}
            onChangeText={onReplyChange}
            placeholder={t('forum.writeReply')}
            containerStyle={{ marginBottom: 0, flex: 1 }}
          />
        </View>
        <Pressable
          style={[styles.sendBtn, !replyText.trim() && styles.sendBtnDisabled]}
          onPress={onReplySubmit}
          disabled={!replyText.trim()}
          android_ripple={Platform.OS === 'android' ? { color: 'transparent' } : undefined}
        >
          <Ionicons name="send" size={18} color={colors.white} />
        </Pressable>
      </View>
    </Card>
  );
}
