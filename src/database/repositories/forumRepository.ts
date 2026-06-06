import { withDatabase } from '../client';
import type { ForumPostRow, ForumReplyRow } from '../rows';
import { rowsToForumPost } from '../mappers';
import type { ForumPost, ForumReply } from '../../types';
import type * as SQLite from 'expo-sqlite';

async function upsertForumReplyRow(
  db: SQLite.SQLiteDatabase,
  postId: string,
  reply: ForumReply,
  now: number
): Promise<void> {
  await db.runAsync(
    `INSERT INTO forum_replies (
      id, post_id, parent_reply_id, author_uid, author_name, team_discriminator, team_name,
      content, timestamp, upvotes_json, attachment_url, attachments_json, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      parent_reply_id = excluded.parent_reply_id,
      author_uid = excluded.author_uid,
      author_name = excluded.author_name,
      content = excluded.content,
      timestamp = excluded.timestamp,
      upvotes_json = excluded.upvotes_json,
      attachment_url = excluded.attachment_url,
      attachments_json = excluded.attachments_json,
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
    JSON.stringify(reply.upvotes ?? []),
    reply.attachmentUrl ?? null,
    JSON.stringify(reply.attachments ?? []),
    now,
    now
  );
}

export async function upsertForumPost(post: ForumPost): Promise<void> {
  await withDatabase(async (db) => {
    const now = Date.now();
    await db.runAsync(
      `INSERT INTO forum_posts (
        id, topic_title, author_uid, author_name, team_discriminator, team_name, grade_band, category_id, category_label, content,
        timestamp, upvotes_json, attachment_url, attachments_json, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        topic_title = excluded.topic_title,
        author_uid = excluded.author_uid,
        author_name = excluded.author_name,
        team_discriminator = excluded.team_discriminator,
        team_name = excluded.team_name,
        grade_band = excluded.grade_band,
        category_id = excluded.category_id,
        category_label = excluded.category_label,
        content = excluded.content,
        timestamp = excluded.timestamp,
        upvotes_json = excluded.upvotes_json,
        attachment_url = excluded.attachment_url,
        attachments_json = excluded.attachments_json,
        updated_at = excluded.updated_at`,
      post.id,
      post.topicTitle,
      post.authorUid,
      post.authorName,
      post.teamDiscriminator,
      post.teamName,
      post.gradeBand ?? null,
      post.categoryId ?? null,
      post.categoryLabel ?? null,
      post.content,
      post.timestamp,
      JSON.stringify(post.upvotes ?? []),
      post.attachmentUrl ?? null,
      JSON.stringify(post.attachments ?? []),
      now,
      now
    );

    for (const reply of post.replies) {
      await upsertForumReplyRow(db, post.id, reply, now);
    }
  });
}

export async function upsertForumReply(postId: string, reply: ForumReply): Promise<void> {
  await withDatabase(async (db) => {
    await upsertForumReplyRow(db, postId, reply, Date.now());
  });
}

export async function getAllForumPosts(): Promise<ForumPost[]> {
  return withDatabase(async (db) => {
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
  });
}

export async function deleteForumPost(id: string): Promise<void> {
  await withDatabase(async (db) => {
    await db.runAsync(`DELETE FROM forum_posts WHERE id = ?`, id);
    await db.runAsync(`DELETE FROM forum_replies WHERE post_id = ?`, id);
  });
}

export async function deleteForumReply(id: string): Promise<void> {
  await withDatabase((db) => db.runAsync(`DELETE FROM forum_replies WHERE id = ?`, id));
}

/** Removes local posts (and their replies) whose ids are not in the remote set. */
export async function purgeForumPostsNotIn(keepIds: Set<string>): Promise<void> {
  await withDatabase(async (db) => {
    const local = await db.getAllAsync<{ id: string }>(`SELECT id FROM forum_posts`);
    for (const row of local) {
      if (!keepIds.has(row.id)) {
        await db.runAsync(`DELETE FROM forum_posts WHERE id = ?`, row.id);
        await db.runAsync(`DELETE FROM forum_replies WHERE post_id = ?`, row.id);
      }
    }
  });
}
