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
  {
    id: '1', title: 'World Cup 2026: Complete guide to host cities and venues across USA, Canada & Mexico',
    source: 'FIFA News', time: '2 hours ago', featured: true,
    image: 'https://images.unsplash.com/photo-1577223625816-7546f13df25d?w=600&q=80',
    content: 'The 2026 FIFA World Cup will be the most expansive in history, featuring 48 teams across 16 host cities in the United States, Canada, and Mexico. The tournament marks the first time three nations will co-host the event, with matches spread across iconic venues including MetLife Stadium, AT&T Stadium, Estadio Azteca, and BC Place. Fans can expect a unique cultural celebration spanning the continent, with improved infrastructure and transportation links between host cities. The tournament schedule promises exciting group-stage matchups and a knockout phase that will crown the next world champion.',
  },
  {
    id: '2', title: 'Champions League quarter-finals: Preview of the biggest matches this week',
    source: 'UEFA.com', time: '4 hours ago',
    image: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=600&q=80',
    content: 'The UEFA Champions League quarter-finals are set to deliver high drama as Europe\'s elite clubs battle for a place in the semi-finals. This week\'s fixtures feature several mouth-watering ties that could go either way. Defending champions face a stern test against a resurgent opponent known for their dramatic comebacks. Meanwhile, the dark horses of the tournament continue their remarkable run, hoping to upset the established order. Key players to watch include the tournament\'s leading scorer and a midfield maestro whose vision and passing could unlock even the most stubborn defenses.',
  },
  {
    id: '3', title: 'Premier League title race: The key matches that will decide the champion',
    source: 'BBC Sport', time: '5 hours ago',
    image: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=600&q=80',
    content: 'The Premier League title race is heating up with several contenders separated by just a few points. With crucial head-to-head encounters remaining, every match carries enormous significance. The leading pack includes traditional powerhouses alongside a surprise challenger who have exceeded all expectations this season. Analysis of the remaining fixtures suggests that consistency against mid-table opposition will be as important as results in the big matches. The run-in promises plenty of twists and turns before the champion is crowned on the final day.',
  },
  {
    id: '4', title: 'La Liga: Barcelona and Real Madrid battle for top spot with crunch fixtures ahead',
    source: 'Marca', time: '7 hours ago',
    image: 'https://images.unsplash.com/photo-1489944966321-032c8f8a5a4b?w=600&q=80',
    content: 'The battle for La Liga supremacy continues as Barcelona and Real Madrid prepare for a series of challenging fixtures that could determine the destination of the title. Both clubs have shown remarkable form in recent weeks, with new signings making significant contributions. Barcelona\'s possession-based style under their manager has been particularly effective at home, while Real Madrid\'s counter-attacking threat remains potent on the road. The upcoming El Clásico could prove decisive, but points dropped against lesser opposition have often proven costly in previous campaigns.',
  },
  {
    id: '5', title: 'Transfer news: Summer window set to be one of the most active in history',
    source: 'Sky Sports', time: '9 hours ago',
    image: 'https://images.unsplash.com/photo-1432521123158-c96e0ac24793?w=600&q=80',
    content: 'The upcoming summer transfer window is shaping up to be one of the most spectacular in football history, with several record-breaking deals expected to be completed. Top clubs across Europe are preparing substantial budgets to strengthen their squads, driven by new broadcast revenue and investor interest. Several high-profile players are expected to seek new challenges, potentially triggering a chain reaction of moves. Agents are working around the clock to facilitate negotiations, while clubs look to secure their targets early to avoid the premium prices that typically accompany late-window purchases.',
  },
  {
    id: '6', title: 'Bundesliga: Bayer Leverkusen continue incredible unbeaten run this season',
    source: 'Kicker', time: '12 hours ago',
    image: 'https://images.unsplash.com/photo-1575361204480-a430a8e7eae0?w=600&q=80',
    content: 'Bayer Leverkusen\'s remarkable unbeaten run continues to defy expectations as they dominate the Bundesliga this season. The team\'s attacking flair and defensive solidity have made them the team to beat, with their pressing system causing problems for every opponent. Their manager\'s tactical innovations have been widely praised, particularly the fluid front three that has contributed over 50 goals this campaign. The rest of the Bundesliga is now playing catch-up, wondering how to stop a team that seems to find new ways to win each week.',
  },
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
            <NewsFeedCard key={n.id} article={n} featured onPress={() => onNavigate('news-article', n)} />
          ))}
          {NEWS.filter(n => !n.featured).slice(0, 2).map(n => (
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
  matchCount: { color: C.textSecondary, fontSize: 12, fontWeight: '500', marginBottom: 12 },
  emptyHint: { color: C.textSecondary, fontSize: 14, textAlign: 'center', paddingVertical: 32 },
  newsSection: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginTop: 8, marginBottom: 4,
  },
  newsViewAll: { color: C.accent, fontSize: 13, fontWeight: '600' },
});
