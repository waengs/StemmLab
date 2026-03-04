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
import { useTheme, useAuthStore, useForumStore } from '../../src/stores';
import { Spacing } from '../../src/theme';
import type { ForumPost, ForumReply } from '../../src/types';

export default function Forum() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const team = useAuthStore((s) => s.team);
  const posts = useForumStore((s) => s.posts);
  const addPost = useForumStore((s) => s.addPost);
  const updatePost = useForumStore((s) => s.updatePost);
  const [newPostContent, setNewPostContent] = useState('');
  const [replyContent, setReplyContent] = useState<Record<string, string>>({});
  const [expandedPosts, setExpandedPosts] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPosts = useMemo(() => {
    if (!searchQuery.trim()) return posts;
    return posts.filter((post) => {
      const replyText = post.replies.map((r) => `${r.teamName} ${r.content}`).join(' ');
      return matchesSearch(`${post.teamName} ${post.content} ${replyText}`, searchQuery);
    });
  }, [posts, searchQuery]);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        safe: { flex: 1, backgroundColor: colors.background },
        flex: { flex: 1 },
        content: {
          padding: Spacing.xl,
          paddingBottom: Spacing.xxxl,
        },
      }),
    [colors]
  );

  const handleCreatePost = async () => {
    if (!team || !newPostContent.trim()) return;

    if (hasProfanity(newPostContent)) {
      Alert.alert(t('common.profanityWarningTitle'), t('common.profanityWarningMsg'));
      return;
    }

    const post: ForumPost = {
      id: Date.now().toString(),
      teamName: team.name,
      teamDiscriminator: team.discriminator,
      content: newPostContent,
      timestamp: Date.now(),
      replies: [],
    };

    await addPost(post);
    setNewPostContent('');
  };

  const handleReply = async (postId: string) => {
    if (!team || !replyContent[postId]?.trim()) return;

    if (hasProfanity(replyContent[postId])) {
      Alert.alert(t('common.profanityWarningTitle'), t('common.profanityWarningMsg'));
      return;
    }

    const post = posts.find((p) => p.id === postId);
    if (!post) return;

    const reply: ForumReply = {
      id: Date.now().toString(),
      teamName: team.name,
      teamDiscriminator: team.discriminator,
      content: replyContent[postId],
      timestamp: Date.now(),
    };

    const updatedPost = { ...post, replies: [...post.replies, reply] };
    await updatePost(updatedPost);

    setReplyContent({ ...replyContent, [postId]: '' });
    setExpandedPosts({ ...expandedPosts, [postId]: true });
  };

  if (!team) return null;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <PageTitle showSettings>{t('forum.pageTitle')}</PageTitle>
          <SearchBar value={searchQuery} onChangeText={setSearchQuery} placeholder={t('forum.searchPlaceholder')} />

          <ForumComposer
            team={team}
            value={newPostContent}
            onChangeText={setNewPostContent}
            onSubmit={handleCreatePost}
          />

          {posts.length === 0 ? (
            <EmptyState
              icon="chatbubbles-outline"
              title={t('forum.noPosts')}
              message={t('forum.noPostsDesc')}
            />
          ) : filteredPosts.length === 0 ? (
            <EmptyState message={t('common.noSearchResults')} />
          ) : (
            filteredPosts.map((post) => (
              <ForumPostCard
                key={post.id}
                post={post}
                replyText={replyContent[post.id] || ''}
                expanded={!!expandedPosts[post.id]}
                onToggleReplies={() =>
                  setExpandedPosts({ ...expandedPosts, [post.id]: !expandedPosts[post.id] })
                }
                onReplyChange={(text) => setReplyContent({ ...replyContent, [post.id]: text })}
                onReplySubmit={() => handleReply(post.id)}
              />
            ))
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
