import React, { useMemo } from 'react';
import { type ImageStyle, type StyleProp } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ZoomableImage } from '../ui/ZoomableImage';
import { BorderRadius, Spacing } from '../../theme';
import {
  getActivityIllustrationSource,
  type ActivityIllustrationId,
} from '../../utils/activityIllustrations';

type Props = {
  activityId: ActivityIllustrationId;
  style?: StyleProp<ImageStyle>;
};

export function ActivityIllustration({ activityId, style }: Props) {
  const { i18n } = useTranslation();

  const source = useMemo(
    () => getActivityIllustrationSource(activityId, i18n.language),
    [activityId, i18n.language]
  );

  return (
    <ZoomableImage
      source={source}
      style={
        style ?? {
          width: '100%',
          height: 200,
          marginTop: Spacing.md,
          borderRadius: BorderRadius.md,
        }
      }
      resizeMode="contain"
    />
  );
}
