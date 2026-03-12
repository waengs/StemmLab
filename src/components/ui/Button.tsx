import React, { useMemo } from 'react';
import { Pressable, Text, StyleSheet, ViewStyle, TextStyle, StyleProp, ActivityIndicator, Platform } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { BorderRadius, Spacing } from '../../theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'outlined' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  loading = false,
  icon,
  style,
  textStyle,
}: ButtonProps) {
  const { colors, typography } = useTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        base: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: Spacing.sm,
          borderRadius: BorderRadius.md,
        },
        fullWidth: { width: '100%' },
        disabled: { opacity: 0.5 },
        text: { ...typography.button },
        primary: { backgroundColor: colors.primary },
        outlined: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: colors.primary },
        danger: { backgroundColor: colors.danger },
        ghost: { backgroundColor: 'transparent' },
        textPrimary: { color: colors.white },
        textOutlined: { color: colors.primary },
        textDanger: { color: colors.white },
        textGhost: { color: colors.primary },
        sm: { paddingVertical: Spacing.sm, paddingHorizontal: Spacing.md },
        md: { paddingVertical: Spacing.md, paddingHorizontal: Spacing.lg },
        lg: { paddingVertical: Spacing.lg, paddingHorizontal: Spacing.xl },
        textSm: { fontSize: 13 },
        textMd: { fontSize: 15 },
        textLg: { fontSize: 16 },
      }),
    [colors, typography]
  );

  const variantStyle = styles[variant];
  const textVariantStyle =
    variant === 'primary'
      ? styles.textPrimary
      : variant === 'outlined'
        ? styles.textOutlined
        : variant === 'danger'
          ? styles.textDanger
          : styles.textGhost;
  const sizeStyle = styles[size];
  const textSizeStyle = styles[`text${size.charAt(0).toUpperCase()}${size.slice(1)}` as 'textSm' | 'textMd' | 'textLg'];

  return (
    <Pressable
      style={[styles.base, variantStyle, sizeStyle, fullWidth && styles.fullWidth, disabled && styles.disabled, style]}
      onPress={onPress}
      disabled={disabled || loading}
      android_ripple={Platform.OS === 'android' ? { color: 'transparent' } : undefined}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' || variant === 'danger' ? colors.white : colors.primary} />
      ) : (
        <>
          {icon}
          <Text style={[styles.text, textVariantStyle, textSizeStyle, textStyle]}>{title}</Text>
        </>
      )}
    </Pressable>
  );
}
