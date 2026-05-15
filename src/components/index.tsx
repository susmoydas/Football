import React, { useRef, useEffect } from 'react';
import { Image, ImageBackground, Animated, Platform } from 'react-native';

import Svg, { Path, Circle, G, Defs, ClipPath, Rect } from 'react-native-svg';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { File01Icon, ArrowRight01Icon, FootballIcon, ArrowLeft01Icon } from '@hugeicons/core-free-icons';
import { Match, Team, Standing, NewsArticle } from '../types';
import { Text } from '@/components/ui/text';
import { Heading } from '@/components/ui/heading';
import { Button, ButtonText } from '@/components/ui/button';
import { Pressable } from '@/components/ui/pressable';
import { Box } from '@/components/ui/box';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { Card } from '@/components/ui/card';
import { Badge, BadgeText } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import { Skeleton } from '@/components/ui/skeleton';

export { Skeleton } from '@/components/ui/skeleton';

const TEAM_BG_CLASSES = [
  'bg-success-100', 'bg-success-200', 'bg-success-300', 'bg-success-400', 'bg-success-500',
  'bg-warning-50', 'bg-warning-100', 'bg-warning-200', 'bg-warning-300',
  'bg-error-50', 'bg-error-100', 'bg-error-200', 'bg-error-300',
  'bg-info-50', 'bg-info-100', 'bg-info-200', 'bg-info-300',
  'bg-background-100', 'bg-background-200', 'bg-background-300',
];

function getInitials(name?: string): string {
  if (!name) return '⚽';
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

export function TeamBadge({ uri, size = 44, name }: { uri?: string; size?: number; name?: string }) {
  const [imgError, setImgError] = React.useState(false);
  const initials = getInitials(name);

  if (uri && (uri.startsWith('http') || uri.startsWith('file') || uri.startsWith('data:')) && !imgError) {
    return (
      <Image
        source={{ uri }}
        style={{ width: size, height: size, borderRadius: 4 }}
        resizeMode="contain"
        onError={() => setImgError(true)}
      />
    );
  }
  return (
    <Text style={{ width: size, height: size, textAlign: 'center', fontSize: size * 0.35, color: '#D9D9D9', lineHeight: size }}>
      {initials}
    </Text>
  );
}

export function StatusBadge({ status, progress }: { status: Match['status']; progress?: string }) {
  if (status === 'live') {
    return (
      <Badge action="success" variant="solid" size="sm" className="bg-success-600">
        <Box className="w-1.5 h-1.5 rounded-full bg-success-400 mr-1" />
        <BadgeText className="text-white font-bold">LIVE{progress ? ` ${progress}'` : ''}</BadgeText>
      </Badge>
    );
  }
  if (status === 'finished') {
    return (
      <Badge action="muted" variant="outline" size="sm">
        <BadgeText>FT</BadgeText>
      </Badge>
    );
  }
  return (
    <Badge action="muted" variant="outline" size="sm">
      <BadgeText>{progress || 'UPCOMING'}</BadgeText>
    </Badge>
  );
}

interface MatchCardProps {
  match: Match;
  onPress?: () => void;
}

export function MatchCard({ match, onPress }: MatchCardProps) {
  const isLive = match.status === 'live';
  const isFinished = match.status === 'finished';
  const showScore = isLive || isFinished;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!isLive) return;
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 0.3, duration: 600, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [isLive, pulseAnim]);

  const formattedDate = match.date
    ? new Date(match.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
    : '';

  return (
    <AnimatedPressable onPress={onPress}>
      <Card
        size="sm"
        variant="elevated"
        className="rounded-xl mb-3 px-4 pt-3 pb-4"
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.3,
          shadowRadius: 6,
          elevation: 5,
        }}
      >
        {/* Header: League + Date + Venue */}
        <HStack className="justify-between items-start mb-3">
          <Text size="2xs" className="text-typography-500 font-semibold uppercase tracking-wider flex-1" numberOfLines={1}>
            {match.league}
          </Text>
          <VStack className="items-end">
            <Text size="2xs" className="text-typography-500 font-medium">
              {formattedDate}
            </Text>
            {match.venue ? (
              <Text size="2xs" className="text-typography-500" numberOfLines={1} style={{ fontSize: 11, marginTop: 2 }}>
                {match.venue}
              </Text>
            ) : null}
          </VStack>
        </HStack>

        {/* Main row: [Home Logo] [Score] [Away Logo] + team names below */}
        <HStack className="items-start justify-between mb-3">
          <VStack className="items-center flex-1">
            <TeamBadge uri={match.homeBadge} size={48} name={match.homeTeam} />
            <Text size="xs" className="text-typography-0 font-semibold mt-2 text-center" numberOfLines={1}>
              {match.homeTeam}
            </Text>
          </VStack>

          <VStack className="items-center px-2 pt-1">
            {showScore ? (
              <HStack className="items-center gap-1.5">
                <Text
                  size="3xl"
                  className={`font-extrabold ${isLive ? 'text-error-500' : 'text-typography-0'}`}
                >
                  {match.homeScore != null ? match.homeScore : '-'}
                </Text>
                <Text size="sm" className="text-typography-500 font-bold">:</Text>
                <Text
                  size="3xl"
                  className={`font-extrabold ${isLive ? 'text-error-500' : 'text-typography-0'}`}
                >
                  {match.awayScore != null ? match.awayScore : '-'}
                </Text>
              </HStack>
            ) : (
              <Text size="lg" className="text-typography-0 font-bold">{match.time}</Text>
            )}
          </VStack>

          <VStack className="items-center flex-1">
            <TeamBadge uri={match.awayBadge} size={48} name={match.awayTeam} />
            <Text size="xs" className="text-typography-0 font-semibold mt-2 text-center" numberOfLines={1}>
              {match.awayTeam}
            </Text>
          </VStack>
        </HStack>

        {/* Status row */}
        <HStack className="items-center justify-center">
          {isLive ? (
            <>
              <Animated.View style={{ opacity: pulseAnim }}>
                <Box className="w-2 h-2 rounded-full bg-success-500 mr-1.5" />
              </Animated.View>
              <Text size="xs" className="text-success-500 font-bold">LIVE</Text>
              {match.progress && (
                <Text size="xs" className="text-typography-500 font-medium ml-1">{match.progress}'</Text>
              )}
            </>
          ) : isFinished ? (
            <Text size="xs" className="text-typography-500 font-semibold">Full Time</Text>
          ) : (
            <Text size="xs" className="text-typography-500 font-semibold">UPCOMING</Text>
          )}
        </HStack>
      </Card>
    </AnimatedPressable>
  );
}

