import React from 'react';
import { Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { getActivityInstructions } from '../../utils/activityContent';

interface ActivityInstructionsListProps {
  activityId: string;
  textStyle: object;
  titleStyle?: object;
}

export function ActivityInstructionsList({
  activityId,
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
      {steps.map((step, index) => (
        <Text key={index} style={textStyle}>
          {index + 1}. {step}
        </Text>
      ))}
    </>
  );
}
