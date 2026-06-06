import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  setDoc,
  updateDoc,
  where,
  onSnapshot,
} from 'firebase/firestore';
import { getFirestoreDb } from '../../config/firebase';
import { FS } from '../../firebase/collections';
import type { AppNotification, ForumPost, ForumReply } from '../../types';
import { supportsCustomNativeModules } from '../../utils/nativeFeatures';

const PULL_LIMIT = 100;
const SEEN_NOTIFICATIONS_KEY = 'stemmlab_seen_notification_ids';
const MAX_SEEN_IDS = 500;

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

export function subscribeToNotifications(
  uid: string,
  onUpdate: (notifications: AppNotification[]) => void
): () => void {
  const db = getFirestoreDb();
  const q = query(
    collection(db, FS.notifications),
    where('recipientUid', '==', uid),
    limit(PULL_LIMIT)
  );
  
  return onSnapshot(q, (snap) => {
    const notifications = snap.docs
      .map((d) => mapNotificationDoc(d.id, d.data()))
      .sort((a, b) => b.timestamp - a.timestamp);
    onUpdate(notifications);
  });
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

  const db = getFirestoreDb();

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
      
      // 1. Write the notification doc to Firestore
      await writeNotification(notification);

      // 2. Fetch the recipient's push token and send remote push
      try {
        const userDoc = await getDoc(doc(db, FS.users, recipientUid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const pushToken = userData.expoPushToken;
          
          if (pushToken) {
            const title = type === 'forum_comment' 
              ? `Comment on "${post.topicTitle}"` 
              : `Reply on "${post.topicTitle}"`;
              
            await fetch('https://exp.host/--/api/v2/push/send', {
              method: 'POST',
              headers: {
                'Accept': 'application/json',
                'Accept-encoding': 'gzip, deflate',
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                to: pushToken,
                sound: 'default',
                title: title,
                body: `${reply.authorName}: ${preview}`,
                channelId: 'forum',
                data: { postId: post.id, notificationId: notification.id },
              }),
            });
          }
        }
      } catch (err) {
        console.warn('Failed to send remote push notification', err);
      }
    })
  );
}

let seenNotificationIds: Set<string> | null = null;

async function loadSeenNotificationIds(): Promise<Set<string>> {
  if (seenNotificationIds) return seenNotificationIds;
  try {
    const raw = await AsyncStorage.getItem(SEEN_NOTIFICATIONS_KEY);
    seenNotificationIds = new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    seenNotificationIds = new Set();
  }
  return seenNotificationIds;
}

async function saveSeenNotificationIds(seen: Set<string>): Promise<void> {
  const trimmed = [...seen].slice(-MAX_SEEN_IDS);
  seenNotificationIds = new Set(trimmed);
  await AsyncStorage.setItem(SEEN_NOTIFICATIONS_KEY, JSON.stringify(trimmed));
}

/** Marks existing notifications as already presented (e.g. on app open). */
export async function seedSeenNotifications(notifications: AppNotification[]): Promise<void> {
  const seen = await loadSeenNotificationIds();
  for (const n of notifications) {
    seen.add(n.id);
  }
  await saveSeenNotificationIds(seen);
}

export async function presentNewNotifications(notifications: AppNotification[]): Promise<void> {
  if (!supportsCustomNativeModules()) return;

  const seen = await loadSeenNotificationIds();
  const fresh = notifications.filter((n) => !n.read && !seen.has(n.id));
  if (fresh.length === 0) return;

  const Notifications = await import('expo-notifications');
  for (const n of fresh) {
    seen.add(n.id);
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
      channelId: 'forum',
    });
  }
  await saveSeenNotificationIds(seen);
}
