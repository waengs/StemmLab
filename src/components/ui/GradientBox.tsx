import React from 'react';
import { type StyleProp, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

type Point = { x: number; y: number };

type Props = {
  colors: readonly string[];
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
  start?: Point;
  end?: Point;
};

export function GradientBox({
  colors: gradientColors,
  style,
  children,
  start = { x: 0, y: 0 },
  end = { x: 1, y: 1 },
}: Props) {
  return (
    <LinearGradient
      colors={gradientColors as [string, string, ...string[]]}
      style={style}
      start={start}
      end={end}
    >
      {children}
    </LinearGradient>
  );
}
