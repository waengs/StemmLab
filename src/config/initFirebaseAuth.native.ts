import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeAuth, getAuth, type Auth } from '@firebase/auth';
import type { Persistence } from 'firebase/auth';
import type { FirebaseApp } from 'firebase/app';

/** Resolved via @firebase/auth react-native entry (not a deep subpath import). */
const { getReactNativePersistence } = require('@firebase/auth') as {
  getReactNativePersistence: (storage: typeof AsyncStorage) => Persistence;
};

export function initFirebaseAuth(app: FirebaseApp): Auth {
  try {
    return initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch {
    return getAuth(app);
  }
}
