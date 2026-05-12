import React from 'react';
import {
  View, Text, TouchableOpacity, Image, ActivityIndicator,
  StyleSheet, Dimensions,
} from 'react-native';
import { C, Match, Team, Standing } from '../types';

const { width } = Dimensions.get('window');

// ─── TeamBadge ────────────────────────────────────────────────────────────────

export function TeamBadge({ uri, size = 40, emoji = '⚽' }: { uri?: string; size?: number; emoji?: string }) {
  const [error, setError] = React.useState(false);
  if (uri && !error) {
    return (
      <Image
        source={{ uri }}
        style={{ width: size, height: size, borderRadius: size / 2 }}
        resizeMode="contain"
        onError={() => setError(true)}
      />
    );
  }
  return (
    <View style={{
      width: size, height: size, borderRadius: size / 2,
      backgroundColor: C.cardAlt, alignItems: 'center', justifyContent: 'center',
    }}>
      <Text style={{ fontSize: size * 0.45 }}>{emoji}</Text>
    </View>
  );
}

// ─── MatchCard ────────────────────────────────────────────────────────────────

interface MatchCardProps {
  match: Match;
  isFavourite?: boolean;
  onToggleFavourite?: () => void;
  onPress?: () => void;
}

export function MatchCard({ match, isFavourite, onToggleFavourite, onPress }: MatchCardProps) {
  const isLive = match.status === 'live';
  const isFinished = match.status === 'finished';

  return (
    <TouchableOpacity style={s.matchCard} onPress={onPress} activeOpacity={0.8}>
      {/* League + status row */}
      <View style={s.matchCardTop}>
        <Text style={s.leagueText} numberOfLines={1}>{match.league}</Text>
        <View style={s.matchCardTopRight}>
          {isLive && (
            <View style={s.liveBadge}>
              <View style={s.liveDot} />
              <Text style={s.liveText}>LIVE{match.progress ? ` ${match.progress}` : ''}</Text>
            </View>
          )}
          {!isLive && match.time && !isFinished && (
            <Text style={s.timeText}>{match.time}</Text>
          )}
          {isFinished && <Text style={s.ftText}>FT</Text>}
          <TouchableOpacity onPress={onToggleFavourite} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={{ fontSize: 16 }}>{isFavourite ? '⭐' : '☆'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Teams + scores */}
      <View style={s.teamsBlock}>
        {/* Home */}
        <View style={s.teamRow}>
          <View style={s.teamLeft}>
            <TeamBadge uri={match.homeBadge} size={28} />
            <Text style={s.teamNameText} numberOfLines={1}>{match.homeTeam}</Text>
          </View>
          {!isFinished && match.status !== 'live' ? null : (
            <Text style={[s.scoreText, isLive && { color: C.accent }]}>
              {match.homeScore ?? 0}
            </Text>
          )}
        </View>
        {/* Away */}
        <View style={s.teamRow}>
          <View style={s.teamLeft}>
            <TeamBadge uri={match.awayBadge} size={28} />
            <Text style={s.teamNameText} numberOfLines={1}>{match.awayTeam}</Text>
          </View>
          {!isFinished && match.status !== 'live' ? null : (
            <Text style={[s.scoreText, isLive && { color: C.accent }]}>
              {match.awayScore ?? 0}
            </Text>
          )}
        </View>
      </View>

      {isFinished && (
        <View style={s.matchCardFooter}>
          <Text style={s.ftLabel}>Full Time</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

// ─── TeamCard ─────────────────────────────────────────────────────────────────

interface TeamCardProps {
  team: Team;
  isFavourite?: boolean;
  onToggleFavourite?: () => void;
  onPress?: () => void;
  listMode?: boolean;
}

export function TeamCard({ team, isFavourite, onToggleFavourite, onPress, listMode }: TeamCardProps) {
  if (listMode) {
    return (
      <TouchableOpacity style={s.teamCardList} onPress={onPress} activeOpacity={0.8}>
        <TeamBadge uri={team.badge} size={44} />
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={s.teamCardName}>{team.name}</Text>
          <Text style={s.teamCardSub}>{team.country}</Text>
        </View>
        <TouchableOpacity onPress={onToggleFavourite} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={{ fontSize: 18 }}>{isFavourite ? '⭐' : '☆'}</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  }
  return (
    <TouchableOpacity style={s.teamCardGrid} onPress={onPress} activeOpacity={0.8}>
      <TouchableOpacity style={s.teamCardFavBtn} onPress={onToggleFavourite}>
        <Text style={{ fontSize: 14 }}>{isFavourite ? '⭐' : '☆'}</Text>
      </TouchableOpacity>
      <TeamBadge uri={team.badge} size={56} />
      <Text style={[s.teamCardName, { marginTop: 8, textAlign: 'center' }]} numberOfLines={2}>{team.name}</Text>
      <Text style={[s.teamCardSub, { textAlign: 'center' }]}>{team.country}</Text>
    </TouchableOpacity>
  );
}

// ─── StandingsTable ───────────────────────────────────────────────────────────

export function StandingsTable({ rows, qualifyCount = 4 }: { rows: Standing[]; qualifyCount?: number }) {
  return (
    <View style={s.standTable}>
      {/* Header */}
      <View style={s.standHeader}>
        <Text style={[s.standTh, { flex: 0.4 }]}>#</Text>
        <Text style={[s.standTh, { flex: 3, textAlign: 'left' }]}>Team</Text>
        <Text style={s.standTh}>P</Text>
        <Text style={s.standTh}>W</Text>
        <Text style={s.standTh}>D</Text>
        <Text style={s.standTh}>L</Text>
        <Text style={s.standTh}>GD</Text>
        <Text style={[s.standTh, { color: C.accent }]}>Pts</Text>
      </View>
      {rows.map((row, i) => (
        <View
          key={row.teamId || row.name}
          style={[
            s.standRow,
            i < qualifyCount && { borderLeftWidth: 3, borderLeftColor: C.accent },
            i % 2 === 0 && { backgroundColor: C.cardAlt },
          ]}
        >
          <Text style={[s.standTd, { flex: 0.4, color: C.textSecondary }]}>{row.position}</Text>
          <View style={[{ flex: 3, flexDirection: 'row', alignItems: 'center', gap: 6 }]}>
            {row.badge ? <TeamBadge uri={row.badge} size={20} /> : null}
            <Text style={[s.standTd, { textAlign: 'left', flex: 1 }]} numberOfLines={1}>{row.name}</Text>
          </View>
          <Text style={s.standTd}>{row.played}</Text>
          <Text style={s.standTd}>{row.won}</Text>
          <Text style={s.standTd}>{row.drawn}</Text>
          <Text style={s.standTd}>{row.lost}</Text>
          <Text style={s.standTd}>{row.goalDiff > 0 ? '+' : ''}{row.goalDiff}</Text>
          <Text style={[s.standTd, { fontWeight: 'bold', color: C.accent }]}>{row.points}</Text>
        </View>
      ))}
    </View>
  );
}

// ─── StatBar ──────────────────────────────────────────────────────────────────

export function StatBar({ label, home, away }: { label: string; home: number; away: number }) {
  const total = home + away || 1;
  return (
    <View style={{ paddingVertical: 8 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
        <Text style={{ color: C.textPrimary, fontSize: 13, fontWeight: '600' }}>{home}</Text>
        <Text style={{ color: C.textSecondary, fontSize: 12 }}>{label}</Text>
        <Text style={{ color: C.textPrimary, fontSize: 13, fontWeight: '600' }}>{away}</Text>
      </View>
      <View style={{ flexDirection: 'row', height: 6, borderRadius: 3, overflow: 'hidden', gap: 2 }}>
        <View style={{ flex: home / total, backgroundColor: C.accent, borderRadius: 3 }} />
        <View style={{ flex: away / total, backgroundColor: C.gold, borderRadius: 3 }} />
      </View>
    </View>
  );
}

// ─── NewsCard ─────────────────────────────────────────────────────────────────

export function NewsCard({ title, source, time, featured }: { title: string; source: string; time: string; featured?: boolean }) {
  return (
    <TouchableOpacity style={[s.newsCard, { marginBottom: 12 }]} activeOpacity={0.8}>
      <View style={[s.newsImage, { height: featured ? 140 : 80 }]}>
        <Text style={{ fontSize: 36 }}>📰</Text>
      </View>
      <View style={{ padding: 14 }}>
        <Text style={{ color: C.textPrimary, fontSize: featured ? 15 : 13, fontWeight: '600', marginBottom: 6 }} numberOfLines={2}>{title}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Text style={{ color: C.textSecondary, fontSize: 12 }}>{source}</Text>
          <Text style={{ color: C.textSecondary, fontSize: 12 }}>•</Text>
          <Text style={{ color: C.textSecondary, fontSize: 12 }}>{time}</Text>
        </View>
        <Text style={{ color: C.accent, fontSize: 12, marginTop: 8, fontWeight: '500' }}>Read more →</Text>
      </View>
    </TouchableOpacity>
  );
}

// ─── EmptyState ───────────────────────────────────────────────────────────────

export function EmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 60, paddingHorizontal: 32 }}>
      <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: C.cardAlt, alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
        <Text style={{ fontSize: 40 }}>⚽</Text>
      </View>
      <Text style={{ color: C.textPrimary, fontSize: 16, fontWeight: '600', marginBottom: 8, textAlign: 'center' }}>{title}</Text>
      {description && <Text style={{ color: C.textSecondary, fontSize: 13, textAlign: 'center' }}>{description}</Text>}
    </View>
  );
}

// ─── LoadingSpinner ───────────────────────────────────────────────────────────

export function LoadingSpinner({ message }: { message?: string }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: C.bg, gap: 12 }}>
      <ActivityIndicator size="large" color={C.accent} />
      {message && <Text style={{ color: C.textSecondary, fontSize: 13 }}>{message}</Text>}
    </View>
  );
}

