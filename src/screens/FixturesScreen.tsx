import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { File01Icon } from '@hugeicons/core-free-icons';
import { C, Match, Screen } from '../types';
import { fetchNextEvents, fetchLastEvents } from '../services/api';
import { MatchCard, FilterPill, LoadingSpinner, EmptyState, Header } from '../components';
import { checkAndNotifyMatches } from '../services/notifications';

interface Props {
  onNavigate: (screen: Screen, data?: any) => void;
  favourites: Set<string>;
  onToggleFavourite: (id: string) => void;
  selectedLeagueId: string;
  navigation?: any;
}

type Filter = 'all' | 'upcoming' | 'finished' | 'live';

export default function FixturesScreen({ onNavigate, favourites, onToggleFavourite, selectedLeagueId, navigation }: Props) {
  const [filter, setFilter] = useState<Filter>('all');
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const [upcoming, past] = await Promise.all([
        fetchNextEvents(selectedLeagueId),
        fetchLastEvents(selectedLeagueId),
      ]);
      const all = [...past.reverse(), ...upcoming];
      setMatches(all);
      checkAndNotifyMatches(all, favourites);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { setLoading(true); load(); }, [selectedLeagueId]);

  const onRefresh = () => { setRefreshing(true); load(); };

  const filtered = filter === 'all' ? matches : matches.filter(m => m.status === filter);

  // Group by date
  const byDate = new Map<string, Match[]>();
  filtered.forEach(m => {
    const list = byDate.get(m.date) ?? [];
    list.push(m);
    byDate.set(m.date, list);
  });

  if (loading) return <LoadingSpinner message="Loading fixtures…" />;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }} edges={['top', 'bottom']}>
      <Header
        title="Fixtures"
        showBack
        onBackPress={() => navigation?.goBack()}
        rightAction={{ icon: <HugeiconsIcon icon={File01Icon} size={18} color={C.textPrimary} />, onPress: () => onNavigate('results') }}
      />
      <ScrollView
        style={{ flex: 1, backgroundColor: C.bg }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.accent} />}
        contentContainerStyle={{ paddingBottom: 48 }}
      >
      {/* Filter bar */}
      <View style={s.filterBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingRight: 8 }}>
          {([['all', 'All'], ['live', '🔴 Live'], ['upcoming', 'Upcoming'], ['finished', 'Finished']] as [Filter, string][]).map(([f, label]) => (
            <FilterPill key={f} label={label} active={filter === f} onPress={() => setFilter(f)} />
          ))}
        </ScrollView>
      </View>

      <View style={{ padding: 16 }}>
        {byDate.size === 0 ? (
          <EmptyState title="No matches found" description="Check back later for upcoming fixtures" />
        ) : (
          Array.from(byDate.keys()).sort().map(date => (
            <View key={date} style={{ marginBottom: 20 }}>
              <Text style={s.dateLabel}>
                {new Date(date).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}
              </Text>
              {byDate.get(date)!.map(m => (
                <MatchCard
                  key={m.id} match={m}
                  isFavourite={favourites.has(m.id)}
                  onToggleFavourite={() => onToggleFavourite(m.id)}
                  onPress={() => onNavigate('match-details', m)}
                />
              ))}
            </View>
          ))
        )}
        <View style={{ height: 24 }} />
      </View>
    </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  filterBar: {
    backgroundColor: C.bg,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  dateLabel: { color: C.textSecondary, fontSize: 13, marginBottom: 10, fontWeight: '600' },
});
