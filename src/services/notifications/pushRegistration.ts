import { Platform } from 'react-native';
import { doc, setDoc } from 'firebase/firestore';
import { getFirestoreDb } from '../../config/firebase';
import { FS } from '../../firebase/collections';
import { supportsCustomNativeModules } from '../../utils/nativeFeatures';
import Constants from 'expo-constants';

async function ensureNotificationHandler(
  Notifications: typeof import('expo-notifications')
): Promise<void> {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

export async function registerForPushNotifications(uid: string): Promise<string | null> {
  if (!supportsCustomNativeModules()) return null;

  const Notifications = await import('expo-notifications');
  await ensureNotificationHandler(Notifications);

  const { status: existing } = await Notifications.getPermissionsAsync();
  let finalStatus = existing;
  if (existing !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== 'granted') return null;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('forum', {
      name: 'Forum replies',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  let token: string | null = null;
  try {
    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: Constants.expoConfig?.extra?.eas?.projectId,
    });
    token = tokenData.data;
  } catch (err) {
    console.warn('[Push] Could not get push token:', err);
    return null;
  }

  const db = getFirestoreDb();
  await setDoc(
    doc(db, FS.users, uid),
    { expoPushToken: token, pushTokenUpdatedAt: Date.now() },
    { merge: true }
  );

  return token;
}