interface TeamCardProps {
  team: Team;
  onPress?: () => void;
  listMode?: boolean;
}

export function TeamCard({ team, onPress, listMode }: TeamCardProps) {
  if (listMode) {
    return (
      <AnimatedPressable onPress={onPress}>
        <Card size="sm" className="rounded-xl flex-row items-center mb-2 px-4 py-3">
          <TeamBadge uri={team.badgeUrl || team.badge} size={48} name={team.name} />
          <Box className="flex-1 ml-3">
            <Text size="sm" className="text-typography-0 font-semibold">{team.name}</Text>
            {team.country ? (
              <Text size="xs" className="text-typography-500 mt-0.5">{team.badge} {team.country}</Text>
            ) : (
              <Text size="xs" className="text-typography-500 mt-0.5">{team.badge}</Text>
            )}
          </Box>
        </Card>
      </AnimatedPressable>
    );
  }
  return (
    <AnimatedPressable onPress={onPress} className="flex-1">
      <Card size="sm" className="rounded-xl items-center w-full px-4 py-4">
        <TeamBadge uri={team.badgeUrl || team.badge} size={60} name={team.name} />
        <Text size="sm" className="text-typography-0 font-semibold mt-2 text-center" numberOfLines={2}>{team.name}</Text>
        {team.country ? (
          <Text size="xs" className="text-typography-500 mt-0.5 text-center">{team.badge} {team.country}</Text>
        ) : (
          <Text size="xs" className="text-typography-500 mt-0.5 text-center">{team.badge}</Text>
        )}
      </Card>
    </AnimatedPressable>
  );
}

