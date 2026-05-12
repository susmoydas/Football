import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { C, Screen, Match, Team } from '../types';
import { getFavMatches, getFavTeams, toggleFavTeam } from '../services/storage';
import { MatchCard, EmptyState, Header } from '../components';

interface Props {
  onNavigate: (screen: Screen, data?: any) => void;
  favourites: Set<string>;
  onToggleFavourite: (id: string) => void;
  allMatches: Match[];
  allTeams: Team[];
  navigation?: any;
}

type Tab = 'matches' | 'teams';

export default function FavouritesScreen({ onNavigate, favourites, onToggleFavourite, allMatches, allTeams, navigation }: Props) {
  const [tab, setTab] = useState<Tab>('matches');
  const [favMatchIds, setFavMatchIds] = useState<string[]>([]);
  const [favTeamIds, setFavTeamIds] = useState<string[]>([]);

  const reload = async () => {
    const [m, t] = await Promise.all([getFavMatches(), getFavTeams()]);
    setFavMatchIds(m);
    setFavTeamIds(t);
  };

  useFocusEffect(useCallback(() => { reload(); }, []));

  const favMatches = allMatches.filter(m => favMatchIds.includes(m.id));
  const favTeams = allTeams.filter(t => favTeamIds.includes(t.id));

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }} edges={['top', 'bottom']}>
      <Header
        title="Favourites"
        showBack={true}
        onBackPress={() => navigation?.goBack()}
      />
      <ScrollView style={{ flex: 1, backgroundColor: C.bg }} showsVerticalScrollIndicator={false}>
      {/* Tabs */}
      <View style={s.tabRow}>
        {(['matches', 'teams'] as Tab[]).map(t => (
          <TouchableOpacity
            key={t}
            style={[s.tabBtn, tab === t && { backgroundColor: C.accent }]}
            onPress={() => setTab(t)}
          >
            <Text style={[s.tabText, tab === t && { color: C.bg }]}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={{ padding: 16 }}>
        {tab === 'matches' && (
          favMatches.length === 0
            ? <EmptyState title="No favourite matches" description="Tap ☆ on a match to save it here" />
            : favMatches.map(m => (
              <MatchCard
                key={m.id} match={m}
                isFavourite
                onToggleFavourite={() => { onToggleFavourite(m.id); reload(); }}
                onPress={() => onNavigate('match-details', m)}
              />
            ))
        )}

        {tab === 'teams' && (
          favTeams.length === 0
            ? <EmptyState title="No favourite teams" description="Tap ☆ on a team to save it here" />
            : favTeams.map(t => (
              <View key={t.id} style={s.teamRow}>
                <Text style={s.teamName}>{t.name}</Text>
                <Text style={s.teamSub}>{t.country}</Text>
                <TouchableOpacity onPress={async () => { await toggleFavTeam(t.id); reload(); }}>
                  <Text style={s.removeText}>Remove</Text>
                </TouchableOpacity>
              </View>
            ))
        )}

        <View style={{ height: 32 }} />
      </View>
    </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  tabRow: {
    flexDirection: 'row', gap: 10, padding: 16,
    borderBottomWidth: 1, borderBottomColor: C.border,
  },
  tabBtn: { flex: 1, paddingVertical: 10, borderRadius: 12, backgroundColor: C.card, alignItems: 'center', borderWidth: 1, borderColor: C.border },
  tabText: { color: C.textSecondary, fontSize: 14, fontWeight: '600' },
  teamRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: C.card, borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: C.border, marginBottom: 8,
  },
  teamName: { flex: 1, color: C.textPrimary, fontSize: 15, fontWeight: '600' },
  teamSub: { color: C.textSecondary, fontSize: 12, marginRight: 12 },
  removeText: { color: C.red, fontSize: 13, fontWeight: '600' },
});
