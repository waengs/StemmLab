import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { SafeAreaView, Edge } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { GradientBox } from '../ui/GradientBox';
import { Spacing } from '../../theme';

interface ScreenProps {
  children: React.ReactNode;
  edges?: Edge[];
  contentContainerStyle?: StyleProp<ViewStyle>;
  keyboardShouldPersistTaps?: 'always' | 'never' | 'handled';
}

export function Screen({
  children,
  edges = ['top'],
  contentContainerStyle,
  keyboardShouldPersistTaps,
}: ScreenProps) {
  const { colors } = useTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        safe: { flex: 1, backgroundColor: colors.background },
        scroll: { flex: 1 },
        content: {
          padding: Spacing.xl,
          paddingBottom: Spacing.xxxl,
        },
      }),
    [colors]
  );

  return (
    <SafeAreaView style={styles.safe} edges={edges}>
      <GradientBox
        colors={colors.gradientBackground}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, contentContainerStyle]}
        keyboardShouldPersistTaps={keyboardShouldPersistTaps}
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}