export function StandingsTable({ rows, qualifyCount = 4, onTeamPress }: { rows: Standing[]; qualifyCount?: number; onTeamPress?: (row: Standing) => void }) {
  return (
    <Card size="sm" variant="elevated" className="rounded-xl overflow-hidden">
      <HStack className="bg-background-0 py-2.5 px-3">
        <Text size="xs" className="flex-[0.4] text-typography-500 font-semibold text-center">#</Text>
        <Text size="xs" className="flex-[3] text-typography-500 font-semibold text-left">Team</Text>
        <Text size="xs" className="flex-1 text-typography-500 font-semibold text-center">P</Text>
        <Text size="xs" className="flex-1 text-typography-500 font-semibold text-center">W</Text>
        <Text size="xs" className="flex-1 text-typography-500 font-semibold text-center">D</Text>
        <Text size="xs" className="flex-1 text-typography-500 font-semibold text-center">L</Text>
        <Text size="xs" className="flex-1 text-typography-500 font-semibold text-center">GD</Text>
        <Text size="xs" className="flex-1 text-success-500 font-semibold text-center">Pts</Text>
      </HStack>
      {rows.map((row, i) => (
        <AnimatedPressable key={row.teamId || row.name} onPress={onTeamPress ? () => onTeamPress(row) : undefined}>
          <HStack
            className={`py-2.5 px-3 items-center ${i < qualifyCount ? 'border-l-[3px] border-l-success-500' : ''}`}
          >
            <Text size="xs" className="flex-[0.4] text-typography-500 text-center">{row.position}</Text>
            <HStack className="flex-[3] items-center gap-1.5">
              <TeamBadge uri={row.badge} size={24} name={row.name} />
              <Text size="xs" className="text-typography-0 text-left flex-1" numberOfLines={1}>{row.name}</Text>
            </HStack>
            <Text size="xs" className="flex-1 text-typography-0 text-center">{row.played}</Text>
            <Text size="xs" className="flex-1 text-typography-0 text-center">{row.won}</Text>
            <Text size="xs" className="flex-1 text-typography-0 text-center">{row.drawn}</Text>
            <Text size="xs" className="flex-1 text-typography-0 text-center">{row.lost}</Text>
            <Text size="xs" className="flex-1 text-typography-0 text-center">{row.goalDiff > 0 ? '+' : ''}{row.goalDiff}</Text>
            <Text size="xs" className="flex-1 text-success-500 font-bold text-center">{row.points}</Text>
          </HStack>
        </AnimatedPressable>
      ))}
    </Card>
  );
}

export function StatBar({ label, home, away }: { label: string; home: number; away: number }) {
  const total = home + away || 1;
  return (
    <VStack className="py-2">
      <HStack className="justify-between mb-1.5">
        <Text size="xs" className="text-typography-0 font-semibold">{home}</Text>
        <Text size="xs" className="text-typography-500">{label}</Text>
        <Text size="xs" className="text-typography-0 font-semibold">{away}</Text>
      </HStack>
      <HStack className="h-1.5 rounded overflow-hidden gap-0.5">
        <Box style={{ flex: home / total }} className="bg-success-500 rounded" />
        <Box style={{ flex: away / total }} className="bg-warning-500 rounded" />
      </HStack>
    </VStack>
  );
}

const BANNER_URL = 'https://drive.usercontent.google.com/download?id=1SuJcTUuFY0dnTKXieddtXCoqi2-eD8kz&export=download';

export function WorldCupBanner() {
  const [imgError, setImgError] = React.useState(false);
  return (
    <Box className="rounded-xl overflow-hidden mb-5" style={{ width: '100%', height: 180 }}>
      {!imgError ? (
        <Image
          source={{ uri: BANNER_URL }}
          resizeMode="cover"
          style={{ width: '100%', height: 180 }}
          onError={() => setImgError(true)}
        />
      ) : (
        <Box className="bg-background-100 items-center justify-center" style={{ width: '100%', height: 180 }}>
          <Text size="sm" className="text-typography-500">Banner</Text>
        </Box>
      )}
    </Box>
  );
}

export function NewsFeedCard({ article, onPress }: { article: NewsArticle; onPress?: () => void }) {
  const [imgError, setImgError] = React.useState(false);
  return (
    <AnimatedPressable onPress={onPress}>
      <Card size="sm" variant="elevated" className="rounded-xl overflow-hidden mb-3 p-0">
        <Box className="bg-background-100 items-center justify-center overflow-hidden">
          {article.image && !imgError ? (
            <Image source={{ uri: article.image }} className="w-full aspect-[16/9]" resizeMode="cover" onError={() => setImgError(true)} />
          ) : (
            <HugeiconsIcon icon={File01Icon} size={34} color="#D9D9D9" />
          )}
        </Box>
        <VStack className="p-3.5">
          <Text size="sm" className="text-typography-0 font-semibold mb-1.5" numberOfLines={2}>{article.title}</Text>
          <HStack className="items-center gap-1.5">
            <Text size="xs" className="text-success-500 font-semibold">{article.source}</Text>
          </HStack>
          <HStack className="items-center gap-1 mt-2">
            <Text size="xs" className="text-success-500 font-medium">Read more</Text>
            <HugeiconsIcon icon={ArrowRight01Icon} size={16} color="#0D9F68" />
          </HStack>
        </VStack>
      </Card>
    </AnimatedPressable>
  );
}

