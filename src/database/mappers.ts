import type { ActivityResult, SensorLog, ForumPost, ForumReply, ForumGradeBand } from '../types';
import type {
  ActivityResultRow,
  SensorLogRow,
  ForumPostRow,
  ForumReplyRow,
} from './rows';

export function rowToActivityResult(row: ActivityResultRow): ActivityResult {
  return {
    id: row.id,
    activityId: row.activity_id,
    activityName: row.activity_name,
    teamDiscriminator: row.team_discriminator,
    submittedByUid: row.submitted_by_uid ?? undefined,
    timestamp: row.timestamp,
    data: JSON.parse(row.data_json),
    score: row.score ?? undefined,
  };
}

export function rowToSensorLog(row: SensorLogRow): SensorLog {
  return {
    id: row.id,
    sensorType: row.sensor_type,
    teamDiscriminator: row.team_discriminator,
    timestamp: row.timestamp,
    data: JSON.parse(row.data_json),
    recordedByUid: row.recorded_by_uid ?? undefined,
  };
}

export function rowsToForumPost(post: ForumPostRow, replies: ForumReplyRow[]): ForumPost {
  return {
    id: post.id,
    topicTitle: post.topic_title ?? 'Untitled topic',
    authorUid: post.author_uid,
    authorName: post.author_name,
    teamDiscriminator: post.team_discriminator,
    teamName: post.team_name,
    gradeBand: (post.grade_band as ForumGradeBand | null) ?? undefined,
    categoryId: post.category_id ?? undefined,
    categoryLabel: post.category_label ?? undefined,
    content: post.content,
    timestamp: post.timestamp,
    upvotes: JSON.parse(post.upvotes_json || '[]'),
    attachmentUrl: post.attachment_url ?? undefined,
    attachments: post.attachments_json 
      ? JSON.parse(post.attachments_json) 
      : post.attachment_url 
        ? [{ url: post.attachment_url, type: 'image', name: 'Legacy Attachment' }] 
        : [],
    replies: replies.map(rowToForumReply),
  };
}

export function rowToForumReply(row: ForumReplyRow): ForumReply {
  return {
    id: row.id,
    parentReplyId: row.parent_reply_id ?? undefined,
    authorUid: row.author_uid,
    authorName: row.author_name,
    teamDiscriminator: row.team_discriminator,
    teamName: row.team_name,
    content: row.content,
    timestamp: row.timestamp,
    upvotes: JSON.parse(row.upvotes_json || '[]'),
    attachmentUrl: row.attachment_url ?? undefined,
    attachments: row.attachments_json 
      ? JSON.parse(row.attachments_json) 
      : row.attachment_url 
        ? [{ url: row.attachment_url, type: 'image', name: 'Legacy Attachment' }] 
        : [],
  };
}

export function normalizeTeamName(name: string): string {
  return name.trim().toLowerCase();
}
