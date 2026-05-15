import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Platform, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { Calendar03Icon, Clock01Icon, MapPinIcon, ChampionIcon, ChartAverageIcon, FootballIcon, ClipboardIcon } from '@hugeicons/core-free-icons';
import { C, LineupPlayer, Match, Screen, LineupResponse } from '../types';
import { fetchEvent, fetchLineup } from '../services/api';
import { TeamBadge, StatBar, LoadingSpinner, Header } from '../components';

interface Props {
  onNavigate?: (screen: Screen) => void;
  matchData: Match;
  navigation?: any;
}

type Tab = 'summary' | 'stats' | 'events' | 'lineups';

const getPlayerColor = (name: string) => {
  const colors = ['#0D9F68', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
};

const getPlayerInitials = (name: string) => {
  const parts = name.trim().split(' ');
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.substring(0, 2).toUpperCase();
};

const positionLabel = (pos: string) => {
  const map: Record<string, string> = { G: 'Goalkeeper', D: 'Defender', M: 'Midfielder', F: 'Forward' };
  return map[pos] || pos;
};

const parseFormation = (formation: string): number[] =>
  formation
    .split('-')
    .map((part) => parseInt(part.trim(), 10))
    .filter((n) => !Number.isNaN(n) && n > 0);

const buildFormationRows = (players: LineupPlayer[], formation: string): LineupPlayer[][] => {
  const formationNumbers = parseFormation(formation);
  const starters = players.slice(0, 11);
  if (starters.length === 0) return [];

  const rows: LineupPlayer[][] = [];
  rows.push([starters[0]]);

  let remaining = starters.slice(1);
  if (formationNumbers.length === 0) {
    rows.push(remaining);
    return rows;
  }

  for (const count of formationNumbers) {
    rows.push(remaining.slice(0, count));
    remaining = remaining.slice(count);
  }

  if (remaining.length > 0) {
    rows.push(remaining);
  }

  return rows;
};

const PLAYER_IMG_BASE = 'https://sports.bzzoiro.com/img/player/';

function PlayerAvatar({ playerId, name, size = 40 }: { playerId: number; name: string; size?: number }) {
  const [failed, setFailed] = useState(false);
  const color = getPlayerColor(name);
  const initials = getPlayerInitials(name);
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: color, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
      {!failed ? (
        <Image
          source={{ uri: `${PLAYER_IMG_BASE}${playerId}/` }}
          style={{ width: size, height: size }}
          resizeMode="cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <Text style={{ color: '#FFFFFF', fontSize: size * 0.4, fontWeight: '700' }}>{initials}</Text>
      )}
    </View>
  );
}

