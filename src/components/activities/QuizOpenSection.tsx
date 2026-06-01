import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Input } from '../ui/Input';
import { Colors, Spacing, Typography } from '../../theme';

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
  heading = 'Reflection questions',
  startNumber,
}: QuizOpenSectionProps) {
  return (
    <>
      <Text style={styles.heading}>{heading}</Text>
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
            placeholder="Write your answer…"
            onLightSurface
          />
        </View>
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  heading: {
    ...Typography.h3,
    color: Colors.text,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  block: {
    marginBottom: Spacing.md,
  },
  question: {
    ...Typography.body,
    color: Colors.text,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
});
