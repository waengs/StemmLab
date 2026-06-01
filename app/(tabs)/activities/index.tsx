import React, { useMemo, useState } from 'react';
import { Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Screen, PageTitle, ActivityCategorySection, SearchBar } from '../../../src/components';
import { ACTIVITIES } from '../../../src/types';
import { useTheme } from '../../../src/context/ThemeContext';
import { activityMatchesSearch } from '../../../src/utils/activitySearch';

export default function Activities() {
  const { t } = useTranslation();
  const { colors, typography } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');

  const matchesFilter = (activity: (typeof ACTIVITIES)[keyof typeof ACTIVITIES]) =>
    activityMatchesSearch(
      activity.id,
      activity.name,
      activity.description,
      activity.category,
      activity.sensors,
      searchQuery,
      t
    );

  const engineeringActivities = useMemo(
    () => Object.values(ACTIVITIES).filter((a) => a.category === 'Engineering' && matchesFilter(a)),
    [searchQuery, t]
  );

  const healthActivities = useMemo(
    () => Object.values(ACTIVITIES).filter((a) => a.category === 'Health/Medical' && matchesFilter(a)),
    [searchQuery, t]
  );

  const hasResults = engineeringActivities.length > 0 || healthActivities.length > 0;

  return (
    <Screen>
      <PageTitle showSettings>{t('activities.pageTitle')}</PageTitle>
      <SearchBar value={searchQuery} onChangeText={setSearchQuery} placeholder={t('activities.searchPlaceholder')} />

      {engineeringActivities.length > 0 && (
        <ActivityCategorySection
          title={t('activities.engineering')}
          activities={engineeringActivities}
          icon="construct"
          iconColor={colors.engineering}
        />
      )}

      {healthActivities.length > 0 && (
        <ActivityCategorySection
          title={t('activities.health')}
          activities={healthActivities}
          icon="medkit"
          iconColor={colors.health}
        />
      )}

      {!hasResults && (
        <Text style={[typography.body, styles.empty, { color: colors.textMuted }]}>
          {t('common.noSearchResults')}
        </Text>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  empty: { textAlign: 'center', marginTop: 24 },
});
