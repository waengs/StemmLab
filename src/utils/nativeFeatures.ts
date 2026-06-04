import Constants, { ExecutionEnvironment } from 'expo-constants';
import { Platform } from 'react-native';

/** True when running inside the Expo Go store client (no custom native modules). */
export function isExpoGo(): boolean {
  return Constants.executionEnvironment === ExecutionEnvironment.StoreClient;
}

/** AdMob, push tokens, background fetch — require a dev/production build. */
export function supportsCustomNativeModules(): boolean {
  return Platform.OS !== 'web' && !isExpoGo();
}
