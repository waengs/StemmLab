import type { ImageSourcePropType } from 'react-native';

export type ActivityIllustrationId =
  | 'parachute-drop'
  | 'sound-pollution'
  | 'hand-fan'
  | 'earthquake'
  | 'human-performance'
  | 'reaction-board'
  | 'breathing-pace';

const ACTIVITY_ILLUSTRATION_NUM: Record<ActivityIllustrationId, 1 | 2 | 3 | 4 | 5 | 6 | 7> = {
  'parachute-drop': 1,
  'sound-pollution': 2,
  'hand-fan': 3,
  earthquake: 4,
  'human-performance': 5,
  'reaction-board': 6,
  'breathing-pace': 7,
};

const EN_ILLUSTRATIONS: Record<1 | 2 | 3 | 4 | 5 | 6 | 7, ImageSourcePropType> = {
  1: require('../../assets/images/activity1illustration.jpeg'),
  2: require('../../assets/images/activity2illustration.jpeg'),
  3: require('../../assets/images/activity3illustration.jpeg'),
  4: require('../../assets/images/activity4illustration.jpeg'),
  5: require('../../assets/images/activity5illustration.jpeg'),
  6: require('../../assets/images/activity6illustration.jpeg'),
  7: require('../../assets/images/activity7illustration.jpeg'),
};

const ID_ILLUSTRATIONS: Record<1 | 2 | 3 | 4 | 5 | 6 | 7, ImageSourcePropType> = {
  1: require('../../assets/images/idn1.png'),
  2: require('../../assets/images/idn2.png'),
  3: require('../../assets/images/idn3.png'),
  4: require('../../assets/images/idn4.png'),
  5: require('../../assets/images/idn5.png'),
  6: require('../../assets/images/idn6.png'),
  7: require('../../assets/images/idn7.png'),
};

export function isIndonesianLanguage(language: string): boolean {
  return language === 'id' || language.startsWith('id-');
}

export function getActivityIllustrationSource(
  activityId: ActivityIllustrationId,
  language: string
): ImageSourcePropType {
  const num = ACTIVITY_ILLUSTRATION_NUM[activityId];
  return isIndonesianLanguage(language) ? ID_ILLUSTRATIONS[num] : EN_ILLUSTRATIONS[num];
}
