import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { C, Standing } from '../types';
import { fetchStandings, FEATURED_LEAGUES } from '../services/api';
import { StandingsTable, LoadingSpinner, EmptyState, Header } from '../components';

interface Props { selectedLeagueId: string; }

const SEASON = '2024-2025';

export default function StandingsScreen({ selectedLeagueId }: Props) {
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
      <Header title="Standings" />
      <ScrollView
        style={{ flex: 1, backgroundColor: C.bg }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.accent} />}
      >
      {/* League selector */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.leagueBar} contentContainerStyle={{ gap: 8, paddingRight: 16 }}>
        {FEATURED_LEAGUES.map(l => (
          <TouchableOpacity
            key={l.id}
            style={[s.leagueChip, leagueId === l.id && { backgroundColor: C.accent }]}
            onPress={() => { setLeagueId(l.id); setLoading(true); }}
          >
            <Text style={[s.leagueChipText, leagueId === l.id && { color: C.bg }]} numberOfLines={1}>
              {l.name}
            </Text>
          </TouchableOpacity>
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
  leagueChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: C.card, borderWidth: 1, borderColor: C.border, maxWidth: 160 },
  leagueChipText: { color: C.textSecondary, fontSize: 12, fontWeight: '600' },
  seasonLabel: { color: C.textSecondary, fontSize: 13, marginBottom: 12, fontWeight: '600' },
  legend: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12 },
  legendDot: { width: 12, height: 12, borderRadius: 6 },
  legendText: { color: C.textSecondary, fontSize: 12 },
});
