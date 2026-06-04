import NetInfo, { type NetInfoState } from '@react-native-community/netinfo';

function isOnlineState(state: NetInfoState): boolean {
  if (state.isConnected === false) return false;
  if (state.isInternetReachable === false) return false;
  return true;
}

/** Resolves when the device has network connectivity (or immediately if already online). */
export async function waitForOnline(timeoutMs = 120_000): Promise<boolean> {
  const current = await NetInfo.fetch();
  if (isOnlineState(current)) return true;

  return new Promise((resolve) => {
    let settled = false;
    const finish = (ok: boolean) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      unsubscribe();
      resolve(ok);
    };

    const timer = setTimeout(() => finish(false), timeoutMs);
    const unsubscribe = NetInfo.addEventListener((state) => {
      if (isOnlineState(state)) finish(true);
    });
  });
}

export async function isDeviceOnline(): Promise<boolean> {
  const state = await NetInfo.fetch();
  return isOnlineState(state);
}
