/**
 * src/__mocks__/firebase.js
 *
 * Universal no-op mock for all firebase/* and @firebase/* modules.
 *
 * Jest's moduleNameMapper routes every `firebase/*` and `@firebase/*` import
 * here so that the ESM `.mjs` postinstall files (which use `export` syntax
 * that Node/Jest can't parse without additional transform config) never reach
 * the test runner.
 *
 * Individual firebase sub-modules that tests actually exercise are mocked more
 * precisely in jest.setup.js (e.g. firebase/firestore). This file acts as the
 * safe fallback for anything not covered there.
 */

module.exports = {
  // ── firebase/app ──────────────────────────────────────────────────────────
  initializeApp: jest.fn(() => ({})),
  getApp: jest.fn(() => ({})),
  getApps: jest.fn(() => []),
  deleteApp: jest.fn(),

  // ── firebase/auth ─────────────────────────────────────────────────────────
  getAuth: jest.fn(() => ({
    currentUser: null,
    authStateReady: jest.fn(() => Promise.resolve()),
    onAuthStateChanged: jest.fn(() => jest.fn()),
  })),
  onAuthStateChanged: jest.fn(() => jest.fn()),
  signInWithEmailAndPassword: jest.fn(() => Promise.resolve({ user: null })),
  createUserWithEmailAndPassword: jest.fn(() => Promise.resolve({ user: null })),
  signOut: jest.fn(() => Promise.resolve()),
  updatePassword: jest.fn(() => Promise.resolve()),
  updateEmail: jest.fn(() => Promise.resolve()),
  sendPasswordResetEmail: jest.fn(() => Promise.resolve()),
  EmailAuthProvider: { credential: jest.fn() },
  reauthenticateWithCredential: jest.fn(() => Promise.resolve()),

  // ── firebase/firestore ────────────────────────────────────────────────────
  getFirestore: jest.fn(() => ({})),
  collection: jest.fn(),
  doc: jest.fn(),
  getDoc: jest.fn(() => Promise.resolve({ exists: () => false, data: () => undefined })),
  getDocs: jest.fn(() => Promise.resolve({ docs: [], forEach: jest.fn() })),
  setDoc: jest.fn(() => Promise.resolve()),
  updateDoc: jest.fn(() => Promise.resolve()),
  deleteDoc: jest.fn(() => Promise.resolve()),
  onSnapshot: jest.fn(() => jest.fn()),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  limit: jest.fn(),
  writeBatch: jest.fn(() => ({
    set: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    commit: jest.fn(() => Promise.resolve()),
  })),
  serverTimestamp: jest.fn(() => new Date()),
  Timestamp: {
    now: jest.fn(() => ({ seconds: 0, nanoseconds: 0 })),
    fromDate: jest.fn((d) => ({ seconds: Math.floor(d.getTime() / 1000), nanoseconds: 0 })),
  },

  // ── firebase/storage ──────────────────────────────────────────────────────
  getStorage: jest.fn(() => ({})),
  ref: jest.fn(),
  uploadBytesResumable: jest.fn(),
  getDownloadURL: jest.fn(() => Promise.resolve('https://example.com/file')),

  // ── firebase/messaging ────────────────────────────────────────────────────
  getMessaging: jest.fn(() => ({})),
  getToken: jest.fn(() => Promise.resolve('mock-fcm-token')),
  onMessage: jest.fn(() => jest.fn()),

  // ── Catch-all default export (for `import firebase from 'firebase/app'`) ──
  default: {},
};
