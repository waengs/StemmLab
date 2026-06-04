import {
  collection,
  doc,
  getDocs,
  limit,
  query,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { getFirestoreDb } from '../../config/firebase';
import { FS } from '../../firebase/collections';
import type { AppNotification, ForumPost, ForumReply } from '../../types';
import { supportsCustomNativeModules } from '../../utils/nativeFeatures';

const PULL_LIMIT = 100;

function mapNotificationDoc(id: string, data: Record<string, unknown>): AppNotification {
  return {
    id,
    recipientUid: data.recipientUid as string,
    type: (data.type as AppNotification['type']) ?? 'forum_reply',
    postId: data.postId as string,
    postTitle: (data.postTitle as string) ?? 'Forum post',
    fromUid: data.fromUid as string,
    fromName: (data.fromName as string) ?? 'Someone',
    preview: (data.preview as string) ?? '',
    timestamp: (data.timestamp as number) ?? Date.now(),
    read: Boolean(data.read),
  };
}

export async function pullNotificationsForUser(uid: string): Promise<AppNotification[]> {
  const db = getFirestoreDb();
  const snap = await getDocs(
    query(collection(db, FS.notifications), where('recipientUid', '==', uid), limit(PULL_LIMIT))
  );
  return snap.docs
    .map((d) => mapNotificationDoc(d.id, d.data()))
    .sort((a, b) => b.timestamp - a.timestamp);
}

export async function markNotificationRead(id: string): Promise<void> {
  const db = getFirestoreDb();
  await updateDoc(doc(db, FS.notifications, id), { read: true, updatedAt: Date.now() });
}

async function writeNotification(notification: AppNotification): Promise<void> {
  const db = getFirestoreDb();
  await setDoc(doc(db, FS.notifications, notification.id), {
    recipientUid: notification.recipientUid,
    type: notification.type,
    postId: notification.postId,
    postTitle: notification.postTitle,
    fromUid: notification.fromUid,
    fromName: notification.fromName,
    preview: notification.preview,
    timestamp: notification.timestamp,
    read: notification.read,
    updatedAt: Date.now(),
  });
}

export async function notifyForumReply(
  post: ForumPost,
  reply: ForumReply,
  actorUid: string
): Promise<void> {
  const recipients = new Set<string>();
  if (post.authorUid !== actorUid) recipients.add(post.authorUid);

  if (reply.parentReplyId) {
    const parent = post.replies.find((r) => r.id === reply.parentReplyId);
    if (parent && parent.authorUid !== actorUid) recipients.add(parent.authorUid);
  }

  const preview = reply.content.slice(0, 120);
  const type: AppNotification['type'] = reply.parentReplyId ? 'forum_comment' : 'forum_reply';

  await Promise.all(
    [...recipients].map(async (recipientUid) => {
      const notification: AppNotification = {
        id: `${post.id}_${reply.id}_${recipientUid}`,
        recipientUid,
        type,
        postId: post.id,
        postTitle: post.topicTitle,
        fromUid: reply.authorUid,
        fromName: reply.authorName,
        preview,
        timestamp: reply.timestamp,
        read: false,
      };
      await writeNotification(notification);
    })
  );
}

const seenNotificationIds = new Set<string>();

export async function presentNewNotifications(
  notifications: AppNotification[],
  previouslySeen: Set<string> = seenNotificationIds
): Promise<void> {
  if (!supportsCustomNativeModules()) return;

  const Notifications = await import('expo-notifications');
  const fresh = notifications.filter((n) => !n.read && !previouslySeen.has(n.id));
  for (const n of fresh) {
    previouslySeen.add(n.id);
    const title =
      n.type === 'forum_comment'
        ? `Comment on "${n.postTitle}"`
        : `Reply on "${n.postTitle}"`;
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body: `${n.fromName}: ${n.preview}`,
        data: { postId: n.postId, notificationId: n.id },
      },
      trigger: null,
    });
  }
}
