import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { C, Match, Screen } from '../types';
import { useUpcomingMatches, usePastMatches, usePrefetch } from '../services/queries';
import { MatchCard, FilterPill, EmptyState, SkeletonMatchCard, SkeletonPillBar } from '../components';

interface Props {
  onNavigate: (screen: Screen, data?: any) => void;
  selectedLeagueId: string;
  navigation?: any;
}

type Filter = 'all' | 'live' | 'today' | 'tomorrow' | 'upcoming' | 'finished';

function isToday(dateStr: string): boolean {
  const today = new Date();
  const d = new Date(dateStr);
  return d.toDateString() === today.toDateString();
}

function isTomorrow(dateStr: string): boolean {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const d = new Date(dateStr);
  return d.toDateString() === tomorrow.toDateString();
}

function getSortKey(m: Match): number {
  const now = new Date();
  const matchDate = new Date(m.date);
  const todayStr = now.toDateString();
  const matchDateStr = matchDate.toDateString();

  if (m.status === 'live') return 0;
  if (matchDateStr === todayStr) return 1;
  if (isTomorrow(m.date)) return 2;
  if (m.status === 'upcoming') return 3;
  if (m.status === 'finished') return 4;
  return 5;
}

export default function FixturesScreen({ onNavigate, selectedLeagueId, navigation }: Props) {
  const [filter, setFilter] = useState<Filter>('upcoming');

  const { data: upcomingMatches, isLoading: upcomingLoading, refetch: refetchUpcoming } = useUpcomingMatches(selectedLeagueId);
  const { data: pastMatches, isLoading: pastLoading, refetch: refetchPast } = usePastMatches(selectedLeagueId);
  const { prefetchEvent } = usePrefetch();

  useEffect(() => {
    const upcoming = upcomingMatches ?? [];
    const first5 = upcoming.slice(0, 5).filter(m => m.id);
    for (const m of first5) {
      prefetchEvent(m.id);
    }
  }, [upcomingMatches, prefetchEvent]);

  const loading = upcomingLoading && pastLoading;

  const onRefresh = async () => {
    await Promise.all([refetchUpcoming(), refetchPast()]);
  };

  const all = useMemo(() => {
    const upcoming = upcomingMatches ?? [];
    const past = pastMatches ?? [];
    return [...upcoming, ...past].sort((a, b) => {
      const ka = getSortKey(a);
      const kb = getSortKey(b);
      if (ka !== kb) return ka - kb;
      if (a.date < b.date) return -1;
      if (a.date > b.date) return 1;
      return a.time.localeCompare(b.time);
    });
  }, [upcomingMatches, pastMatches]);

  const filtered = useMemo(() => {
    if (filter === 'all') return all;
    if (filter === 'live') return all.filter(m => m.status === 'live');
    if (filter === 'today') return all.filter(m => isToday(m.date) || m.status === 'live');
    if (filter === 'tomorrow') return all.filter(m => isTomorrow(m.date));
    if (filter === 'upcoming') return all.filter(m => m.status === 'upcoming');
    if (filter === 'finished') return all.filter(m => m.status === 'finished');
    return all;
  }, [all, filter]);

  const byDate = useMemo(() => {
    const map = new Map<string, Match[]>();
    filtered.forEach(m => {
      const list = map.get(m.date) ?? [];
      list.push(m);
      map.set(m.date, list);
    });
    return map;
  }, [filtered]);

  if (loading && !all.length) return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }} edges={['top', 'bottom']}>
      <View style={{ height: 8 }} />
      <ScrollView style={{ flex: 1, backgroundColor: C.bg }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 48 }}>
        <View style={s.filterBar}>
          <SkeletonPillBar count={6} width={80} />
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
        refreshControl={<RefreshControl refreshing={false} onRefresh={onRefresh} tintColor={C.accent} />}
        contentContainerStyle={{ paddingBottom: 48 }}
      >
        <View style={s.filterBar}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingRight: 8 }}>
            {([['upcoming', 'Upcoming'], ['live', '● Live'], ['today', 'Today'], ['tomorrow', 'Tomorrow'], ['all', 'All'], ['finished', 'Finished']] as [Filter, string][]).map(([f, label]) => (
              <FilterPill key={f} label={label} active={filter === f} onPress={() => setFilter(f)} />
            ))}
          </ScrollView>
        </View>

        <View style={{ padding: 16 }}>
          {filtered.length === 0 ? (
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
