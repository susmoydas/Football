import React from 'react';
import { Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { ArrowLeft01Icon, StarIcon } from '@hugeicons/core-free-icons';
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
import { Avatar, AvatarImage, AvatarFallbackText } from '@/components/ui/avatar';
import { Spinner } from '@/components/ui/spinner';

const TEAM_BG_CLASSES = [
  'bg-success-100', 'bg-success-200', 'bg-success-300', 'bg-success-400', 'bg-success-500',
  'bg-warning-50', 'bg-warning-100', 'bg-warning-200', 'bg-warning-300',
  'bg-error-50', 'bg-error-100', 'bg-error-200', 'bg-error-300',
  'bg-info-50', 'bg-info-100', 'bg-info-200', 'bg-info-300',
  'bg-background-100', 'bg-background-200', 'bg-background-300',
];

function getTeamBgClass(name?: string): string {
  if (!name) return TEAM_BG_CLASSES[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return TEAM_BG_CLASSES[Math.abs(hash) % TEAM_BG_CLASSES.length];
}

function getInitials(name?: string): string {
  if (!name) return '⚽';
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

export function TeamBadge({ uri, size = 40, name, fallbackText }: { uri?: string; size?: number; name?: string; fallbackText?: string }) {
  const [imgError, setImgError] = React.useState(false);
  const avatarSize = size <= 24 ? 'xs' : size <= 32 ? 'sm' : size <= 48 ? 'md' : size <= 64 ? 'lg' : 'xl';
  const initials = getInitials(name);
  const bgClass = getTeamBgClass(name);

  if (uri && (uri.startsWith('http') || uri.startsWith('file') || uri.startsWith('data:')) && !imgError) {
    return (
      <Avatar size={avatarSize} className={bgClass}>
        <AvatarImage source={{ uri }} onError={() => setImgError(true)} />
        <AvatarFallbackText>{initials}</AvatarFallbackText>
      </Avatar>
    );
  }
  return (
    <Avatar size={avatarSize} className={bgClass}>
      <AvatarFallbackText>{initials}</AvatarFallbackText>
    </Avatar>
  );
}

export function StatusBadge({ status, progress }: { status: Match['status']; progress?: string }) {
  if (status === 'live') {
    return (
      <Badge action="error" variant="solid" size="sm" className="bg-error-600">
        <Box className="w-1.5 h-1.5 rounded-full bg-white mr-1" />
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
  return (
    <Pressable onPress={onPress}>
      <Card size="sm" variant="outline" className="rounded-xl mb-2.5 px-4 pt-3 pb-1">
        {/* Header: league + status/time */}
        <HStack className="justify-between items-center mb-1">
          <Text size="2xs" className="text-typography-500 font-medium flex-1" numberOfLines={1}>{match.league}</Text>
          {isLive ? (
            <HStack className="items-center gap-1">
              <Box className="w-1.5 h-1.5 rounded-full bg-error-500" />
              <Text size="2xs" className="text-error-500 font-bold">LIVE</Text>
              {match.progress && <Text size="2xs" className="text-typography-500 font-medium">{match.progress}'</Text>}
            </HStack>
          ) : isFinished ? (
            <Text size="2xs" className="text-typography-500 font-semibold">FT</Text>
          ) : (
            <Text size="2xs" className="text-typography-500 font-semibold">{match.time || ''}</Text>
          )}
        </HStack>

        {/* Home team */}
        <HStack className="items-center py-2.5">
          <TeamBadge uri={match.homeBadge} size={36} name={match.homeTeam} />
          <Text size="sm" className="text-typography-0 font-semibold flex-1 ml-3" numberOfLines={1}>{match.homeTeam}</Text>
          {showScore ? (
            <Text size="2xl" className={`font-extrabold w-9 text-right ${isLive ? 'text-error-500' : 'text-typography-0'}`}>
              {match.homeScore != null ? match.homeScore : '-'}
            </Text>
          ) : null}
        </HStack>

        {/* Away team */}
        <HStack className="items-center py-2.5 border-t" style={{ borderTopColor: '#26364F' }}>
          <TeamBadge uri={match.awayBadge} size={36} name={match.awayTeam} />
          <Text size="sm" className="text-typography-0 font-semibold flex-1 ml-3" numberOfLines={1}>{match.awayTeam}</Text>
          {showScore ? (
            <Text size="2xl" className={`font-extrabold w-9 text-right ${isLive ? 'text-error-500' : 'text-typography-0'}`}>
              {match.awayScore != null ? match.awayScore : '-'}
            </Text>
          ) : null}
        </HStack>
      </Card>
    </Pressable>
  );
}

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
      <Pressable onPress={onPress}>
        <Card size="sm" variant="outline" className="rounded-xl flex-row items-center mb-2">
          <TeamBadge uri={team.badgeUrl || team.badge} size={44} name={team.name} fallbackText={team.badge} />
          <Box className="flex-1 ml-3">
            <Text size="sm" className="text-typography-0 font-semibold">{team.name}</Text>
            {team.country ? (
              <Text size="xs" className="text-typography-500 mt-0.5">{team.badge} {team.country}</Text>
            ) : (
              <Text size="xs" className="text-typography-500 mt-0.5">{team.badge}</Text>
            )}
          </Box>
          <Pressable onPress={onToggleFavourite} hitSlop={8}>
            <HugeiconsIcon icon={StarIcon} size={18} color={isFavourite ? '#FFD700' : '#A9B4C2'} />
          </Pressable>
        </Card>
      </Pressable>
    );
  }
  return (
    <Pressable onPress={onPress} className="flex-1">
      <Card size="sm" variant="outline" className="rounded-xl items-center">
        <Pressable className="absolute top-2.5 right-2.5 p-1" onPress={onToggleFavourite}>
          <HugeiconsIcon icon={StarIcon} size={16} color={isFavourite ? '#FFD700' : '#A9B4C2'} />
        </Pressable>
        <TeamBadge uri={team.badgeUrl || team.badge} size={56} name={team.name} fallbackText={team.badge} />
        <Text size="sm" className="text-typography-0 font-semibold mt-2 text-center" numberOfLines={2}>{team.name}</Text>
        {team.country ? (
          <Text size="xs" className="text-typography-500 mt-0.5 text-center">{team.badge} {team.country}</Text>
        ) : (
          <Text size="xs" className="text-typography-500 mt-0.5 text-center">{team.badge}</Text>
        )}
      </Card>
    </Pressable>
  );
}

export function StandingsTable({ rows, qualifyCount = 4 }: { rows: Standing[]; qualifyCount?: number }) {
  return (
    <Card size="sm" variant="outline" className="rounded-xl overflow-hidden">
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
        <HStack
          key={row.teamId || row.name}
          className={`py-2.5 px-3 items-center ${i < qualifyCount ? 'border-l-[3px] border-l-success-500' : ''}`}
        >
          <Text size="xs" className="flex-[0.4] text-typography-500 text-center">{row.position}</Text>
          <HStack className="flex-[3] items-center gap-1.5">
            <TeamBadge uri={row.badge} size={20} name={row.name} />
            <Text size="xs" className="text-typography-0 text-left flex-1" numberOfLines={1}>{row.name}</Text>
          </HStack>
          <Text size="xs" className="flex-1 text-typography-0 text-center">{row.played}</Text>
          <Text size="xs" className="flex-1 text-typography-0 text-center">{row.won}</Text>
          <Text size="xs" className="flex-1 text-typography-0 text-center">{row.drawn}</Text>
          <Text size="xs" className="flex-1 text-typography-0 text-center">{row.lost}</Text>
          <Text size="xs" className="flex-1 text-typography-0 text-center">{row.goalDiff > 0 ? '+' : ''}{row.goalDiff}</Text>
          <Text size="xs" className="flex-1 text-success-500 font-bold text-center">{row.points}</Text>
        </HStack>
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

interface BannerProps {
  leagueName: string;
  onViewFixtures: () => void;
}

export function WorldCupBanner({ leagueName, onViewFixtures }: BannerProps) {
  return (
    <Box className="rounded-xl overflow-hidden mb-5">
      <LinearGradient
        colors={['#0D3320', '#1A6B3E', '#0F3D2B']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="p-5 pt-6 relative"
      >
        <Box className="absolute w-36 h-36 rounded-full bg-success-500/15 -top-16 -right-14" />
        <Box className="absolute w-20 h-20 rounded-full bg-warning-500/10 -bottom-6 -left-5" />
        <Box className="absolute w-12 h-12 rounded-full bg-success-500/20 top-5 left-[60%]" />
        <Text className="text-sm tracking-widest mb-2">🇺🇸🇨🇦🇲🇽</Text>
        <Box className="relative z-10">
          <Heading size="2xl" className="text-typography-0 font-extrabold mb-1">🏆 FIFA World Cup 2026</Heading>
          <Text size="sm" className="text-success-500 font-semibold mb-0.5">{leagueName}</Text>
          <Text size="xs" className="text-typography-500 mb-4">Live scores, fixtures & football updates</Text>
          <Button size="md" variant="solid" action="positive" className="self-start" onPress={onViewFixtures}>
            <ButtonText>View Fixtures</ButtonText>
          </Button>
        </Box>
      </LinearGradient>
    </Box>
  );
}

export function NewsFeedCard({ article, onPress }: { article: NewsArticle; onPress?: () => void }) {
  const [imgError, setImgError] = React.useState(false);
  return (
    <Pressable onPress={onPress}>
      <Card size="sm" variant="outline" className="rounded-xl overflow-hidden mb-3 p-0">
        <Box className="bg-background-100 items-center justify-center overflow-hidden">
          {article.image && !imgError ? (
            <Image source={{ uri: article.image }} className="w-full aspect-[16/9]" resizeMode="cover" onError={() => setImgError(true)} />
          ) : (
            <Text className="text-4xl">📰</Text>
          )}
        </Box>
        <VStack className="p-3.5">
          <Text size="sm" className="text-typography-0 font-semibold mb-1.5" numberOfLines={2}>{article.title}</Text>
          <HStack className="items-center gap-1.5">
            <Text size="xs" className="text-success-500 font-semibold">{article.source}</Text>
            <Text size="xs" className="text-typography-500">•</Text>
            <Text size="xs" className="text-typography-500">{article.time}</Text>
          </HStack>
          <Text size="xs" className="text-success-500 mt-2 font-medium">Read more →</Text>
        </VStack>
      </Card>
    </Pressable>
  );
}

export function NewsCard({ title, source, time, featured }: { title: string; source: string; time: string; featured?: boolean }) {
  return (
    <Pressable>
      <Card size="sm" variant="outline" className="rounded-xl overflow-hidden mb-3 p-0">
        <Box className="bg-background-100 items-center justify-center overflow-hidden" style={{ height: featured ? 140 : 80 }}>
          <Text className="text-4xl">📰</Text>
        </Box>
        <VStack className="p-3.5">
          <Text size="sm" className="text-typography-0 font-semibold mb-1.5" numberOfLines={2}>{title}</Text>
          <HStack className="items-center gap-1.5">
            <Text size="xs" className="text-success-500 font-semibold">{source}</Text>
            <Text size="xs" className="text-typography-500">•</Text>
            <Text size="xs" className="text-typography-500">{time}</Text>
          </HStack>
          <Text size="xs" className="text-success-500 mt-2 font-medium">Read more →</Text>
        </VStack>
      </Card>
    </Pressable>
  );
}

export function EmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <VStack className="items-center justify-center py-15 px-8">
      <Avatar size="xl">
        <AvatarFallbackText>⚽</AvatarFallbackText>
      </Avatar>
      <Heading size="md" className="text-typography-0 font-semibold mb-2 text-center">{title}</Heading>
      {description && <Text size="xs" className="text-typography-500 text-center">{description}</Text>}
    </VStack>
  );
}

export function LoadingSpinner({ message }: { message?: string }) {
  return (
    <VStack className="flex-1 items-center justify-center bg-background-0 gap-3">
      <Spinner color="#20C997" />
      {message && <Text size="xs" className="text-typography-500">{message}</Text>}
    </VStack>
  );
}

export function FilterPill({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Button
      size="sm"
      variant={active ? 'solid' : 'outline'}
      action={active ? 'positive' : 'secondary'}
      className="rounded-full"
      onPress={onPress}
    >
      <ButtonText>{label}</ButtonText>
    </Button>
  );
}

export function SectionHeader({ title }: { title: string }) {
  return (
    <Box className="mb-3">
      <Heading size="lg" className="text-typography-0 font-bold">{title}</Heading>
    </Box>
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
      <HStack className="items-center justify-start w-11">
        {showBack && (
          <Pressable onPress={onBackPress} hitSlop={8}>
            <HugeiconsIcon icon={ArrowLeft01Icon} size={22} color="#20C997" />
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
