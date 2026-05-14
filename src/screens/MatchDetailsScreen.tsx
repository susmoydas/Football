import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { StarIcon } from '@hugeicons/core-free-icons';
import { C, Match, Screen } from '../types';
import { fetchEvent } from '../services/api';
import { TeamBadge, StatBar, LoadingSpinner, Header } from '../components';

interface Props {
  onNavigate?: (screen: Screen) => void;
  matchData: Match;
  favourites: Set<string>;
  onToggleFavourite: (id: string) => void;
  navigation?: any;
}

type Tab = 'summary' | 'stats' | 'events' | 'lineups';

export default function MatchDetailsScreen({ onNavigate, matchData, favourites, onToggleFavourite, navigation }: Props) {
  const [tab, setTab] = useState<Tab>('summary');
  const [match, setMatch] = useState<Match>(matchData);
  const [loading, setLoading] = useState(true);
  const isFav = favourites.has(match.id);

  useEffect(() => {
    fetchEvent(matchData.id).then(m => {
      if (m) setMatch(m);
    }).finally(() => setLoading(false));
  }, [matchData.id]);

  const isLive = match.status === 'live';
  const isFinished = match.status === 'finished';
  const hasScore = isLive || isFinished;

  const dateStr = match.date
    ? new Date(match.date).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    : '';

  const statusColor = isLive ? C.red : isFinished ? C.textSecondary : C.accent;
  const statusLabel = isLive
    ? (match.progress ? `LIVE ${match.progress}'` : 'LIVE')
    : isFinished
    ? 'Full Time'
    : match.time;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }} edges={['top', 'bottom']}>
      <Header
        title={`${match.homeTeam} vs ${match.awayTeam}`}
        showBack={true}
        onBackPress={() => navigation?.goBack()}
        rightAction={{
          icon: <HugeiconsIcon icon={StarIcon} size={18} color={isFav ? '#FFD700' : C.textSecondary} />,
          onPress: () => onToggleFavourite(match.id),
        }}
      />

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {/* ─── Score Hero ─── */}
        <View style={s.hero}>
          <Text style={s.heroLeague}>{match.league}</Text>
          <View style={s.heroMain}>
            <View style={s.heroTeam}>
              <TeamBadge uri={match.homeBadge} size={64} />
              <Text style={s.heroTeamName} numberOfLines={2}>{match.homeTeam}</Text>
            </View>
            <View style={s.heroScoreWrap}>
              {hasScore ? (
                <Text style={s.heroScore}>{match.homeScore != null ? match.homeScore : '-'} – {match.awayScore != null ? match.awayScore : '-'}</Text>
              ) : (
                <Text style={s.heroTime}>{match.time}</Text>
              )}
            </View>
            <View style={s.heroTeam}>
              <TeamBadge uri={match.awayBadge} size={64} />
              <Text style={s.heroTeamName} numberOfLines={2}>{match.awayTeam}</Text>
            </View>
          </View>
          <View style={[s.statusBadge, { backgroundColor: statusColor + '18' }]}>
            {isLive && <View style={[s.statusDot, { backgroundColor: statusColor }]} />}
            <Text style={[s.statusText, { color: statusColor }]}>{statusLabel}</Text>
          </View>
        </View>

        {/* ─── Tabs ─── */}
        <View style={s.tabs}>
          {(['summary', 'stats', 'events', 'lineups'] as Tab[]).map(t => (
            <TouchableOpacity key={t} style={s.tab} onPress={() => setTab(t)} activeOpacity={0.7}>
              <Text style={[s.tabText, tab === t && s.tabTextActive]}>{t.charAt(0).toUpperCase() + t.slice(1)}</Text>
              {tab === t && <View style={s.tabIndicator} />}
            </TouchableOpacity>
          ))}
        </View>

        {/* ─── Tab Content ─── */}
        <View style={{ padding: 16 }}>
          {/* ── Summary ── */}
          {tab === 'summary' && (
            <View style={s.card}>
              <Text style={s.cardTitle}>Match Information</Text>
              <View style={s.cardBody}>
                {[
                  ['📅', 'Date', dateStr],
                  ['🕐', 'Kick-off', match.time ? `${match.time} (local)` : 'TBC'],
                  ['🏟️', 'Venue', match.venue || 'TBC'],
                  ['🏆', 'Competition', match.league],
                ].map(([icon, label, value], i) => value ? (
                  <View key={label} style={[s.infoRow, i < 3 && s.infoRowBorder]}>
                    <View style={s.infoIcon}>
                      <Text style={{ fontSize: 15 }}>{icon}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={s.infoLabel}>{label}</Text>
                      <Text style={s.infoValue}>{value}</Text>
                    </View>
                  </View>
                ) : null)}
              </View>
            </View>
          )}

          {/* ── Stats ── */}
          {tab === 'stats' && (
            <View style={s.card}>
              <Text style={s.cardTitle}>Match Statistics</Text>
              {hasScore ? (
                <View style={s.cardBody}>
                  <StatBar label="Possession" home={58} away={42} />
                  <View style={s.divider} />
                  <StatBar label="Shots" home={12} away={8} />
                  <View style={s.divider} />
                  <StatBar label="Shots on Target" home={5} away={3} />
                  <View style={s.divider} />
                  <StatBar label="Corners" home={6} away={4} />
                  <View style={s.divider} />
                  <StatBar label="Fouls" home={11} away={14} />
                  <View style={s.divider} />
                  <StatBar label="Yellow Cards" home={2} away={3} />
                </View>
              ) : (
                <View style={s.emptyState}>
                  <Text style={s.emptyIcon}>📊</Text>
                  <Text style={s.emptyText}>Stats available after kick-off</Text>
                </View>
              )}
            </View>
          )}

          {/* ── Events ── */}
          {tab === 'events' && (
            <View style={s.card}>
              <Text style={s.cardTitle}>Match Events</Text>
              {hasScore ? (
                <View style={s.timeline}>
                  {[
                    { time: "23'", type: 'goal', team: 'home', player: 'Player Name' },
                    { time: "35'", type: 'yellow', team: 'away', player: 'Player Name' },
                    { time: "56'", type: 'goal', team: 'home', player: 'Player Name' },
                    { time: "72'", type: 'goal', team: 'away', player: 'Player Name' },
                  ].map((e, i) => {
                    const isHome = e.team === 'home';
                    const isGoal = e.type === 'goal';
                    return (
                      <View key={i} style={s.eventRow}>
                        <View style={s.eventTimeCol}>
                          <Text style={s.eventTime}>{e.time}</Text>
                        </View>
                        <View style={s.eventLineCol}>
                          <View style={[s.eventDot, { backgroundColor: isGoal ? C.gold : C.red }]}>
                            <Text style={{ fontSize: 10 }}>{isGoal ? '⚽' : '🟨'}</Text>
                          </View>
                          {i < 3 && <View style={s.eventLine} />}
                        </View>
                        <View style={s.eventInfoCol}>
                          <Text style={s.eventLabel}>{isGoal ? 'Goal' : 'Yellow Card'}</Text>
                          <Text style={s.eventTeam}>{isHome ? match.homeTeam : match.awayTeam}</Text>
                        </View>
                      </View>
                    );
                  })}
                </View>
              ) : (
                <View style={s.emptyState}>
                  <Text style={s.emptyIcon}>📋</Text>
                  <Text style={s.emptyText}>Events available after kick-off</Text>
                </View>
              )}
            </View>
          )}

          {/* ── Lineups ── */}
          {tab === 'lineups' && (
            <View style={{ gap: 12 }}>
              {[{ name: match.homeTeam, badge: match.homeBadge }, { name: match.awayTeam, badge: match.awayBadge }].map(team => (
                <View key={team.name} style={s.card}>
                  <View style={s.lineupHeader}>
                    <TeamBadge uri={team.badge} size={24} />
                    <Text style={[s.cardTitle, { marginBottom: 0, flex: 1 }]}>{team.name}</Text>
                    <View style={s.formationBadge}>
                      <Text style={s.formationText}>4-4-2</Text>
                    </View>
                  </View>
                  <View style={s.cardBody}>
                    {[
                      { num: 1, pos: 'GK', name: 'Player 1' },
                      { num: 2, pos: 'DF', name: 'Player 2' },
                      { num: 3, pos: 'DF', name: 'Player 3' },
                      { num: 4, pos: 'DF', name: 'Player 4' },
                      { num: 5, pos: 'MF', name: 'Player 5' },
                    ].map((p, i) => (
                      <View key={i} style={[s.lineupRow, i < 4 && s.infoRowBorder]}>
                        <View style={s.shirtNum}>
                          <Text style={s.shirtNumText}>{p.num}</Text>
                        </View>
                        <Text style={s.lineupPos}>{p.pos}</Text>
                        <Text style={s.lineupName}>{p.name}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  // ─── Hero ───
  hero: {
    alignItems: 'center',
    paddingVertical: 28,
    paddingHorizontal: 16,
    backgroundColor: C.card,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  heroLeague: {
    color: C.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 16,
  },
  heroMain: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  heroTeam: {
    flex: 1,
    alignItems: 'center',
    gap: 10,
  },
  heroTeamName: {
    color: C.textPrimary,
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 18,
  },
  heroScoreWrap: {
    alignItems: 'center',
    paddingHorizontal: 12,
    minWidth: 100,
  },
  heroScore: {
    color: C.textPrimary,
    fontSize: 38,
    fontWeight: '800',
    letterSpacing: 2,
  },
  heroTime: {
    color: C.textSecondary,
    fontSize: 18,
    fontWeight: '600',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 16,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  // ─── Tabs ───
  tabs: {
    flexDirection: 'row',
    backgroundColor: C.bg,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    position: 'relative',
  },
  tabText: {
    color: C.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  tabTextActive: {
    color: C.accent,
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: '16%',
    right: '16%',
    height: 3,
    backgroundColor: C.accent,
    borderRadius: 2,
  },

  // ─── Card ───
  card: {
    backgroundColor: C.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: C.border,
  },
  cardTitle: {
    color: C.textPrimary,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 14,
  },
  cardBody: {
    padding: 0,
  },

  // ─── Info Row ───
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  infoRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  infoIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: C.cardAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoLabel: {
    color: C.textSecondary,
    fontSize: 11,
    marginBottom: 2,
    fontWeight: '500',
  },
  infoValue: {
    color: C.textPrimary,
    fontSize: 14,
    fontWeight: '500',
  },

  // ─── Divider ───
  divider: {
    height: 1,
    backgroundColor: C.border,
    marginVertical: 0,
  },

  // ─── Empty State ───
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 8,
  },
  emptyIcon: {
    fontSize: 28,
  },
  emptyText: {
    color: C.textSecondary,
    fontSize: 13,
    textAlign: 'center',
  },

  // ─── Events Timeline ───
  timeline: {
    paddingTop: 8,
  },
  eventRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    minHeight: 56,
  },
  eventTimeCol: {
    width: 40,
    alignItems: 'center',
    paddingTop: 10,
  },
  eventTime: {
    color: C.textSecondary,
    fontSize: 12,
    fontWeight: '700',
  },
  eventLineCol: {
    width: 32,
    alignItems: 'center',
  },
  eventDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  eventLine: {
    position: 'absolute',
    top: 28,
    width: 2,
    flex: 1,
    bottom: 0,
    backgroundColor: C.border,
  },
  eventInfoCol: {
    flex: 1,
    paddingTop: 8,
    paddingLeft: 8,
  },
  eventLabel: {
    color: C.textPrimary,
    fontSize: 13,
    fontWeight: '600',
  },
  eventTeam: {
    color: C.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },

  // ─── Lineups ───
  lineupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  formationBadge: {
    backgroundColor: C.cardAlt,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  formationText: {
    color: C.accent,
    fontSize: 11,
    fontWeight: '700',
  },
  lineupRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 10,
  },
  shirtNum: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: C.cardAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shirtNumText: {
    color: C.textPrimary,
    fontSize: 11,
    fontWeight: '700',
  },
  lineupPos: {
    color: C.textSecondary,
    fontSize: 11,
    fontWeight: '600',
    width: 28,
  },
  lineupName: {
    color: C.textPrimary,
    fontSize: 14,
  },
});
