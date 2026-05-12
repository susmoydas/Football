import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { C, Match, Screen, NewsArticle } from '../types';
import {
  fetchLiveEvents, fetchLeagueEvents, fetchNextEvents, FEATURED_LEAGUES,
} from '../services/api';
import {
  MatchCard, FilterPill, SectionHeader, LoadingSpinner,
  WorldCupBanner, NewsFeedCard,
} from '../components';

interface Props {
  onNavigate: (screen: Screen, data?: any) => void;
  favourites: Set<string>;
  onToggleFavourite: (id: string) => void;
  selectedLeagueId: string;
}

type Tab = 'live' | 'today' | 'tomorrow' | 'all';

const NEWS: NewsArticle[] = [
  { id: '1', title: 'World Cup 2026: Complete guide to host cities and venues across USA, Canada & Mexico', source: 'FIFA News', time: '2 hours ago', featured: true },
  { id: '2', title: 'Champions League quarter-finals: Preview of the biggest matches this week', source: 'UEFA.com', time: '4 hours ago' },
  { id: '3', title: 'Premier League title race: The key matches that will decide the champion', source: 'BBC Sport', time: '5 hours ago' },
  { id: '4', title: 'La Liga: Barcelona and Real Madrid battle for top spot with crunch fixtures ahead', source: 'Marca', time: '7 hours ago' },
  { id: '5', title: 'Transfer news: Summer window set to be one of the most active in history', source: 'Sky Sports', time: '9 hours ago' },
  { id: '6', title: 'Bundesliga: Bayer Leverkusen continue incredible unbeaten run this season', source: 'Kicker', time: '12 hours ago' },
];

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

export default function HomeScreen({ onNavigate, favourites, onToggleFavourite, selectedLeagueId }: Props) {
  const [tab, setTab] = useState<Tab>('live');
  const [liveMatches, setLiveMatches] = useState<Match[]>([]);
  const [allMatches, setAllMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const league = FEATURED_LEAGUES.find(l => l.id === selectedLeagueId) ?? FEATURED_LEAGUES[0];

  const load = async () => {
    try {
      const [live, all, next] = await Promise.all([
        fetchLiveEvents(selectedLeagueId),
        fetchLeagueEvents(selectedLeagueId),
        fetchNextEvents(selectedLeagueId),
      ]);
      setLiveMatches(live);

      const seen = new Set<string>();
      const merged = [...live, ...all, ...next].filter(m => {
        if (seen.has(m.id)) return false;
        seen.add(m.id);
        return true;
      });
      setAllMatches(merged);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { setLoading(true); load(); }, [selectedLeagueId]);

  const onRefresh = () => { setRefreshing(true); load(); };

  const todayMatches = allMatches.filter(m => isToday(m.date) || m.status === 'live');
  const tomorrowMatches = allMatches.filter(m => isTomorrow(m.date));

  const displayedMatches = tab === 'live' ? liveMatches
    : tab === 'today' ? todayMatches
    : tab === 'tomorrow' ? tomorrowMatches
    : allMatches;

  if (loading) return <LoadingSpinner message="Loading matches…" />;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }} edges={['top', 'bottom']}>
      <ScrollView
        style={s.container}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.accent} />}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        <View style={s.inner}>
          {/* Banner */}
          <WorldCupBanner
            leagueName={league.name}
            onViewFixtures={() => onNavigate('fixtures')}
          />

          {/* Tab filters */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }} contentContainerStyle={{ gap: 8, paddingRight: 4 }}>
            {([['live', '● Live'], ['today', 'Today'], ['tomorrow', 'Tomorrow'], ['all', 'All']] as [Tab, string][]).map(([t, label]) => (
              <FilterPill key={t} label={label} active={tab === t} onPress={() => setTab(t)} />
            ))}
          </ScrollView>

          {/* Match count */}
          <Text style={s.matchCount}>{displayedMatches.length} match{displayedMatches.length !== 1 ? 'es' : ''}</Text>

          {/* Live matches */}
          {tab === 'live' && (
            <>
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

          {/* Today matches */}
          {tab === 'today' && (
            <>
              {todayMatches.length === 0
                ? <Text style={s.emptyHint}>No matches scheduled for today</Text>
                : todayMatches.map(m => (
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

          {/* Tomorrow matches */}
          {tab === 'tomorrow' && (
            <>
              {tomorrowMatches.length === 0
                ? <Text style={s.emptyHint}>No matches scheduled for tomorrow</Text>
                : tomorrowMatches.map(m => (
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

          {/* All matches */}
          {tab === 'all' && (
            <>
              {liveMatches.length > 0 && (
                <>
                  <SectionHeader title="Live Now" />
                  {liveMatches.map(m => (
                    <MatchCard key={m.id} match={m}
                      isFavourite={favourites.has(m.id)}
                      onToggleFavourite={() => onToggleFavourite(m.id)}
                      onPress={() => onNavigate('match-details', m)} />
                  ))}
                </>
              )}
              <SectionHeader title="Upcoming" />
              {allMatches.filter(m => m.status !== 'finished').slice(0, 10).map(m => (
                <MatchCard key={m.id} match={m}
                  isFavourite={favourites.has(m.id)}
                  onToggleFavourite={() => onToggleFavourite(m.id)}
                  onPress={() => onNavigate('match-details', m)} />
              ))}
            </>
          )}

          {/* News Section */}
          <View style={s.newsSection}>
            <SectionHeader title="News" />
            <TouchableOpacity onPress={() => onNavigate('news')}>
              <Text style={s.newsViewAll}>View all</Text>
            </TouchableOpacity>
          </View>
          {NEWS.filter(n => n.featured).slice(0, 1).map(n => (
            <NewsFeedCard key={n.id} article={n} featured />
          ))}
          {NEWS.filter(n => !n.featured).slice(0, 2).map(n => (
            <NewsFeedCard key={n.id} article={n} />
          ))}
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  inner: { padding: 16 },
  matchCount: { color: C.textSecondary, fontSize: 12, fontWeight: '500', marginBottom: 12 },
  emptyHint: { color: C.textSecondary, fontSize: 14, textAlign: 'center', paddingVertical: 32 },
  newsSection: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginTop: 8, marginBottom: 4,
  },
  newsViewAll: { color: C.accent, fontSize: 13, fontWeight: '600' },
});
