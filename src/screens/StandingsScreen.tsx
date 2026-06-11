import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { ArrowDown01Icon } from '@hugeicons/core-free-icons';
import { C, Standing, Team, League } from '../types';
import { fetchStandings, fetchGroupedStandings, fetchLeagues, FEATURED_LEAGUES } from '../services/api';
import { saveSelectedLeague, getCachedLeagues, setCachedLeagues } from '../services/storage';
import { StandingsTable, GroupedStandings, EmptyState, SkeletonStandingsRows, SkeletonBlock, SoftSkeleton, FadeInView } from '../components';
import LeagueBottomSheet from '../components/home/LeagueBottomSheet';

interface Props {
  selectedLeagueId: string;
  navigation?: any;
  onNavigate?: (screen: string, data?: any) => void;
  onLeagueChange?: (id: string) => void;
}

const SEASON = '2024-2025';

export default function StandingsScreen({ selectedLeagueId, navigation, onNavigate, onLeagueChange }: Props) {
  const [rows, setRows] = useState<Standing[]>([]);
  const [groups, setGroups] = useState<Record<string, Standing[]>>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showBottomSheet, setShowBottomSheet] = useState(false);
  const [allLeagues, setAllLeagues] = useState<League[]>(FEATURED_LEAGUES);

  const useGroups = ['7', '27'].includes(selectedLeagueId);

  const activeLeague = FEATURED_LEAGUES.find(l => l.id === selectedLeagueId) || allLeagues.find(l => l.id === selectedLeagueId);
  const activeName = activeLeague?.name ?? 'Select League';

  const load = async (id: string) => {
    try {
      if (['7', '27'].includes(id)) {
        const g = await fetchGroupedStandings(id);
        setGroups(g);
        setRows([]);
      } else {
        const data = await fetchStandings(id, SEASON);
        setRows(data);
        setGroups({});
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    load(selectedLeagueId);
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

  const onRefresh = () => { setRefreshing(true); load(selectedLeagueId); };

  const handleLeagueSelect = async (id: string) => {
    await saveSelectedLeague(id);
    onLeagueChange?.(id);
    setShowBottomSheet(false);
  };

  if (loading) return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }} edges={['top', 'bottom']}>
      <View style={{ height: 8 }} />
      <ScrollView style={{ flex: 1, backgroundColor: C.bg }} showsVerticalScrollIndicator={false}>
        <View style={{ padding: 16 }}>
          <SoftSkeleton>
            <SkeletonBlock style={{ width: 192, height: 14, marginBottom: 12 }} />
            <SkeletonStandingsRows count={6} />
          </SoftSkeleton>
        </View>
      </ScrollView>
      <LeagueBottomSheet
        visible={showBottomSheet}
        leagues={allLeagues}
        selectedLeagueId={selectedLeagueId}
        onSelectLeague={handleLeagueSelect}
        onClose={() => setShowBottomSheet(false)}
      />
    </SafeAreaView>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }} edges={['top', 'bottom']}>
      <View style={{ height: 8 }} />
      <FadeInView style={{ flex: 1 }}>
      <ScrollView
        style={{ flex: 1, backgroundColor: C.bg }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.accent} />}
      >
      <TouchableOpacity style={s.leagueSelector} onPress={() => setShowBottomSheet(true)} activeOpacity={0.7}>
        <Text style={s.leagueSelectorText} numberOfLines={1}>{activeName}</Text>
        <HugeiconsIcon icon={ArrowDown01Icon} size={16} color={C.accent} />
      </TouchableOpacity>

      <View style={{ padding: 16 }}>
        <Text style={s.seasonLabel}>{activeName} · {SEASON}</Text>

        {useGroups && Object.keys(groups).length > 0 ? (
          <GroupedStandings
            groups={groups}
            onTeamPress={row => onNavigate?.('team-details', {
              team: { id: row.teamId, name: row.name, badge: row.badge || '', league: '', country: '' } as Team,
              leagueId: selectedLeagueId,
            })}
          />
        ) : rows.length === 0 ? (
          <EmptyState title="Standings not available" description="Try another league or pull to refresh" />
        ) : (
          <StandingsTable
            rows={rows}
            qualifyCount={4}
            onTeamPress={row => onNavigate?.('team-details', {
              team: { id: row.teamId, name: row.name, badge: row.badge || '', league: '', country: '' } as Team,
              leagueId: selectedLeagueId,
            })}
          />
        )}

        {!useGroups && (
          <View style={s.legend}>
            <View style={[s.legendDot, { backgroundColor: C.accent }]} />
            <Text style={s.legendText}>Qualifies / Champions League</Text>
          </View>
        )}

        <View style={{ height: 32 }} />
      </View>
    </ScrollView>
    </FadeInView>
    <LeagueBottomSheet
      visible={showBottomSheet}
      leagues={allLeagues}
      selectedLeagueId={selectedLeagueId}
      onSelectLeague={handleLeagueSelect}
      onClose={() => setShowBottomSheet(false)}
    />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  leagueSelector: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: C.border,
  },
  leagueSelectorText: { color: C.accent, fontSize: 14, fontWeight: '600', maxWidth: 200 },
  seasonLabel: { color: C.textSecondary, fontSize: 13, marginBottom: 12, fontWeight: '600' },
  legend: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12 },
  legendDot: { width: 12, height: 12, borderRadius: 6 },
  legendText: { color: C.textSecondary, fontSize: 12 },
});
