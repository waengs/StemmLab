import React, { useState } from 'react';
import {
  Pressable,
  Image,
  type ImageSourcePropType,
  type ImageStyle,
  type ImageResizeMode,
  type StyleProp,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { ImageZoomModal } from './ImageZoomModal';

type Props = {
  source: ImageSourcePropType;
  style?: StyleProp<ImageStyle>;
  resizeMode?: ImageResizeMode;
  accessibilityLabel?: string;
};

export function ZoomableImage({
  source,
  style,
  resizeMode = 'cover',
  accessibilityLabel,
}: Props) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={
          accessibilityLabel ?? t('common.viewFullImage', { defaultValue: 'View full-size image' })
        }
      >
        <Image source={source} style={style} resizeMode={resizeMode} />
      </Pressable>
      <ImageZoomModal visible={open} source={source} onClose={() => setOpen(false)} />
    </>
  );
}
