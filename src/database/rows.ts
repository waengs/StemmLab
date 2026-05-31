export interface ActivityResultRow {
  id: string;
  activity_id: string;
  activity_name: string;
  team_discriminator: string;
  submitted_by_uid: string | null;
  timestamp: number;
  data_json: string;
  score: number | null;
  created_at: number;
  updated_at: number;
  synced_at: number | null;
  deleted_at: number | null;
}

export interface SensorLogRow {
  id: string;
  sensor_type: string;
  team_discriminator: string;
  recorded_by_uid: string | null;
  timestamp: number;
  data_json: string;
  created_at: number;
  updated_at: number;
  synced_at: number | null;
}

export interface ForumPostRow {
  id: string;
  topic_title: string | null;
  author_uid: string;
  author_name: string;
  team_discriminator: string;
  team_name: string;
  category_id: string | null;
  category_label: string | null;
  content: string;
  timestamp: number;
  upvotes_json: string;
  created_at: number;
  updated_at: number;
  synced_at: number | null;
  attachment_url: string | null;
  attachments_json: string | null;
}

export interface ForumReplyRow {
  id: string;
  post_id: string;
  parent_reply_id: string | null;
  author_uid: string;
  author_name: string;
  team_discriminator: string;
  team_name: string;
  content: string;
  timestamp: number;
  upvotes_json: string;
  created_at: number;
  updated_at: number;
  synced_at: number | null;
  attachment_url: string | null;
  attachments_json: string | null;
}

export interface ForumDraftRow {
  id: string;
  topic_title: string;
  category_id: string;
  content: string;
  updated_at: number;
}
