import React from 'react';
import { Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { getActivityInstructions } from '../../utils/activityContent';

interface ActivityInstructionsListProps {
  activityId: string;
  durationMinutes?: number;
  textStyle: object;
  titleStyle?: object;
}

export function ActivityInstructionsList({
  activityId,
  durationMinutes,
  textStyle,
  titleStyle,
}: ActivityInstructionsListProps) {
  const { t } = useTranslation();
  const steps = getActivityInstructions(activityId);

  return (
    <>
      <Text style={titleStyle ?? textStyle}>
        {t('activities.instructionsTitle', { defaultValue: 'Instructions' })}
      </Text>
      {durationMinutes != null && (
        <Text style={textStyle}>
          {t('activities.timeBudgetHint', {
            minutes: durationMinutes,
            defaultValue:
              'This activity takes about {{minutes}} minutes. Make sure you have enough time to complete it before you start.',
          })}
        </Text>
      )}
      {steps.map((step, index) => (
        <Text key={index} style={textStyle}>
          {index + 1}. {step}
        </Text>
      ))}
    </>
  );
}