export function NewsCard({ title, source, time, featured }: { title: string; source: string; time: string; featured?: boolean }) {
  return (
    <Pressable>
      <Card size="sm" variant="elevated" className="rounded-xl overflow-hidden mb-3 p-0">
        <Box className="bg-background-100 items-center justify-center overflow-hidden" style={{ height: featured ? 140 : 80 }}>
          <HugeiconsIcon icon={File01Icon} size={34} color="#D9D9D9" />
        </Box>
        <VStack className="p-3.5">
          <Text size="sm" className="text-typography-0 font-semibold mb-1.5" numberOfLines={2}>{title}</Text>
          <HStack className="items-center gap-1.5">
            <Text size="xs" className="text-success-500 font-semibold">{source}</Text>
            <Text size="xs" className="text-typography-500">•</Text>
            <Text size="xs" className="text-typography-500">{time}</Text>
          </HStack>
          <HStack className="items-center gap-1 mt-2">
            <Text size="xs" className="text-success-500 font-medium">Read more</Text>
            <HugeiconsIcon icon={ArrowRight01Icon} size={16} color="#0D9F68" />
          </HStack>
        </VStack>
      </Card>
    </Pressable>
  );
}

export function EmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <VStack className="items-center justify-center py-15 px-8">
      <Box className="w-16 h-16 rounded-full bg-background-100 items-center justify-center mb-3">
          <HugeiconsIcon icon={FootballIcon} size={34} color="#D9D9D9" />
      </Box>
      <Heading size="md" className="text-typography-0 font-semibold mb-2 text-center">{title}</Heading>
      {description && <Text size="xs" className="text-typography-500 text-center">{description}</Text>}
    </VStack>
  );
}

export function LoadingSpinner({ message }: { message?: string }) {
  return (
    <VStack className="flex-1 items-center justify-center bg-background-0 gap-3">
      <Spinner color="#0D9F68" />
      {message && <Text size="xs" className="text-typography-500">{message}</Text>}
    </VStack>
  );
}

export function AnimatedPressable({ children, onPress, style, className, ...props }: { children: React.ReactNode; onPress?: () => void; style?: any; className?: string }) {
  const scale = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 350,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.97,
      friction: 8,
      tension: 120,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      friction: 6,
      tension: 120,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Pressable className={className} onPress={onPress} onPressIn={handlePressIn} onPressOut={handlePressOut} {...props}>
      <Animated.View style={[{ transform: [{ scale }], opacity: fadeAnim }, style]}>
        {children}
      </Animated.View>
    </Pressable>
  );
}

export function SkeletonMatchCard() {
  return (
    <Card size="sm" variant="elevated" className="rounded-xl mb-3 px-4 pt-3 pb-4">
      <HStack className="justify-between items-start mb-3">
        <Skeleton variant="rounded" startColor="bg-background-100" className="h-3 w-24" />
        <VStack className="items-end gap-1">
          <Skeleton variant="rounded" startColor="bg-background-100" className="h-3 w-20" />
          <Skeleton variant="rounded" startColor="bg-background-100" className="h-2.5 w-28" />
        </VStack>
      </HStack>
      <HStack className="items-start justify-between mb-3">
        <VStack className="items-center flex-1 gap-2">
          <Skeleton variant="circular" startColor="bg-background-100" className="w-12 h-12" />
          <Skeleton variant="rounded" startColor="bg-background-100" className="h-3 w-16" />
        </VStack>
        <VStack className="items-center px-2 pt-1">
          <Skeleton variant="rounded" startColor="bg-background-100" className="h-8 w-16" />
        </VStack>
        <VStack className="items-center flex-1 gap-2">
          <Skeleton variant="circular" startColor="bg-background-100" className="w-12 h-12" />
          <Skeleton variant="rounded" startColor="bg-background-100" className="h-3 w-16" />
        </VStack>
      </HStack>
      <HStack className="items-center justify-center">
        <Skeleton variant="rounded" startColor="bg-background-100" className="h-3 w-16" />
      </HStack>
    </Card>
  );
}

