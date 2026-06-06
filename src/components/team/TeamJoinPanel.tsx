import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { TeamMembersList } from './TeamMembersList';
import {
  browseTeams,
  filterTeamListings,
  fetchTeamMembers,
} from '../../utils/storage';
import { useTheme } from '../../context/ThemeContext';
import { useThemedStyles } from '../../hooks/useThemedStyles';
import { useAsyncAction } from '../../hooks/useAsyncAction';
import { BorderRadius, Spacing } from '../../theme';
import type { TeamListing, TeamMemberSummary } from '../../types';

interface TeamJoinPanelProps {
  /** @deprecated Navigation is handled by AuthNavigationSync after joinTeam updates auth state. */
  onJoinSuccess?: () => void;
  joinTeam: (discriminator: string, joinPassword: string) => Promise<boolean>;
}

export function TeamJoinPanel({ onJoinSuccess, joinTeam }: TeamJoinPanelProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = useThemedStyles(({ colors: c }) => ({
    label: {
      fontSize: 14,
      fontWeight: '600',
      color: c.text,
      marginBottom: Spacing.xs,
    },
    searchField: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: c.background,
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: BorderRadius.md,
      paddingHorizontal: Spacing.md,
      gap: Spacing.sm,
      marginBottom: Spacing.md,
    },
    searchInput: {
      flex: 1,
      fontSize: 15,
      color: c.text,
      paddingVertical: Platform.OS === 'ios' ? Spacing.md : Spacing.sm,
    },
    teamRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: Spacing.md,
      paddingHorizontal: Spacing.sm,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: c.border,
    },
    teamRowBody: { flex: 1 },
    teamName: { fontSize: 15, fontWeight: '600', color: c.text },
    teamMeta: { fontSize: 12, color: c.textMuted, marginTop: 2 },
    empty: { fontSize: 14, color: c.textMuted, textAlign: 'center', padding: Spacing.lg },
    backRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.xs,
      marginBottom: Spacing.md,
    },
    backText: { fontSize: 14, fontWeight: '600', color: c.primary },
    selectedCard: {
      backgroundColor: c.background,
      borderRadius: BorderRadius.md,
      padding: Spacing.md,
      marginBottom: Spacing.md,
      borderWidth: 1,
      borderColor: c.border,
    },
    selectedName: { fontSize: 17, fontWeight: '700', color: c.text },
    selectedMeta: { fontSize: 13, color: c.textMuted, marginTop: 4 },
    hint: { fontSize: 12, color: c.textMuted, marginTop: -Spacing.sm, marginBottom: Spacing.md },
  }));
  const [teams, setTeams] = useState<TeamListing[]>([]);
  const [loadingTeams, setLoadingTeams] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<TeamListing | null>(null);
  const [members, setMembers] = useState<TeamMemberSummary[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [joinPassword, setJoinPassword] = useState('');

  const joinAction = useCallback(async () => {
    if (!selected || !joinPassword) {
      return;
    }
    const ok = await joinTeam(selected.discriminator, joinPassword);
    if (ok) {
      onJoinSuccess?.();
    } else {
      const { Alert } = await import('react-native');
      Alert.alert(t('setup.joinError'), t('setup.joinErrorMsg'));
    }
  }, [selected, joinPassword, joinTeam, onJoinSuccess, t]);

  const [handleJoin, isJoining] = useAsyncAction(joinAction);

  const loadTeams = useCallback(async () => {
    setLoadingTeams(true);
    try {
      setTeams(await browseTeams());
    } finally {
      setLoadingTeams(false);
    }
  }, []);

  useEffect(() => {
    void loadTeams();
  }, [loadTeams]);

  useEffect(() => {
    if (!selected) {
      setMembers([]);
      return;
    }
    let cancelled = false;
    setLoadingMembers(true);
    void fetchTeamMembers(selected.discriminator).then((list) => {
      if (!cancelled) {
        setMembers(list);
        setLoadingMembers(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [selected?.discriminator]);

  const filtered = useMemo(() => filterTeamListings(teams, search), [teams, search]);

  const handleSelect = (team: TeamListing) => {
    setSelected(team);
    setJoinPassword('');
  };

  if (selected) {
    return (
      <View>
        <Pressable style={styles.backRow} onPress={() => setSelected(null)}>
          <Ionicons name="arrow-back" size={18} color={colors.primary} />
          <Text style={styles.backText}>{t('setup.backToTeamList')}</Text>
        </Pressable>

        <View style={styles.selectedCard}>
          <Text style={styles.selectedName}>{selected.name}</Text>
          <Text style={styles.selectedMeta}>
            {t('dashboard.teamId', { id: selected.discriminator })} • {selected.gradeLevel}
          </Text>
        </View>

        <TeamMembersList
          title={t('setup.teamMembers')}
          members={members}
          loading={loadingMembers}
          emptyText={t('setup.noMembersYet')}
          loadingText={t('setup.loadingMembers')}
        />

        <Input
          label={t('setup.joinPassword')}
          value={joinPassword}
          onChangeText={setJoinPassword}
          placeholder={t('setup.joinPasswordPlaceholder')}
          secureTextEntry
          onLightSurface
        />
        <Text style={styles.hint}>{t('setup.joinPasswordHint')}</Text>

        <Button
          title={t('setup.joinTeamBtn')}
          onPress={handleJoin}
          size="lg"
          fullWidth
          disabled={!joinPassword}
          loading={isJoining}
          style={{ marginTop: Spacing.sm }}
        />
      </View>
    );
  }

  return (
    <View>
      <Text style={styles.label}>{t('setup.searchTeams')}</Text>
      <View style={styles.searchField}>
        <Ionicons name="search" size={18} color={colors.textMuted} />
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder={t('setup.searchTeamsPlaceholder')}
          placeholderTextColor={colors.textMuted}
          style={styles.searchInput}
          autoCorrect={false}
          autoCapitalize="none"
        />
        {search.length > 0 && (
          <Pressable onPress={() => setSearch('')} hitSlop={8}>
            <Ionicons name="close-circle" size={18} color={colors.textMuted} />
          </Pressable>
        )}
      </View>

      {loadingTeams ? (
        <ActivityIndicator color={colors.primary} style={{ marginVertical: Spacing.xl }} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.discriminator}
          scrollEnabled={false}
          ListEmptyComponent={
            <Text style={styles.empty}>{t('setup.noTeamsFound')}</Text>
          }
          renderItem={({ item }) => (
            <Pressable
              style={styles.teamRow}
              onPress={() => handleSelect(item)}
              android_ripple={{ color: colors.borderLight }}
            >
              <View style={styles.teamRowBody}>
                <Text style={styles.teamName}>{item.name}</Text>
                <Text style={styles.teamMeta}>
                  {item.gradeLevel} • {item.discriminator}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
            </Pressable>
          )}
        />
      )}
    </View>
  );
}

