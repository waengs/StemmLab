import React from 'react';
import { useTranslation } from 'react-i18next';
import { Screen, PageTitle, ActivityCategorySection } from '../../../src/components';
import { ACTIVITIES } from '../../../src/types';
import { Colors } from '../../../src/theme';

export default function Activities() {
  const { t } = useTranslation();

  const engineeringActivities = Object.values(ACTIVITIES).filter((a) => a.category === 'Engineering');
  const healthActivities = Object.values(ACTIVITIES).filter((a) => a.category === 'Health/Medical');

  return (
    <Screen>
      <PageTitle>{t('activities.pageTitle')}</PageTitle>

      <ActivityCategorySection
        title={t('activities.engineering')}
        activities={engineeringActivities}
        icon="construct"
        iconColor={Colors.engineering}
      />

      <ActivityCategorySection
        title={t('activities.health')}
        activities={healthActivities}
        icon="medkit"
        iconColor={Colors.health}
      />
    </Screen>
  );
}
