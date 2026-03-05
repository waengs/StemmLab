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
  author_uid: string;
  author_name: string;
  team_discriminator: string;
  team_name: string;
  content: string;
  timestamp: number;
  created_at: number;
  updated_at: number;
  synced_at: number | null;
}

export interface ForumReplyRow {
  id: string;
  post_id: string;
  author_uid: string;
  author_name: string;
  team_discriminator: string;
  team_name: string;
  content: string;
  timestamp: number;
  created_at: number;
  updated_at: number;
  synced_at: number | null;
}
