import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { StarIcon } from '@hugeicons/core-free-icons';
import { C, Match, Screen } from '../types';
import { fetchRecentResults, FEATURED_LEAGUES } from '../services/api';
import { TeamBadge, LoadingSpinner, EmptyState, Header } from '../components';

interface Props {
  onNavigate?: (screen: Screen, data?: any) => void;
  selectedLeagueId: string;
  navigation?: any;
}

export default function ResultsScreen({ onNavigate, selectedLeagueId, navigation }: Props) {
  const [allResults, setAllResults] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [leagueId, setLeagueId] = useState(selectedLeagueId);

  const load = async (id: string) => {
    try {
      const data = await fetchRecentResults(id);
      setAllResults(data);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { setLeagueId(selectedLeagueId); }, [selectedLeagueId]);
  useEffect(() => { setLoading(true); load(leagueId); }, [leagueId]);

  const onRefresh = () => { setRefreshing(true); load(leagueId); };

  const byDate = new Map<string, Match[]>();
  allResults.forEach(m => {
    const list = byDate.get(m.date) ?? [];
    list.push(m);
    byDate.set(m.date, list);
  });

  if (loading) return <LoadingSpinner message="Loading results…" />;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }} edges={['top', 'bottom']}>
      <Header
        title="Results"
        showBack={true}
        onBackPress={() => navigation?.goBack()}
        rightAction={{ icon: <HugeiconsIcon icon={StarIcon} size={16} color="#FFD700" />, onPress: () => navigation?.navigate('Home', { screen: 'Favourites' }) }}
      />

      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.accent} />}
      >
        {allResults.length === 0 ? (
          <EmptyState title="No recent results" description="Finished matches will appear here" />
        ) : (
          <View style={{ padding: 16 }}>
            {Array.from(byDate.keys()).sort().reverse().map(date => (
              <View key={date} style={{ marginBottom: 20 }}>
                <Text style={s.dateLabel}>
                  {new Date(date + 'T00:00:00').toLocaleDateString('en-GB', {
                    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
                  })}
                </Text>
                <View style={s.card}>
                  {byDate.get(date)!.map((m, i) => (
                    <TouchableOpacity
                      key={m.id}
                      style={[s.matchRow, i > 0 && s.matchRowBorder]}
                      onPress={() => onNavigate?.('match-details', m)}
                      activeOpacity={0.7}
                    >
                      <View style={s.matchTeams}>
                        <View style={s.teamGroup}>
                          <TeamBadge uri={m.homeBadge} size={20} />
                          <Text style={s.teamName} numberOfLines={1}>{m.homeTeam}</Text>
                        </View>
                        <View style={s.teamGroup}>
                          <TeamBadge uri={m.awayBadge} size={20} />
                          <Text style={s.teamName} numberOfLines={1}>{m.awayTeam}</Text>
                        </View>
                      </View>
                      <View style={s.scoreGroup}>
                        <Text style={s.score}>{m.homeScore ?? '-'}</Text>
                        <Text style={s.scoreDivider}>:</Text>
                        <Text style={s.score}>{m.awayScore ?? '-'}</Text>
                      </View>
                      <View style={s.badgeWrap}>
                        <View style={s.ftBadge}>
                          <Text style={s.ftText}>FT</Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ))}
          </View>
        )}
        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  dateLabel: {
    color: C.textSecondary,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 10,
  },
  card: {
    backgroundColor: C.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    overflow: 'hidden',
  },
  matchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  matchRowBorder: {
    borderTopWidth: 1,
    borderTopColor: C.border,
  },
  matchTeams: {
    flex: 1,
    gap: 8,
  },
  teamGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  teamName: {
    color: C.textPrimary,
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  scoreGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginHorizontal: 16,
    minWidth: 48,
    justifyContent: 'center',
  },
  score: {
    color: C.textPrimary,
    fontSize: 18,
    fontWeight: '700',
    minWidth: 20,
    textAlign: 'center',
  },
  scoreDivider: {
    color: C.textSecondary,
    fontSize: 14,
    fontWeight: '500',
  },
  badgeWrap: {
    width: 32,
    alignItems: 'center',
  },
  ftBadge: {
    backgroundColor: C.cardAlt,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  ftText: {
    color: C.textSecondary,
    fontSize: 10,
    fontWeight: '700',
  },
});
