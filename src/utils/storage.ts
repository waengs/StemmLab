import { assertFirebaseConfigured } from '../config/env';
import { initDatabase } from '../database/client';
import { migrateLegacyContentIfNeeded } from '../database/migrateLegacyContent';
import * as activityRepo from '../database/repositories/activityResultRepository';
import * as sensorRepo from '../database/repositories/sensorLogRepository';
import * as forumRepo from '../database/repositories/forumRepository';
import * as draftRepo from '../database/repositories/draftRepository';
import {
  registerAccount,
  signInWithEmail,
  createTeamForUser,
  joinTeamForUser,
  leaveTeamForUser,
  getAuthSession,
  signOut,
  updateUserProfile,
} from '../services/auth/authService';
import {
  listAvailableTeams,
  filterTeamListings,
  fetchTeamMembers,
} from '../services/team/teamDirectoryService';
import {
  syncWhenOnline,
  queueActivityResultSync,
  queueActivityResultDelete,
  queueSensorLogSync,
  queueSensorLogDelete,
  queueForumPostSync,
  queueForumPostDelete,
  queueForumReplySync,
  queueForumReplyDelete,
} from '../services/sync/syncService';
import type {
  AppUser,
  Team,
  TeamListing,
  TeamMemberSummary,
  ActivityResult,
  SensorLog,
  ForumPost,
} from '../types';

export function generateDiscriminator(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export async function initializeDataLayer(): Promise<void> {
  assertFirebaseConfigured();
  await initDatabase();
  await migrateLegacyContentIfNeeded();
}

export async function getAuthContext(): Promise<{ user: AppUser; team: Team | null } | null> {
  return getAuthSession();
}

/** @deprecated Use getAuthContext */
export async function getTeam(): Promise<Team | null> {
  const ctx = await getAuthSession();
  return ctx?.team ?? null;
}

export async function getUser(): Promise<AppUser | null> {
  const ctx = await getAuthSession();
  return ctx?.user ?? null;
}

export async function registerUser(input: {
  displayName: string;
  email: string;
  password: string;
}): Promise<AppUser> {
  return registerAccount(input);
}

export async function signInUser(email: string, password: string): Promise<AppUser | null> {
  return signInWithEmail(email, password);
}

export async function createTeam(
  uid: string,
  input: { name: string; gradeLevel: string; joinPassword: string; discriminator?: string }
): Promise<{ user: AppUser; team: Team }> {
  const result = await createTeamForUser(uid, {
    ...input,
    discriminator: input.discriminator ?? generateDiscriminator(),
  });
  void syncWhenOnline();
  return result;
}

export async function joinTeam(
  uid: string,
  teamDiscriminator: string,
  joinPassword: string
): Promise<{ user: AppUser; team: Team } | null> {
  const result = await joinTeamForUser(uid, { teamDiscriminator, joinPassword });
  if (result) void syncWhenOnline();
  return result;
}

export async function leaveTeam(uid: string): Promise<AppUser> {
  return leaveTeamForUser(uid);
}

export async function browseTeams(): Promise<TeamListing[]> {
  return listAvailableTeams();
}

export { filterTeamListings, fetchTeamMembers };
export type { TeamListing, TeamMemberSummary };

export async function updateProfile(
  user: AppUser,
  options?: { displayName?: string; newPassword?: string }
): Promise<AppUser> {
  return updateUserProfile(user, options);
}

export async function clearSession(): Promise<void> {
  await signOut();
}

export async function saveActivityResult(result: ActivityResult): Promise<void> {
  await activityRepo.upsertActivityResult(result);
  await queueActivityResultSync(result);
  void syncWhenOnline();
}

export async function getActivityResults(): Promise<ActivityResult[]> {
  return activityRepo.getAllActivityResults();
}

export async function deleteActivityResult(id: string): Promise<void> {
  await activityRepo.deleteActivityResult(id);
  await queueActivityResultDelete(id);
  void syncWhenOnline();
}

export async function saveSensorLog(log: SensorLog): Promise<void> {
  await sensorRepo.upsertSensorLog(log);
  await queueSensorLogSync(log);
  void syncWhenOnline();
}

export async function getSensorLogs(): Promise<SensorLog[]> {
  return sensorRepo.getAllSensorLogs();
}

export async function deleteSensorLogRecord(id: string): Promise<void> {
  await sensorRepo.deleteSensorLog(id);
  await queueSensorLogDelete(id);
  void syncWhenOnline();
}

export async function saveForumPost(post: ForumPost): Promise<void> {
  await forumRepo.upsertForumPost(post);
  await queueForumPostSync(post);
  void syncWhenOnline();
}

export async function updateForumPost(post: ForumPost): Promise<void> {
  const previous = await forumRepo.getAllForumPosts();
  const prior = previous.find((p) => p.id === post.id);
  const priorReplyCount = prior?.replies.length ?? 0;

  await forumRepo.upsertForumPost(post);
  await queueForumPostSync(post);
  const latestReply = post.replies[post.replies.length - 1];
  if (latestReply && post.replies.length > priorReplyCount) {
    await queueForumReplySync(post.id, latestReply);
    const { getFirebaseAuth } = await import('../config/firebase');
    const actorUid = getFirebaseAuth().currentUser?.uid;
    if (actorUid) {
      const { notifyForumReply } = await import('../services/notifications/notificationService');
      await notifyForumReply(post, latestReply, actorUid);
    }
  }
  void syncWhenOnline();
}

export async function getForumPosts(): Promise<ForumPost[]> {
  return forumRepo.getAllForumPosts();
}

export async function deleteForumPostRecord(id: string): Promise<void> {
  await forumRepo.deleteForumPost(id);
  await queueForumPostDelete(id);
  void syncWhenOnline();
}

export async function deleteForumReplyRecord(postId: string, replyId: string): Promise<void> {
  const posts = await forumRepo.getAllForumPosts();
  const post = posts.find((p) => p.id === postId);
  if (!post) return;

  const childrenByParent = new Map<string, string[]>();
  for (const reply of post.replies) {
    const parent = reply.parentReplyId ?? '__root__';
    const list = childrenByParent.get(parent) ?? [];
    list.push(reply.id);
    childrenByParent.set(parent, list);
  }

  const idsToDelete: string[] = [];
  const stack = [replyId];
  while (stack.length > 0) {
    const current = stack.pop()!;
    idsToDelete.push(current);
    const children = childrenByParent.get(current) ?? [];
    for (const childId of children) {
      stack.push(childId);
    }
  }

  for (const id of idsToDelete) {
    await forumRepo.deleteForumReply(id);
    await queueForumReplyDelete(postId, id);
  }
  void syncWhenOnline();
}

export async function refreshSharedData(): Promise<void> {
  await syncWhenOnline();
}

export async function saveForumDraft(id: string, title: string, categoryId: string, content: string): Promise<void> {
  return draftRepo.saveForumDraft(id, title, categoryId, content);
}

export async function getForumDraft(id: string) {
  return draftRepo.getForumDraft(id);
}

export async function deleteForumDraft(id: string): Promise<void> {
  return draftRepo.deleteForumDraft(id);
}
