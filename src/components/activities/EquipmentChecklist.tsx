import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { BorderRadius, Spacing } from '../../theme';

type Props = {
  equipmentList: string[];
  checkedEquipment: Record<string, boolean>;
  onToggle: (item: string) => void;
  disabled?: boolean;
  titleKey?: string;
};

export function EquipmentChecklist({
  equipmentList,
  checkedEquipment,
  onToggle,
  disabled = false,
  titleKey = 'activities.equipmentTitle',
}: Props) {
  const { t } = useTranslation();
  const { colors, typography } = useTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        hint: {
          ...typography.bodySmall,
          color: colors.textSecondary,
          marginBottom: Spacing.md,
        },
        sectionTitle: {
          ...typography.h3,
          marginBottom: Spacing.sm,
        },
        checklistItem: {
          flexDirection: 'row',
          alignItems: 'center',
          paddingVertical: Spacing.sm,
          gap: Spacing.md,
        },
        checkbox: {
          width: 24,
          height: 24,
          borderRadius: BorderRadius.sm,
          borderWidth: 2,
          borderColor: colors.primary,
          justifyContent: 'center',
          alignItems: 'center',
        },
        checkboxChecked: {
          backgroundColor: colors.primary,
        },
        checklistText: {
          ...typography.body,
          flex: 1,
        },
      }),
    [colors, typography]
  );

  return (
    <View>
      <Text style={styles.hint}>
        {t('activities.equipmentCheckHint', {
          defaultValue: 'Tick every item below to confirm you have the equipment ready. You must check all items before you can continue.',
        })}
      </Text>
      <Text style={styles.sectionTitle}>{t(titleKey, { defaultValue: 'Equipment checklist' })}</Text>
      {equipmentList.map((item) => (
        <TouchableOpacity
          key={item}
          style={styles.checklistItem}
          onPress={() => {
            if (!disabled) onToggle(item);
          }}
          disabled={disabled}
        >
          <View style={[styles.checkbox, checkedEquipment[item] && styles.checkboxChecked]}>
            {checkedEquipment[item] && <Ionicons name="checkmark" size={16} color={colors.white} />}
          </View>
          <Text style={styles.checklistText}>{item}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}
