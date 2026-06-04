import React, { useState, useMemo, useCallback } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useFocusEffect, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { PageTitle, SearchBar, ForumComposer, ForumPostCard, EmptyState, Chip } from '../../src/components';
import { matchesSearch } from '../../src/utils/search';
import { hasProfanity } from '../../src/utils/profanity';
import { getGradeBand, isForumPostVisibleToBand } from '../../src/utils/gradeLevel';
import { useTheme } from '../../src/stores/themeStore';
import { useForumStore } from '../../src/stores';
import { useRequireAuth } from '../../src/stores';
import { BorderRadius, Shadows, Spacing } from '../../src/theme';
import { loadForumFeedParallel } from '../../src/services/app/parallelFeedLoad';
import { ACTIVITIES, type ForumAttachment, type ForumPost, type ForumReply } from '../../src/types';

type SortOption = 'new' | 'top' | 'trending' | 'relevance';

const SORT_OPTION_META: { id: SortOption; icon: string; labelKey: string }[] = [
  { id: 'new', icon: 'time-outline', labelKey: 'forum.sort.new' },
  { id: 'top', icon: 'arrow-up-outline', labelKey: 'forum.sort.top' },
  { id: 'trending', icon: 'flame-outline', labelKey: 'forum.sort.trending' },
  { id: 'relevance', icon: 'search-outline', labelKey: 'forum.sort.relevance' },
];

/** Simple "hotness" score: upvotes + 2× replies, decayed by age (hours). */
function trendingScore(post: ForumPost): number {
  const ageHours = (Date.now() - post.timestamp) / 3_600_000;
  const votes = (post.upvotes ?? []).length;
  const replies = post.replies.length;
  return (votes + replies * 2) / Math.pow(ageHours + 2, 1.5);
}

/** Simple relevance score against a search string. */
function relevanceScore(post: ForumPost, query: string): number {
  if (!query.trim()) return 0;
  const q = query.toLowerCase();
  const title = post.topicTitle.toLowerCase();
  const body = post.content.toLowerCase();
  let score = 0;
  if (title.includes(q)) score += 10;
  if (body.includes(q)) score += 5;
  score += (post.upvotes ?? []).length * 0.5;
  score += post.replies.length * 0.3;
  return score;
}

