/** @type {import('expo/config').ExpoConfig} */
const base = require('./app.json');

const androidAppId =
  process.env.EXPO_PUBLIC_ADMOB_ANDROID_APP_ID || 'ca-app-pub-3940256099942544~3347511713';
const iosAppId =
  process.env.EXPO_PUBLIC_ADMOB_IOS_APP_ID || 'ca-app-pub-3940256099942544~1458002511';

module.exports = {
  expo: {
    ...base.expo,
    extra: {
      ...(base.expo.extra ?? {}),
      eas: {
        projectId: '5a660196-e9a2-44d9-9761-1b78794f910a',
      },
    },
    plugins: [
      ...(base.expo.plugins ?? []),
      [
        'react-native-google-mobile-ads',
        {
          androidAppId,
          iosAppId,
        },
      ],
      [
        'expo-notifications',
        {
          icon: './assets/notification-icon.png',
          color: '#2563EB',
        },
      ],
    ],
    android: {
      ...base.expo.android,
      permissions: [...(base.expo.android?.permissions ?? []), 'RECEIVE_BOOT_COMPLETED'],
    },
    ios: {
      ...base.expo.ios,
      infoPlist: {
        ...(base.expo.ios?.infoPlist ?? {}),
        UIBackgroundModes: ['fetch'],
      },
    },
  },
};
