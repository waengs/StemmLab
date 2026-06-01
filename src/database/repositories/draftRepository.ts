import { withDatabase } from '../client';
import type { ForumDraftRow } from '../rows';

export async function saveForumDraft(
  id: string,
  topicTitle: string,
  categoryId: string,
  content: string
): Promise<void> {
  const now = Date.now();
  await withDatabase((db) =>
    db.runAsync(
      `INSERT INTO forum_drafts (
        id, topic_title, category_id, content, updated_at
      ) VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        topic_title = excluded.topic_title,
        category_id = excluded.category_id,
        content = excluded.content,
        updated_at = excluded.updated_at`,
      id,
      topicTitle,
      categoryId,
      content,
      now
    )
  );
}

export async function getForumDraft(id: string): Promise<ForumDraftRow | null> {
  return withDatabase((db) =>
    db.getFirstAsync<ForumDraftRow>(`SELECT * FROM forum_drafts WHERE id = ?`, id)
  );
}

export async function deleteForumDraft(id: string): Promise<void> {
  await withDatabase((db) => db.runAsync(`DELETE FROM forum_drafts WHERE id = ?`, id));
}
