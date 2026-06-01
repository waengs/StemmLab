export const DB_NAME = 'stemmlab.db';
export const DB_VERSION = 11;

/** Ordered migrations — only bump DB_VERSION when adding new statements. */
export const MIGRATIONS: string[] = [
  `CREATE TABLE IF NOT EXISTS app_meta (
    key TEXT PRIMARY KEY NOT NULL,
    value TEXT NOT NULL
  );`,

  /** Logged-in session (single row, id = 1). */
  `CREATE TABLE IF NOT EXISTS session (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    team_discriminator TEXT NOT NULL,
    auth_uid TEXT NOT NULL,
    updated_at INTEGER NOT NULL
  );`,

  /** Team profile cache (auth via Firebase only). */
  `CREATE TABLE IF NOT EXISTS teams (
    discriminator TEXT PRIMARY KEY NOT NULL,
    auth_uid TEXT NOT NULL,
    name TEXT NOT NULL,
    name_lower TEXT NOT NULL,
    grade_level TEXT NOT NULL,
    members_json TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    synced_at INTEGER
  );`,
  `CREATE INDEX IF NOT EXISTS idx_teams_name_lower ON teams(name_lower);`,
  `CREATE INDEX IF NOT EXISTS idx_teams_auth_uid ON teams(auth_uid);`,

  /** Activity submissions — shared via Firestore for leaderboard. */
  `CREATE TABLE IF NOT EXISTS activity_results (
    id TEXT PRIMARY KEY NOT NULL,
    activity_id TEXT NOT NULL,
    activity_name TEXT NOT NULL,
    team_discriminator TEXT NOT NULL,
    submitted_by_uid TEXT,
    timestamp INTEGER NOT NULL,
    data_json TEXT NOT NULL,
    score REAL,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    synced_at INTEGER,
    deleted_at INTEGER
  );`,
  `CREATE INDEX IF NOT EXISTS idx_activity_results_team ON activity_results(team_discriminator);`,
  `CREATE INDEX IF NOT EXISTS idx_activity_results_activity ON activity_results(activity_id);`,

  /** Sensor readings — primarily local; synced per team when online. */
  `CREATE TABLE IF NOT EXISTS sensor_logs (
    id TEXT PRIMARY KEY NOT NULL,
    sensor_type TEXT NOT NULL,
    team_discriminator TEXT NOT NULL,
    timestamp INTEGER NOT NULL,
    data_json TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    synced_at INTEGER
  );`,
  `CREATE INDEX IF NOT EXISTS idx_sensor_logs_team ON sensor_logs(team_discriminator);`,

  `CREATE TABLE IF NOT EXISTS forum_posts (
    id TEXT PRIMARY KEY NOT NULL,
    team_discriminator TEXT NOT NULL,
    team_name TEXT NOT NULL,
    content TEXT NOT NULL,
    timestamp INTEGER NOT NULL,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    synced_at INTEGER
  );`,
  `CREATE INDEX IF NOT EXISTS idx_forum_posts_timestamp ON forum_posts(timestamp DESC);`,

  `CREATE TABLE IF NOT EXISTS forum_replies (
    id TEXT PRIMARY KEY NOT NULL,
    post_id TEXT NOT NULL,
    team_discriminator TEXT NOT NULL,
    team_name TEXT NOT NULL,
    content TEXT NOT NULL,
    timestamp INTEGER NOT NULL,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    synced_at INTEGER,
    FOREIGN KEY (post_id) REFERENCES forum_posts(id) ON DELETE CASCADE
  );`,
  `CREATE INDEX IF NOT EXISTS idx_forum_replies_post ON forum_replies(post_id);`,

  /** Offline write queue → pushed to Firestore when online. */
  `CREATE TABLE IF NOT EXISTS sync_queue (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    operation TEXT NOT NULL,
    payload_json TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    retry_count INTEGER NOT NULL DEFAULT 0
  );`,
];

/** Runs when upgrading an existing install to DB_VERSION 2. */
export const MIGRATIONS_V2: string[] = [
  `CREATE TABLE IF NOT EXISTS teams_v2 (
    discriminator TEXT PRIMARY KEY NOT NULL,
    auth_uid TEXT NOT NULL,
    name TEXT NOT NULL,
    name_lower TEXT NOT NULL,
    grade_level TEXT NOT NULL,
    members_json TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    synced_at INTEGER
  );`,
  `INSERT OR IGNORE INTO teams_v2 (
    discriminator, auth_uid, name, name_lower, grade_level, members_json,
    created_at, updated_at, synced_at
  )
  SELECT discriminator, '', name, name_lower, grade_level, members_json,
    created_at, updated_at, synced_at FROM teams;`,
  `DROP TABLE IF EXISTS teams;`,
  `ALTER TABLE teams_v2 RENAME TO teams;`,
  `CREATE INDEX IF NOT EXISTS idx_teams_name_lower ON teams(name_lower);`,
  `CREATE INDEX IF NOT EXISTS idx_teams_auth_uid ON teams(auth_uid);`,
];

