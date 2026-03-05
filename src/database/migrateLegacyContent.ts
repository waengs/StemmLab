import AsyncStorage from '@react-native-async-storage/async-storage';
import { getDatabase } from './client';
import type { ActivityResult, SensorLog, ForumPost } from '../types';
import * as activityRepo from './repositories/activityResultRepository';
import * as sensorRepo from './repositories/sensorLogRepository';
import * as forumRepo from './repositories/forumRepository';

const LEGACY_KEYS = {
  RESULTS: 'stem_app_results',
  SENSOR_LOGS: 'stem_app_sensor_logs',
  FORUM_POSTS: 'stem_app_forum_posts',
  MIGRATED: 'stem_legacy_content_migrated',
};

/**
 * One-time import of activity/forum/sensor data from old AsyncStorage.
 * Does NOT migrate auth — teams must register/sign in via Firebase Auth.
 */
export async function migrateLegacyContentIfNeeded(): Promise<void> {
  const database = await getDatabase();
  const flag = await database.getFirstAsync<{ value: string }>(
    `SELECT value FROM app_meta WHERE key = ?`,
    LEGACY_KEYS.MIGRATED
  );
  if (flag?.value === '1') return;

  const resultsRaw = await AsyncStorage.getItem(LEGACY_KEYS.RESULTS);
  if (resultsRaw) {
    const results: ActivityResult[] = JSON.parse(resultsRaw);
    for (const r of results) await activityRepo.upsertActivityResult(r);
  }

  const logsRaw = await AsyncStorage.getItem(LEGACY_KEYS.SENSOR_LOGS);
  if (logsRaw) {
    const logs: SensorLog[] = JSON.parse(logsRaw);
    for (const l of logs) await sensorRepo.upsertSensorLog(l);
  }

  const postsRaw = await AsyncStorage.getItem(LEGACY_KEYS.FORUM_POSTS);
  if (postsRaw) {
    const posts: ForumPost[] = JSON.parse(postsRaw);
    for (const p of posts) await forumRepo.upsertForumPost(p);
  }

  await database.runAsync(
    `INSERT INTO app_meta (key, value) VALUES (?, '1')
     ON CONFLICT(key) DO UPDATE SET value = '1'`,
    LEGACY_KEYS.MIGRATED
  );

  await AsyncStorage.multiRemove([
    LEGACY_KEYS.RESULTS,
    LEGACY_KEYS.SENSOR_LOGS,
    LEGACY_KEYS.FORUM_POSTS,
    'stem_app_team',
    'stem_app_all_teams',
  ]);
}
