import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { C, Team } from '../types';
import { fetchTeamsByLeague, FEATURED_LEAGUES } from '../services/api';
import { TeamCard, LoadingSpinner, EmptyState, Header } from '../components';

interface Props {
  favourites: Set<string>;
  onToggleFavourite: (id: string) => void;
  selectedLeagueId: string;
}

export default function TeamsScreen({ favourites, onToggleFavourite, selectedLeagueId }: Props) {
  const [teams, setTeams] = useState<Team[]>([]);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
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

  if (loading) return <LoadingSpinner message="Loading teams…" />;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }} edges={['top', 'bottom']}>
      <Header title="Teams" />
      <View style={{ flex: 1, backgroundColor: C.bg }}>
      {/* Search + view toggle */}
      <View style={s.searchRow}>
        <View style={s.searchBox}>
          <Text style={{ fontSize: 16, marginRight: 8 }}>🔍</Text>
          <TextInput
            style={s.searchInput}
            placeholder="Search team…"
            placeholderTextColor={C.textSecondary}
            value={search}
            onChangeText={setSearch}
          />
        </View>
        <View style={s.viewToggle}>
          {(['grid', 'list'] as const).map(v => (
            <TouchableOpacity
              key={v}
              style={[s.viewBtn, viewMode === v && { backgroundColor: C.accent }]}
              onPress={() => setViewMode(v)}
            >
              <Text style={{ fontSize: 14, color: viewMode === v ? C.bg : C.textSecondary }}>
                {v === 'grid' ? '⊞' : '☰'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {filtered.length === 0 ? (
        <EmptyState title="No teams found" description="Try a different search term" />
      ) : viewMode === 'list' ? (
        <FlatList
          data={filtered}
          keyExtractor={t => t.id}
          contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
          renderItem={({ item }) => (
            <TeamCard
              team={item}
              listMode
              isFavourite={favourites.has(item.id)}
              onToggleFavourite={() => onToggleFavourite(item.id)}
            />
          )}
        />
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
              isFavourite={favourites.has(item.id)}
              onToggleFavourite={() => onToggleFavourite(item.id)}
            />
          )}
        />
      )}
    </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  searchRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    padding: 16, borderBottomWidth: 1, borderBottomColor: C.border,
  },
  searchBox: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    backgroundColor: C.card, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10,
    borderWidth: 1, borderColor: C.border,
  },
  searchInput: { flex: 1, color: C.textPrimary, fontSize: 14 },
  viewToggle: { flexDirection: 'row', backgroundColor: C.card, borderRadius: 10, padding: 4, borderWidth: 1, borderColor: C.border },
  viewBtn: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
});