export function SkeletonTeamCardList() {
  return (
    <Card size="sm" variant="elevated" className="rounded-xl flex-row items-center mb-2 px-4 py-3">
      <Skeleton variant="circular" startColor="bg-background-100" className="w-12 h-12" />
      <VStack className="flex-1 ml-3 gap-1.5">
        <Skeleton variant="rounded" startColor="bg-background-100" className="h-3.5 w-32" />
        <Skeleton variant="rounded" startColor="bg-background-100" className="h-3 w-20" />
      </VStack>
    </Card>
  );
}

export function SkeletonTeamCardGrid() {
  return (
    <Card size="sm" variant="elevated" className="rounded-xl items-center px-4 py-4 flex-1">
      <Skeleton variant="circular" startColor="bg-background-100" className="w-14 h-14 mb-2" />
      <Skeleton variant="rounded" startColor="bg-background-100" className="h-3.5 w-20 mb-1" />
      <Skeleton variant="rounded" startColor="bg-background-100" className="h-3 w-16" />
    </Card>
  );
}

export function SkeletonNewsCard() {
  return (
    <Card size="sm" variant="elevated" className="rounded-xl overflow-hidden mb-3 p-0">
      <Skeleton variant="rounded" startColor="bg-background-100" className="w-full h-40" />
      <VStack className="p-3.5 gap-2">
        <Skeleton variant="rounded" startColor="bg-background-100" className="h-4 w-full" />
        <Skeleton variant="rounded" startColor="bg-background-100" className="h-4 w-3/4" />
        <Skeleton variant="rounded" startColor="bg-background-100" className="h-3 w-24" />
      </VStack>
    </Card>
  );
}

export function SkeletonStandingsRows({ count = 6 }: { count?: number }) {
  return (
    <Card size="sm" variant="elevated" className="rounded-xl overflow-hidden">
      <HStack className="bg-background-0 py-2.5 px-3">
        <Skeleton variant="rounded" startColor="bg-background-100" className="h-3 w-5" />
        <Skeleton variant="rounded" startColor="bg-background-100" className="h-3 flex-[3] ml-2" />
        <Skeleton variant="rounded" startColor="bg-background-100" className="h-3 flex-1 ml-2" />
        <Skeleton variant="rounded" startColor="bg-background-100" className="h-3 flex-1 ml-2" />
        <Skeleton variant="rounded" startColor="bg-background-100" className="h-3 flex-1 ml-2" />
        <Skeleton variant="rounded" startColor="bg-background-100" className="h-3 flex-1 ml-2" />
        <Skeleton variant="rounded" startColor="bg-background-100" className="h-3 flex-1 ml-2" />
        <Skeleton variant="rounded" startColor="bg-background-100" className="h-3 flex-1 ml-2" />
      </HStack>
      {Array.from({ length: count }).map((_, i) => (
        <HStack key={i} className="py-2.5 px-3 items-center">
          <Skeleton variant="rounded" startColor="bg-background-100" className="h-3 w-5" />
          <HStack className="flex-[3] items-center gap-1.5 ml-2">
            <Skeleton variant="circular" startColor="bg-background-100" className="w-6 h-6" />
            <Skeleton variant="rounded" startColor="bg-background-100" className="h-3 flex-1" />
          </HStack>
          <Skeleton variant="rounded" startColor="bg-background-100" className="h-3 flex-1 ml-2" />
          <Skeleton variant="rounded" startColor="bg-background-100" className="h-3 flex-1 ml-2" />
          <Skeleton variant="rounded" startColor="bg-background-100" className="h-3 flex-1 ml-2" />
          <Skeleton variant="rounded" startColor="bg-background-100" className="h-3 flex-1 ml-2" />
          <Skeleton variant="rounded" startColor="bg-background-100" className="h-3 flex-1 ml-2" />
          <Skeleton variant="rounded" startColor="bg-background-100" className="h-3 flex-1 ml-2" />
        </HStack>
      ))}
    </Card>
  );
}

