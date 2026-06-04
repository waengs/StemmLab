import React from 'react';
import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Card } from '../ui/Card';
import { useTheme } from '../../context/ThemeContext';
import { useGradeBand } from '../../hooks/useGradeBand';
import {
  actT,
  getDiscussionParagraphs,
  getDiscussionSections,
  getDiscussionTables,
} from '../../utils/activityContent';

type DiscussionStyles = {
  discussionCard: object;
  sectionTitle: object;
  paragraph: object;
  subHeading?: object;
  infoBox: object;
  infoText: object;
  tableBlock?: object;
  tableHeading?: object;
  tableRowHeader?: object;
  tableRow?: object;
  tableCell?: object;
};

interface ActivityDiscussionCardProps {
  activityId: string;
  styles: DiscussionStyles;
  showHighSchoolTables?: boolean;
}

export function ActivityDiscussionCard({
  activityId,
  styles,
  showHighSchoolTables = true,
}: ActivityDiscussionCardProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { isPrimary, isHighSchool } = useGradeBand();
  const band = isPrimary ? 'primary' : 'highSchool';

  const paragraphs = getDiscussionParagraphs(activityId, band);
  const sections = getDiscussionSections(activityId, band);
  const tables = showHighSchoolTables && isHighSchool ? getDiscussionTables(activityId, band) : [];
  const talkAbout = t(`activityContent.discussion.${activityId}.${band}.talkAbout`, {
    defaultValue: '',
  });
  const didYouKnow = t(`activityContent.discussion.${activityId}.${band}.didYouKnow`, {
    defaultValue: '',
  });
  const important = t(`activityContent.discussion.${activityId}.${band}.important`, {
    defaultValue: '',
  });

  return (
    <Card style={styles.discussionCard}>
      <Text style={styles.sectionTitle}>{actT('shared.discussionTitle')}</Text>

      {paragraphs.map((paragraph, index) => (
        <Text key={`p-${index}`} style={styles.paragraph}>
          {paragraph}
        </Text>
      ))}

      {sections.map((section, index) => (
        <View key={`s-${index}`}>
          {section.heading && styles.subHeading ? (
            <Text style={styles.subHeading}>{section.heading}</Text>
          ) : section.heading ? (
            <Text style={[styles.paragraph, { fontWeight: '700' }]}>{section.heading}</Text>
          ) : null}
          <Text style={styles.paragraph}>{section.body}</Text>
        </View>
      ))}

      {tables.map((table, tableIndex) => (
        <View key={`t-${tableIndex}`} style={styles.tableBlock}>
          <Text style={styles.tableHeading}>{table.title}</Text>
          <View style={styles.tableRowHeader}>
            {table.headers.map((header, headerIndex) => (
              <Text
                key={`h-${headerIndex}`}
                style={[
                  styles.tableCell,
                  { flex: headerIndex === 0 ? 1 : 2, fontWeight: '700' },
                ]}
              >
                {header}
              </Text>
            ))}
          </View>
          {table.rows.map((row, rowIndex) => (
            <View key={`r-${rowIndex}`} style={styles.tableRow}>
              {row.map((cell, cellIndex) => (
                <Text
                  key={`c-${cellIndex}`}
                  style={[
                    styles.tableCell,
                    {
                      flex: cellIndex === 0 ? 1 : 2,
                      fontWeight: cellIndex === 0 ? '600' : '400',
                      color:
                        tableIndex === 1 && rowIndex >= 3 && cellIndex === 2
                          ? colors.danger
                          : colors.textSecondary,
                    },
                  ]}
                >
                  {cell}
                </Text>
              ))}
            </View>
          ))}
        </View>
      ))}

      {talkAbout ? (
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            <Text style={{ fontWeight: '700' }}>{actT('shared.talkAboutLabel')}</Text>
            {talkAbout}
          </Text>
        </View>
      ) : null}

      {didYouKnow ? (
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            <Text style={{ fontWeight: '700' }}>{actT('shared.didYouKnowLabel')}</Text>
            {didYouKnow}
          </Text>
        </View>
      ) : null}

      {important ? (
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            <Text style={{ fontWeight: '700' }}>{actT('shared.importantLabel')}</Text>
            {important}
          </Text>
        </View>
      ) : null}
    </Card>
  );
}
