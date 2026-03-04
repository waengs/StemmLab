import React, { useState, useEffect, useMemo } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import {
  Screen,
  PageTitle,
  SearchBar,
  LeaderboardTabs,
  LeaderboardEntryCard,
  EmptyState,
} from '../../src/components';
import { matchesSearch } from '../../src/utils/search';
import { useActivityResultsStore, buildLeaderboards } from '../../src/stores';

export default function Leaderboard() {
  const { t } = useTranslation();
  const results = useActivityResultsStore((s) => s.results);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState(0);

  const leaderboards = useMemo(() => buildLeaderboards(results), [results]);

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

  return (
    <Screen>
      <PageTitle showSettings>{t('leaderboard.pageTitle')}</PageTitle>
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
            <LeaderboardEntryCard key={entry.teamDiscriminator} entry={entry} rank={index} />
          ))}
        </View>
      )}
    </Screen>
  );
}
