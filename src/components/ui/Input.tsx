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
import { BorderRadius, Spacing, createTypography, lightColors } from '../../theme';

interface InputProps extends Omit<RNTextInputProps, 'style'> {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
  /** Force dark text on a white/light card (e.g. setup screen) when app theme is dark */
  onLightSurface?: boolean;
}

export function Input({
  label,
  error,
  containerStyle,
  onLightSurface,
  secureTextEntry,
  ...props
}: InputProps) {
  const { colors, typography } = useTheme();
  const surfaceColors = onLightSurface ? lightColors : colors;
  const surfaceTypography = onLightSurface ? createTypography(lightColors) : typography;
  const [passwordVisible, setPasswordVisible] = useState(false);
  const isPasswordField = Boolean(secureTextEntry);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: { marginBottom: Spacing.md },
        label: { ...surfaceTypography.label, marginBottom: Spacing.xs },
        inputRow: {
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: surfaceColors.background,
          borderWidth: 1,
          borderColor: surfaceColors.border,
          borderRadius: BorderRadius.md,
        },
        inputRowError: { borderColor: surfaceColors.danger },
        input: {
          flex: 1,
          paddingHorizontal: Spacing.lg,
          paddingVertical: Spacing.md,
          fontSize: 15,
          color: surfaceColors.text,
        },
        inputWithToggle: { paddingRight: Spacing.sm },
        toggleBtn: {
          paddingHorizontal: Spacing.md,
          paddingVertical: Spacing.md,
          justifyContent: 'center',
          alignItems: 'center',
        },
        multiline: { minHeight: 80, textAlignVertical: 'top' },
        error: { ...surfaceTypography.caption, color: surfaceColors.danger, marginTop: Spacing.xs },
      }),
    [surfaceColors, surfaceTypography]
  );

  const inputElement = (
    <RNTextInput
      style={[
        styles.input,
        isPasswordField && styles.inputWithToggle,
        props.multiline && styles.multiline,
      ]}
      placeholderTextColor={surfaceColors.textMuted}
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
              color={surfaceColors.textMuted}
            />
          </Pressable>
        </View>
      ) : (
        <View style={[styles.inputRow, error && styles.inputRowError]}>
          <RNTextInput
            style={[styles.input, props.multiline && styles.multiline]}
            placeholderTextColor={surfaceColors.textMuted}
            {...props}
          />
        </View>
      )}
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}
