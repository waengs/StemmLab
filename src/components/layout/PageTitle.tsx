import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { Typography, Spacing } from '../../theme';

interface PageTitleProps {
  children: string;
}

export function PageTitle({ children }: PageTitleProps) {
  return <Text style={styles.title}>{children}</Text>;
}

const styles = StyleSheet.create({
  title: {
    ...Typography.h1,
    marginBottom: Spacing.xxl,
  },
});
