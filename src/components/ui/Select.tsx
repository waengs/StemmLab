import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  Pressable,
  Modal,
  FlatList,
  StyleSheet,
  ViewStyle,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { BorderRadius, Spacing, Shadows, createTypography, lightColors, type ThemeColors } from '../../theme';
import { useTranslation } from 'react-i18next';

interface SelectProps {
  label?: string;
  value: string;
  options: string[];
  /** Optional map from stored value to display label (e.g. i18n). */
  optionLabels?: Record<string, string>;
  onValueChange: (value: string) => void;
  placeholder?: string;
  containerStyle?: ViewStyle;
  onLightSurface?: boolean;
  disabled?: boolean;
  /** Called when the picker modal opens */
  onOpen?: () => void;
  /** Called when the picker modal closes */
  onClose?: () => void;
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

export function Select({
  label,
  value,
  options,
  optionLabels,
  onValueChange,
  placeholder = 'Select...',
  containerStyle,
  onLightSurface,
  disabled,
  onOpen,
  onClose,
}: SelectProps) {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);
  const { colors, typography, isDark } = useTheme();
  const fieldColors = resolveFieldColors(colors, isDark, onLightSurface);
  const fieldTypography =
    onLightSurface && !isDark ? createTypography(lightColors) : typography;

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: { marginBottom: Spacing.md },
        label: { ...fieldTypography.label, marginBottom: Spacing.xs },
        trigger: {
          backgroundColor: fieldColors.background,
          borderWidth: 1,
          borderColor: fieldColors.border,
          borderRadius: BorderRadius.md,
          paddingHorizontal: Spacing.lg,
          paddingVertical: Spacing.md,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        },
        triggerText: { fontSize: 15, color: fieldColors.text },
        placeholder: { color: fieldColors.textMuted },
        overlay: {
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.4)',
          justifyContent: 'center',
          padding: Spacing.xxl,
        },
        dropdown: {
          backgroundColor: colors.surface,
          borderRadius: BorderRadius.lg,
          maxHeight: 400,
          ...Shadows.lg,
        },
        dropdownTitle: {
          ...typography.h3,
          padding: Spacing.lg,
          borderBottomWidth: 1,
          borderBottomColor: colors.borderLight,
        },
        option: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: Spacing.lg,
          paddingVertical: Spacing.md,
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: colors.borderLight,
        },
        optionSelected: {
          backgroundColor: isDark ? colors.surfaceElevated : colors.background,
        },
        optionText: { ...typography.body, color: colors.text },
        optionTextSelected: { color: colors.primary, fontWeight: '600' },
      }),
    [colors, fieldColors, fieldTypography, isDark, typography]
  );

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <Pressable
        style={[styles.trigger, disabled && { opacity: 0.5 }]}
        onPress={() => {
          if (disabled) return;
          setVisible(true);
          onOpen?.();
        }}
        disabled={disabled}
        android_ripple={Platform.OS === 'android' ? { color: 'transparent' } : undefined}
      >
        <Text style={[styles.triggerText, !value && styles.placeholder]}>
          {(value && (optionLabels?.[value] || value)) || (placeholder === 'Select...' ? t('common.selectPlaceholder', { defaultValue: 'Select...' }) : placeholder)}
        </Text>
        <Ionicons name="chevron-down" size={18} color={fieldColors.textMuted} />
      </Pressable>

      <Modal visible={visible} transparent animationType="fade" onRequestClose={() => { setVisible(false); onClose?.(); }}>
        <Pressable style={styles.overlay} onPress={() => { setVisible(false); onClose?.(); }}>
          <View style={styles.dropdown}>
            <Text style={styles.dropdownTitle}>{label || 'Select'}</Text>
            <FlatList
              data={options}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <Pressable
                  style={[styles.option, item === value && styles.optionSelected]}
                  onPress={() => {
                    onValueChange(item);
                    setVisible(false);
                    onClose?.();
                  }}
                >
                  <Text style={[styles.optionText, item === value && styles.optionTextSelected]}>
                    {optionLabels?.[item] ?? item}
                  </Text>
                  {item === value && <Ionicons name="checkmark" size={20} color={colors.primary} />}
                </Pressable>
              )}
            />
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}
