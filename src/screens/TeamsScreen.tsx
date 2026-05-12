import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { Search01Icon, StarIcon } from '@hugeicons/core-free-icons';
import { C, Team } from '../types';
import { fetchTeamsByLeague, FEATURED_LEAGUES } from '../services/api';
import { TeamCard, LoadingSpinner, EmptyState, Header } from '../components';

interface Props {
  favourites: Set<string>;
  onToggleFavourite: (id: string) => void;
  selectedLeagueId: string;
  navigation?: any;
}

export default function TeamsScreen({ favourites, onToggleFavourite, selectedLeagueId, navigation }: Props) {
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

  if (loading) return <LoadingSpinner message="Loading teams…" />;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }} edges={['top', 'bottom']}>
      <Header
        title="Teams"
        showBack
        onBackPress={() => navigation?.goBack()}
        rightAction={{ icon: <HugeiconsIcon icon={StarIcon} size={16} color="#FFD700" />, onPress: () => navigation?.navigate('Home', { screen: 'Favourites' }) }}
      />
      <View style={{ flex: 1, backgroundColor: C.bg }}>
      {/* Search */}
      <View style={s.searchRow}>
        <View style={s.searchBox}>
          <HugeiconsIcon icon={Search01Icon} size={16} color={C.textSecondary} style={{ marginRight: 8 }} />
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
});
