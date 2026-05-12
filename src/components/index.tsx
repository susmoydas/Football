import React from 'react';
import {
  View, Text, TouchableOpacity, Image, ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { ArrowLeft01Icon, StarIcon } from '@hugeicons/core-free-icons';
import { C, Match, Team, Standing, NewsArticle } from '../types';

// ─── TeamBadge ────────────────────────────────────────────────────────────────

export function TeamBadge({ uri, size = 40, emoji = '⚽' }: { uri?: string; size?: number; emoji?: string }) {
  const [error, setError] = React.useState(false);

  if (uri && !uri.startsWith('http') && !uri.startsWith('file') && !uri.startsWith('data:')) {
    return (
      <View style={{
        width: size, height: size, borderRadius: size / 2,
        backgroundColor: C.cardAlt, alignItems: 'center', justifyContent: 'center',
      }}>
        <Text style={{ fontSize: size * 0.5 }}>{uri}</Text>
      </View>
    );
  }

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

// ─── StatusBadge ──────────────────────────────────────────────────────────────

export function StatusBadge({ status, progress }: { status: Match['status']; progress?: string }) {
  if (status === 'live') {
    return (
      <View style={s.badgeLive}>
        <View style={s.badgeLiveDot} />
        <Text style={s.badgeLiveText}>LIVE{progress ? ` ${progress}'` : ''}</Text>
      </View>
    );
  }
  if (status === 'finished') {
    return (
      <View style={s.badgeFinished}>
        <Text style={s.badgeFinishedText}>FINISHED</Text>
      </View>
    );
  }
  return (
    <View style={s.badgeUpcoming}>
      <Text style={s.badgeUpcomingText}>UPCOMING</Text>
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
          <StatusBadge status={match.status} progress={match.progress} />
          {!isLive && !isFinished && match.time && (
            <Text style={s.timeText}>{match.time}</Text>
          )}
          <TouchableOpacity onPress={onToggleFavourite} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <HugeiconsIcon icon={StarIcon} size={16} color={isFavourite ? '#FFD700' : C.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Teams + scores inline */}
      <View style={s.teamsBlock}>
        <View style={s.teamRow}>
          <TeamBadge uri={match.homeBadge} size={28} />
          <Text style={s.teamNameText} numberOfLines={1}>{match.homeTeam}</Text>
          <View style={s.scoreBlock}>
            {isLive || isFinished ? (
              <Text style={[s.scoreText, isLive && { color: C.accent }]}>{match.homeScore ?? 0}</Text>
            ) : null}
          </View>
        </View>
        <View style={s.vsDivider}>
          <View style={s.vsLine} />
          {!isLive && !isFinished ? <Text style={s.vsText}>{match.time || 'vs'}</Text> : <Text style={s.vsText}>vs</Text>}
          <View style={s.vsLine} />
        </View>
        <View style={s.teamRow}>
          <TeamBadge uri={match.awayBadge} size={28} />
          <Text style={s.teamNameText} numberOfLines={1}>{match.awayTeam}</Text>
          <View style={s.scoreBlock}>
            {isLive || isFinished ? (
              <Text style={[s.scoreText, isLive && { color: C.accent }]}>{match.awayScore ?? 0}</Text>
            ) : null}
          </View>
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
          <HugeiconsIcon icon={StarIcon} size={16} color={isFavourite ? '#FFD700' : C.textSecondary} />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  }
  return (
    <TouchableOpacity style={s.teamCardGrid} onPress={onPress} activeOpacity={0.8}>
      <TouchableOpacity style={s.teamCardFavBtn} onPress={onToggleFavourite}>
        <HugeiconsIcon icon={StarIcon} size={14} color={isFavourite ? '#FFD700' : '#FFFFFF'} />
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

// ─── WorldCupBanner ──────────────────────────────────────────────────────────

interface BannerProps {
  leagueName: string;
  onViewFixtures: () => void;
}

export function WorldCupBanner({ leagueName, onViewFixtures }: BannerProps) {
  return (
    <LinearGradient
      colors={['#0F2B3D', '#1A3F54', '#0D2137']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={s.banner}
    >
      {/* Decorative circles */}
      <View style={s.bannerCircle1} />
      <View style={s.bannerCircle2} />
      <View style={s.bannerCircle3} />

      {/* Flag decorations */}
      <Text style={s.bannerFlags} numberOfLines={1}>
        🇺🇸🇨🇦🇲🇽🇺🇸🇨🇦🇲🇽
      </Text>

      <View style={s.bannerContent}>
        <Text style={s.bannerGreeting}>Welcome back</Text>
        <Text style={s.bannerTitle}>🏆 FIFA World Cup 2026</Text>
        <Text style={s.bannerSub}>{leagueName}</Text>
        <Text style={s.bannerInfo}>Live scores, fixtures & football updates</Text>
        <TouchableOpacity style={s.bannerBtn} onPress={onViewFixtures}>
          <Text style={s.bannerBtnText}>View Fixtures</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

// ─── NewsFeedCard ─────────────────────────────────────────────────────────────

export function NewsFeedCard({ article, onPress }: { article: NewsArticle; featured?: boolean; onPress?: () => void }) {
  const [imgError, setImgError] = React.useState(false);
  return (
    <TouchableOpacity style={s.newsCard} activeOpacity={0.8} onPress={onPress}>
      <View style={s.newsImage}>
        {article.image && !imgError ? (
          <Image source={{ uri: article.image }} style={{ width: '100%', aspectRatio: 16 / 9 }} resizeMode="cover" onError={() => setImgError(true)} />
        ) : (
          <Text style={{ fontSize: 40 }}>📰</Text>
        )}
      </View>
      <View style={s.newsBody}>
        <Text style={s.newsTitle} numberOfLines={2}>{article.title}</Text>
        <View style={s.newsMeta}>
          <Text style={s.newsSource}>{article.source}</Text>
          <Text style={s.newsDot}>•</Text>
          <Text style={s.newsTime}>{article.time}</Text>
        </View>
        <Text style={s.newsReadMore}>Read more →</Text>
      </View>
    </TouchableOpacity>
  );
}

// ─── NewsCard (legacy) ────────────────────────────────────────────────────────

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
    icon: React.ReactNode;
    onPress: () => void;
  };
}

export function Header({ title, showBack, onBackPress, rightAction }: HeaderProps) {
  return (
    <View style={s.headerContainer}>
      <View style={s.headerLeft}>
        {showBack && (
          <TouchableOpacity style={s.backBtn} onPress={onBackPress} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <View style={s.backCircle}>
              <HugeiconsIcon icon={ArrowLeft01Icon} size={16} color={C.textPrimary} />
            </View>
          </TouchableOpacity>
        )}
        <Text style={s.headerTitle} numberOfLines={1}>{title}</Text>
      </View>
      <View style={s.headerRight}>
        {rightAction && (
          <TouchableOpacity style={s.headerIconBtn} onPress={rightAction.onPress} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            {rightAction.icon}
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
  matchCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  matchCardTopRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  leagueText: { color: C.textSecondary, fontSize: 11, flex: 1, fontWeight: '500' },
  timeText: { color: C.textSecondary, fontSize: 12, fontWeight: '600' },

  // StatusBadge
  badgeLive: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: C.accent + '20', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10,
  },
  badgeLiveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: C.accent },
  badgeLiveText: { color: C.accent, fontSize: 11, fontWeight: '800' },
  badgeFinished: {
    backgroundColor: C.red + '20', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10,
  },
  badgeFinishedText: { color: C.red, fontSize: 11, fontWeight: '800' },
  badgeUpcoming: {
    backgroundColor: C.textSecondary + '20', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10,
  },
  badgeUpcomingText: { color: C.textSecondary, fontSize: 11, fontWeight: '800' },

  teamsBlock: { gap: 4, marginTop: 4 },
  teamRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  teamNameText: { color: C.textPrimary, fontSize: 14, fontWeight: '500', flex: 1 },
  scoreBlock: { minWidth: 28, alignItems: 'flex-end' },
  scoreText: { color: C.textPrimary, fontSize: 20, fontWeight: '700' },
  vsDivider: {
    flexDirection: 'row', alignItems: 'center', marginVertical: 2,
    paddingLeft: 36,
  },
  vsLine: { flex: 1, height: 1, backgroundColor: C.border },
  vsText: { color: C.textSecondary, fontSize: 10, marginHorizontal: 8, fontWeight: '600' },
  matchCardFooter: { marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: C.border },
  ftLabel: { color: C.textSecondary, fontSize: 11, fontWeight: '500' },

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

  // Banner
  banner: {
    borderRadius: 24,
    padding: 20,
    paddingTop: 28,
    marginBottom: 20,
    overflow: 'hidden',
    position: 'relative',
  },
  bannerCircle1: {
    position: 'absolute', width: 160, height: 160, borderRadius: 80,
    backgroundColor: C.accent + '20', top: -60, right: -40,
  },
  bannerCircle2: {
    position: 'absolute', width: 100, height: 100, borderRadius: 50,
    backgroundColor: '#FFD16615', bottom: -30, left: -20,
  },
  bannerCircle3: {
    position: 'absolute', width: 60, height: 60, borderRadius: 30,
    backgroundColor: C.red + '15', top: 20, left: '60%',
  },
  bannerFlags: { fontSize: 18, letterSpacing: 4, marginBottom: 8, opacity: 0.6 },
  bannerContent: { position: 'relative', zIndex: 1 },
  bannerGreeting: { color: C.textSecondary, fontSize: 13, marginBottom: 2 },
  bannerTitle: { color: '#FFFFFF', fontSize: 22, fontWeight: '800', marginBottom: 4 },
  bannerSub: { color: C.accent, fontSize: 14, fontWeight: '600', marginBottom: 2 },
  bannerInfo: { color: C.textSecondary, fontSize: 12, marginBottom: 16 },
  bannerBtn: {
    backgroundColor: C.accent, paddingHorizontal: 24, paddingVertical: 10,
    borderRadius: 24, alignSelf: 'flex-start',
  },
  bannerBtnText: { color: C.bg, fontSize: 13, fontWeight: '800' },

  // News
  newsCard: {
    backgroundColor: C.card, borderRadius: 16, borderWidth: 1, borderColor: C.border,
    overflow: 'hidden', marginBottom: 12,
  },
  newsImage: { backgroundColor: C.cardAlt, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  newsBody: { padding: 14 },
  newsTitle: { color: C.textPrimary, fontSize: 14, fontWeight: '600', marginBottom: 6 },
  newsMeta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  newsSource: { color: C.accent, fontSize: 12, fontWeight: '600' },
  newsDot: { color: C.textSecondary, fontSize: 12 },
  newsTime: { color: C.textSecondary, fontSize: 12 },
  newsReadMore: { color: C.accent, fontSize: 12, marginTop: 8, fontWeight: '500' },

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

  // Pill
  pill: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: C.card },
  pillText: { color: C.textSecondary, fontSize: 13, fontWeight: '600' },

  // Header
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 2,
    backgroundColor: C.bg,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  headerTitle: {
    color: C.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
  },
  backBtn: {
    padding: 2,
    marginRight: 2,
  },
  backCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: C.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: C.border,
  },
  headerRight: {
    flexDirection: 'row',
    gap: 8,
  },
  headerIconBtn: {
    padding: 4,
  },
});
