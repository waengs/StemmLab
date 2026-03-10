import { getDatabase } from '../client';
import type { ForumPostRow, ForumReplyRow } from '../rows';
import { rowsToForumPost } from '../mappers';
import type { ForumPost, ForumReply } from '../../types';

export async function upsertForumPost(post: ForumPost): Promise<void> {
  const db = await getDatabase();
  const now = Date.now();
  await db.runAsync(
    `INSERT INTO forum_posts (
      id, topic_title, author_uid, author_name, team_discriminator, team_name, category_id, category_label, content,
      timestamp, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      topic_title = excluded.topic_title,
      author_uid = excluded.author_uid,
      author_name = excluded.author_name,
      team_discriminator = excluded.team_discriminator,
      category_id = excluded.category_id,
      category_label = excluded.category_label,
      content = excluded.content,
      timestamp = excluded.timestamp,
      updated_at = excluded.updated_at`,
    post.id,
    post.topicTitle,
    post.authorUid,
    post.authorName,
    post.teamDiscriminator,
    post.teamName,
    post.categoryId ?? null,
    post.categoryLabel ?? null,
    post.content,
    post.timestamp,
    now,
    now
  );

  for (const reply of post.replies) {
    await upsertForumReply(post.id, reply);
  }
}

export async function upsertForumReply(postId: string, reply: ForumReply): Promise<void> {
  const db = await getDatabase();
  const now = Date.now();
  await db.runAsync(
    `INSERT INTO forum_replies (
      id, post_id, parent_reply_id, author_uid, author_name, team_discriminator, team_name,
      content, timestamp, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      parent_reply_id = excluded.parent_reply_id,
      author_uid = excluded.author_uid,
      author_name = excluded.author_name,
      content = excluded.content,
      timestamp = excluded.timestamp,
      updated_at = excluded.updated_at`,
    reply.id,
    postId,
    reply.parentReplyId ?? null,
    reply.authorUid,
    reply.authorName,
    reply.teamDiscriminator,
    reply.teamName,
    reply.content,
    reply.timestamp,
    now,
    now
  );
}

export async function getAllForumPosts(): Promise<ForumPost[]> {
  const db = await getDatabase();
  const posts = await db.getAllAsync<ForumPostRow>(
    `SELECT * FROM forum_posts ORDER BY timestamp DESC`
  );
  const result: ForumPost[] = [];
  for (const post of posts) {
    const replies = await db.getAllAsync<ForumReplyRow>(
      `SELECT * FROM forum_replies WHERE post_id = ? ORDER BY timestamp ASC`,
      post.id
    );
    result.push(rowsToForumPost(post, replies));
  }
  return result;
}

export async function deleteForumPost(id: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(`DELETE FROM forum_posts WHERE id = ?`, id);
  await db.runAsync(`DELETE FROM forum_replies WHERE post_id = ?`, id);
}

export async function deleteForumReply(id: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(`DELETE FROM forum_replies WHERE id = ?`, id);
}
