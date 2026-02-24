import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { Card } from '../../src/components/Card';
import { Avatar } from '../../src/components/Avatar';
import { Button } from '../../src/components/Button';
import { Input } from '../../src/components/Input';
import { getTeam, getForumPosts, saveForumPost, updateForumPost } from '../../src/utils/storage';
import { Colors, Spacing, BorderRadius, Typography } from '../../src/theme';
import type { ForumPost, ForumReply, Team } from '../../src/types';

export default function Forum() {
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [newPostContent, setNewPostContent] = useState('');
  const [replyContent, setReplyContent] = useState<Record<string, string>>({});
  const [expandedPosts, setExpandedPosts] = useState<Record<string, boolean>>({});
  const [team, setTeam] = useState<Team | null>(null);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const teamData = await getTeam();
        setTeam(teamData);
        const allPosts = await getForumPosts();
        setPosts(allPosts.sort((a, b) => b.timestamp - a.timestamp));
      })();
    }, [])
  );

  const handleCreatePost = async () => {
    if (!team || !newPostContent.trim()) return;

    const post: ForumPost = {
      id: Date.now().toString(),
      teamName: team.name,
      teamDiscriminator: team.discriminator,
      content: newPostContent,
      timestamp: Date.now(),
      replies: [],
    };

    await saveForumPost(post);
    setPosts([post, ...posts]);
    setNewPostContent('');
  };

  const handleReply = async (postId: string) => {
    if (!team || !replyContent[postId]?.trim()) return;

    const post = posts.find(p => p.id === postId);
    if (!post) return;

    const reply: ForumReply = {
      id: Date.now().toString(),
      teamName: team.name,
      teamDiscriminator: team.discriminator,
      content: replyContent[postId],
      timestamp: Date.now(),
    };

    const updatedPost = { ...post, replies: [...post.replies, reply] };
    await updateForumPost(updatedPost);

    setPosts(posts.map(p => p.id === postId ? updatedPost : p));
    setReplyContent({ ...replyContent, [postId]: '' });
    setExpandedPosts({ ...expandedPosts, [postId]: true });
  };

  const toggleExpand = (postId: string) => {
    setExpandedPosts({
      ...expandedPosts,
      [postId]: !expandedPosts[postId],
    });
  };

  if (!team) return null;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={styles.pageTitle}>Team Forum</Text>

          {/* New post card */}
          <Card style={styles.newPostCard}>
            <View style={styles.newPostHeader}>
              <Avatar name={team.name} size={36} backgroundColor={Colors.primary} />
              <Text style={styles.newPostLabel}>Share with the community</Text>
            </View>
            <Input
              value={newPostContent}
              onChangeText={setNewPostContent}
              placeholder="Ask a question or share an idea..."
              multiline
              numberOfLines={3}
              containerStyle={{ marginBottom: Spacing.sm }}
            />
            <Button
              title="Post"
              onPress={handleCreatePost}
              disabled={!newPostContent.trim()}
              icon={<Ionicons name="send" size={16} color={Colors.white} />}
            />
          </Card>

          {/* Posts */}
          {posts.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Ionicons name="chatbubbles-outline" size={48} color={Colors.textMuted} />
              <Text style={styles.emptyTitle}>No posts yet</Text>
              <Text style={styles.emptyText}>Be the first to start a discussion!</Text>
            </Card>
          ) : (
            posts.map((post) => (
              <Card key={post.id} style={styles.postCard}>
                {/* Post header */}
                <View style={styles.postHeader}>
                  <Avatar name={post.teamName} size={36} backgroundColor={Colors.primary} />
                  <View style={styles.postMeta}>
                    <Text style={styles.postTeam}>{post.teamName}</Text>
                    <Text style={styles.postDate}>
                      {new Date(post.timestamp).toLocaleString()}
                    </Text>
                  </View>
                </View>

                {/* Post content */}
                <Text style={styles.postContent}>{post.content}</Text>

                {/* Replies toggle */}
                {post.replies.length > 0 && (
                  <TouchableOpacity
                    style={styles.repliesToggle}
                    onPress={() => toggleExpand(post.id)}
                  >
                    <Text style={styles.repliesToggleText}>
                      {post.replies.length} {post.replies.length === 1 ? 'Reply' : 'Replies'}
                    </Text>
                    <Ionicons
                      name={expandedPosts[post.id] ? 'chevron-up' : 'chevron-down'}
                      size={16}
                      color={Colors.primary}
                    />
                  </TouchableOpacity>
                )}

                {/* Expanded replies */}
                {expandedPosts[post.id] && post.replies.length > 0 && (
                  <View style={styles.repliesContainer}>
                    {post.replies.map((reply) => (
                      <View key={reply.id} style={styles.replyItem}>
                        <View style={styles.replyHeader}>
                          <Avatar name={reply.teamName} size={22} backgroundColor={Colors.primaryLight} />
                          <Text style={styles.replyTeam}>{reply.teamName}</Text>
                          <Text style={styles.replyDate}>
                            • {new Date(reply.timestamp).toLocaleString()}
                          </Text>
                        </View>
                        <Text style={styles.replyContent}>{reply.content}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {/* Reply input */}
                <View style={styles.replyInputRow}>
                  <View style={styles.replyInputWrapper}>
                    <Input
                      value={replyContent[post.id] || ''}
                      onChangeText={(v) => setReplyContent({ ...replyContent, [post.id]: v })}
                      placeholder="Write a reply..."
                      containerStyle={{ marginBottom: 0, flex: 1 }}
                    />
                  </View>
                  <TouchableOpacity
                    style={[styles.sendBtn, !replyContent[post.id]?.trim() && styles.sendBtnDisabled]}
                    onPress={() => handleReply(post.id)}
                    disabled={!replyContent[post.id]?.trim()}
                  >
                    <Ionicons name="send" size={18} color={Colors.white} />
                  </TouchableOpacity>
                </View>
              </Card>
            ))
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
  },
  content: {
    padding: Spacing.xl,
    paddingBottom: Spacing.xxxl,
  },
  pageTitle: {
    ...Typography.h1,
    marginBottom: Spacing.xxl,
  },
  newPostCard: {
    marginBottom: Spacing.xl,
  },
  newPostHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  newPostLabel: {
    ...Typography.bodySmall,
    fontWeight: '600',
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: Spacing.xxxl,
    gap: Spacing.sm,
  },
  emptyTitle: {
    ...Typography.h3,
    color: Colors.textMuted,
  },
  emptyText: {
    ...Typography.bodySmall,
    color: Colors.textMuted,
  },
  postCard: {
    marginBottom: Spacing.lg,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  postMeta: {
    flex: 1,
  },
  postTeam: {
    ...Typography.label,
  },
  postDate: {
    ...Typography.caption,
  },
  postContent: {
    ...Typography.body,
    marginBottom: Spacing.md,
  },
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
  repliesContainer: {
    borderLeftWidth: 2,
    borderLeftColor: Colors.border,
    paddingLeft: Spacing.lg,
    marginBottom: Spacing.md,
  },
  replyItem: {
    marginBottom: Spacing.md,
  },
  replyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  replyTeam: {
    ...Typography.bodySmall,
    fontWeight: '600',
  },
  replyDate: {
    ...Typography.caption,
  },
  replyContent: {
    ...Typography.bodySmall,
    paddingLeft: 30,
  },
  replyInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    paddingTop: Spacing.md,
  },
  replyInputWrapper: {
    flex: 1,
  },
  sendBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    opacity: 0.4,
  },
});
