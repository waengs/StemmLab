import { admobEnv, isAdMobConfigured } from '../../config/env';
import { supportsCustomNativeModules } from '../../utils/nativeFeatures';

let mobileAdsInit: Promise<void> | null = null;
let loading = false;

function ensureMobileAdsInit(): Promise<void> {
  if (!mobileAdsInit) {
    mobileAdsInit = import('react-native-google-mobile-ads')
      .then((m) => m.default().initialize())
      .then(() => undefined)
      .catch(() => undefined);
  }
  return mobileAdsInit;
}

/**
 * Full-screen interstitial after completing an activity (custom APK only).
 * Resolves when the ad is dismissed or if ads are unavailable.
 */
export function showInterstitialAd(): Promise<void> {
  if (!supportsCustomNativeModules() || loading) {
    return Promise.resolve();
  }

  loading = true;

  return new Promise((resolve) => {
    const finish = () => {
      loading = false;
      resolve();
    };

    void (async () => {
      let settled = false;
      const cleanup = () => {
        if (settled) return;
        settled = true;
        finish();
      };

      const loadTimeout = setTimeout(cleanup, 12_000);

      try {
        await ensureMobileAdsInit();
        const { InterstitialAd, AdEventType, TestIds } = await import(
          'react-native-google-mobile-ads'
        );
        const unitId = isAdMobConfigured()
          ? admobEnv.interstitialUnitId
          : TestIds.INTERSTITIAL;

        const ad = InterstitialAd.createForAdRequest(unitId);
        const unsubs: (() => void)[] = [];

        const teardown = () => {
          clearTimeout(loadTimeout);
          unsubs.forEach((u) => u());
          cleanup();
        };

        unsubs.push(
          ad.addAdEventListener(AdEventType.LOADED, () => {
            void ad.show();
          })
        );
        unsubs.push(ad.addAdEventListener(AdEventType.CLOSED, teardown));
        unsubs.push(ad.addAdEventListener(AdEventType.ERROR, teardown));

        ad.load();
      } catch {
        clearTimeout(loadTimeout);
        cleanup();
      }
    })();
  });
}
