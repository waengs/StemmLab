/**
 * Firebase config from Expo public env vars.
 * Copy .env.example → .env and fill values from Firebase Console.
 */
export const firebaseEnv = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY ?? '',
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ?? '',
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ?? '',
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ?? '',
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? '',
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID ?? '',
};

export const cloudinaryEnv = {
  cloudName: process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME ?? '',
  uploadPreset: process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET ?? '',
  slowmoFolder: process.env.EXPO_PUBLIC_CLOUDINARY_SLOWMO_FOLDER ?? 'stemmlab/slow-mo',
  sensorLogsFolder:
    process.env.EXPO_PUBLIC_CLOUDINARY_SENSOR_LOGS_FOLDER ??
    process.env.EXPO_PUBLIC_CLOUDINARY_SLOWMO_FOLDER ??
    'stemmlab/sensor-logs',
  forumFolder: process.env.EXPO_PUBLIC_CLOUDINARY_FORUM_FOLDER ?? 'stemmlab/forum',
};

export function isFirebaseConfigured(): boolean {
  return Boolean(
    firebaseEnv.apiKey &&
      firebaseEnv.authDomain &&
      firebaseEnv.projectId &&
      firebaseEnv.appId
  );
}

/** Ensures Firebase is configured before auth or Firestore calls. */
export function assertFirebaseConfigured(): void {
  if (!isFirebaseConfigured()) {
    throw new Error(
      'Firebase is not configured. Copy .env.example to .env and add your Firebase web app keys, then restart Expo (npx expo start -c).'
    );
  }
}
