import React, { useState, useMemo } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  Pressable,
  Text,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ForumPostCard, EmptyState } from '../../../src/components';
import { useTheme } from '../../../src/stores/themeStore';
import { useForumStore } from '../../../src/stores';
import { useRequireAuth } from '../../../src/stores';
import { Spacing, BorderRadius } from '../../../src/theme';
import type { ForumReply } from '../../../src/types';
import { hasProfanity } from '../../../src/utils/profanity';
import { getGradeBand, isForumPostVisibleToBand } from '../../../src/utils/gradeLevel';

type SortOption = 'new' | 'old' | 'top';

const SORT_OPTION_META: { id: SortOption; icon: string; labelKey: string }[] = [
  { id: 'new', icon: 'time-outline', labelKey: 'forum.sort.new' },
  { id: 'old', icon: 'hourglass-outline', labelKey: 'forum.sort.old' },
  { id: 'top', icon: 'arrow-up-outline', labelKey: 'forum.sort.top' },
];

export default function PostThreadScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { user, team } = useRequireAuth();
  
  const allPosts = useForumStore((s) => s.posts);
  const updatePost = useForumStore((s) => s.updatePost);
  const deletePost = useForumStore((s) => s.deletePost);
  const deleteReply = useForumStore((s) => s.deleteReply);
  const upvotePost = useForumStore((s) => s.upvotePost);
  const upvoteReply = useForumStore((s) => s.upvoteReply);

  const [replyContent, setReplyContent] = useState('');
  const [replyTarget, setReplyTarget] = useState<{ replyId: string; authorName: string } | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('new');
  // Always keep replies expanded in thread view
  const [expanded, setExpanded] = useState(true);

  const sortOptions = useMemo(
    () =>
      SORT_OPTION_META.map((opt) => ({
        ...opt,
        label: t(opt.labelKey),
      })),
    [t]
  );

  const viewerGradeBand = useMemo(
    () => getGradeBand(team?.gradeLevel, t),
    [team?.gradeLevel, t]
  );
  const post = useMemo(() => {
    const found = allPosts.find((p) => p.id === id);
    if (!found || !isForumPostVisibleToBand(found, viewerGradeBand)) return undefined;
    return found;
  }, [allPosts, id, viewerGradeBand]);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        safe: { flex: 1, backgroundColor: colors.background },
        flex: { flex: 1 },
        header: {
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: Spacing.xl,
          paddingVertical: Spacing.md,
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: colors.borderLight,
          backgroundColor: colors.surface,
        },
        backBtn: {
          padding: Spacing.xs,
          marginRight: Spacing.md,
        },
        headerTitle: {
          fontSize: 18,
          fontWeight: '700',
          color: colors.text,
        },
        content: { padding: Spacing.xl, paddingBottom: 100 },
        sortRow: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: Spacing.xs,
          marginBottom: Spacing.md,
        },
        sortBtn: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 4,
          paddingHorizontal: Spacing.sm,
          paddingVertical: 6,
          borderRadius: BorderRadius.full,
          borderWidth: 1.5,
        },
        sortBtnText: {
          fontSize: 12,
          fontWeight: '600',
        },
      }),
    [colors]
  );

  if (!user || !team) return null;

  if (!post) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={8}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </Pressable>
          <Text style={styles.headerTitle}>Thread</Text>
        </View>
        <EmptyState message="Post not found or has been deleted." />
      </SafeAreaView>
    );
  }

  // Sort the post replies based on the selected option
  const sortedPost = useMemo(() => {
    // We create a deep copy of the post to safely reorder its replies
    const clonedReplies = [...post.replies];
    
    // Sort logic for root replies.
    // For a real threaded forum, sorting usually only affects the top level replies,
    // and children stay chronologically under their parents.
    // But since our replies list is flat and renderReplies groups them,
    // changing the order in the array changes the root render order.
    switch (sortBy) {
      case 'new':
        clonedReplies.sort((a, b) => b.timestamp - a.timestamp);
        break;
      case 'old':
        clonedReplies.sort((a, b) => a.timestamp - b.timestamp);
        break;
      case 'top':
        clonedReplies.sort((a, b) => (b.upvotes ?? []).length - (a.upvotes ?? []).length);
        break;
    }

    return { ...post, replies: clonedReplies };
  }, [post, sortBy]);

  const handleReplySubmit = async (attachments?: { url: string; type: 'image' | 'video' | 'raw'; name: string }[]) => {
    if (!user || !team || (!replyContent.trim() && (!attachments || attachments.length === 0))) return;

    if (hasProfanity(replyContent)) {
      Alert.alert(t('common.profanityWarningTitle'), t('common.profanityWarningMsg'));
      return;
    }

    const target = replyTarget;
    const body = replyContent.trim();
    const content =
      target && !body.startsWith(`@${target.authorName}`)
        ? `@${target.authorName} ${body}`
        : body;

    const reply: ForumReply = {
      id: Date.now().toString(),
      parentReplyId: target?.replyId,
      authorUid: user.uid,
      authorName: user.displayName,
      teamDiscriminator: team.discriminator,
      teamName: team.name,
      content,
      timestamp: Date.now(),
      attachments,
    };

    const updatedPost = { ...post, replies: [...post.replies, reply] };
    await updatePost(updatedPost);

    setReplyContent('');
    setReplyTarget(null);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={8}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </Pressable>
          <Text style={styles.headerTitle}>Thread</Text>
        </View>

        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.sortRow}>
            {sortOptions.map((opt) => {
              const active = sortBy === opt.id;
              return (
                <Pressable
                  key={opt.id}
                  style={[
                    styles.sortBtn,
                    {
                      backgroundColor: active ? colors.primary : 'transparent',
                      borderColor: active ? colors.primary : colors.border,
                    },
                  ]}
                  onPress={() => setSortBy(opt.id)}
                >
                  <Ionicons
                    name={opt.icon as any}
                    size={13}
                    color={active ? colors.white : colors.textSecondary}
                  />
                  <Text
                    style={[
                      styles.sortBtnText,
                      { color: active ? colors.white : colors.textSecondary },
                    ]}
                  >
                    {opt.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <ForumPostCard
            post={sortedPost}
            currentUid={user.uid}
            replyText={replyContent}
            replyTargetName={replyTarget?.authorName}
            expanded={expanded}
            onToggleReplies={() => setExpanded(!expanded)}
            onReplyChange={setReplyContent}
            onReplySubmit={handleReplySubmit}
            onReplyToReply={(replyId, authorName) => setReplyTarget({ replyId, authorName })}
            onClearReplyTarget={() => setReplyTarget(null)}
            onDelete={() => {
              deletePost(post.id);
              router.back();
            }}
            onDeleteReply={(replyId) => deleteReply(post.id, replyId)}
            onUpvote={() => upvotePost(post.id, user.uid)}
            onUpvoteReply={(replyId) => upvoteReply(post.id, replyId, user.uid)}
            isThreadView={true}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
