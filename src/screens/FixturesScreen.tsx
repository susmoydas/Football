import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { C, Match, Screen } from '../types';
import { fetchNextEvents, fetchLastEvents } from '../services/api';
import { MatchCard, FilterPill, LoadingSpinner, EmptyState, SkeletonMatchCard, Skeleton } from '../components';

interface Props {
  onNavigate: (screen: Screen, data?: any) => void;
  selectedLeagueId: string;
  navigation?: any;
}

type Filter = 'all' | 'upcoming' | 'finished' | 'live';

export default function FixturesScreen({ onNavigate, selectedLeagueId, navigation }: Props) {
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
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { setLoading(true); load(); }, [selectedLeagueId]);
  const onRefresh = () => { setRefreshing(true); load(); };

  const filtered = filter === 'all' ? matches : matches.filter(m => m.status === filter);

  const byDate = new Map<string, Match[]>();
  filtered.forEach(m => {
    const list = byDate.get(m.date) ?? [];
    list.push(m);
    byDate.set(m.date, list);
  });

  if (loading) return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }} edges={['top', 'bottom']}>
      <View style={{ height: 8 }} />
      <ScrollView style={{ flex: 1, backgroundColor: C.bg }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 48 }}>
        <View style={s.filterBar}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} variant="rounded" startColor="bg-background-100" className="h-8 rounded-full" style={{ width: 80 }} />
            ))}
          </ScrollView>
        </View>
        <View style={{ padding: 16 }}>
          {[1, 2, 3].map(i => <SkeletonMatchCard key={i} />)}
        </View>
      </ScrollView>
    </SafeAreaView>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }} edges={['top', 'bottom']}>
      <View style={{ height: 8 }} />
      <ScrollView
        style={{ flex: 1, backgroundColor: C.bg }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.accent} />}
        contentContainerStyle={{ paddingBottom: 48 }}
      >
        <View style={s.filterBar}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingRight: 8 }}>
            {([['all', 'All'], ['live', '● Live'], ['upcoming', 'Upcoming'], ['finished', 'Finished']] as [Filter, string][]).map(([f, label]) => (
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
