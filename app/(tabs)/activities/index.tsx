import React, { useMemo, useState } from 'react';
import { Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Screen, PageTitle, ActivityCategorySection, SearchBar } from '../../../src/components';
import { ACTIVITIES } from '../../../src/types';
import { useTheme } from '../../../src/context/ThemeContext';
import { matchesSearch } from '../../../src/utils/search';

export default function Activities() {
  const { t } = useTranslation();
  const { colors, typography } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');

  const filterActivity = (id: string, name: string, description: string, category: string) => {
    const translatedName = t(`data.activities.${id}.name`, { defaultValue: name });
    const translatedDesc = t(`data.activities.${id}.desc`, { defaultValue: description });
    const translatedCategory = t(`data.categories.${category}`, { defaultValue: category });
    return matchesSearch(`${translatedName} ${translatedDesc} ${translatedCategory}`, searchQuery);
  };

  const engineeringActivities = useMemo(
    () =>
      Object.values(ACTIVITIES).filter(
        (a) =>
          a.category === 'Engineering' &&
          filterActivity(a.id, a.name, a.description, a.category)
      ),
    [searchQuery, t]
  );

  const healthActivities = useMemo(
    () =>
      Object.values(ACTIVITIES).filter(
        (a) =>
          a.category === 'Health/Medical' &&
          filterActivity(a.id, a.name, a.description, a.category)
      ),
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
