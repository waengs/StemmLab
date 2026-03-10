import React, { useMemo, useState, useEffect, useRef } from 'react';
import { View, Text, Pressable, StyleSheet, Platform, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Card } from '../ui/Card';
import { Avatar } from '../ui/Avatar';
import { Input } from '../ui/Input';
import { Chip } from '../ui/Chip';
import { useTheme } from '../../context/ThemeContext';
import { Spacing } from '../../theme';
import type { ForumPost, ForumReply } from '../../types';

interface ForumPostCardProps {
  post: ForumPost;
  currentUid?: string;
  replyText: string;
  replyTargetName?: string;
  expanded: boolean;
  onToggleReplies: () => void;
  onReplyChange: (text: string) => void;
  onReplySubmit: () => void;
  onReplyToReply?: (replyId: string, authorName: string) => void;
  onClearReplyTarget?: () => void;
  onDelete?: () => void;
  onDeleteReply?: (replyId: string) => void;
  onUpvote?: () => void;
  onUpvoteReply?: (replyId: string) => void;
  isThreadView?: boolean;
  onPress?: () => void;
}

export function ForumPostCard({
  post,
  currentUid,
  replyText,
  replyTargetName,
  expanded,
  onToggleReplies,
  onReplyChange,
  onReplySubmit,
  onReplyToReply,
  onClearReplyTarget,
  onDelete,
  onDeleteReply,
  onUpvote,
  onUpvoteReply,
  isThreadView = false,
  onPress,
}: ForumPostCardProps) {
  const { t } = useTranslation();
  const { colors, typography } = useTheme();
  const MAX_VISIBLE_DEPTH = 2;
  const [expandedBranches, setExpandedBranches] = useState<Record<string, boolean>>({});
  const formatDate = (timestamp: number) =>
    new Date(timestamp).toLocaleString([], {
      year: '2-digit',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });

  const hasUpvoted = !!(currentUid && (post.upvotes ?? []).includes(currentUid));
  const upvoteCount = (post.upvotes ?? []).length;

  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (hasUpvoted) {
      Animated.sequence([
        Animated.timing(scaleAnim, { toValue: 1.2, duration: 100, useNativeDriver: true }),
        Animated.spring(scaleAnim, { toValue: 1, friction: 3, useNativeDriver: true }),
      ]).start();
    }
  }, [hasUpvoted, scaleAnim]);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        card: { marginBottom: Spacing.md },
        header: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: Spacing.md,
          marginBottom: Spacing.sm,
        },
        meta: { flex: 1 },
        team: { ...typography.label },
        date: { ...typography.caption },
        postTitle: { ...typography.h3, fontSize: 18, lineHeight: 24, marginBottom: Spacing.xs },
        deleteBtn: { padding: Spacing.xs },
        content: { ...typography.body, marginBottom: Spacing.sm },
        categoryChip: { marginBottom: Spacing.md },
        // Upvote row
        actionsRow: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: Spacing.md,
          marginBottom: Spacing.sm,
        },
        upvoteBtn: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 5,
          paddingHorizontal: Spacing.sm,
          paddingVertical: 5,
          borderRadius: 20,
          borderWidth: 1.5,
        },
        upvoteCount: {
          fontSize: 13,
          fontWeight: '700',
        },
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
          paddingLeft: Spacing.sm,
          marginBottom: Spacing.sm,
        },
        replyItem: { marginBottom: Spacing.xl },
        nestedReplyItem: {
          marginLeft: Spacing.sm,
          paddingLeft: Spacing.sm,
          borderLeftWidth: 2,
          borderLeftColor: colors.borderLight,
        },
        replyHeader: {
          flexDirection: 'row',
          alignItems: 'flex-start',
          gap: Spacing.xs,
          marginBottom: Spacing.xs,
        },
        replyMeta: { flex: 1, minWidth: 0 },
        replyTopRow: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: Spacing.xs,
        },
        replyTopLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, minWidth: 0 },
        replyTopRight: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, marginLeft: Spacing.sm },
        replyTeam: { ...typography.bodySmall, fontWeight: '600', flexShrink: 1 },
        replyDate: { ...typography.caption, marginTop: 2, flexShrink: 1 },
        replyDeleteBtn: { padding: Spacing.xs },
        replyActionBtn: { paddingHorizontal: Spacing.xs, paddingVertical: 2 },
        replyActionText: { ...typography.caption, color: colors.primary, fontWeight: '600' },
        replyUpvoteBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: Spacing.xs, paddingVertical: 2 },
        replyUpvoteText: { ...typography.caption, fontWeight: '600' },
        replyContent: { ...typography.bodySmall, paddingLeft: 26, marginTop: 2, marginBottom: Spacing.md },
        continueThreadBtn: {
          marginTop: Spacing.sm,
          marginLeft: 26,
          marginBottom: Spacing.xs,
          alignSelf: 'stretch',
          minHeight: 34,
          justifyContent: 'center',
          paddingVertical: Spacing.xs,
          paddingHorizontal: Spacing.sm,
          borderRadius: 8,
          backgroundColor: colors.surfaceElevated,
        },
        continueThreadText: { ...typography.caption, color: colors.primary, fontWeight: '700' },
        replyTargetRow: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: Spacing.sm,
          borderWidth: 1,
          borderColor: colors.borderLight,
          borderRadius: 8,
          paddingHorizontal: Spacing.sm,
          paddingVertical: Spacing.xs,
        },
        replyTargetText: { ...typography.caption, color: colors.textSecondary, fontWeight: '600' },
        cancelReplyText: { ...typography.caption, color: colors.primary, fontWeight: '700' },
        replyRow: {
          flexDirection: 'row',
          alignItems: 'flex-end',
          gap: Spacing.sm,
          borderTopWidth: 1,
          borderTopColor: colors.borderLight,
          paddingTop: Spacing.sm,
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

  const repliesByParent = useMemo(() => {
    const map: Record<string, ForumReply[]> = {};
    const ids = new Set(post.replies.map((r) => r.id));
    for (const reply of post.replies) {
      const parent =
        reply.parentReplyId && ids.has(reply.parentReplyId) ? reply.parentReplyId : '__root__';
      if (!map[parent]) map[parent] = [];
      map[parent].push(reply);
    }
    return map;
  }, [post.replies]);

  const renderReplies = (parentId: string | null, depth = 0): React.ReactNode => {
    const key = parentId ?? '__root__';
    const replies = repliesByParent[key] ?? [];
    if (replies.length === 0) return null;

    return replies.map((reply) => {
      const replyHasUpvoted = !!(currentUid && (reply.upvotes ?? []).includes(currentUid));
      const replyUpvoteCount = (reply.upvotes ?? []).length;

      return (
        <View key={reply.id} style={[styles.replyItem, depth > 0 && styles.nestedReplyItem]}>
          <View style={styles.replyHeader}>
            <Avatar
              name={reply.authorName}
              size={depth > 0 ? 18 : 22}
              backgroundColor={depth > 0 ? colors.primary : colors.primaryLight}
            />
            <View style={styles.replyMeta}>
              <View style={styles.replyTopRow}>
                <View style={styles.replyTopLeft}>
                  <Text style={styles.replyTeam} numberOfLines={1}>
                    {reply.authorName}
                    {reply.teamName ? ` • ${reply.teamName}` : ''}
                  </Text>
                </View>
                <View style={styles.replyTopRight}>
                  {onUpvoteReply ? (
                    <Pressable
                      style={styles.replyUpvoteBtn}
                      onPress={() => onUpvoteReply(reply.id)}
                      hitSlop={8}
                    >
                      <Ionicons
                        name={replyHasUpvoted ? 'arrow-up-circle' : 'arrow-up-circle-outline'}
                        size={14}
                        color={replyHasUpvoted ? colors.primary : colors.textSecondary}
                      />
                      {replyUpvoteCount > 0 && (
                        <Text style={[styles.replyUpvoteText, { color: replyHasUpvoted ? colors.primary : colors.textSecondary }]}>
                          {replyUpvoteCount}
                        </Text>
                      )}
                    </Pressable>
                  ) : null}
                  {onReplyToReply ? (
                    <Pressable
                      style={styles.replyActionBtn}
                      onPress={() => onReplyToReply(reply.id, reply.authorName)}
                      hitSlop={8}
                      android_ripple={Platform.OS === 'android' ? { color: 'transparent' } : undefined}
                    >
                      <Text style={styles.replyActionText}>{t('forum.reply')}</Text>
                    </Pressable>
                  ) : null}
                  {currentUid && reply.authorUid === currentUid && onDeleteReply ? (
                    <Pressable
                      style={styles.replyDeleteBtn}
                      onPress={() => onDeleteReply(reply.id)}
                      hitSlop={8}
                      android_ripple={Platform.OS === 'android' ? { color: 'transparent' } : undefined}
                    >
                      <Ionicons name="trash-outline" size={16} color={colors.danger} />
                    </Pressable>
                  ) : null}
                </View>
              </View>
              <Text style={styles.replyDate}>{formatDate(reply.timestamp)}</Text>
            </View>
          </View>
          <Text style={styles.replyContent}>{reply.content}</Text>
          {depth < MAX_VISIBLE_DEPTH || expandedBranches[reply.id] ? (
            renderReplies(reply.id, depth + 1)
          ) : (repliesByParent[reply.id] ?? []).length > 0 ? (
            <Pressable
              style={styles.continueThreadBtn}
              onPress={() => setExpandedBranches((state) => ({ ...state, [reply.id]: true }))}
              hitSlop={8}
              android_ripple={Platform.OS === 'android' ? { color: 'transparent' } : undefined}
            >
              <Text style={styles.continueThreadText}>
                {t('forum.seeMoreReplies', {
                  count: (repliesByParent[reply.id] ?? []).length,
                })}
              </Text>
            </Pressable>
          ) : null}
        </View>
      );
    });
  };

  const cardContent = (
    <>
      <View style={styles.header}>
        <Avatar name={post.authorName} size={36} />
        <View style={styles.meta}>
          <Text style={styles.team}>
            {post.authorName} {post.teamName ? `• ${post.teamName}` : ''}
          </Text>
          <Text style={styles.date}>{formatDate(post.timestamp)}</Text>
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

      <Text style={styles.postTitle}>{post.topicTitle}</Text>
      <Text style={styles.content}>{post.content}</Text>
      {post.categoryLabel ? (
        <Chip
          label={post.categoryLabel}
          variant="outlined"
          color={colors.primary}
          style={styles.categoryChip}
        />
      ) : null}

      {/* Upvote + reply count row */}
      <View style={styles.actionsRow}>
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <Pressable
            style={({ pressed }) => [
              styles.upvoteBtn,
              {
                backgroundColor: hasUpvoted ? colors.primary : 'transparent',
                borderColor: hasUpvoted ? colors.primary : colors.border,
                opacity: pressed ? 0.7 : 1,
              },
            ]}
            onPress={onUpvote}
            hitSlop={8}
            android_ripple={Platform.OS === 'android' ? { color: 'rgba(0,0,0,0.1)' } : undefined}
          >
            <Ionicons
              name={hasUpvoted ? 'arrow-up-circle' : 'arrow-up-circle-outline'}
              size={16}
              color={hasUpvoted ? colors.white : colors.textSecondary}
            />
            <Text
              style={[
                styles.upvoteCount,
                { color: hasUpvoted ? colors.white : colors.textSecondary },
              ]}
            >
              {upvoteCount}
            </Text>
          </Pressable>
        </Animated.View>
      </View>

      {post.replies.length > 0 && (
        <Pressable
          style={styles.repliesToggle}
          onPress={isThreadView ? onToggleReplies : undefined}
          android_ripple={Platform.OS === 'android' ? { color: 'transparent' } : undefined}
        >
          <Text style={styles.repliesToggleText}>
            {post.replies.length}{' '}
            {post.replies.length === 1 ? t('forum.reply') : t('forum.reply_plural')}
          </Text>
          {isThreadView && (
            <Ionicons
              name={expanded ? 'chevron-up' : 'chevron-down'}
              size={16}
              color={colors.primary}
            />
          )}
        </Pressable>
      )}

      {isThreadView && expanded && post.replies.length > 0 && (
        <View style={styles.replies}>
          {renderReplies(null)}
        </View>
      )}

      {isThreadView && (
        <View style={styles.replyRow}>
          <View style={styles.replyInput}>
            {replyTargetName ? (
              <View style={styles.replyTargetRow}>
                <Text style={styles.replyTargetText}>{t('forum.replyingTo', { name: replyTargetName })}</Text>
                {onClearReplyTarget ? (
                  <Pressable onPress={onClearReplyTarget} hitSlop={8}>
                    <Text style={styles.cancelReplyText}>{t('forum.cancelReply')}</Text>
                  </Pressable>
                ) : null}
              </View>
            ) : null}
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
      )}
    </>
  );

  if (onPress && !isThreadView) {
    return (
      <Card style={[styles.card, { padding: 0, overflow: 'hidden' }]}>
        <Pressable
          onPress={onPress}
          android_ripple={Platform.OS === 'android' ? { color: 'rgba(0,0,0,0.05)' } : undefined}
          style={{ padding: Spacing.lg }}
        >
          {cardContent}
        </Pressable>
      </Card>
    );
  }

  return (
    <Card style={styles.card}>
      {cardContent}
    </Card>
  );
}
