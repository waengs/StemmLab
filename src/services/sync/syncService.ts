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
        authorUid: (rd.authorUid as string) ?? 'legacy',
        authorName: (rd.authorName as string) ?? 'Student',
        teamDiscriminator: rd.teamDiscriminator as string,
        content: rd.content as string,
        timestamp: rd.timestamp as number,
      };
    });
    await forumRepo.upsertForumPost({
      id: postDoc.id,
      authorUid: (data.authorUid as string) ?? 'legacy',
      authorName: (data.authorName as string) ?? 'Student',
      teamDiscriminator: data.teamDiscriminator as string,
      content: data.content as string,
      timestamp: data.timestamp as number,
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
      } else if (item.entityType === 'forum_post' && item.operation === 'upsert') {
        const post = item.payload as ForumPost;
        await setDoc(doc(db, FS.forumPosts, post.id), {
          authorUid: post.authorUid,
          authorName: post.authorName,
          teamDiscriminator: post.teamDiscriminator,
          content: post.content,
          timestamp: post.timestamp,
          updatedAt: Date.now(),
        });
      } else if (item.entityType === 'forum_reply' && item.operation === 'upsert') {
        const payload = item.payload as { postId: string; reply: ForumReply };
        await setDoc(
          doc(db, FS.forumPosts, payload.postId, FS.forumReplies, payload.reply.id),
          {
            authorUid: payload.reply.authorUid,
            authorName: payload.reply.authorName,
            teamDiscriminator: payload.reply.teamDiscriminator,
            content: payload.reply.content,
            timestamp: payload.reply.timestamp,
            updatedAt: Date.now(),
          }
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
    } catch {
      await syncQueue.incrementSyncRetry(item.id);
    }
  }
}

export async function syncWhenOnline(): Promise<void> {
  const firebaseUser = await waitForSignedInUser();
  if (!firebaseUser) return;

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
      console.warn(
        '[sync] Firestore permission denied. Publish firestore.rules in Firebase Console (see docs/FIREBASE_SETUP.md).'
      );
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

export async function queueForumPostSync(post: ForumPost): Promise<void> {
  await syncQueue.enqueueSync('forum_post', post.id, 'upsert', post);
}

export async function queueForumReplySync(postId: string, reply: ForumReply): Promise<void> {
  await syncQueue.enqueueSync('forum_reply', reply.id, 'upsert', { postId, reply });
}
