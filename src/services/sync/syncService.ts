import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  orderBy,
  query,
  limit,
} from 'firebase/firestore';
import { isSigningOut } from '../../auth/sessionFlags';
import { getFirebaseAuth, getFirestoreDb } from '../../config/firebase';

async function waitForSignedInUser() {
  const auth = getFirebaseAuth();
  await auth.authStateReady();
  return auth.currentUser;
}
import { FS } from '../../firebase/collections';
import * as activityRepo from '../../database/repositories/activityResultRepository';
import * as forumRepo from '../../database/repositories/forumRepository';
import * as syncQueue from '../../database/repositories/syncQueueRepository';
import { normalizeTeamName } from '../../database/mappers';
import type { ActivityResult, SensorLog, ForumPost, ForumReply, Team } from '../../types';
import { getGradeBandFromStoredLevel } from '../../utils/gradeLevel';
import * as teamRepo from '../../database/repositories/teamRepository';

const PULL_LIMIT = 500;

/** Pull shared Firestore data into SQLite cache. */
export async function pullSharedDataFromFirestore(): Promise<void> {
  const db = getFirestoreDb();

  const resultsSnap = await getDocs(
    query(collection(db, FS.activityResults), orderBy('timestamp', 'desc'), limit(PULL_LIMIT))
  );
  for (const d of resultsSnap.docs) {
    const data = d.data();
    await activityRepo.upsertActivityResult({
      id: d.id,
      activityId: data.activityId as string,
      activityName: data.activityName as string,
      teamDiscriminator: data.teamDiscriminator as string,
      submittedByUid: data.submittedByUid as string | undefined,
      timestamp: data.timestamp as number,
      data: data.data as Record<string, unknown>,
      score: data.score as number | undefined,
    });
  }

  const postsSnap = await getDocs(
    query(collection(db, FS.forumPosts), orderBy('timestamp', 'desc'), limit(PULL_LIMIT))
  );
  for (const postDoc of postsSnap.docs) {
    const data = postDoc.data();
    const repliesSnap = await getDocs(collection(db, FS.forumPosts, postDoc.id, FS.forumReplies));
    const replies: ForumReply[] = repliesSnap.docs.map((r) => {
      const rd = r.data();
      return {
        id: r.id,
        parentReplyId: (rd.parentReplyId as string) ?? undefined,
        authorUid: (rd.authorUid as string) ?? 'legacy',
        authorName: (rd.authorName as string) ?? 'Student',
        teamDiscriminator: rd.teamDiscriminator as string,
        teamName: (rd.teamName as string) ?? 'Legacy Team',
        content: rd.content as string,
        timestamp: rd.timestamp as number,
        upvotes: (rd.upvotes as string[]) ?? [],
        attachmentUrl: (rd.attachmentUrl as string) ?? undefined,
        attachments: rd.attachments as any[] | undefined,
      };
    });
    const teamDiscriminator = data.teamDiscriminator as string;
    let gradeBand = (data.gradeBand as ForumPost['gradeBand']) ?? undefined;
    if (!gradeBand && teamDiscriminator) {
      const localTeam = await teamRepo.getTeamByDiscriminator(teamDiscriminator);
      gradeBand = getGradeBandFromStoredLevel(localTeam?.gradeLevel);
    }

    await forumRepo.upsertForumPost({
      id: postDoc.id,
      topicTitle: (data.topicTitle as string) ?? 'Untitled topic',
      authorUid: (data.authorUid as string) ?? 'legacy',
      authorName: (data.authorName as string) ?? 'Student',
      teamDiscriminator,
      teamName: (data.teamName as string) ?? 'Legacy Team',
      gradeBand,
      categoryId: (data.categoryId as string) ?? undefined,
      categoryLabel: (data.categoryLabel as string) ?? undefined,
      content: data.content as string,
      timestamp: data.timestamp as number,
      upvotes: (data.upvotes as string[]) ?? [],
      attachmentUrl: (data.attachmentUrl as string) ?? undefined,
      attachments: data.attachments as any[] | undefined,
      replies,
    });
  }
}

