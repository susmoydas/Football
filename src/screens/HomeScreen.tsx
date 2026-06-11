import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { ArrowDown01Icon } from '@hugeicons/core-free-icons';
import { C, Match, Screen, NewsArticle, League } from '../types';
import {
  fetchLiveEvents, fetchLeagueEvents, fetchNextEvents, fetchFootballNews, fetchLeagues,
  FEATURED_LEAGUES,
} from '../services/api';
import { checkAndNotifyMatches } from '../services/notifications';
import { getFavMatches, saveSelectedLeague, getCachedMatches, setCachedMatches, getCachedLeagues, setCachedLeagues } from '../services/storage';
import LeagueBottomSheet from '../components/home/LeagueBottomSheet';
import {
  WorldCupBanner, MatchCard, FilterPill, SectionHeader,
  NewsFeedCard, SkeletonMatchCard, SkeletonNewsCard, SkeletonBanner, SkeletonPillBar,
  FadeInView,
} from '../components';

interface Props {
  onNavigate: (screen: Screen, data?: any) => void;
  selectedLeagueId: string;
  onLeagueChange?: (id: string) => void;
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

export default function HomeScreen({ onNavigate, selectedLeagueId, onLeagueChange }: Props) {
  const [tab, setTab] = useState<Tab>('all');
  const [liveMatches, setLiveMatches] = useState<Match[]>([]);
  const [allMatches, setAllMatches] = useState<Match[]>([]);
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [allLeagues, setAllLeagues] = useState<League[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const activeLeague = FEATURED_LEAGUES.find(l => l.id === selectedLeagueId) || allLeagues.find(l => l.id === selectedLeagueId);
  const activeName = activeLeague?.name ?? 'Select League';

  function isPlaceholder(name: string): boolean {
    return /^[A-Z]\d+$/.test(name);
  }

  function shouldFilterPlaceholder(leagueId: string): boolean {
    return leagueId !== '27';
  }

  const load = async (cached?: Match[]) => {
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
        if (shouldFilterPlaceholder(selectedLeagueId) && (isPlaceholder(m.homeTeam) || isPlaceholder(m.awayTeam))) return false;
        return true;
      }).sort((a, b) => {
        if (a.date < b.date) return -1;
        if (a.date > b.date) return 1;
        return a.time.localeCompare(b.time);
      });
      setAllMatches(merged);
      setCachedMatches(selectedLeagueId, merged);

      const favIds = new Set(await getFavMatches());
      checkAndNotifyMatches(merged, favIds).catch(error => console.warn('Failed to send notifications:', error));
    } catch {
      if (!cached) {
        setLiveMatches([]);
        setAllMatches([]);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    getCachedMatches(selectedLeagueId).then(cached => {
      if (cached && cached.length > 0) {
        setAllMatches(cached);
        setLoading(false);
      }
      load(cached ?? undefined);
    });
  }, [selectedLeagueId]);

  useEffect(() => {
    getCachedLeagues().then(cached => {
      if (cached && cached.length > 0) {
        setAllLeagues(cached as League[]);
      }
      fetchLeagues().then(apiLeagues => {
        const merged: League[] = [];
        const seen = new Set<string>();
        for (const l of [...FEATURED_LEAGUES, ...apiLeagues]) {
          if (!seen.has(l.id)) { seen.add(l.id); merged.push(l); }
        }
        setAllLeagues(merged);
        setCachedLeagues(merged);
      }).catch(() => {
        if (!cached) setAllLeagues(FEATURED_LEAGUES);
      });
    });
  }, []);

  const onRefresh = () => { setRefreshing(true); load(); };

  const todayMatches = allMatches.filter(m => isToday(m.date) || m.status === 'live');
  const tomorrowMatches = allMatches.filter(m => isTomorrow(m.date));

  const displayedMatches = tab === 'live' ? liveMatches
    : tab === 'today' ? todayMatches
    : tab === 'tomorrow' ? tomorrowMatches
    : allMatches;

  if (loading) return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }} edges={['top', 'bottom']}>
      <ScrollView style={s.container} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        <View style={s.inner}>
          <SkeletonBanner />
          <SkeletonPillBar count={4} width={72} />
          {[1, 2, 3].map(i => <SkeletonMatchCard key={i} />)}
          <SkeletonNewsCard />
        </View>
      </ScrollView>
    </SafeAreaView>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }} edges={['top', 'bottom']}>
      <FadeInView style={{ flex: 1 }}>
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
              <SectionHeader
                title="Upcoming"
                rightContent={
                  <TouchableOpacity style={s.leagueSelector} onPress={() => setShowDropdown(true)}>
                    <Text style={s.leagueSelectorText} numberOfLines={1}>{activeName}</Text>
                    <HugeiconsIcon icon={ArrowDown01Icon} size={16} color={C.accent} />
                  </TouchableOpacity>
                }
              />
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
      </FadeInView>
      <LeagueBottomSheet
        visible={showDropdown}
        leagues={allLeagues}
        selectedLeagueId={selectedLeagueId}
        onSelectLeague={async (id) => { await saveSelectedLeague(id); onLeagueChange?.(id); }}
        onClose={() => setShowDropdown(false)}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  inner: { padding: 16 },
  emptyHint: { color: C.textSecondary, fontSize: 14, textAlign: 'center', paddingVertical: 32 },
  leagueSelector: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 0, paddingVertical: 0,
    backgroundColor: 'transparent',
    borderRadius: 0,
  },
  leagueSelectorText: { color: C.accent, fontSize: 14, fontWeight: '600', maxWidth: 160 },
  newsSection: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginTop: 8, marginBottom: 4,
  },
  newsViewAll: { color: C.accent, fontSize: 13, fontWeight: '600' },
});
