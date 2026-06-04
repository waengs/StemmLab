import React from 'react';
import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Input } from '../ui/Input';
import { useThemedStyles } from '../../hooks/useThemedStyles';
import { actT } from '../../utils/activityContent';
import { Spacing } from '../../theme';



interface QuizOpenSectionProps {

  questions: string[];

  answers: string[];

  onChange: (index: number, value: string) => void;

  disabled?: boolean;

  heading?: string;

  /** When set, prefixes each prompt with a question number (e.g. after MCQs). */

  startNumber?: number;

}



export function QuizOpenSection({

  questions,

  answers,

  onChange,

  disabled = false,

  heading,

  startNumber,

}: QuizOpenSectionProps) {
  const { t } = useTranslation();
  const resolvedHeading = heading ?? actT('shared.reflectionHeading');

  const styles = useThemedStyles(({ colors, typography }) => ({

    heading: {

      ...typography.h3,

      color: colors.text,

      marginTop: Spacing.lg,

      marginBottom: Spacing.sm,

    },

    block: {

      marginBottom: Spacing.md,

    },

    question: {

      ...typography.body,

      color: colors.text,

      fontWeight: '600',

      marginBottom: Spacing.xs,

    },

  }));



  return (

    <>

      <Text style={styles.heading}>{resolvedHeading}</Text>

      {questions.map((prompt, index) => (

        <View key={index} style={styles.block}>

          <Text style={styles.question}>

            {startNumber != null ? `${startNumber + index}. ` : ''}

            {prompt}

          </Text>

          <Input

            value={answers[index] ?? ''}

            onChangeText={(value) => onChange(index, value)}

            multiline

            numberOfLines={3}

            editable={!disabled}

            placeholder={t('activityContent.shared.answerPlaceholder')}

          />

        </View>

      ))}

    </>

  );

}

