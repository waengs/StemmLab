import type { ActivityResult, SensorLog, ForumPost, ForumReply } from '../types';
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
    authorUid: post.author_uid,
    authorName: post.author_name,
    teamDiscriminator: post.team_discriminator,
    content: post.content,
    timestamp: post.timestamp,
    replies: replies.map(rowToForumReply),
  };
}

export function rowToForumReply(row: ForumReplyRow): ForumReply {
  return {
    id: row.id,
    authorUid: row.author_uid,
    authorName: row.author_name,
    teamDiscriminator: row.team_discriminator,
    content: row.content,
    timestamp: row.timestamp,
  };
}

export function normalizeTeamName(name: string): string {
  return name.trim().toLowerCase();
}
