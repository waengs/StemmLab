import React, { useState, useMemo } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  PageTitle,
  SearchBar,
  ForumComposer,
  ForumPostCard,
  EmptyState,
} from '../../src/components';
import { matchesSearch } from '../../src/utils/search';
import { hasProfanity } from '../../src/utils/profanity';
import { useTheme } from '../../src/stores/themeStore';
import { useAuthStore, useForumStore } from '../../src/stores';
import { useRequireAuth } from '../../src/stores';
import { Spacing } from '../../src/theme';
import type { ForumPost, ForumReply } from '../../src/types';

export default function Forum() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { user, team } = useRequireAuth();
  const posts = useForumStore((s) => s.posts);
  const addPost = useForumStore((s) => s.addPost);
  const updatePost = useForumStore((s) => s.updatePost);
  const deletePost = useForumStore((s) => s.deletePost);
  const deleteReply = useForumStore((s) => s.deleteReply);
  const [newPostContent, setNewPostContent] = useState('');
  const [replyContent, setReplyContent] = useState<Record<string, string>>({});
  const [expandedPosts, setExpandedPosts] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPosts = useMemo(() => {
    if (!searchQuery.trim()) return posts;
    return posts.filter((post) => {
      const replyText = post.replies.map((r) => `${r.authorName} ${r.content}`).join(' ');
      return matchesSearch(`${post.authorName} ${post.content} ${replyText}`, searchQuery);
    });
  }, [posts, searchQuery]);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        safe: { flex: 1, backgroundColor: colors.background },
        flex: { flex: 1 },
        content: { padding: Spacing.xl, paddingBottom: Spacing.xxxl },
      }),
    [colors]
  );

  const handleCreatePost = async () => {
    if (!user || !team || !newPostContent.trim()) return;

    if (hasProfanity(newPostContent)) {
      Alert.alert(t('common.profanityWarningTitle'), t('common.profanityWarningMsg'));
      return;
    }

    const post: ForumPost = {
      id: Date.now().toString(),
      authorUid: user.uid,
      authorName: user.displayName,
      teamDiscriminator: team.discriminator,
      teamName: team.name,
      content: newPostContent,
      timestamp: Date.now(),
      replies: [],
    };

    await addPost(post);
    setNewPostContent('');
  };

  const handleReply = async (postId: string) => {
    if (!user || !team || !replyContent[postId]?.trim()) return;

    if (hasProfanity(replyContent[postId])) {
      Alert.alert(t('common.profanityWarningTitle'), t('common.profanityWarningMsg'));
      return;
    }

    const post = posts.find((p) => p.id === postId);
    if (!post) return;

    const reply: ForumReply = {
      id: Date.now().toString(),
      authorUid: user.uid,
      authorName: user.displayName,
      teamDiscriminator: team.discriminator,
      teamName: team.name,
      content: replyContent[postId],
      timestamp: Date.now(),
    };

    const updatedPost = { ...post, replies: [...post.replies, reply] };
    await updatePost(updatedPost);

    setReplyContent({ ...replyContent, [postId]: '' });
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

          <ForumComposer
            user={user}
            value={newPostContent}
            onChangeText={setNewPostContent}
            onSubmit={handleCreatePost}
          />

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
                expanded={!!expandedPosts[post.id]}
                onToggleReplies={() =>
                  setExpandedPosts({ ...expandedPosts, [post.id]: !expandedPosts[post.id] })
                }
                onReplyChange={(text) => setReplyContent({ ...replyContent, [post.id]: text })}
                onReplySubmit={() => handleReply(post.id)}
                onDelete={() => handleDeletePost(post.id)}
                onDeleteReply={(replyId) => handleDeleteReply(post.id, replyId)}
              />
            ))
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
