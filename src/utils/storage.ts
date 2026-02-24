import AsyncStorage from '@react-native-async-storage/async-storage';
import { Team, ActivityResult, SensorLog, ForumPost } from '../types';

const STORAGE_KEYS = {
  TEAM: 'stem_app_team',
  RESULTS: 'stem_app_results',
  SENSOR_LOGS: 'stem_app_sensor_logs',
  FORUM_POSTS: 'stem_app_forum_posts',
};

export function generateDiscriminator(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export async function saveTeam(team: Team): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.TEAM, JSON.stringify(team));
}

export async function getTeam(): Promise<Team | null> {
  const data = await AsyncStorage.getItem(STORAGE_KEYS.TEAM);
  return data ? JSON.parse(data) : null;
}

export async function clearTeam(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEYS.TEAM);
}

export async function saveActivityResult(result: ActivityResult): Promise<void> {
  const results = await getActivityResults();
  results.push(result);
  await AsyncStorage.setItem(STORAGE_KEYS.RESULTS, JSON.stringify(results));
}

export async function getActivityResults(): Promise<ActivityResult[]> {
  const data = await AsyncStorage.getItem(STORAGE_KEYS.RESULTS);
  return data ? JSON.parse(data) : [];
}

export async function deleteActivityResult(id: string): Promise<void> {
  const results = (await getActivityResults()).filter(r => r.id !== id);
  await AsyncStorage.setItem(STORAGE_KEYS.RESULTS, JSON.stringify(results));
}

export async function saveSensorLog(log: SensorLog): Promise<void> {
  const logs = await getSensorLogs();
  logs.push(log);
  await AsyncStorage.setItem(STORAGE_KEYS.SENSOR_LOGS, JSON.stringify(logs));
}

export async function getSensorLogs(): Promise<SensorLog[]> {
  const data = await AsyncStorage.getItem(STORAGE_KEYS.SENSOR_LOGS);
  return data ? JSON.parse(data) : [];
}

export async function saveForumPost(post: ForumPost): Promise<void> {
  const posts = await getForumPosts();
  posts.push(post);
  await AsyncStorage.setItem(STORAGE_KEYS.FORUM_POSTS, JSON.stringify(posts));
}

export async function updateForumPost(post: ForumPost): Promise<void> {
  const posts = await getForumPosts();
  const index = posts.findIndex(p => p.id === post.id);
  if (index !== -1) {
    posts[index] = post;
    await AsyncStorage.setItem(STORAGE_KEYS.FORUM_POSTS, JSON.stringify(posts));
  }
}

export async function getForumPosts(): Promise<ForumPost[]> {
  const data = await AsyncStorage.getItem(STORAGE_KEYS.FORUM_POSTS);
  return data ? JSON.parse(data) : [];
}
