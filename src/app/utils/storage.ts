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

export function saveTeam(team: Team): void {
  localStorage.setItem(STORAGE_KEYS.TEAM, JSON.stringify(team));
}

export function getTeam(): Team | null {
  const data = localStorage.getItem(STORAGE_KEYS.TEAM);
  return data ? JSON.parse(data) : null;
}

export function clearTeam(): void {
  localStorage.removeItem(STORAGE_KEYS.TEAM);
}

export function saveActivityResult(result: ActivityResult): void {
  const results = getActivityResults();
  results.push(result);
  localStorage.setItem(STORAGE_KEYS.RESULTS, JSON.stringify(results));
}

export function getActivityResults(): ActivityResult[] {
  const data = localStorage.getItem(STORAGE_KEYS.RESULTS);
  return data ? JSON.parse(data) : [];
}

export function deleteActivityResult(id: string): void {
  const results = getActivityResults().filter(r => r.id !== id);
  localStorage.setItem(STORAGE_KEYS.RESULTS, JSON.stringify(results));
}

export function saveSensorLog(log: SensorLog): void {
  const logs = getSensorLogs();
  logs.push(log);
  localStorage.setItem(STORAGE_KEYS.SENSOR_LOGS, JSON.stringify(logs));
}

export function getSensorLogs(): SensorLog[] {
  const data = localStorage.getItem(STORAGE_KEYS.SENSOR_LOGS);
  return data ? JSON.parse(data) : [];
}

export function saveForumPost(post: ForumPost): void {
  const posts = getForumPosts();
  posts.push(post);
  localStorage.setItem(STORAGE_KEYS.FORUM_POSTS, JSON.stringify(posts));
}

export function updateForumPost(post: ForumPost): void {
  const posts = getForumPosts();
  const index = posts.findIndex(p => p.id === post.id);
  if (index !== -1) {
    posts[index] = post;
    localStorage.setItem(STORAGE_KEYS.FORUM_POSTS, JSON.stringify(posts));
  }
}

export function getForumPosts(): ForumPost[] {
  const data = localStorage.getItem(STORAGE_KEYS.FORUM_POSTS);
  return data ? JSON.parse(data) : [];
}
