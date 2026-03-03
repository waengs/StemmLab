import React, { useMemo } from 'react';
import {
  View,
  TextInput as RNTextInput,
  Text,
  StyleSheet,
  ViewStyle,
  TextInputProps as RNTextInputProps,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { BorderRadius, Spacing } from '../../theme';

interface InputProps extends Omit<RNTextInputProps, 'style'> {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
}

export function Input({ label, error, containerStyle, ...props }: InputProps) {
  const { colors, typography } = useTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: { marginBottom: Spacing.md },
        label: { ...typography.label, marginBottom: Spacing.xs },
        input: {
          backgroundColor: colors.background,
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: BorderRadius.md,
          paddingHorizontal: Spacing.lg,
          paddingVertical: Spacing.md,
          fontSize: 15,
          color: colors.text,
        },
        inputError: { borderColor: colors.danger },
        multiline: { minHeight: 80, textAlignVertical: 'top' },
        error: { ...typography.caption, color: colors.danger, marginTop: Spacing.xs },
      }),
    [colors, typography]
  );

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <RNTextInput
        style={[styles.input, error && styles.inputError, props.multiline && styles.multiline]}
        placeholderTextColor={colors.textMuted}
        {...props}
      />
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}
