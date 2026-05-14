import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { C, Match, Screen, NewsArticle } from '../types';
import {
  fetchLiveEvents, fetchLeagueEvents, fetchNextEvents, fetchFootballNews,
} from '../services/api';
import {
  WorldCupBanner, MatchCard, FilterPill, SectionHeader, LoadingSpinner,
  NewsFeedCard,
} from '../components';

interface Props {
  onNavigate: (screen: Screen, data?: any) => void;
  selectedLeagueId: string;
}

type Tab = 'live' | 'today' | 'tomorrow' | 'all';

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

export default function HomeScreen({ onNavigate, selectedLeagueId }: Props) {
  const [tab, setTab] = useState<Tab>('all');
  const [liveMatches, setLiveMatches] = useState<Match[]>([]);
  const [allMatches, setAllMatches] = useState<Match[]>([]);
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  function isPlaceholder(name: string): boolean {
    return /^[A-Z]\d+$/.test(name);
  }

  const load = async () => {
    try {
      const [live, all, next, newsData] = await Promise.all([
        fetchLiveEvents(selectedLeagueId),
        fetchLeagueEvents(selectedLeagueId),
        fetchNextEvents(selectedLeagueId),
        fetchFootballNews(),
      ]);
      setLiveMatches(live);
      if (newsData.length > 0) setNews(newsData.slice(0, 5));

      const seen = new Set<string>();
      const merged = [...live, ...all, ...next].filter(m => {
        if (seen.has(m.id)) return false;
        seen.add(m.id);
        if (isPlaceholder(m.homeTeam) || isPlaceholder(m.awayTeam)) return false;
        return true;
      });
      setAllMatches(merged);
    } catch {
      setLiveMatches([]);
      setAllMatches([]);
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

  if (loading) return <LoadingSpinner message="Loading matches..." />;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }} edges={['top', 'bottom']}>
      <ScrollView
        style={s.container}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.accent} />}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        <View style={s.inner}>
          <WorldCupBanner />
          {/* Tab filters */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }} contentContainerStyle={{ gap: 8, paddingRight: 4 }}>
            {([['all', 'All'], ['live', '● Live'], ['today', 'Today'], ['tomorrow', 'Tomorrow']] as [Tab, string][]).map(([t, label]) => (
              <FilterPill key={t} label={label} active={tab === t} onPress={() => setTab(t)} />
            ))}
          </ScrollView>

          {/* Live matches */}
          {tab === 'live' && (
            <>
              {liveMatches.length === 0
                ? <Text style={s.emptyHint}>No live matches right now</Text>
                : liveMatches.map(m => (
                  <MatchCard
                    key={m.id} match={m}
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
                      onPress={() => onNavigate('match-details', m)} />
                  ))}
                </>
              )}
              <SectionHeader title="Upcoming" />
              {allMatches.filter(m => m.status !== 'finished').slice(0, 10).map(m => (
                <MatchCard key={m.id} match={m}
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
          {news.slice(0, 3).map(n => (
            <NewsFeedCard key={n.id} article={n} onPress={() => onNavigate('news-article', n)} />
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
  emptyHint: { color: C.textSecondary, fontSize: 14, textAlign: 'center', paddingVertical: 32 },
  newsSection: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginTop: 8, marginBottom: 4,
  },
  newsViewAll: { color: C.accent, fontSize: 13, fontWeight: '600' },
});
