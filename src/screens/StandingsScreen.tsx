import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { C, Standing } from '../types';
import { fetchStandings, FEATURED_LEAGUES } from '../services/api';
import { StandingsTable, LoadingSpinner, EmptyState, FilterPill } from '../components';

interface Props { selectedLeagueId: string; navigation?: any; }

const SEASON = '2024-2025';

export default function StandingsScreen({ selectedLeagueId, navigation }: Props) {
  const [rows, setRows] = useState<Standing[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [leagueId, setLeagueId] = useState(selectedLeagueId);

  const load = async (id: string) => {
    try {
      const data = await fetchStandings(id, SEASON);
      setRows(data);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { setLeagueId(selectedLeagueId); }, [selectedLeagueId]);
  useEffect(() => { setLoading(true); load(leagueId); }, [leagueId]);

  const onRefresh = () => { setRefreshing(true); load(leagueId); };

  const activeName = FEATURED_LEAGUES.find(l => l.id === leagueId)?.name ?? '';

  if (loading) return <LoadingSpinner message="Loading standings…" />;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }} edges={['top', 'bottom']}>
      <View style={{ height: 8 }} />
      <ScrollView
        style={{ flex: 1, backgroundColor: C.bg }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.accent} />}
      >
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.leagueBar} contentContainerStyle={{ gap: 8, paddingRight: 16 }}>
        {FEATURED_LEAGUES.map(l => (
          <FilterPill
            key={l.id}
            label={l.name}
            active={leagueId === l.id}
            onPress={() => { setLeagueId(l.id); setLoading(true); }}
          />
        ))}
      </ScrollView>

      <View style={{ padding: 16 }}>
        <Text style={s.seasonLabel}>{activeName} · {SEASON}</Text>

        {rows.length === 0 ? (
          <EmptyState title="Standings not available" description="Try another league or pull to refresh" />
        ) : (
          <StandingsTable rows={rows} qualifyCount={4} />
        )}

        <View style={s.legend}>
          <View style={[s.legendDot, { backgroundColor: C.accent }]} />
          <Text style={s.legendText}>Qualifies / Champions League</Text>
        </View>

        <View style={{ height: 32 }} />
      </View>
    </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  leagueBar: { borderBottomWidth: 1, borderBottomColor: C.border, paddingVertical: 12, paddingLeft: 16 },

  seasonLabel: { color: C.textSecondary, fontSize: 13, marginBottom: 12, fontWeight: '600' },
  legend: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12 },
  legendDot: { width: 12, height: 12, borderRadius: 6 },
  legendText: { color: C.textSecondary, fontSize: 12 },
});