// ─── FilterPill ───────────────────────────────────────────────────────────────

export function FilterPill({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity
      style={[s.pill, active && { backgroundColor: C.accent }]}
      onPress={onPress}
    >
      <Text style={[s.pillText, active && { color: C.bg }]}>{label}</Text>
    </TouchableOpacity>
  );
}

// ─── SectionHeader ────────────────────────────────────────────────────────────

export function SectionHeader({ title }: { title: string }) {
  return (
    <View style={{ marginBottom: 12 }}>
      <Text style={{ color: C.textPrimary, fontSize: 18, fontWeight: '700' }}>{title}</Text>
    </View>
  );
}

// ─── Header ───────────────────────────────────────────────────────────────────

interface HeaderProps {
  title: string;
  showBack?: boolean;
  onBackPress?: () => void;
  rightAction?: {
    icon: string;
    onPress: () => void;
  };
  isFavourite?: boolean;
}

export function Header({ title, showBack, onBackPress, rightAction, isFavourite }: HeaderProps) {
  return (
    <View style={s.headerContainer}>
      <View style={s.headerLeft}>
        {showBack && (
          <TouchableOpacity style={s.backBtn} onPress={onBackPress} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={{ fontSize: 24, color: C.textPrimary, lineHeight: 24 }}>‹</Text>
          </TouchableOpacity>
        )}
        <Text style={s.headerTitle} numberOfLines={1}>{title}</Text>
      </View>
      <View style={s.headerRight}>
        {rightAction && (
          <TouchableOpacity style={s.headerIconBtn} onPress={rightAction.onPress} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={{ fontSize: 18 }}>{rightAction.icon}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  // MatchCard
  matchCard: {
    backgroundColor: C.card,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: C.border,
    marginBottom: 10,
  },
  matchCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  matchCardTopRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  leagueText: { color: C.textSecondary, fontSize: 12, flex: 1 },
  liveBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: C.red },
  liveText: { color: C.red, fontSize: 12, fontWeight: '700' },
  timeText: { color: C.textSecondary, fontSize: 12 },
  ftText: { color: C.textSecondary, fontSize: 12, fontWeight: '600' },
  teamsBlock: { gap: 8 },
  teamRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  teamLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  teamNameText: { color: C.textPrimary, fontSize: 15, fontWeight: '500', flex: 1 },
  scoreText: { color: C.textPrimary, fontSize: 20, fontWeight: '700', minWidth: 28, textAlign: 'right' },
  matchCardFooter: { marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: C.border },
  ftLabel: { color: C.textSecondary, fontSize: 12 },

  // TeamCard grid
  teamCardGrid: {
    backgroundColor: C.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: 'center',
    flex: 1,
  },
  teamCardFavBtn: { position: 'absolute', top: 10, right: 10, padding: 4 },
  teamCardName: { color: C.textPrimary, fontSize: 14, fontWeight: '600' },
  teamCardSub: { color: C.textSecondary, fontSize: 12, marginTop: 2 },
  // TeamCard list
  teamCardList: {
    backgroundColor: C.card,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: C.border,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },

  // Standings
  standTable: {
    backgroundColor: C.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
    overflow: 'hidden',
  },
  standHeader: {
    flexDirection: 'row',
    backgroundColor: C.bg,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  standTh: { flex: 1, color: C.textSecondary, fontSize: 11, fontWeight: '600', textAlign: 'center' },
  standRow: { flexDirection: 'row', paddingVertical: 10, paddingHorizontal: 12, alignItems: 'center' },
  standTd: { flex: 1, color: C.textPrimary, fontSize: 12, textAlign: 'center' },

  // News
  newsCard: { backgroundColor: C.card, borderRadius: 16, borderWidth: 1, borderColor: C.border, overflow: 'hidden' },
  newsImage: { backgroundColor: C.cardAlt, alignItems: 'center', justifyContent: 'center' },

  // Pill
  pill: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: C.card },
  pillText: { color: C.textSecondary, fontSize: 13, fontWeight: '600' },

  // Header
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: C.bg,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  headerTitle: {
    color: C.textPrimary,
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
  },
  backBtn: {
    padding: 4,
    marginRight: -12,
  },
  headerRight: {
    flexDirection: 'row',
    gap: 12,
  },
  headerIconBtn: {
    padding: 8,
  },
});