export default function Forum() {
  const { t } = useTranslation();
  const router = useRouter();
  const { colors } = useTheme();
  const { user, team } = useRequireAuth();
  const allPosts = useForumStore((s) => s.posts);
  const viewerGradeBand = useMemo(
    () => getGradeBand(team?.gradeLevel, t),
    [team?.gradeLevel, t]
  );
  const posts = useMemo(
    () => allPosts.filter((post) => isForumPostVisibleToBand(post, viewerGradeBand)),
    [allPosts, viewerGradeBand]
  );
  const addPost = useForumStore((s) => s.addPost);
  const deletePost = useForumStore((s) => s.deletePost);
  const upvotePost = useForumStore((s) => s.upvotePost);
  const draftTitle = useForumStore((s) => s.draftTitle);
  const draftContent = useForumStore((s) => s.draftContent);
  const draftCategoryId = useForumStore((s) => s.draftCategoryId);
  const saveDraft = useForumStore((s) => s.saveDraft);
  const clearDraft = useForumStore((s) => s.clearDraft);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategoryId, setActiveCategoryId] = useState<string>('all');
  const [composerOpen, setComposerOpen] = useState(false);
  const [composerInitialAttachments, setComposerInitialAttachments] = useState<
    ForumAttachment[] | undefined
  >();
  const [sortBy, setSortBy] = useState<SortOption>('new');

  const sortOptions = useMemo(
    () =>
      SORT_OPTION_META.map((opt) => ({
        ...opt,
        label: t(opt.labelKey),
      })),
    [t]
  );

  const categoryOptions = useMemo(() => {
    const activityOptions = Object.values(ACTIVITIES).map((activity) => ({
      id: activity.id,
      label: t(`data.activities.${activity.id}.name`, { defaultValue: activity.name }),
    }));
    return [
      { id: 'general', label: t('forum.generalCategory') },
      { id: 'sensors', label: t('forum.sensorsCategory') },
      ...activityOptions,
    ];
  }, [t]);

  useFocusEffect(
    useCallback(() => {
      const share = useForumStore.getState().consumePendingSensorShare();
      if (share) {
        setComposerInitialAttachments(share.attachments);
        setActiveCategoryId(share.categoryId);
        setComposerOpen(true);
      }
      if (user?.uid) {
        void loadForumFeedParallel(user.uid);
      }
    }, [user?.uid])
  );

  const composerCategoryLabel = useMemo(
    () =>
      categoryOptions.find((option) => option.id === draftCategoryId)?.label ??
      t('forum.generalCategory'),
    [categoryOptions, draftCategoryId, t]
  );

  const filterTabs = useMemo(
    () => [{ id: 'all', label: t('forum.allCategories') }, ...categoryOptions],
    [categoryOptions, t]
  );

  const categoryStats = useMemo(
    () =>
      categoryOptions.map((category) => ({
        id: category.id,
        count: posts.filter((post) => (post.categoryId ?? 'general') === category.id).length,
      })),
    [categoryOptions, posts]
  );

  const filteredAndSortedPosts = useMemo(() => {
    let result = posts.filter((post) => {
      const inCategory = activeCategoryId === 'all' || (post.categoryId ?? 'general') === activeCategoryId;
      if (!inCategory) return false;
      const replyText = post.replies.map((r) => `${r.authorName} ${r.content}`).join(' ');
      const haystack = `${post.topicTitle} ${post.authorName} ${post.content} ${post.categoryLabel ?? ''} ${replyText}`;
      return !searchQuery.trim() || matchesSearch(haystack, searchQuery);
    });

    switch (sortBy) {
      case 'new':
        result = [...result].sort((a, b) => b.timestamp - a.timestamp);
        break;
      case 'top':
        result = [...result].sort(
          (a, b) => (b.upvotes ?? []).length - (a.upvotes ?? []).length
        );
        break;
      case 'trending':
        result = [...result].sort((a, b) => trendingScore(b) - trendingScore(a));
        break;
      case 'relevance':
        result = [...result].sort(
          (a, b) => relevanceScore(b, searchQuery) - relevanceScore(a, searchQuery)
        );
        break;
    }
    return result;
  }, [posts, searchQuery, activeCategoryId, sortBy]);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        safe: { flex: 1, backgroundColor: colors.background },
        flex: { flex: 1 },
        content: { padding: Spacing.xl, paddingBottom: 100, gap: Spacing.md },
        filtersRow: {
          flexDirection: 'row',
          gap: Spacing.sm,
          marginBottom: Spacing.xs,
          paddingRight: Spacing.xl,
        },
        // Sort bar
        sortRow: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: Spacing.xs,
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
        fab: {
          position: 'absolute',
          bottom: 45, // Shifted upwards to avoid tab bar
          right: Spacing.xl,
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: colors.primary,
          alignItems: 'center',
          justifyContent: 'center',
          ...Shadows.lg,
        },
      }),
    [colors]
  );

  const handleCreatePost = async (attachments?: { url: string; type: 'image' | 'video' | 'raw'; name: string }[]) => {
    if (!user || !team) return;

    if (!draftTitle.trim() || !draftContent.trim()) {
      Alert.alert(
        t('forum.missingFieldsTitle', { defaultValue: 'Cannot post' }),
        t('forum.missingFieldsMsg', {
          defaultValue: 'Add a title and message before posting.',
        })
      );
      return;
    }

    if (hasProfanity(draftTitle) || hasProfanity(draftContent)) {
      Alert.alert(t('common.profanityWarningTitle'), t('common.profanityWarningMsg'));
      return;
    }

    const post: ForumPost = {
      id: Date.now().toString(),
      topicTitle: draftTitle.trim(),
      authorUid: user.uid,
      authorName: user.displayName,
      teamDiscriminator: team.discriminator,
      teamName: team.name,
      gradeBand: viewerGradeBand,
      categoryId: draftCategoryId,
      categoryLabel: composerCategoryLabel,
      content: draftContent.trim(),
      timestamp: Date.now(),
      replies: [],
      upvotes: [],
      attachments,
    };

    try {
      await addPost(post);
      await clearDraft();
      setComposerOpen(false);
      setComposerInitialAttachments(undefined);
    } catch (err) {
      Alert.alert(
        t('common.error', { defaultValue: 'Error' }),
        err instanceof Error ? err.message : t('forum.postFailed', { defaultValue: 'Could not publish your post.' })
      );
    }
  };

  const handleDeletePost = (postId: string) => {
    const runDelete = () => {
      void deletePost(postId).catch((err) => {
        Alert.alert(t('common.error'), err.message);
      });
    };

    if (Platform.OS === 'web') {
      if (window.confirm(t('common.confirmDelete', { defaultValue: 'Are you sure you want to delete this?' }))) {
        runDelete();
      }
    } else {
      Alert.alert(
        t('common.delete', { defaultValue: 'Delete' }),
        t('common.confirmDelete', { defaultValue: 'Are you sure you want to delete this?' }),
        [
          { text: t('common.cancel', { defaultValue: 'Cancel' }), style: 'cancel' },
          { text: t('common.delete', { defaultValue: 'Delete' }), style: 'destructive', onPress: runDelete },
        ]
      );
    }
  };

  if (!user || !team) return null;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <PageTitle showSettings>{t('forum.pageTitle')}</PageTitle>
          <SearchBar value={searchQuery} onChangeText={setSearchQuery} placeholder={t('forum.searchPlaceholder')} />

          {/* Category filter chips */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filtersRow}
            style={{ marginHorizontal: -Spacing.xl, paddingHorizontal: Spacing.xl }}
          >
            {filterTabs.map((tab) => (
              <Chip
                key={tab.id}
                label={`${tab.label}${tab.id !== 'all' ? ` (${categoryStats.find((s) => s.id === tab.id)?.count ?? 0})` : ''}`}
                variant={activeCategoryId === tab.id ? 'filled' : 'outlined'}
                onPress={() => setActiveCategoryId(tab.id)}
              />
            ))}
          </ScrollView>

          {/* Sort bar */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={[styles.sortRow, { paddingRight: Spacing.xl }]}
            style={{ marginHorizontal: -Spacing.xl, paddingHorizontal: Spacing.xl }}
          >
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
          </ScrollView>

          {/* Post list */}
          {posts.length === 0 ? (
            <EmptyState icon="chatbubbles-outline" title={t('forum.noPosts')} message={t('forum.noPostsDesc')} />
          ) : filteredAndSortedPosts.length === 0 ? (
            <EmptyState message={t('common.noSearchResults')} />
          ) : (
            filteredAndSortedPosts.map((post) => (
              <ForumPostCard
                key={post.id}
                post={post}
                currentUid={user.uid}
                replyText=""
                expanded={false}
                onToggleReplies={() => {}}
                onReplyChange={() => {}}
                onReplySubmit={() => {}}
                onDelete={() => handleDeletePost(post.id)}
                onUpvote={() => upvotePost(post.id, user.uid)}
                isThreadView={false}
                onPress={() => router.push(`/post/${post.id}`)}
              />
            ))
          )}
        </ScrollView>

        {/* Floating Action Button */}
        <Pressable
          style={({ pressed }) => [
            styles.fab,
            { opacity: pressed ? 0.85 : 1, transform: [{ scale: pressed ? 0.94 : 1 }] },
          ]}
          onPress={() => setComposerOpen(true)}
          android_ripple={{ color: 'rgba(255,255,255,0.2)', borderless: true, radius: 28 }}
        >
          <Ionicons name="add" size={28} color="#fff" />
        </Pressable>
      </KeyboardAvoidingView>

      {/* New-post modal composer */}
      <ForumComposer
        visible={composerOpen}
        user={user}
        topicTitle={draftTitle}
        onTopicTitleChange={(title) => saveDraft(title, draftContent, draftCategoryId)}
        categoryLabel={composerCategoryLabel}
        categoryOptions={categoryOptions.map((option) => option.label)}
        onCategoryChange={(label) => {
          const match = categoryOptions.find((option) => option.label === label);
          if (match) saveDraft(draftTitle, draftContent, match.id);
        }}
        value={draftContent}
        onChangeText={(text) => saveDraft(draftTitle, text, draftCategoryId)}
        onSubmit={handleCreatePost}
        initialAttachments={composerInitialAttachments}
        onCancel={() => {
          setComposerOpen(false);
          setComposerInitialAttachments(undefined);
        }}
      />
    </SafeAreaView>
  );
}
