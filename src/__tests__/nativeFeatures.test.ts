/**
 * nativeFeatures.test.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Unit Tests — Phase 2: Native Features
 *
 * Tests the isolated utility functions `isExpoGo()` and
 * `supportsCustomNativeModules()` to ensure device-capability checks are
 * accurate under every combination of execution environment and platform.
 *
 * Strategy: expo-constants and react-native/Platform are mocked at the module
 * level. Each `describe` block that needs a different environment uses
 * `jest.resetModules()` + `jest.doMock()` + `require()` to re-import the
 * module under test with a fresh module registry.
 * ─────────────────────────────────────────────────────────────────────────────
 */

describe('nativeFeatures — isExpoGo()', () => {
  afterEach(() => {
    jest.resetModules();
  });

  it('returns true when executionEnvironment is StoreClient (Expo Go)', () => {
    // Arrange: override the global mock so Constants looks like Expo Go
    jest.doMock('expo-constants', () => ({
      __esModule: true,
      ExecutionEnvironment: {
        StoreClient: 'storeClient',
        Standalone: 'standalone',
        Bare: 'bare',
      },
      default: { executionEnvironment: 'storeClient' },
    }));

    // Re-require the module so it picks up the new mock
    const { isExpoGo } = require('../utils/nativeFeatures');

    // Assert
    expect(isExpoGo()).toBe(true);
  });

  it('returns false when executionEnvironment is Standalone (production APK)', () => {
    jest.doMock('expo-constants', () => ({
      __esModule: true,
      ExecutionEnvironment: {
        StoreClient: 'storeClient',
        Standalone: 'standalone',
        Bare: 'bare',
      },
      default: { executionEnvironment: 'standalone' },
    }));

    const { isExpoGo } = require('../utils/nativeFeatures');

    expect(isExpoGo()).toBe(false);
  });

  it('returns false when executionEnvironment is Bare (dev build)', () => {
    jest.doMock('expo-constants', () => ({
      __esModule: true,
      ExecutionEnvironment: {
        StoreClient: 'storeClient',
        Standalone: 'standalone',
        Bare: 'bare',
      },
      default: { executionEnvironment: 'bare' },
    }));

    const { isExpoGo } = require('../utils/nativeFeatures');

    expect(isExpoGo()).toBe(false);
  });
});

describe('nativeFeatures — supportsCustomNativeModules()', () => {
  afterEach(() => {
    jest.resetModules();
  });

  it('returns true on Android with a Standalone build (full APK)', () => {
    jest.doMock('expo-constants', () => ({
      __esModule: true,
      ExecutionEnvironment: { StoreClient: 'storeClient', Standalone: 'standalone', Bare: 'bare' },
      default: { executionEnvironment: 'standalone' },
    }));
    jest.doMock('react-native', () => ({
      Platform: { OS: 'android' },
    }));

    const { supportsCustomNativeModules } = require('../utils/nativeFeatures');

    expect(supportsCustomNativeModules()).toBe(true);
  });

  it('returns true on iOS with a Standalone build', () => {
    jest.doMock('expo-constants', () => ({
      __esModule: true,
      ExecutionEnvironment: { StoreClient: 'storeClient', Standalone: 'standalone', Bare: 'bare' },
      default: { executionEnvironment: 'standalone' },
    }));
    jest.doMock('react-native', () => ({
      Platform: { OS: 'ios' },
    }));

    const { supportsCustomNativeModules } = require('../utils/nativeFeatures');

    expect(supportsCustomNativeModules()).toBe(true);
  });

  it('returns false when running inside Expo Go on Android', () => {
    jest.doMock('expo-constants', () => ({
      __esModule: true,
      ExecutionEnvironment: { StoreClient: 'storeClient', Standalone: 'standalone', Bare: 'bare' },
      default: { executionEnvironment: 'storeClient' },
    }));
    jest.doMock('react-native', () => ({
      Platform: { OS: 'android' },
    }));

    const { supportsCustomNativeModules } = require('../utils/nativeFeatures');

    expect(supportsCustomNativeModules()).toBe(false);
  });

  it('returns false when running on the web platform (no native modules)', () => {
    jest.doMock('expo-constants', () => ({
      __esModule: true,
      ExecutionEnvironment: { StoreClient: 'storeClient', Standalone: 'standalone', Bare: 'bare' },
      default: { executionEnvironment: 'standalone' },
    }));
    jest.doMock('react-native', () => ({
      Platform: { OS: 'web' },
    }));

    const { supportsCustomNativeModules } = require('../utils/nativeFeatures');

    // Even if it's a "standalone" environment, web never has custom native modules
    expect(supportsCustomNativeModules()).toBe(false);
  });

  it('returns false when in Expo Go on web (doubly unsupported)', () => {
    jest.doMock('expo-constants', () => ({
      __esModule: true,
      ExecutionEnvironment: { StoreClient: 'storeClient', Standalone: 'standalone', Bare: 'bare' },
      default: { executionEnvironment: 'storeClient' },
    }));
    jest.doMock('react-native', () => ({
      Platform: { OS: 'web' },
    }));

    const { supportsCustomNativeModules } = require('../utils/nativeFeatures');

    expect(supportsCustomNativeModules()).toBe(false);
  });
});