export default function MatchDetailsScreen({ onNavigate, matchData, navigation }: Props) {
  const [tab, setTab] = useState<Tab>('summary');
  const [match, setMatch] = useState<Match>(matchData);
  const [selectedPlayer, setSelectedPlayer] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [lineup, setLineup] = useState<LineupResponse | null>(null);
  const [lineupLoading, setLineupLoading] = useState(false);

  useEffect(() => {
    fetchEvent(matchData.id).then(m => {
      if (m) setMatch(m);
    }).finally(() => setLoading(false));
  }, [matchData.id]);

  useEffect(() => {
    if (tab === 'lineups' && !lineup) {
      setLineupLoading(true);
      fetchLineup(matchData.id).then(setLineup).finally(() => setLineupLoading(false));
    }
  }, [tab, matchData.id, lineup]);

  const isLive = match.status === 'live';
  const isFinished = match.status === 'finished';
  const hasScore = isLive || isFinished;

  const dateStr = match.date
    ? new Date(match.date).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    : '';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }} edges={['top', 'bottom']}>
      <Header
        title="Match Details"
        showBack={true}
        onBackPress={() => navigation?.goBack()}
      />

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {/* ─── Score Hero (Card Style) ─── */}
        <View style={s.hero}>
          <View style={s.heroInner}>
            {/* Header: League + Date */}
            <View style={s.heroHeader}>
              <Text style={s.heroLeague} numberOfLines={1}>{match.league}</Text>
              <Text style={s.heroDate}>{dateStr}</Text>
            </View>

            {/* Main row: [Home Logo] [Score] [Away Logo] */}
            <View style={s.heroMain}>
              <View style={s.heroTeam}>
                <TeamBadge uri={match.homeBadge} size={64} name={match.homeTeam} />
                <Text style={s.heroTeamName} numberOfLines={2}>{match.homeTeam}</Text>
              </View>

              <View style={s.heroScoreWrap}>
                {hasScore ? (
                  <View style={s.scoreRow}>
                    <Text style={[s.heroScore, isLive && { color: C.red }]}>
                      {match.homeScore != null ? match.homeScore : '-'}
                    </Text>
                    <Text style={s.scoreSep}>:</Text>
                    <Text style={[s.heroScore, isLive && { color: C.red }]}>
                      {match.awayScore != null ? match.awayScore : '-'}
                    </Text>
                  </View>
                ) : (
                  <Text style={s.heroTime}>{match.time}</Text>
                )}
              </View>

              <View style={s.heroTeam}>
                <TeamBadge uri={match.awayBadge} size={64} name={match.awayTeam} />
                <Text style={s.heroTeamName} numberOfLines={2}>{match.awayTeam}</Text>
              </View>
            </View>

            {/* Status row */}
            <View style={s.statusWrap}>
              {isLive && <View style={s.statusDotGreen} />}
              <Text style={[s.statusText, isLive && { color: '#22C55E', fontWeight: '800' }]}>
                {isLive
                  ? (match.progress ? `LIVE ${match.progress}'` : 'LIVE')
                  : isFinished
                  ? 'Full Time'
                  : 'UPCOMING'}
              </Text>
            </View>
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
                  { icon: Calendar03Icon, label: 'Date', value: dateStr },
                  { icon: Clock01Icon, label: 'Kick-off', value: match.time ? `${match.time} (local)` : 'TBC' },
                  { icon: MapPinIcon, label: 'Venue', value: match.venue || 'TBC' },
                  { icon: ChampionIcon, label: 'Competition', value: match.league },
                ].map((item, i) => item.value ? (
                  <View key={item.label} style={[s.infoRow, i < 3 && s.infoRowBorder]}>
                    <View style={s.infoIcon}>
                      <HugeiconsIcon icon={item.icon} size={22} color={C.accent} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={s.infoLabel}>{item.label}</Text>
                      <Text style={s.infoValue}>{item.value}</Text>
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
                  <HugeiconsIcon icon={ChartAverageIcon} size={30} color={C.textSecondary} />
                  <Text style={s.emptyText}>Stats available after kick-off</Text>
                </View>
              )}
            </View>
          )}

          {/* ── Events ── */}
          {tab === 'events' && (
            <View style={{ gap: 8 }}>
              {hasScore ? (
                (() => {
                  const rawEvents = [
                    { time: "23'", type: 'goal', team: 'home', player: 'Player Name' },
                    { time: "35'", type: 'yellow', team: 'away', player: 'Player Name' },
                    { time: "56'", type: 'goal', team: 'home', player: 'Player Name' },
                    { time: "72'", type: 'goal', team: 'away', player: 'Player Name' },
                  ];
                  let homeCount = 0, awayCount = 0;
                  return rawEvents.map((e, i) => {
                    if (e.type === 'goal') {
                      if (e.team === 'home') homeCount++;
                      else awayCount++;
                    }
                    const score = `${homeCount} - ${awayCount}`;
                    const teamName = e.team === 'home' ? match.homeTeam : match.awayTeam;
                    const teamBadge = e.team === 'home' ? match.homeBadge : match.awayBadge;
                    return (
                      <View key={i} style={s.eventCard}>
                        <View style={s.eventMinuteCol}>
                          <View style={s.eventMinuteBox}>
                            <Text style={s.eventMinuteText}>{e.time}</Text>
                          </View>
                          {e.type === 'goal' && (
                            <Text style={s.eventScoreText}>{score}</Text>
                          )}
                        </View>
                        <View style={s.eventIconCol}>
                          {e.type === 'goal' ? (
                            <View style={s.goalIconCircle}>
                              <HugeiconsIcon icon={FootballIcon} size={14} color="#000" />
                            </View>
                          ) : (
                            <View style={s.yellowCardBox} />
                          )}
                        </View>
                        <View style={s.eventInfoCol}>
                          <Text style={s.eventTitle}>{e.type === 'goal' ? 'Goal' : 'Yellow Card'}</Text>
                          <Text style={s.eventPlayer}>{e.player}</Text>
                        </View>
                        <View style={s.eventTeamCol}>
                          <TeamBadge uri={teamBadge} size={28} name={teamName} />
                          <Text style={s.eventTeamName} numberOfLines={1}>{teamName}</Text>
                        </View>
                      </View>
                    );
                  });
                })()
              ) : (
                <View style={s.card}>
                  <View style={s.emptyState}>
                    <HugeiconsIcon icon={ClipboardIcon} size={30} color={C.textSecondary} />
                    <Text style={s.emptyText}>Events available after kick-off</Text>
                  </View>
                </View>
              )}
            </View>
          )}

          {/* ── Lineups ── */}
          {tab === 'lineups' && (
            <View style={{ gap: 12 }}>
              {lineupLoading ? (
                <View style={s.card}><LoadingSpinner /></View>
              ) : !lineup ? (
                <View style={s.card}>
                  <View style={s.emptyState}>
                    <HugeiconsIcon icon={ClipboardIcon} size={30} color={C.textSecondary} />
                    <Text style={s.emptyText}>Lineups not yet available</Text>
                  </View>
                </View>
              ) : (
                [lineup.lineups.home, lineup.lineups.away].map(team => {
                  const teamBadge = team.team_id === Number(match.homeTeamId) ? match.homeBadge : match.awayBadge;
                  return (
                    <View key={team.team_id} style={s.card}>
                      <View style={s.lineupHeader}>
                        <TeamBadge uri={teamBadge} size={32} />
                        <Text style={s.lineupTeamName}>{team.team_name}</Text>
                        <View style={s.formationBadge}>
                          <Text style={s.formationText}>{team.formation}</Text>
                        </View>
                      </View>
                      <ScrollView
                        style={{ maxHeight: 420 }}
                        showsVerticalScrollIndicator={false}
                        nestedScrollEnabled
                      >
                        <View style={s.formationField}>
                          <LinearGradient
                            colors={['#1a5c2a', '#2d8a3e', '#1a5c2a']}
                            style={StyleSheet.absoluteFill}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 0, y: 1 }}
                          />
                          {buildFormationRows(team.players, team.formation).map((row, rowIndex) => (
                            <View
                              key={`${team.team_id}-${rowIndex}`}
                              style={[s.formationRow, row.length === 1 && s.formationRowCentered]}
                            >
                              {row.map((player) => (
                                <TouchableOpacity
                                  key={player.id}
                                  style={[
                                    s.playerSpot,
                                    selectedPlayer === player.id && s.playerSpotSelected,
                                  ]}
                                  activeOpacity={0.8}
                                  onPress={() => setSelectedPlayer(selectedPlayer === player.id ? null : player.id)}
                                >
                                  <PlayerAvatar playerId={player.id} name={player.name} size={48} />
                                  <Text style={s.playerNumber}>{player.jersey_number ? `#${player.jersey_number}` : ''}</Text>
                                  <Text style={s.playerNameSmall} numberOfLines={1}>{player.short_name}</Text>
                                  <Text style={s.playerPositionSmall}>{positionLabel(player.position)}</Text>
                                  {player.card && (
                                    <View style={[
                                      s.cardStatus,
                                      player.card === 'red' ? s.cardStatusRed : s.cardStatusYellow,
                                    ]}>
                                      <Text style={s.cardStatusText}>{player.card === 'red' ? 'R' : 'Y'}</Text>
                                    </View>
                                  )}
                                </TouchableOpacity>
                              ))}
                            </View>
                          ))}
                        </View>

                        {team.substitutes.length > 0 && (
                          <>
                            <View style={s.subsHeader}>
                              <Text style={s.subsHeaderText}>Substitutes</Text>
                            </View>
                            {team.substitutes.map((p, i) => (
                              <TouchableOpacity
                                key={p.id}
                                style={[
                                  s.playerRow,
                                  i < team.substitutes.length - 1 && s.playerRowBorder,
                                  selectedPlayer === p.id && s.playerRowSelected,
                                ]}
                                activeOpacity={0.7}
                                onPress={() => setSelectedPlayer(selectedPlayer === p.id ? null : p.id)}
                              >
                                <PlayerAvatar playerId={p.id} name={p.name} size={36} />

                                <View style={s.playerInfo}>
                                  <Text style={s.playerName}>{p.short_name}</Text>
                                  <Text style={s.playerPosition}>{positionLabel(p.position)}{p.jersey_number ? ` · #${p.jersey_number}` : ''}</Text>
                                </View>
                              </TouchableOpacity>
                            ))}
                          </>
                        )}
                      </ScrollView>
                    </View>
                  );})
              )}
            </View>
          )}
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  hero: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    backgroundColor: C.bg,
  },
  heroInner: {
    backgroundColor: C.card,
    borderRadius: 16,
    padding: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  heroLeague: {
    color: C.textSecondary,
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    flex: 1,
  },
  heroDate: {
    color: C.textSecondary,
    fontSize: 13,
    fontWeight: '500',
  },
  heroMain: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroTeam: {
    flex: 1,
    alignItems: 'center',
    gap: 10,
  },
  heroTeamName: {
    color: C.textPrimary,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 18,
  },
  heroScoreWrap: {
    alignItems: 'center',
    paddingHorizontal: 8,
    minWidth: 100,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  heroScore: {
    color: C.textPrimary,
    fontSize: 36,
    fontWeight: '800',
    letterSpacing: 1,
  },
  scoreSep: {
    color: C.textSecondary,
    fontSize: 20,
    fontWeight: '700',
  },
  heroTime: {
    color: C.textPrimary,
    fontSize: 20,
    fontWeight: '700',
  },
  statusWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: C.border,
  },
  statusDotGreen: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#22C55E',
  },
  statusText: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1,
    color: C.textSecondary,
    textTransform: 'uppercase',
  },
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
    fontSize: 15,
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
  card: {
    backgroundColor: C.card,
    borderRadius: 16,
    padding: 16,
  },
  cardTitle: {
    color: C.textPrimary,
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 14,
  },
  cardBody: {
    padding: 0,
  },
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
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: C.cardAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoLabel: {
    color: C.textSecondary,
    fontSize: 14,
    marginBottom: 2,
    fontWeight: '500',
  },
  infoValue: {
    color: C.textPrimary,
    fontSize: 17,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: C.border,
    marginVertical: 0,
  },
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
    fontSize: 15,
    textAlign: 'center',
  },
  // ── Event Card ──
  eventCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.card,
    borderRadius: 14,
    padding: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  eventMinuteCol: {
    alignItems: 'center',
    marginRight: 10,
  },
  eventMinuteBox: {
    backgroundColor: C.border,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  eventMinuteText: {
    color: C.textSecondary,
    fontSize: 13,
    fontWeight: '700',
  },
  eventScoreText: {
    color: C.textSecondary,
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
  },
  eventIconCol: {
    marginRight: 10,
  },
  goalIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#22C55E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  yellowCardBox: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: '#FFD166',
  },
  eventInfoCol: {
    flex: 1,
  },
  eventTitle: {
    color: C.textPrimary,
    fontSize: 15,
    fontWeight: '700',
  },
  eventPlayer: {
    color: C.textSecondary,
    fontSize: 13,
    marginTop: 2,
  },
  eventTeamCol: {
    alignItems: 'center',
    marginLeft: 8,
    maxWidth: 80,
  },
  eventTeamName: {
    color: C.textSecondary,
    fontSize: 10,
    fontWeight: '500',
    marginTop: 3,
    textAlign: 'center',
  },
  lineupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  lineupTeamName: {
    color: C.textPrimary,
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
  },
  formationBadge: {
    backgroundColor: C.cardAlt,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  formationText: {
    color: C.accent,
    fontSize: 13,
    fontWeight: '700',
  },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 4,
    gap: 12,
  },
  playerRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  playerRowSelected: {
    backgroundColor: C.accent + '18',
    borderRadius: 10,
    marginHorizontal: -4,
    paddingHorizontal: 8,
  },
  playerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playerAvatarText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    color: C.textPrimary,
    fontSize: 15,
    fontWeight: '700',
  },
  playerPosition: {
    color: C.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  formationField: {
    borderRadius: 18,
    paddingVertical: 18,
    paddingHorizontal: 12,
    marginBottom: 14,
    overflow: 'hidden',
    position: 'relative',
  },
  formationRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    marginBottom: 18,
  },
  formationRowCentered: {
    justifyContent: 'center',
  },
  playerSpot: {
    width: 92,
    alignItems: 'center',
    paddingHorizontal: 4,
    paddingVertical: 6,
    borderRadius: 16,
  },
  playerSpotSelected: {
    backgroundColor: C.accent + '22',
  },
  playerNumber: {
    color: C.accent,
    fontSize: 12,
    fontWeight: '700',
    marginTop: 6,
  },
  playerNameSmall: {
    color: C.textPrimary,
    fontSize: 13,
    fontWeight: '700',
    marginTop: 6,
    textAlign: 'center',
  },
  playerPositionSmall: {
    color: C.textSecondary,
    fontSize: 11,
    marginTop: 2,
    textAlign: 'center',
  },
  cardStatus: {
    marginTop: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 999,
  },
  cardStatusText: {
    color: '#000',
    fontSize: 12,
    fontWeight: '800',
  },
  cardStatusYellow: {
    backgroundColor: '#FFD166',
  },
  cardStatusRed: {
    backgroundColor: C.red,
  },
  scoreBox: {
    alignItems: 'flex-end',
  },
  playerScore: {
    fontSize: 16,
    fontWeight: '800',
  },
  startsText: {
    color: C.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
  subsHeader: {
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderTopWidth: 1,
    borderTopColor: C.border,
    marginTop: 4,
  },
  subsHeaderText: {
    color: C.textSecondary,
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