export function FilterPill({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  const showLiveDot = label.startsWith('● ');
  const pillLabel = showLiveDot ? label.slice(2) : label;

  return (
    <Button
      size="sm"
      variant={active ? 'solid' : 'outline'}
      action={active ? 'positive' : 'secondary'}
      className="rounded-full"
      onPress={onPress}
    >
      {showLiveDot ? (
        <HStack className="items-center gap-1">
          <Text size="xs" className="text-error-500">●</Text>
          <ButtonText>{pillLabel}</ButtonText>
        </HStack>
      ) : (
        <ButtonText>{pillLabel}</ButtonText>
      )}
    </Button>
  );
}

export function SectionHeader({ title, rightContent }: { title: string; rightContent?: React.ReactNode }) {
  return (
    <HStack className="items-center justify-between mb-3">
      <Heading size="lg" className="text-typography-0 font-bold">{title}</Heading>
      {rightContent}
    </HStack>
  );
}

export function AppLogo({ size = 48 }: { size?: number }) {
  const s = size;
  return (
    <Svg width={s} height={s} viewBox="0 0 90 90" fill="none">
      <G clipPath="url(#logoClip)">
        <Rect width={90} height={90} rx={45} fill="#07111F" />
        <Path
          d="M64.3613 -11.0788C62.094 -5.31141 61.836 1.0578 63.6377 6.99734C65.4879 13.0963 69.395 18.3656 74.6943 21.9065C79.8548 25.3546 86.0243 26.9545 92.2012 26.4593L93.373 38.3528C84.4441 39.1182 75.5143 36.8274 68.0547 31.843C60.4564 26.766 54.8539 19.211 52.2012 10.4661C49.5968 1.88049 49.9946 -7.33053 53.3193 -15.653L64.3613 -11.0788Z"
          stroke="#0D9F68"
        />
        <Path
          d="M58.2102 68.0907C52.4125 76.3888 49.9767 86.5765 51.3938 96.5996L64.2183 94.7864C63.26 88.0088 64.9071 81.1199 68.8275 75.5087C72.7478 69.8975 78.6498 65.9814 85.3435 64.55C92.0372 63.1185 99.0247 64.2782 104.897 67.7951L111.552 56.6835C102.867 51.4824 92.5339 49.7674 82.635 51.8844C72.736 54.0013 64.0078 59.7926 58.2102 68.0907Z"
          fill="#0D9F68"
        />
        <Path
          d="M26.5508 61.0709C19.0038 54.3245 9.17959 50.6905 -0.94101 50.9015L-0.671013 63.8507C6.17253 63.708 12.8157 66.1653 17.919 70.7272C23.0223 75.2891 26.2062 81.6162 26.8287 88.4329L39.8079 93.5C39.943 91.4314 39.9178 89.3437 39.7271 87.2549C38.8064 77.1741 34.0979 67.8172 26.5508 61.0709Z"
          fill="#0D9F68"
        />
        <Path
          d="M33.7057 20.2438C38.9545 11.5881 40.7264 1.26431 38.6641 -8.64618L25.9838 -6.00747C27.3783 0.694004 26.1801 7.67498 22.6309 13.5279C19.0816 19.3809 13.4452 23.6705 6.85806 25.5318C0.270962 27.3932 -6.77689 26.6878 -12.8645 23.558L-18.7867 35.0767C-9.78404 39.7053 0.638684 40.7484 10.38 37.9958C20.1214 35.2431 28.4568 28.8995 33.7057 20.2438Z"
          fill="#0D9F68"
        />
        <Circle cx={45} cy={45} r={16} fill="#0D9F68" />
      </G>
      <Defs>
        <ClipPath id="logoClip">
          <Rect width={90} height={90} rx={45} fill="white" />
        </ClipPath>
      </Defs>
    </Svg>
  );
}

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
    <HStack className="items-center px-3 h-[54px]">
      <HStack className="items-center justify-start pl-2" style={{ width: 52 }}>
        {showBack && (
          <Pressable onPress={onBackPress} hitSlop={12}>
            <HugeiconsIcon icon={ArrowLeft01Icon} size={28} color="#0D9F68" />
          </Pressable>
        )}
      </HStack>
      <Box className="flex-1 items-center justify-center">
        <Text size="sm" className="text-white font-bold" style={{ textAlign: 'center' }} numberOfLines={1}>{title}</Text>
      </Box>
      <HStack className="items-center justify-end w-11">
        {rightAction && (
          <Pressable onPress={rightAction.onPress} hitSlop={8}>
            {rightAction.icon}
          </Pressable>
        )}
      </HStack>
    </HStack>
  );
}