export async function pushSyncQueue(): Promise<void> {
  const db = getFirestoreDb();
  const pending = await syncQueue.getPendingSyncItems();

  for (const item of pending) {
    try {
      if (item.entityType === 'activity_result' && item.operation === 'upsert') {
        const result = item.payload as ActivityResult;
        await setDoc(doc(db, FS.activityResults, result.id), {
          activityId: result.activityId,
          activityName: result.activityName,
          teamDiscriminator: result.teamDiscriminator,
          submittedByUid: result.submittedByUid ?? null,
          timestamp: result.timestamp,
          data: result.data,
          score: result.score ?? null,
          updatedAt: Date.now(),
        });
      } else if (item.entityType === 'activity_result' && item.operation === 'delete') {
        await deleteDoc(doc(db, FS.activityResults, item.entityId));
      } else if (item.entityType === 'sensor_log' && item.operation === 'upsert') {
        const log = item.payload as SensorLog;
        await setDoc(doc(db, FS.sensorLogs, log.id), {
          sensorType: log.sensorType,
          teamDiscriminator: log.teamDiscriminator,
          timestamp: log.timestamp,
          data: log.data,
          updatedAt: Date.now(),
        });
      } else if (item.entityType === 'sensor_log' && item.operation === 'delete') {
        await deleteDoc(doc(db, FS.sensorLogs, item.entityId));
      } else if (item.entityType === 'forum_post' && item.operation === 'upsert') {
        const post = item.payload as ForumPost;
        await setDoc(doc(db, FS.forumPosts, post.id), {
          topicTitle: post.topicTitle,
          authorUid: post.authorUid,
          authorName: post.authorName,
          teamDiscriminator: post.teamDiscriminator,
          teamName: post.teamName,
          gradeBand: post.gradeBand ?? null,
          categoryId: post.categoryId ?? null,
          categoryLabel: post.categoryLabel ?? null,
          content: post.content,
          timestamp: post.timestamp,
          upvotes: post.upvotes ?? [],
          attachmentUrl: post.attachmentUrl ?? null,
          attachments: post.attachments ?? [],
          updatedAt: Date.now(),
        });
      } else if (item.entityType === 'forum_post' && item.operation === 'delete') {
        // Delete all replies first so the document doesn't become an orphaned ghost
        const repliesSnap = await getDocs(collection(db, FS.forumPosts, item.entityId, FS.forumReplies));
        await Promise.all(repliesSnap.docs.map((d) => deleteDoc(d.ref)));
        // Then delete the post itself
        await deleteDoc(doc(db, FS.forumPosts, item.entityId));
      } else if (item.entityType === 'forum_reply' && item.operation === 'upsert') {
        const payload = item.payload as { postId: string; reply: ForumReply };
        await setDoc(
          doc(db, FS.forumPosts, payload.postId, FS.forumReplies, payload.reply.id),
          {
            authorUid: payload.reply.authorUid,
            authorName: payload.reply.authorName,
            parentReplyId: payload.reply.parentReplyId ?? null,
            teamDiscriminator: payload.reply.teamDiscriminator,
            teamName: payload.reply.teamName,
            content: payload.reply.content,
            timestamp: payload.reply.timestamp,
            upvotes: payload.reply.upvotes ?? [],
            attachmentUrl: payload.reply.attachmentUrl ?? null,
            attachments: payload.reply.attachments ?? [],
            updatedAt: Date.now(),
          }
        );
      } else if (item.entityType === 'forum_reply' && item.operation === 'delete') {
        const payload = item.payload as { postId: string; replyId: string };
        await deleteDoc(
          doc(db, FS.forumPosts, payload.postId, FS.forumReplies, payload.replyId)
        );
      } else if (item.entityType === 'team' && item.operation === 'upsert') {
        const team = item.payload as Team;
        await setDoc(
          doc(db, FS.teams, team.discriminator),
          {
            name: team.name,
            nameLower: normalizeTeamName(team.name),
            gradeLevel: team.gradeLevel,
            joinPassword: team.joinPassword,
            createdByUid: team.createdByUid,
            updatedAt: Date.now(),
          },
          { merge: true }
        );
      }
      await syncQueue.removeSyncItem(item.id);
    } catch (err: any) {
      if (item.retryCount > 3 || String(err).includes('permission')) {
        await syncQueue.removeSyncItem(item.id);
      } else {
        console.warn(`[sync] failed to push ${item.entityType} (${item.operation}):`, err);
        await syncQueue.incrementSyncRetry(item.id);
      }
    }
  }
}

export async function syncWhenOnline(): Promise<void> {
  if (isSigningOut()) return;

  const firebaseUser = await waitForSignedInUser();
  if (!firebaseUser || isSigningOut()) return;

  try {
    await pushSyncQueue();
  } catch (err) {
    console.warn('[sync] push failed:', err);
  }

  try {
    await pullSharedDataFromFirestore();
  } catch (err) {
    const code = (err as { code?: string })?.code;
    if (code === 'permission-denied') {
      if (!isSigningOut()) {
        console.warn(
          '[sync] Firestore permission denied. Publish firestore.rules in Firebase Console (see docs/FIREBASE_SETUP.md).'
        );
      }
    } else {
      console.warn('[sync] pull failed:', err);
    }
  }
}

export async function queueActivityResultSync(result: ActivityResult): Promise<void> {
  await syncQueue.enqueueSync('activity_result', result.id, 'upsert', result);
}

export async function queueActivityResultDelete(id: string): Promise<void> {
  await syncQueue.enqueueSync('activity_result', id, 'delete', { id });
}

export async function queueSensorLogSync(log: SensorLog): Promise<void> {
  await syncQueue.enqueueSync('sensor_log', log.id, 'upsert', log);
}

export async function queueSensorLogDelete(id: string): Promise<void> {
  await syncQueue.enqueueSync('sensor_log', id, 'delete', { id });
}

export async function queueForumPostSync(post: ForumPost): Promise<void> {
  await syncQueue.enqueueSync('forum_post', post.id, 'upsert', post);
}

export async function queueForumPostDelete(id: string): Promise<void> {
  await syncQueue.enqueueSync('forum_post', id, 'delete', { id });
}

export async function queueForumReplySync(postId: string, reply: ForumReply): Promise<void> {
  await syncQueue.enqueueSync('forum_reply', reply.id, 'upsert', { postId, reply });
}

export async function queueForumReplyDelete(postId: string, replyId: string): Promise<void> {
  await syncQueue.enqueueSync('forum_reply', replyId, 'delete', { postId, replyId });
}
