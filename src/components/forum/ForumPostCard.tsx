import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Card } from '../ui/Card';
import { Avatar } from '../ui/Avatar';
import { Input } from '../ui/Input';
import { Colors, Spacing, Typography } from '../../theme';
import type { ForumPost } from '../../types';

interface ForumPostCardProps {
  post: ForumPost;
  replyText: string;
  expanded: boolean;
  onToggleReplies: () => void;
  onReplyChange: (text: string) => void;
  onReplySubmit: () => void;
}

export function ForumPostCard({
  post,
  replyText,
  expanded,
  onToggleReplies,
  onReplyChange,
  onReplySubmit,
}: ForumPostCardProps) {
  const { t } = useTranslation();

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <Avatar name={post.teamName} size={36} backgroundColor={Colors.primary} />
        <View style={styles.meta}>
          <Text style={styles.team}>{post.teamName}</Text>
          <Text style={styles.date}>{new Date(post.timestamp).toLocaleString()}</Text>
        </View>
      </View>

      <Text style={styles.content}>{post.content}</Text>

      {post.replies.length > 0 && (
        <TouchableOpacity style={styles.repliesToggle} onPress={onToggleReplies}>
          <Text style={styles.repliesToggleText}>
            {post.replies.length}{' '}
            {post.replies.length === 1 ? t('forum.reply') : t('forum.reply_plural')}
          </Text>
          <Ionicons
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={16}
            color={Colors.primary}
          />
        </TouchableOpacity>
      )}

      {expanded && post.replies.length > 0 && (
        <View style={styles.replies}>
          {post.replies.map((reply) => (
            <View key={reply.id} style={styles.replyItem}>
              <View style={styles.replyHeader}>
                <Avatar name={reply.teamName} size={22} backgroundColor={Colors.primaryLight} />
                <Text style={styles.replyTeam}>{reply.teamName}</Text>
                <Text style={styles.replyDate}>• {new Date(reply.timestamp).toLocaleString()}</Text>
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
        <TouchableOpacity
          style={[styles.sendBtn, !replyText.trim() && styles.sendBtnDisabled]}
          onPress={onReplySubmit}
          disabled={!replyText.trim()}
        >
          <Ionicons name="send" size={18} color={Colors.white} />
        </TouchableOpacity>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: Spacing.lg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  meta: { flex: 1 },
  team: { ...Typography.label },
  date: { ...Typography.caption },
  content: { ...Typography.body, marginBottom: Spacing.md },
  repliesToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  repliesToggleText: {
    ...Typography.bodySmall,
    color: Colors.primary,
    fontWeight: '600',
  },
  replies: {
    borderLeftWidth: 2,
    borderLeftColor: Colors.border,
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
  replyTeam: { ...Typography.bodySmall, fontWeight: '600' },
  replyDate: { ...Typography.caption },
  replyContent: { ...Typography.bodySmall, paddingLeft: 30 },
  replyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    paddingTop: Spacing.md,
  },
  replyInput: { flex: 1 },
  sendBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: { opacity: 0.4 },
});
