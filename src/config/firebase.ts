import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import type { Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { firebaseEnv, assertFirebaseConfigured } from './env';
import { initFirebaseAuth } from './initFirebaseAuth';

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

export function getFirebaseApp(): FirebaseApp {
  assertFirebaseConfigured();
  if (!app) {
    app = getApps().length > 0 ? getApps()[0]! : initializeApp(firebaseEnv);
  }
  return app;
}

export function getFirebaseAuth(): Auth {
  if (!auth) {
    auth = initFirebaseAuth(getFirebaseApp());
  }
  return auth;
}

export function getFirestoreDb(): Firestore {
  if (!db) {
    db = getFirestore(getFirebaseApp());
  }
  return db;
}
