import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { C, Match, Screen } from '../types';
import { fetchLiveEvents, fetchNextEvents, FEATURED_LEAGUES } from '../services/api';
import { MatchCard, FilterPill, SectionHeader, LoadingSpinner } from '../components';

interface Props {
  onNavigate: (screen: Screen, data?: any) => void;
  favourites: Set<string>;
  onToggleFavourite: (id: string) => void;
  selectedLeagueId: string;
}

type Tab = 'live' | 'today' | 'upcoming' | 'all';

export default function HomeScreen({ onNavigate, favourites, onToggleFavourite, selectedLeagueId }: Props) {
  const [tab, setTab] = useState<Tab>('upcoming');
  const [liveMatches, setLiveMatches] = useState<Match[]>([]);
  const [upcomingMatches, setUpcomingMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const league = FEATURED_LEAGUES.find(l => l.id === selectedLeagueId) ?? FEATURED_LEAGUES[0];

  const load = async () => {
    try {
      const [live, upcoming] = await Promise.all([
        fetchLiveEvents(),
        fetchNextEvents(selectedLeagueId),
      ]);
      setLiveMatches(live);
      setUpcomingMatches(upcoming);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { setLoading(true); load(); }, [selectedLeagueId]);

  const onRefresh = () => { setRefreshing(true); load(); };

  const displayedMatches = tab === 'live' ? liveMatches : upcomingMatches;

  if (loading) return <LoadingSpinner message="Loading matches…" />;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }} edges={['top', 'bottom']}>
      <ScrollView
        style={s.container}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.accent} />}
        contentContainerStyle={{ paddingBottom: 48 }}
      >
      <View style={s.inner}>
        {/* Header */}
        <View style={s.header}>
          <View>
            <Text style={s.welcomeText}>Welcome back</Text>
            <Text style={s.headerTitle}>Football 2026 Code</Text>
          </View>
          <View style={s.headerIcons}>
          <TouchableOpacity style={s.iconBtn} onPress={() => onNavigate('favourites')}>
              <Text style={{ fontSize: 20 }}>⭐</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Hero Card */}
        <View style={s.heroCard}>
          <View style={s.heroCircle1} />
          <View style={s.heroCircle2} />
          <View style={{ position: 'relative', zIndex: 1 }}>
            <Text style={s.heroTitle}>🏆 {league.name}</Text>
            <Text style={s.heroSub}>Live scores & fixtures</Text>
            <TouchableOpacity style={s.heroBtn} onPress={() => onNavigate('fixtures')}>
              <Text style={s.heroBtnText}>View Fixtures</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Tab filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }} contentContainerStyle={{ gap: 8, paddingRight: 4 }}>
          {([['live', '🔴 Live'], ['upcoming', 'Upcoming'], ['all', 'All']] as [Tab, string][]).map(([t, label]) => (
            <FilterPill key={t} label={label} active={tab === t} onPress={() => setTab(t)} />
          ))}
        </ScrollView>

        {/* Matches */}
        {tab === 'live' && (
          <>
            <SectionHeader title="Live Now" />
            {liveMatches.length === 0
              ? <Text style={s.emptyHint}>No live matches right now</Text>
              : liveMatches.map(m => (
                <MatchCard
                  key={m.id} match={m}
                  isFavourite={favourites.has(m.id)}
                  onToggleFavourite={() => onToggleFavourite(m.id)}
                  onPress={() => onNavigate('match-details', m)}
                />
              ))
            }
          </>
        )}

        {tab === 'upcoming' && (
          <>
            <SectionHeader title="Upcoming Matches" />
            {upcomingMatches.length === 0
              ? <Text style={s.emptyHint}>No upcoming matches found</Text>
              : upcomingMatches.slice(0, 6).map(m => (
                <MatchCard
                  key={m.id} match={m}
                  isFavourite={favourites.has(m.id)}
                  onToggleFavourite={() => onToggleFavourite(m.id)}
                  onPress={() => onNavigate('match-details', m)}
                />
              ))
            }
          </>
        )}

        {tab === 'all' && (
          <>
            {liveMatches.length > 0 && (
              <>
                <SectionHeader title="🔴 Live" />
                {liveMatches.map(m => (
                  <MatchCard key={m.id} match={m}
                    isFavourite={favourites.has(m.id)}
                    onToggleFavourite={() => onToggleFavourite(m.id)}
                    onPress={() => onNavigate('match-details', m)} />
                ))}
              </>
            )}
            <SectionHeader title="Upcoming" />
            {upcomingMatches.slice(0, 8).map(m => (
              <MatchCard key={m.id} match={m}
                isFavourite={favourites.has(m.id)}
                onToggleFavourite={() => onToggleFavourite(m.id)}
                onPress={() => onNavigate('match-details', m)} />
            ))}
          </>
        )}

        {/* Quick Actions */}
        <SectionHeader title="Quick Actions" />
        <View style={s.quickGrid}>
          {[
            { label: 'Fixtures', icon: '📅', screen: 'fixtures' },
            { label: 'Teams', icon: '⚽', screen: 'teams' },
            { label: 'Standings', icon: '📊', screen: 'standings' },
            { label: 'Favourites', icon: '⭐', screen: 'favourites' },
            { label: 'News', icon: '📰', screen: 'news' },
            { label: 'More', icon: '⚙️', screen: 'more' },
          ].map(a => (
            <TouchableOpacity key={a.label} style={s.quickBtn} onPress={() => onNavigate(a.screen as Screen)}>
              <Text style={{ fontSize: 30, marginBottom: 6 }}>{a.icon}</Text>
              <Text style={s.quickLabel}>{a.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: 24 }} />
      </View>
    </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  inner: { padding: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  welcomeText: { color: C.textSecondary, fontSize: 13 },
  headerTitle: { color: C.textPrimary, fontSize: 22, fontWeight: '800' },
  headerIcons: { flexDirection: 'row', gap: 8 },
  iconBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: C.card, alignItems: 'center', justifyContent: 'center' },
  heroCard: {
    backgroundColor: C.card,
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: C.accent,
    overflow: 'hidden',
    position: 'relative',
  },
  heroCircle1: { position: 'absolute', width: 120, height: 120, borderRadius: 60, backgroundColor: C.accent + '15', top: -30, right: -30 },
  heroCircle2: { position: 'absolute', width: 80, height: 80, borderRadius: 40, backgroundColor: C.accent + '10', bottom: -20, left: -20 },
  heroTitle: { color: C.textPrimary, fontSize: 18, fontWeight: '800', marginBottom: 4 },
  heroSub: { color: C.textSecondary, fontSize: 13, marginBottom: 14 },
  heroBtn: { backgroundColor: C.accent, paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20, alignSelf: 'flex-start' },
  heroBtnText: { color: C.bg, fontSize: 13, fontWeight: '700' },
  emptyHint: { color: C.textSecondary, fontSize: 14, textAlign: 'center', paddingVertical: 24 },
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 8 },
  quickBtn: {
    width: '47%',
    backgroundColor: C.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: 'flex-start',
  },
  quickLabel: { color: C.textPrimary, fontSize: 14, fontWeight: '600' },
});
