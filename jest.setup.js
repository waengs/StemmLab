// jest.setup.js
// Phase 1 + Phase 2 mocks: stubbing React Native libraries that cannot run in
// the Node.js Jest environment. Each mock is as minimal as possible.

// ─── AsyncStorage ────────────────────────────────────────────────────────────
// The theme store (Zustand) and i18n language detector both call AsyncStorage.
// We replace it with a simple in-memory implementation so tests stay isolated.
jest.mock('@react-native-async-storage/async-storage', () => {
  const store = {};
  return {
    __esModule: true,
    default: {
      getItem: jest.fn(async (key) => store[key] ?? null),
      setItem: jest.fn(async (key, value) => { store[key] = value; }),
      removeItem: jest.fn(async (key) => { delete store[key]; }),
      clear: jest.fn(async () => { Object.keys(store).forEach((k) => delete store[k]); }),
      getAllKeys: jest.fn(async () => Object.keys(store)),
      multiGet: jest.fn(async (keys) => keys.map((k) => [k, store[k] ?? null])),
      multiSet: jest.fn(async (pairs) => pairs.forEach(([k, v]) => { store[k] = v; })),
    },
  };
});

// ─── expo-sqlite ─────────────────────────────────────────────────────────────
jest.mock('expo-sqlite', () => ({
  openDatabaseSync: jest.fn(() => ({
    execSync: jest.fn(),
    runSync: jest.fn(),
    getFirstSync: jest.fn(),
    getAllSync: jest.fn(),
    prepareSync: jest.fn(() => ({ executeSync: jest.fn() })),
  })),
}));

// ─── firebase/firestore ───────────────────────────────────────────────────────
jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(),
  collection: jest.fn(),
  doc: jest.fn(),
  getDoc: jest.fn(),
  getDocs: jest.fn(),
  setDoc: jest.fn(),
  updateDoc: jest.fn(),
  onSnapshot: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  limit: jest.fn(),
  writeBatch: jest.fn(() => ({
    set: jest.fn(),
    update: jest.fn(),
    commit: jest.fn(),
  })),
}));

// ─── expo-constants ──────────────────────────────────────────────────────────
// Used by nativeFeatures.ts to detect Expo Go vs. custom build.
// We mock it so each test can control the execution environment.
jest.mock('expo-constants', () => ({
  __esModule: true,
  ExecutionEnvironment: {
    StoreClient: 'storeClient',
    Standalone: 'standalone',
    Bare: 'bare',
  },
  default: {
    executionEnvironment: 'standalone', // default: NOT Expo Go
  },
}));

// ─── expo-linear-gradient ────────────────────────────────────────────────────
// Used by GradientBox inside Button. Render it as a plain View in tests.
jest.mock('expo-linear-gradient', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    __esModule: true,
    LinearGradient: ({ children, ...props }) =>
      React.createElement(View, props, children),
  };
});

// ─── react-native-google-mobile-ads ──────────────────────────────────────────
// showInterstitialAd.ts uses this package; resolve immediately in tests.
jest.mock('react-native-google-mobile-ads', () => ({
  __esModule: true,
  default: jest.fn(() => ({ initialize: jest.fn(() => Promise.resolve()) })),
  InterstitialAd: {
    createForAdRequest: jest.fn(() => ({
      addAdEventListener: jest.fn(() => jest.fn()),
      load: jest.fn(),
      show: jest.fn(() => Promise.resolve()),
    })),
  },
  AdEventType: { LOADED: 'loaded', CLOSED: 'closed', ERROR: 'error' },
  TestIds: { INTERSTITIAL: 'ca-app-pub-3940256099942544/1033173712' },
}));

// ─── expo-localization ───────────────────────────────────────────────────────
// i18n/index.ts calls Localization.getLocales() on init.
jest.mock('expo-localization', () => ({
  __esModule: true,
  getLocales: jest.fn(() => [{ languageCode: 'en' }]),
}));

// ─── react-i18next ───────────────────────────────────────────────────────────
// Return the translation key as the value for deterministic test assertions.
jest.mock('react-i18next', () => ({
  __esModule: true,
  useTranslation: () => ({
    t: (key) => key,
    i18n: { language: 'en', changeLanguage: jest.fn() },
  }),
  initReactI18next: { type: '3rdParty', init: jest.fn() },
  Trans: ({ children }) => children,
}));

// ─── Global silence ──────────────────────────────────────────────────────────
// Suppress expected console.log/warn noise from library init paths.
global.console = {
  ...console,
  log: jest.fn(),
  warn: jest.fn(),
};

// ─── Alert ───────────────────────────────────────────────────────────────────
// Spy on Alert.alert so component tests can assert it was called without
// triggering any native dialog. jest-expo already sets up the react-native
// mock environment, so we patch after-the-fact.
const { Alert } = require('react-native');
if (Alert) {
  jest.spyOn(Alert, 'alert').mockImplementation(jest.fn());
}
