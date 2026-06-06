import React, { useMemo } from 'react';
import {
  Modal,
  View,
  Pressable,
  Image,
  ScrollView,
  StyleSheet,
  Platform,
  useWindowDimensions,
  type ImageSourcePropType,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Spacing } from '../../theme';

type Props = {
  visible: boolean;
  source: ImageSourcePropType;
  onClose: () => void;
};

export function ImageZoomModal({ visible, source, onClose }: Props) {
  const { t } = useTranslation();
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const imageSize = useMemo(
    () => ({
      width: width - 32,
      height: height - insets.top - insets.bottom - 96,
    }),
    [height, insets.bottom, insets.top, width]
  );

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Pressable
          style={[styles.closeBtn, { top: insets.top + Spacing.sm }]}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel={t('common.close', { defaultValue: 'Close' })}
        >
          <Ionicons name="close" size={28} color="#fff" />
        </Pressable>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          maximumZoomScale={Platform.OS === 'ios' ? 4 : 1}
          minimumZoomScale={1}
          centerContent
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
        >
          <Image source={source} style={imageSize} resizeMode="contain" accessibilityIgnoresInvertColors />
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.92)',
  },
  closeBtn: {
    position: 'absolute',
    right: 16,
    zIndex: 2,
    padding: 8,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 64,
  },
});
