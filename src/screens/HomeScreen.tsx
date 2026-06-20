import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { ArrowDown01Icon } from '@hugeicons/core-free-icons';
import { C, Match, Screen, NewsArticle, League } from '../types';
import { useMatches, useNews, useLeagues } from '../services/queries';
import { checkAndNotifyMatches } from '../services/notifications';
import { getFavMatches, saveSelectedLeague } from '../services/storage';
import { FEATURED_LEAGUES } from '../services/api';
import LeagueBottomSheet from '../components/home/LeagueBottomSheet';
import {
  WorldCupBanner, MatchCard, FilterPill, SectionHeader,
  NewsFeedCard, SkeletonMatchCard, SkeletonNewsCard, SkeletonBanner, SkeletonPillBar,
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

function isDateInNext7Days(dateStr: string): boolean {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const future = new Date(now);
  future.setDate(now.getDate() + 7);
  const d = new Date(dateStr);
  d.setHours(0, 0, 0, 0);
  return d >= now && d <= future;
}

export default function HomeScreen({ onNavigate, selectedLeagueId, onLeagueChange }: Props) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [tab, setTab] = useState<Tab>('all');
  const dataOpacity = useRef(new Animated.Value(0)).current;
  const [dataReady, setDataReady] = useState(false);

  const { data: matchesData, isLoading: matchesLoading } = useMatches(selectedLeagueId);
  const { data: leaguesData } = useLeagues();
  const { data: newsData } = useNews();

  useEffect(() => {
    if (!matchesData || matchesData.length === 0) return;
    (async () => {
      const favIds = new Set(await getFavMatches());
      checkAndNotifyMatches(matchesData, favIds).catch(() => {});
    })();
  }, [matchesData]);

  useEffect(() => {
    if (!matchesLoading && matchesData) {
      setDataReady(true);
      Animated.timing(dataOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [matchesLoading, matchesData, dataOpacity]);

  const allLeagues = leaguesData ?? FEATURED_LEAGUES;
  const activeLeague = FEATURED_LEAGUES.find(l => l.id === selectedLeagueId) || allLeagues.find(l => l.id === selectedLeagueId);
  const activeName = activeLeague?.name ?? 'Select League';

  const liveMatches = useMemo(() => {
    if (!matchesData) return [];
    return matchesData.filter(m => m.status === 'live')
      .sort((a, b) => a.time.localeCompare(b.time));
  }, [matchesData]);

  const todayMatches = useMemo(() => {
    if (!matchesData) return [];
    return matchesData.filter(m => isToday(m.date))
      .sort((a, b) => {
        if (a.date < b.date) return -1;
        if (a.date > b.date) return 1;
        return a.time.localeCompare(b.time);
      });
  }, [matchesData]);

  const tomorrowMatches = useMemo(() => {
    if (!matchesData) return [];
    return matchesData.filter(m => isTomorrow(m.date))
      .sort((a, b) => {
        if (a.date < b.date) return -1;
        if (a.date > b.date) return 1;
        return a.time.localeCompare(b.time);
      });
  }, [matchesData]);

  const allMatches = useMemo(() => {
    if (!matchesData) return [];
    return [...matchesData]
      .filter(m => m.status === 'upcoming' && isDateInNext7Days(m.date))
      .sort((a, b) => {
        if (a.date < b.date) return -1;
        if (a.date > b.date) return 1;
        return a.time.localeCompare(b.time);
      });
  }, [matchesData]);

  const displayedMatches = tab === 'live' ? liveMatches
    : tab === 'today' ? todayMatches
    : tab === 'tomorrow' ? tomorrowMatches
    : allMatches;

  const isLoading = matchesLoading && !matchesData;

  const FILTERS: { key: Tab; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'live', label: '● Live' },
    { key: 'today', label: 'Today' },
    { key: 'tomorrow', label: 'Tomorrow' },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }} edges={['top', 'bottom']}>
      <View style={{ flex: 1, backgroundColor: C.bg }}>
      {/* Skeleton - shows while loading or before data is ready */}
      {(isLoading || (!dataReady)) && (
        <ScrollView
          style={s.container}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 32 }}
        >
          <View style={s.inner}>
            <SkeletonBanner />
            <SkeletonPillBar count={4} />
            {[1, 2, 3].map(i => <SkeletonMatchCard key={i} />)}
            <SkeletonNewsCard />
          </View>
        </ScrollView>
      )}

      {/* Data - crossfades with skeleton */}
      <Animated.View style={{ flex: 1, opacity: dataReady ? dataOpacity : 0, display: dataReady ? 'flex' : 'none' }}>
        <ScrollView
          style={s.container}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 32 }}
          refreshControl={
            <RefreshControl
              refreshing={matchesLoading}
              onRefresh={() => {}}
              tintColor={C.accent}
            />
          }
        >
          <View style={s.inner}>
            <WorldCupBanner />

            {/* Filter tabs */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ marginBottom: 16 }}
              contentContainerStyle={{ gap: 8, paddingRight: 4 }}
            >
              {FILTERS.map(({ key, label }) => (
                <FilterPill
                  key={key}
                  label={label}
                  active={tab === key}
                  onPress={() => setTab(key)}
                />
              ))}
            </ScrollView>

            <SectionHeader
              title={tab === 'live' ? 'Live Now'
                : tab === 'today' ? "Today's Matches"
                : tab === 'tomorrow' ? "Tomorrow's Matches"
                : 'Upcoming Matches'}
              rightContent={
                <TouchableOpacity style={s.leagueSelector} onPress={() => setShowDropdown(true)}>
                  <Text style={s.leagueSelectorText} numberOfLines={1}>{activeName}</Text>
                  <HugeiconsIcon icon={ArrowDown01Icon} size={16} color={C.accent} />
                </TouchableOpacity>
              }
            />

            <Text style={s.matchCount}>{displayedMatches.length} match{displayedMatches.length !== 1 ? 'es' : ''}</Text>

            {displayedMatches.length === 0 ? (
              <Text style={s.emptyHint}>
                {tab === 'live' ? 'No live matches right now'
                  : tab === 'today' ? 'No matches scheduled for today'
                  : tab === 'tomorrow' ? 'No matches scheduled for tomorrow'
                  : 'No upcoming matches in the next 7 days'}
              </Text>
            ) : (
              displayedMatches.map(m => (
                <MatchCard key={m.id} match={m} onPress={() => onNavigate('match-details', m)} />
              ))
            )}

            <View style={s.newsSection}>
              <SectionHeader title="News" />
              <TouchableOpacity onPress={() => onNavigate('news')}>
                <Text style={s.newsViewAll}>View all</Text>
              </TouchableOpacity>
            </View>
            {(newsData ?? []).slice(0, 3).map(n => (
              <NewsFeedCard key={n.id} article={n} onPress={() => onNavigate('news-article', n)} />
            ))}
          </View>
          <View style={{ height: 24 }} />
        </ScrollView>
      </Animated.View>
      </View>
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
  matchCount: { color: C.textSecondary, fontSize: 12, fontWeight: '500', marginBottom: 12 },
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