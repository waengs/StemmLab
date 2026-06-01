import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import {
  Screen,
  PageTitle,
  SearchBar,
  LeaderboardTabs,
  LeaderboardEntryCard,
  TeamLeaderboardDetailModal,
  EmptyState,
} from '../../src/components';
import { Chip } from '../../src/components/ui/Chip';
import { matchesSearch } from '../../src/utils/search';
import {
  buildTeamDirectory,
  filterResultsForLeaderboardBand,
} from '../../src/utils/leaderboardGradeFilter';
import { useActivityResultsStore, buildLeaderboards, getTeamActivityCompletions } from '../../src/stores';
import { useGradeBand } from '../../src/hooks/useGradeBand';
import { listAvailableTeams, fetchTeamMembers } from '../../src/services/team/teamDirectoryService';
import type { LeaderboardEntry } from '../../src/components/leaderboard/LeaderboardEntryCard';
import type { TeamMemberSummary } from '../../src/types';
import { useTheme } from '../../src/context/ThemeContext';
import { Spacing } from '../../src/theme';

export default function Leaderboard() {
  const { t } = useTranslation();
  const { colors, typography } = useTheme();
  const { gradeBand, isHighSchool } = useGradeBand();
  const results = useActivityResultsStore((s) => s.results);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState(0);
  const [teamNamesByDiscriminator, setTeamNamesByDiscriminator] = useState<Record<string, string>>({});
  const [teamsByDisc, setTeamsByDisc] = useState<ReturnType<typeof buildTeamDirectory>>({});
  const [selectedEntry, setSelectedEntry] = useState<LeaderboardEntry | null>(null);
  const [members, setMembers] = useState<TeamMemberSummary[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);

  const gradeBandLabel = isHighSchool
    ? t('setup.gradeLowerHigh')
    : t('setup.gradeUpperPrimary');

  useEffect(() => {
    let cancelled = false;
    void listAvailableTeams().then((teams) => {
      if (cancelled) return;
      const map: Record<string, string> = {};
      teams.forEach((team) => {
        map[team.discriminator.toUpperCase()] = team.name;
      });
      setTeamNamesByDiscriminator(map);
      setTeamsByDisc(buildTeamDirectory(teams));
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const bandFilteredResults = useMemo(
    () => filterResultsForLeaderboardBand(results, teamsByDisc, gradeBand),
    [results, teamsByDisc, gradeBand]
  );

  const leaderboards = useMemo(
    () => buildLeaderboards(bandFilteredResults, teamNamesByDiscriminator),
    [bandFilteredResults, teamNamesByDiscriminator]
  );

  const categories = useMemo(
    () => [
      { label: t('leaderboard.overall'), key: 'overall' },
      { label: t('data.activities.parachute-drop.name', { defaultValue: 'Parachute Drop' }), key: 'parachute-drop' },
      { label: t('data.activities.sound-pollution.name', { defaultValue: 'Sound Pollution' }), key: 'sound-pollution' },
      { label: t('data.activities.hand-fan.name', { defaultValue: 'Hand Fan' }), key: 'hand-fan' },
      { label: t('data.activities.earthquake.name', { defaultValue: 'Earthquake' }), key: 'earthquake' },
      { label: t('data.activities.human-performance.name', { defaultValue: 'Human Performance' }), key: 'human-performance' },
      { label: t('data.activities.reaction-board.name', { defaultValue: 'Reaction Board' }), key: 'reaction-board' },
      { label: t('data.activities.breathing-pace.name', { defaultValue: 'Breathing Pace' }), key: 'breathing-pace' },
    ],
    [t]
  );

  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return categories;
    return categories.filter((cat) => matchesSearch(cat.label, searchQuery));
  }, [categories, searchQuery]);

  useEffect(() => {
    if (selectedTab >= filteredCategories.length) {
      setSelectedTab(0);
    }
  }, [filteredCategories.length, selectedTab]);

  const activeCategory = filteredCategories[selectedTab]?.key ?? filteredCategories[0]?.key;
  const currentBoard = useMemo(() => {
    const board = leaderboards[activeCategory] ?? [];
    if (!searchQuery.trim()) return board;
    return board.filter((entry) =>
      matchesSearch(`${entry.teamName} ${entry.teamDiscriminator}`, searchQuery)
    );
  }, [leaderboards, activeCategory, searchQuery]);

  const selectedCompletions = useMemo(() => {
    if (!selectedEntry) return [];
    return getTeamActivityCompletions(bandFilteredResults, selectedEntry.teamDiscriminator);
  }, [bandFilteredResults, selectedEntry]);

  const selectedGradeLevel = selectedEntry
    ? teamsByDisc[selectedEntry.teamDiscriminator.toUpperCase()]?.gradeLevel
    : undefined;

  useEffect(() => {
    if (!selectedEntry) {
      setMembers([]);
      return;
    }
    let cancelled = false;
    setLoadingMembers(true);
    void fetchTeamMembers(selectedEntry.teamDiscriminator).then((list) => {
      if (cancelled) return;
      setMembers(list);
      setLoadingMembers(false);
    });
    return () => {
      cancelled = true;
    };
  }, [selectedEntry]);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        bandRow: {
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: Spacing.md,
          gap: Spacing.sm,
        },
        bandHint: { ...typography.caption, color: colors.textMuted, flex: 1 },
      }),
    [colors, typography]
  );

  return (
    <>
      <Screen>
        <PageTitle showSettings>{t('leaderboard.pageTitle')}</PageTitle>

        <View style={styles.bandRow}>
          <Chip label={gradeBandLabel} variant="filled" color={colors.primary} size="sm" />
          <Text style={styles.bandHint}>{t('leaderboard.gradeBandHint')}</Text>
        </View>

        <SearchBar value={searchQuery} onChangeText={setSearchQuery} placeholder={t('leaderboard.searchPlaceholder')} />

        {filteredCategories.length > 0 ? (
          <LeaderboardTabs
            tabs={filteredCategories}
            selectedIndex={selectedTab}
            onSelect={setSelectedTab}
          />
        ) : null}

        {filteredCategories.length === 0 ? (
          <EmptyState message={t('common.noSearchResults')} />
        ) : currentBoard.length === 0 ? (
          <EmptyState message={t('leaderboard.noResults')} />
        ) : (
          <View>
            {currentBoard.map((entry, index) => (
              <LeaderboardEntryCard
                key={entry.teamDiscriminator}
                entry={entry}
                rank={index}
                onPress={() => setSelectedEntry(entry)}
              />
            ))}
          </View>
        )}
      </Screen>

      <TeamLeaderboardDetailModal
        visible={selectedEntry != null}
        entry={selectedEntry}
        gradeLevel={selectedGradeLevel}
        completions={selectedCompletions}
        members={members}
        loadingMembers={loadingMembers}
        onClose={() => setSelectedEntry(null)}
      />
    </>
  );
}
