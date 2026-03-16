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
import { BorderRadius, Spacing, Shadows, createTypography, lightColors } from '../../theme';

interface SelectProps {
  label?: string;
  value: string;
  options: string[];
  onValueChange: (value: string) => void;
  placeholder?: string;
  containerStyle?: ViewStyle;
  onLightSurface?: boolean;
  disabled?: boolean;
}

export function Select({
  label,
  value,
  options,
  onValueChange,
  placeholder = 'Select...',
  containerStyle,
  onLightSurface,
  disabled,
}: SelectProps) {
  const [visible, setVisible] = useState(false);
  const { colors, typography } = useTheme();
  const surfaceColors = onLightSurface ? lightColors : colors;
  const surfaceTypography = onLightSurface ? createTypography(lightColors) : typography;

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: { marginBottom: Spacing.md },
        label: { ...surfaceTypography.label, marginBottom: Spacing.xs },
        trigger: {
          backgroundColor: surfaceColors.background,
          borderWidth: 1,
          borderColor: surfaceColors.border,
          borderRadius: BorderRadius.md,
          paddingHorizontal: Spacing.lg,
          paddingVertical: Spacing.md,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        },
        triggerText: { fontSize: 15, color: surfaceColors.text },
        placeholder: { color: surfaceColors.textMuted },
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
        optionSelected: { backgroundColor: colors.background },
        optionText: { ...typography.body },
        optionTextSelected: { color: colors.primary, fontWeight: '600' },
      }),
    [colors, surfaceColors, surfaceTypography]
  );

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <Pressable
        style={styles.trigger}
        onPress={() => setVisible(true)}
        android_ripple={Platform.OS === 'android' ? { color: 'transparent' } : undefined}
      >
        <Text style={[styles.triggerText, !value && styles.placeholder]}>{value || placeholder}</Text>
        <Ionicons name="chevron-down" size={18} color={colors.textMuted} />
      </Pressable>

      <Modal visible={visible} transparent animationType="fade" onRequestClose={() => setVisible(false)}>
        <Pressable style={styles.overlay} onPress={() => setVisible(false)}>
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
                  }}
                >
                  <Text style={[styles.optionText, item === value && styles.optionTextSelected]}>{item}</Text>
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
