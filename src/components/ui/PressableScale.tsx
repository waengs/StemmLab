import React, { useRef } from 'react';
import {
  Pressable,
  Animated,
  StyleSheet,
  StyleProp,
  ViewStyle,
  Platform,
} from 'react-native';

interface PressableScaleProps {
  children: React.ReactNode;
  onPress: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

/**
 * Subtle spring scale on press — no opacity flash, no Android ripple border.
 */
export function PressableScale({ children, onPress, disabled, style }: PressableScaleProps) {
  const scale = useRef(new Animated.Value(1)).current;

  const animate = (toValue: number) => {
    Animated.spring(scale, {
      toValue,
      useNativeDriver: true,
      speed: 28,
      bounciness: 0,
    }).start();
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      onPressIn={() => animate(0.98)}
      onPressOut={() => animate(1)}
      accessibilityRole="button"
      style={[style, Platform.OS === 'web' && ({ outlineWidth: 0 } as ViewStyle)]}
    >
      <Animated.View style={[styles.inner, { transform: [{ scale }] }]}>{children}</Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  inner: {
    flex: 1,
  },
});
