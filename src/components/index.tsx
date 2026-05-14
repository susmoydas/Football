import React from 'react';
import { Image, ImageBackground, Platform } from 'react-native';

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

  const formattedDate = match.date
    ? new Date(match.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
    : '';

  return (
    <Pressable onPress={onPress}>
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
        {/* Header: League + Date */}
        <HStack className="justify-between items-center mb-4">
          <Text size="2xs" className="text-typography-500 font-semibold uppercase tracking-wider flex-1" numberOfLines={1}>
            {match.league}
          </Text>
          <Text size="2xs" className="text-typography-500 font-medium">
            {formattedDate}
          </Text>
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
              <Box className="w-2 h-2 rounded-full bg-success-500 mr-1.5" />
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
    </Pressable>
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
      <Pressable onPress={onPress}>
        <Card size="sm" variant="elevated" className="rounded-xl flex-row items-center mb-2">
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
      </Pressable>
    );
  }
  return (
    <Pressable onPress={onPress} className="flex-1">
      <Card size="sm" variant="elevated" className="rounded-xl items-center">
        <TeamBadge uri={team.badgeUrl || team.badge} size={60} name={team.name} />
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
        <HStack
          key={row.teamId || row.name}
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

export function WorldCupBanner() {
  return (
    <Box className="rounded-xl overflow-hidden mb-5" style={{ height: 180 }}>
      <ImageBackground
        source={require('../../assets/Banner.png')}
        resizeMode="cover"
        style={{ width: '100%', height: '100%' }}
      />
    </Box>
  );
}

export function NewsFeedCard({ article, onPress }: { article: NewsArticle; onPress?: () => void }) {
  const [imgError, setImgError] = React.useState(false);
  return (
    <Pressable onPress={onPress}>
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
    </Pressable>
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
