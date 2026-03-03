import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

interface AvatarProps {
  name: string;
  size?: number;
  backgroundColor?: string;
  textColor?: string;
  style?: ViewStyle;
}

export function Avatar({
  name,
  size = 48,
  backgroundColor,
  textColor,
  style,
}: AvatarProps) {
  const { colors } = useTheme();
  const bg = backgroundColor ?? colors.primary;
  const fg = textColor ?? colors.white;
  const initial = name.charAt(0).toUpperCase();

  return (
    <View
      style={[
        styles.container,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: bg },
        style,
      ]}
    >
      <Text style={[styles.text, { fontSize: size * 0.4, color: fg }]}>{initial}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center' },
  text: { fontWeight: '700' },
});
