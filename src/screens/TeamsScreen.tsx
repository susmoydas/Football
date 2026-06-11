import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { Search01Icon } from '@hugeicons/core-free-icons';
import { C, Team } from '../types';
import { fetchTeamsByLeague, FEATURED_LEAGUES } from '../services/api';
import { TeamCard, EmptyState, SkeletonTeamCardGrid, SkeletonBlock, SoftSkeleton, FadeInView } from '../components';

interface Props {
  selectedLeagueId: string;
  navigation?: any;
  onNavigate?: (screen: string, data?: any) => void;
}

export default function TeamsScreen({ selectedLeagueId, navigation, onNavigate }: Props) {
  const [teams, setTeams] = useState<Team[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const league = FEATURED_LEAGUES.find(l => l.id === selectedLeagueId) ?? FEATURED_LEAGUES[0];

  useEffect(() => {
    setLoading(true);
    fetchTeamsByLeague(selectedLeagueId).then(t => {
      setTeams(t);
      setLoading(false);
    });
  }, [selectedLeagueId]);

  const filtered = teams.filter(t => t.name.toLowerCase().includes(search.toLowerCase()));

  if (loading) return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }} edges={['top', 'bottom']}>
      <View style={{ flex: 1, backgroundColor: C.bg }}>
        <View style={s.searchRow}>
          <SoftSkeleton>
            <SkeletonBlock style={{ flex: 1, height: 40, borderRadius: 12 }} />
          </SoftSkeleton>
        </View>
        <View style={{ flexDirection: 'row', padding: 16, gap: 10 }}>
          <SkeletonTeamCardGrid />
          <SkeletonTeamCardGrid />
        </View>
      </View>
    </SafeAreaView>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }} edges={['top', 'bottom']}>
      <FadeInView style={{ flex: 1 }}>
      <View style={{ flex: 1, backgroundColor: C.bg }}>
      <View style={s.searchRow}>
        <View style={s.searchBox}>
          <HugeiconsIcon icon={Search01Icon} size={24} color={C.textSecondary} style={{ marginRight: 8 }} />
          <TextInput
            style={s.searchInput}
            placeholder="Search team…"
            placeholderTextColor={C.textSecondary}
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      {filtered.length === 0 ? (
        <EmptyState title="No teams found" description="Try a different search term" />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={t => t.id}
          numColumns={2}
          contentContainerStyle={{ padding: 16, paddingBottom: 48 }}
          columnWrapperStyle={{ gap: 10, marginBottom: 10 }}
          renderItem={({ item }) => (
            <TeamCard
              team={item}
              onPress={() => onNavigate?.('team-details', { team: item, leagueId: selectedLeagueId })}
            />
          )}
        />
      )}
    </View>
    </FadeInView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  searchRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    padding: 16,
  },
  searchBox: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#1D1D1D', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10,
  },
  searchInput: { flex: 1, color: C.textPrimary, fontSize: 14 },
});
