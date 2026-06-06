import React, { useMemo, useState } from 'react';
import {
  View,
  TextInput as RNTextInput,
  Text,
  StyleSheet,
  ViewStyle,
  TextInputProps as RNTextInputProps,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { BorderRadius, Spacing, createTypography, lightColors, type ThemeColors } from '../../theme';

interface InputProps extends Omit<RNTextInputProps, 'style'> {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
  /** Use light-theme field colors only when the app is in light mode (e.g. fields on pale cards). */
  onLightSurface?: boolean;
}

function resolveFieldColors(
  colors: ThemeColors,
  isDark: boolean,
  onLightSurface?: boolean
): ThemeColors {
  if (onLightSurface && !isDark) {
    return lightColors;
  }
  if (isDark) {
    return {
      ...colors,
      background: colors.surfaceElevated,
      border: colors.border,
    };
  }
  return colors;
}

export function Input({
  label,
  error,
  containerStyle,
  onLightSurface,
  secureTextEntry,
  ...props
}: InputProps) {
  const { colors, typography, isDark } = useTheme();
  const fieldColors = resolveFieldColors(colors, isDark, onLightSurface);
  const fieldTypography =
    onLightSurface && !isDark ? createTypography(lightColors) : typography;
  const [passwordVisible, setPasswordVisible] = useState(false);
  const isPasswordField = Boolean(secureTextEntry);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: { marginBottom: Spacing.md },
        label: { ...fieldTypography.label, marginBottom: Spacing.xs },
        inputRow: {
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: fieldColors.background,
          borderWidth: 1,
          borderColor: fieldColors.border,
          borderRadius: BorderRadius.md,
        },
        inputRowError: { borderColor: fieldColors.danger },
        input: {
          flex: 1,
          paddingHorizontal: Spacing.lg,
          paddingVertical: Spacing.md,
          fontSize: 15,
          color: fieldColors.text,
        },
        inputWithToggle: { paddingRight: Spacing.sm },
        toggleBtn: {
          paddingHorizontal: Spacing.md,
          paddingVertical: Spacing.md,
          justifyContent: 'center',
          alignItems: 'center',
        },
        multiline: { minHeight: 80, textAlignVertical: 'top' },
        error: { ...fieldTypography.caption, color: fieldColors.danger, marginTop: Spacing.xs },
      }),
    [fieldColors, fieldTypography]
  );

  const inputElement = (
    <RNTextInput
      style={[
        styles.input,
        isPasswordField && styles.inputWithToggle,
        props.multiline && styles.multiline,
      ]}
      placeholderTextColor={fieldColors.textMuted}
      secureTextEntry={isPasswordField && !passwordVisible}
      {...props}
    />
  );

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      {isPasswordField ? (
        <View style={[styles.inputRow, error && styles.inputRowError]}>
          {inputElement}
          <Pressable
            style={styles.toggleBtn}
            onPress={() => setPasswordVisible((v) => !v)}
            accessibilityRole="button"
            accessibilityLabel={passwordVisible ? 'Hide password' : 'Show password'}
            hitSlop={8}
          >
            <Ionicons
              name={passwordVisible ? 'eye-off-outline' : 'eye-outline'}
              size={22}
              color={fieldColors.textMuted}
            />
          </Pressable>
        </View>
      ) : (
        <View style={[styles.inputRow, error && styles.inputRowError]}>
          {inputElement}
        </View>
      )}
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}
