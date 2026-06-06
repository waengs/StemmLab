import React, { useMemo } from 'react';
import { View, TextInput, StyleSheet, Pressable, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { BorderRadius, Spacing } from '../../theme';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

export function SearchBar({ value, onChangeText, placeholder }: SearchBarProps) {
  const { t } = useTranslation();
  const { colors, isDark } = useTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        wrap: { marginBottom: Spacing.lg },
        field: {
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: isDark ? colors.surfaceElevated : colors.primary + '08',
          borderWidth: 1,
          borderColor: isDark ? colors.primary + '40' : colors.primaryLight + '88',
          borderRadius: BorderRadius.lg,
          paddingHorizontal: Spacing.md,
          gap: Spacing.sm,
        },
        input: {
          flex: 1,
          fontSize: 15,
          color: colors.text,
          paddingVertical: Platform.OS === 'ios' ? Spacing.md : Spacing.sm,
        },
      }),
    [colors, isDark]
  );

  return (
    <View style={styles.wrap}>
      <View style={styles.field}>
        <Ionicons name="search" size={18} color={colors.primary} />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder ?? t('common.searchPlaceholder')}
          placeholderTextColor={colors.textMuted}
          style={styles.input}
          returnKeyType="search"
          clearButtonMode="while-editing"
          autoCorrect={false}
          autoCapitalize="none"
        />
        {value.length > 0 && (
          <Pressable onPress={() => onChangeText('')} hitSlop={8}>
            <Ionicons name="close-circle" size={18} color={colors.textMuted} />
          </Pressable>
        )}
      </View>
    </View>
  );
}
