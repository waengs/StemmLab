import React, { useState, useMemo } from 'react';
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
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { PageTitle, SearchBar, ForumComposer, ForumPostCard, EmptyState, Chip } from '../../src/components';
import { matchesSearch } from '../../src/utils/search';
import { hasProfanity } from '../../src/utils/profanity';
import { useTheme } from '../../src/stores/themeStore';
import { useForumStore } from '../../src/stores';
import { useRequireAuth } from '../../src/stores';
import { BorderRadius, Shadows, Spacing } from '../../src/theme';
import { ACTIVITIES, type ForumPost, type ForumReply } from '../../src/types';

export default function Forum() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { user, team } = useRequireAuth();
  const posts = useForumStore((s) => s.posts);
  const addPost = useForumStore((s) => s.addPost);
  const updatePost = useForumStore((s) => s.updatePost);
  const deletePost = useForumStore((s) => s.deletePost);
  const deleteReply = useForumStore((s) => s.deleteReply);
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [replyContent, setReplyContent] = useState<Record<string, string>>({});
  const [replyTarget, setReplyTarget] = useState<Record<string, { replyId: string; authorName: string } | null>>({});
  const [expandedPosts, setExpandedPosts] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategoryId, setActiveCategoryId] = useState<string>('all');
  const [composerCategoryId, setComposerCategoryId] = useState<string>('general');
  const [composerOpen, setComposerOpen] = useState(false);

  const categoryOptions = useMemo(() => {
    const activityOptions = Object.values(ACTIVITIES).map((activity) => ({
      id: activity.id,
      label: activity.name,
    }));
    return [{ id: 'general', label: t('forum.generalCategory') }, ...activityOptions];
  }, [t]);

  const composerCategoryLabel = useMemo(
    () =>
      categoryOptions.find((option) => option.id === composerCategoryId)?.label ??
      t('forum.generalCategory'),
    [categoryOptions, composerCategoryId, t]
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

  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const inCategory = activeCategoryId === 'all' || (post.categoryId ?? 'general') === activeCategoryId;
      if (!inCategory) return false;
      const replyText = post.replies.map((r) => `${r.authorName} ${r.content}`).join(' ');
      const haystack = `${post.topicTitle} ${post.authorName} ${post.content} ${post.categoryLabel ?? ''} ${replyText}`;
      return !searchQuery.trim() || matchesSearch(haystack, searchQuery);
    });
  }, [posts, searchQuery, activeCategoryId]);

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
        // Floating action button
        fab: {
          position: 'absolute',
          bottom: Spacing.xxl,
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

  const handleCreatePost = async () => {
    if (!user || !team || !newPostTitle.trim() || !newPostContent.trim()) return;

    if (hasProfanity(newPostContent)) {
      Alert.alert(t('common.profanityWarningTitle'), t('common.profanityWarningMsg'));
      return;
    }

    const post: ForumPost = {
      id: Date.now().toString(),
      topicTitle: newPostTitle.trim(),
      authorUid: user.uid,
      authorName: user.displayName,
      teamDiscriminator: team.discriminator,
      teamName: team.name,
      categoryId: composerCategoryId,
      categoryLabel: composerCategoryLabel,
      content: newPostContent,
      timestamp: Date.now(),
      replies: [],
    };

    await addPost(post);
    setNewPostTitle('');
    setNewPostContent('');
    setComposerOpen(false);
  };

  const handleReply = async (postId: string) => {
    if (!user || !team || !replyContent[postId]?.trim()) return;

    if (hasProfanity(replyContent[postId])) {
      Alert.alert(t('common.profanityWarningTitle'), t('common.profanityWarningMsg'));
      return;
    }

    const post = posts.find((p) => p.id === postId);
    if (!post) return;

    const target = replyTarget[postId];
    const body = replyContent[postId].trim();
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
    };

    const updatedPost = { ...post, replies: [...post.replies, reply] };
    await updatePost(updatedPost);

    setReplyContent({ ...replyContent, [postId]: '' });
    setReplyTarget({ ...replyTarget, [postId]: null });
    setExpandedPosts({ ...expandedPosts, [postId]: true });
  };

  const handleDeletePost = (postId: string) => {
    const runDelete = () => {
      void deletePost(postId).catch((err) => {
        Alert.alert('Error', err.message);
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

  const handleDeleteReply = (postId: string, replyId: string) => {
    const runDelete = () => {
      void deleteReply(postId, replyId).catch((err) => {
        Alert.alert('Error', err.message);
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

          {posts.length === 0 ? (
            <EmptyState icon="chatbubbles-outline" title={t('forum.noPosts')} message={t('forum.noPostsDesc')} />
          ) : filteredPosts.length === 0 ? (
            <EmptyState message={t('common.noSearchResults')} />
          ) : (
            filteredPosts.map((post) => (
              <ForumPostCard
                key={post.id}
                post={post}
                currentUid={user.uid}
                replyText={replyContent[post.id] || ''}
                replyTargetName={replyTarget[post.id]?.authorName}
                expanded={!!expandedPosts[post.id]}
                onToggleReplies={() =>
                  setExpandedPosts({ ...expandedPosts, [post.id]: !expandedPosts[post.id] })
                }
                onReplyChange={(text) => setReplyContent({ ...replyContent, [post.id]: text })}
                onReplySubmit={() => handleReply(post.id)}
                onReplyToReply={(replyId, authorName) => {
                  setExpandedPosts({ ...expandedPosts, [post.id]: true });
                  setReplyTarget({ ...replyTarget, [post.id]: { replyId, authorName } });
                }}
                onClearReplyTarget={() => setReplyTarget({ ...replyTarget, [post.id]: null })}
                onDelete={() => handleDeletePost(post.id)}
                onDeleteReply={(replyId) => handleDeleteReply(post.id, replyId)}
              />
            ))
          )}
        </ScrollView>

        {/* Floating Action Button */}
        <Pressable
          style={({ pressed }) => [styles.fab, { opacity: pressed ? 0.85 : 1, transform: [{ scale: pressed ? 0.94 : 1 }] }]}
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
        topicTitle={newPostTitle}
        onTopicTitleChange={setNewPostTitle}
        categoryLabel={composerCategoryLabel}
        categoryOptions={categoryOptions.map((option) => option.label)}
        onCategoryChange={(label) => {
          const match = categoryOptions.find((option) => option.label === label);
          if (match) setComposerCategoryId(match.id);
        }}
        value={newPostContent}
        onChangeText={setNewPostContent}
        onSubmit={handleCreatePost}
        onCancel={() => {
          setComposerOpen(false);
          setNewPostTitle('');
          setNewPostContent('');
        }}
      />
    </SafeAreaView>
  );
}
