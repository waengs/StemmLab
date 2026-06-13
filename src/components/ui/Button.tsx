import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Pressable, Text, StyleSheet, ViewStyle, TextStyle, StyleProp, ActivityIndicator, Platform } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { GradientBox } from './GradientBox';
import { BorderRadius, Spacing } from '../../theme';

interface ButtonProps {
  title: string;
  onPress: () => void | Promise<void>;
  variant?: 'primary' | 'outlined' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  testID?: string;
  accessibilityLabel?: string;
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
  iconRight,
  style,
  textStyle,
  testID,
  accessibilityLabel,
}: ButtonProps) {
  const { colors, typography, isDark } = useTheme();
  const pendingRef = useRef(false);
  const [internalLoading, setInternalLoading] = useState(false);
  const isBusy = loading || internalLoading;

  const handlePress = useCallback(async () => {
    if (disabled || isBusy || pendingRef.current) return;

    pendingRef.current = true;
    try {
      const result = onPress();
      if (result instanceof Promise) {
        setInternalLoading(true);
        await result;
      }
    } finally {
      pendingRef.current = false;
      setInternalLoading(false);
    }
  }, [disabled, isBusy, onPress]);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        base: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: Spacing.sm,
          borderRadius: BorderRadius.md,
          overflow: 'hidden',
          flexShrink: 1,
        },
        fullWidth: { width: '100%' },
        disabled: { opacity: 0.5 },
        text: { ...typography.button },
        primary: { backgroundColor: colors.primary },
        outlined: {
          backgroundColor: isDark ? colors.primary + '18' : colors.primary + '10',
          borderWidth: 1.5,
          borderColor: colors.primary,
        },
        danger: { backgroundColor: colors.danger },
        ghost: {
          backgroundColor: isDark ? colors.primary + '14' : 'transparent',
          borderWidth: isDark ? 1 : 0,
          borderColor: isDark ? colors.primaryLight + '66' : 'transparent',
        },
        textPrimary: { color: colors.white },
        textOutlined: { color: isDark ? colors.primaryLight : colors.primary },
        textDanger: { color: colors.white },
        textGhost: { color: isDark ? colors.primaryLight : colors.primary },
        sm: { paddingVertical: Spacing.sm, paddingHorizontal: Spacing.md },
        md: { paddingVertical: Spacing.md, paddingHorizontal: Spacing.lg },
        lg: { paddingVertical: Spacing.lg, paddingHorizontal: Spacing.xl },
        textSm: { fontSize: 13 },
        textMd: { fontSize: 15 },
        textLg: { fontSize: 16 },
      }),
    [colors, isDark, typography]
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

  const content = isBusy ? (
      <ActivityIndicator
        color={
          variant === 'primary' || variant === 'danger'
            ? colors.white
            : isDark
              ? colors.primaryLight
              : colors.primary
        }
      />
  ) : (
    <>
      {icon}
      <Text 
        style={[styles.text, textVariantStyle, textSizeStyle, textStyle]}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.7}
      >
        {title}
      </Text>
      {iconRight}
    </>
  );

  const pressableStyle = [
    styles.base,
    variant !== 'primary' || isDark ? variantStyle : undefined,
    sizeStyle,
    fullWidth && styles.fullWidth,
    (disabled || isBusy) && styles.disabled,
    style,
  ];

  if (variant === 'primary' && !disabled) {
    return (
      <Pressable
        testID={testID}
        accessibilityLabel={accessibilityLabel}
        accessibilityRole="button"
        onPress={handlePress}
        disabled={disabled || isBusy}
        android_ripple={Platform.OS === 'android' ? { color: 'transparent' } : undefined}
        style={({ pressed }) => [
          fullWidth && styles.fullWidth,
          (disabled || isBusy) && styles.disabled,
          pressed && !isBusy && { opacity: 0.9 },
          style,
        ]}
      >
        <GradientBox colors={colors.gradientPrimary} style={[styles.base, sizeStyle, fullWidth && styles.fullWidth]}>
          {content}
        </GradientBox>
      </Pressable>
    );
  }

  return (
    <Pressable
      testID={testID}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      style={pressableStyle}
      onPress={handlePress}
      disabled={disabled || isBusy}
      android_ripple={Platform.OS === 'android' ? { color: 'transparent' } : undefined}
    >
      {content}
    </Pressable>
  );
}
