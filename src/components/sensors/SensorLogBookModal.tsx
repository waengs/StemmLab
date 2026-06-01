import React, { useMemo } from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SearchBar } from '../layout/SearchBar';
import { SensorLogList } from './SensorLogList';
import { useTheme } from '../../context/ThemeContext';
import { filterSensorLogsBySearch } from '../../utils/sensorLogSearch';
import { normalizeSearch } from '../../utils/search';
import { BorderRadius, Spacing } from '../../theme';
import type { SensorLog } from '../../types';

interface SensorLogBookModalProps {
  visible: boolean;
  logs: SensorLog[];
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  onClose: () => void;
  onShareToForum?: (log: SensorLog) => void;
}

export function SensorLogBookModal({
  visible,
  logs,
  searchQuery,
  onSearchQueryChange,
  onClose,
  onShareToForum,
}: SensorLogBookModalProps) {
  const { t } = useTranslation();
  const { colors, typography } = useTheme();

  const filteredLogs = useMemo(
    () => filterSensorLogsBySearch(logs, searchQuery, t),
    [logs, searchQuery, t]
  );
  const isFiltering = normalizeSearch(searchQuery).length > 0;

  const styles = useMemo(
    () =>
      StyleSheet.create({
        safe: { flex: 1, backgroundColor: colors.background },
        header: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: Spacing.lg,
          paddingVertical: Spacing.md,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        },
        headerText: { flex: 1, paddingRight: Spacing.md },
        title: { ...typography.h2, color: colors.text },
        subtitle: { ...typography.caption, color: colors.textMuted, marginTop: 2 },
        closeBtn: {
          padding: Spacing.sm,
          borderRadius: BorderRadius.full,
          backgroundColor: colors.surface,
        },
        scroll: { flex: 1 },
        searchWrap: {
          paddingHorizontal: Spacing.lg,
          paddingTop: Spacing.sm,
        },
        content: {
          padding: Spacing.lg,
          paddingTop: 0,
          paddingBottom: Spacing.xxxl,
        },
      }),
    [colors, typography]
  );

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <KeyboardAvoidingView
          style={styles.safe}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.header}>
            <View style={styles.headerText}>
              <Text style={styles.title}>{t('sensors.logBook.title')}</Text>
              <Text style={styles.subtitle}>
                {isFiltering
                  ? t('sensors.logBook.subtitleFiltered', {
                      shown: filteredLogs.length,
                      total: logs.length,
                    })
                  : t('sensors.logBook.subtitle', { count: logs.length })}
              </Text>
            </View>
            <Pressable
              style={styles.closeBtn}
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel={t('common.close', { defaultValue: 'Close' })}
            >
              <Ionicons name="close" size={24} color={colors.text} />
            </Pressable>
          </View>
          <View style={styles.searchWrap}>
            <SearchBar
              value={searchQuery}
              onChangeText={onSearchQueryChange}
              placeholder={t('sensors.logBook.searchPlaceholder')}
            />
          </View>
          <ScrollView style={styles.scroll} keyboardShouldPersistTaps="handled">
            <View style={styles.content}>
              <SensorLogList
                logs={logs}
                searchQuery={searchQuery}
                title={t('sensors.logBook.allLogs')}
                showWhenEmpty
                onShareToForum={onShareToForum}
              />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}