/** Individual accounts + team join codes (v3). */
export const MIGRATIONS_V3: string[] = [
  `CREATE TABLE IF NOT EXISTS users (
    uid TEXT PRIMARY KEY NOT NULL,
    display_name TEXT NOT NULL,
    email TEXT NOT NULL,
    team_discriminator TEXT,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  );`,

  `CREATE TABLE IF NOT EXISTS session_v3 (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    user_uid TEXT NOT NULL,
    team_discriminator TEXT,
    updated_at INTEGER NOT NULL
  );`,
  `INSERT OR IGNORE INTO session_v3 (id, user_uid, team_discriminator, updated_at)
   SELECT 1, auth_uid, team_discriminator, updated_at FROM session;`,
  `DROP TABLE IF EXISTS session;`,
  `ALTER TABLE session_v3 RENAME TO session;`,

  `CREATE TABLE IF NOT EXISTS teams_v3 (
    discriminator TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    name_lower TEXT NOT NULL,
    grade_level TEXT NOT NULL,
    join_password TEXT NOT NULL DEFAULT '',
    created_by_uid TEXT NOT NULL DEFAULT '',
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    synced_at INTEGER
  );`,
  `INSERT OR IGNORE INTO teams_v3 (
    discriminator, name, name_lower, grade_level, join_password, created_by_uid,
    created_at, updated_at, synced_at
  )
  SELECT discriminator, name, name_lower, grade_level, '', '',
    created_at, updated_at, synced_at FROM teams;`,
  `DROP TABLE IF EXISTS teams;`,
  `ALTER TABLE teams_v3 RENAME TO teams;`,
  `CREATE INDEX IF NOT EXISTS idx_teams_name_lower ON teams(name_lower);`,

  `ALTER TABLE forum_posts ADD COLUMN author_uid TEXT;`,
  `ALTER TABLE forum_posts ADD COLUMN author_name TEXT;`,
  `UPDATE forum_posts SET author_name = team_name, author_uid = 'legacy' WHERE author_name IS NULL;`,

  `ALTER TABLE forum_replies ADD COLUMN author_uid TEXT;`,
  `ALTER TABLE forum_replies ADD COLUMN author_name TEXT;`,
  `UPDATE forum_replies SET author_name = team_name, author_uid = 'legacy' WHERE author_name IS NULL;`,
];

/** Forum categories per activity (v4). */
export const MIGRATIONS_V4: string[] = [
  `ALTER TABLE forum_posts ADD COLUMN category_id TEXT;`,
  `ALTER TABLE forum_posts ADD COLUMN category_label TEXT;`,
];

/** Nested forum replies (v5). */
export const MIGRATIONS_V5: string[] = [
  `ALTER TABLE forum_replies ADD COLUMN parent_reply_id TEXT;`,
];

/** Forum post topic titles (v6). */
export const MIGRATIONS_V6: string[] = [
  `ALTER TABLE forum_posts ADD COLUMN topic_title TEXT;`,
];

/** Upvotes JSON and Draft Posts (v7). */
export const MIGRATIONS_V7: string[] = [
  `ALTER TABLE forum_posts ADD COLUMN upvotes_json TEXT DEFAULT '[]';`,
  `ALTER TABLE forum_replies ADD COLUMN upvotes_json TEXT DEFAULT '[]';`,
  `CREATE TABLE IF NOT EXISTS forum_drafts (
    id TEXT PRIMARY KEY NOT NULL,
    topic_title TEXT NOT NULL,
    category_id TEXT NOT NULL,
    content TEXT NOT NULL,
    updated_at INTEGER NOT NULL
  );`,
];

/** Cloudinary Image Attachments (v8). */
export const MIGRATIONS_V8: string[] = [
  `ALTER TABLE forum_posts ADD COLUMN attachment_url TEXT;`,
  `ALTER TABLE forum_replies ADD COLUMN attachment_url TEXT;`,
];

/** Multiple File Attachments JSON (v9). */
export const MIGRATIONS_V9: string[] = [
  `ALTER TABLE forum_posts ADD COLUMN attachments_json TEXT DEFAULT '[]';`,
  `ALTER TABLE forum_replies ADD COLUMN attachments_json TEXT DEFAULT '[]';`,
];

/** Forum posts scoped by grade band (v10). */
export const MIGRATIONS_V10: string[] = [
  `ALTER TABLE forum_posts ADD COLUMN grade_band TEXT;`,
  `UPDATE forum_posts
   SET grade_band = (
     SELECT CASE
       WHEN t.grade_level LIKE '%High%'
         OR t.grade_level LIKE '%SMP%'
         OR t.grade_level = 'Lower High School (Grades 7–9)'
       THEN 'high_school'
       ELSE 'primary'
     END
     FROM teams t
     WHERE t.discriminator = forum_posts.team_discriminator
   )
   WHERE grade_band IS NULL;`,
];

/** Personal sensor log ownership + cloud sync (v11). */
export const MIGRATIONS_V11: string[] = [
  `ALTER TABLE sensor_logs ADD COLUMN recorded_by_uid TEXT;`,
  `CREATE INDEX IF NOT EXISTS idx_sensor_logs_user ON sensor_logs(recorded_by_uid);`,
];
