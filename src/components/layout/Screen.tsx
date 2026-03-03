import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { SafeAreaView, Edge } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
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
