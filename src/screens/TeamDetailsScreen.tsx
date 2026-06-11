import React, { useState, useEffect } from 'react';
import { ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { C, Team, Match, Player, CoachStaff } from '../types';
import { fetchTeam, fetchTeamSquad, fetchTeamEvents, fetchTeamCoachingStaff, countryToFlag, FEATURED_LEAGUES } from '../services/api';
import { Text } from '@/components/ui/text';
import { Heading } from '@/components/ui/heading';
import { Card } from '@/components/ui/card';
import { Box } from '@/components/ui/box';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { TeamBadge, MatchCard, Header, AnimatedPressable, SkeletonBlock, SoftSkeleton, FadeInView, SkeletonMatchCard } from '../components';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { Location01Icon, Calendar01Icon, GlobeIcon } from '@hugeicons/core-free-icons';

interface Props {
  teamData: Team;
  selectedLeagueId: string;
  navigation?: any;
  onNavigate?: (screen: string, data?: any) => void;
}

const POSITION_ORDER: Record<string, string> = {
  G: 'Goalkeepers',
  D: 'Defenders',
  M: 'Midfielders',
  F: 'Forwards',
};

export default function TeamDetailsScreen({ teamData, selectedLeagueId, navigation, onNavigate }: Props) {
  const [team, setTeam] = useState<Team | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [coachingStaff, setCoachingStaff] = useState<CoachStaff[]>([]);
  const [recentMatches, setRecentMatches] = useState<Match[]>([]);
  const [upcomingMatches, setUpcomingMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const fullTeam = await fetchTeam(teamData.id);
      setTeam(fullTeam);
      const [squad, staff, recent, upcoming] = await Promise.all([
        fetchTeamSquad(teamData.id),
        fetchTeamCoachingStaff(teamData.id),
        fetchTeamEvents(teamData.id, 'finished', 50, selectedLeagueId),
        fetchTeamEvents(teamData.id, 'notstarted', 50, selectedLeagueId),
      ]);
      setPlayers(squad);
      setCoachingStaff(uniqueByNameOrId(staff));
      setRecentMatches(recent);
      setUpcomingMatches(
        [...upcoming].sort((a, b) => {
          if (a.date < b.date) return -1;
          if (a.date > b.date) return 1;
          return a.time.localeCompare(b.time);
        })
      );
      setLoading(false);
    })();
  }, [teamData.id]);

  if (loading || !team) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }} edges={['top', 'bottom']}>
        <Header title="Team" showBack onBackPress={() => navigation?.goBack()} />
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 40 }}>
          <SoftSkeleton>
            <Card size="sm" variant="elevated" className="rounded-xl mx-4 mb-4 items-center py-6">
              <SkeletonBlock variant="circular" style={{ width: 80, height: 80, marginBottom: 12 }} />
              <SkeletonBlock style={{ width: 160, height: 22, marginBottom: 8 }} />
              <SkeletonBlock style={{ width: 100, height: 14 }} />
            </Card>
            <Box className="mx-4 mb-4">
              <HStack className="gap-3 mb-3">
                <Card size="sm" variant="elevated" className="rounded-xl flex-1 px-4 py-3.5">
                  <SkeletonBlock style={{ width: 80, height: 10, marginBottom: 8 }} />
                  <SkeletonBlock style={{ width: 100, height: 14 }} />
                </Card>
                <Card size="sm" variant="elevated" className="rounded-xl flex-1 px-4 py-3.5">
                  <SkeletonBlock style={{ width: 80, height: 10, marginBottom: 8 }} />
                  <SkeletonBlock style={{ width: 100, height: 14 }} />
                </Card>
              </HStack>
              <HStack className="gap-3">
                <Card size="sm" variant="elevated" className="rounded-xl flex-1 px-4 py-3.5">
                  <SkeletonBlock style={{ width: 80, height: 10, marginBottom: 8 }} />
                  <SkeletonBlock style={{ width: 100, height: 14 }} />
                </Card>
                <Card size="sm" variant="elevated" className="rounded-xl flex-1 px-4 py-3.5">
                  <SkeletonBlock style={{ width: 80, height: 10, marginBottom: 8 }} />
                  <SkeletonBlock style={{ width: 100, height: 14 }} />
                </Card>
              </HStack>
            </Box>
            <Box className="mx-4 mb-4">
              <SkeletonBlock style={{ width: 120, height: 20, marginBottom: 12 }} />
              <Card size="sm" variant="elevated" className="rounded-xl px-4 py-4 mb-2">
                <HStack className="items-center">
                  <SkeletonBlock variant="circular" style={{ width: 56, height: 56 }} />
                  <VStack className="flex-1 ml-4 gap-2">
                    <SkeletonBlock style={{ width: 120, height: 14 }} />
                    <SkeletonBlock style={{ width: 80, height: 10 }} />
                  </VStack>
                </HStack>
              </Card>
            </Box>
            <Box className="mx-4 mb-4">
              <SkeletonBlock style={{ width: 80, height: 20, marginBottom: 12 }} />
              {[1, 2, 3].map(i => <SkeletonMatchCard key={i} />)}
            </Box>
          </SoftSkeleton>
        </ScrollView>
      </SafeAreaView>
    );
  }

  const grouped = groupByPosition(players);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }} edges={['top', 'bottom']}>
      <Header title={team.name} showBack onBackPress={() => navigation?.goBack()} />
      <FadeInView style={{ flex: 1 }}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Hero Card */}
        <Card size="sm" variant="elevated" className="rounded-xl mx-4 mb-4 items-center py-6">
          <TeamBadge uri={team.badgeUrl || team.badge} size={80} name={team.name} />
          <Heading size="2xl" className="text-typography-0 font-bold mt-3">{team.name}</Heading>
          <HStack className="items-center gap-1.5 mt-1">
            <Text size="lg">{countryToFlag(team.country)}</Text>
            <Text size="sm" className="text-typography-500">{team.country}</Text>
          </HStack>
        </Card>

        {/* Info Grid */}
        <Box className="mx-4 mb-4">
          <HStack className="gap-3 mb-3">
            <InfoCard icon={GlobeIcon} label="Country" value={team.country || 'N/A'} />
            <InfoCard icon={Location01Icon} label="Stadium" value={team.stadium || 'N/A'} />
          </HStack>
          <HStack className="gap-3">
            <InfoCard icon={Calendar01Icon} label="League" value={resolveLeagueName(selectedLeagueId)} />
            <InfoCard icon={GlobeIcon} label="Formed" value={team.formedYear || '—'} />
          </HStack>
        </Box>

        {/* Coaching Staff */}
        {coachingStaff.length > 0 && (
          <Box className="mx-4 mb-4">
            <Heading size="lg" className="text-typography-0 font-bold mb-3">Coaching Staff</Heading>
            {coachingStaff.map(staff => (
              <AnimatedPressable key={staff.id} onPress={() => onNavigate?.('coach-profile', staff)}>
                <CoachCard staff={staff} />
              </AnimatedPressable>
            ))}
          </Box>
        )}

        {/* Squad Section */}
        {players.length > 0 && (
          <Box className="mx-4 mb-4">
            <Heading size="lg" className="text-typography-0 font-bold mb-3">Squad</Heading>
            {Object.entries(grouped).map(([pos, posPlayers]) => (
              <Box key={pos} className="mb-4">
                <HStack className="items-center gap-2 mb-2 px-1">
                  <Box className="h-4 w-1 rounded-full bg-success-500" />
                  <Text size="xs" className="text-success-500 font-bold uppercase tracking-wider">
                    {pos}
                  </Text>
                  <Text size="2xs" className="text-typography-500 ml-auto">{posPlayers.length} players</Text>
                </HStack>
                {posPlayers.map(p => (
                  <AnimatedPressable key={p.id} onPress={() => onNavigate?.('player-profile', p)}>
                    <PlayerCard player={p} />
                  </AnimatedPressable>
                ))}
              </Box>
            ))}
          </Box>
        )}

        {/* Upcoming Fixtures */}
        {upcomingMatches.length > 0 && (
          <Box className="mx-4 mb-4">
            <Heading size="lg" className="text-typography-0 font-bold mb-3">Upcoming Fixtures</Heading>
            {upcomingMatches.map(m => (
              <MatchCard key={m.id} match={m} onPress={() => onNavigate?.('match-details', m)} />
            ))}
          </Box>
        )}

        {/* Recent Results */}
        {recentMatches.length > 0 && (
          <Box className="mx-4 mb-4">
            <Heading size="lg" className="text-typography-0 font-bold mb-3">Recent Results</Heading>
            {recentMatches.map(m => (
              <MatchCard key={m.id} match={m} onPress={() => onNavigate?.('match-details', m)} />
            ))}
          </Box>
        )}
      </ScrollView>
      </FadeInView>
    </SafeAreaView>
  );
}

function CoachCard({ staff }: { staff: CoachStaff }) {
  const [imgError, setImgError] = useState(false);
  const coachImageUrl = `https://sports.bzzoiro.com/img/manager/${staff.id}/`;

  return (
    <Card size="sm" variant="elevated" className="rounded-xl px-4 py-4">
      <HStack className="items-center">
        {/* Coach Photo */}
        <Box className="w-14 h-14 rounded-full bg-background-100 overflow-hidden items-center justify-center">
          {!imgError ? (
            <Image
              source={{ uri: coachImageUrl }}
              style={{ width: 56, height: 56, borderRadius: 28 }}
              resizeMode="cover"
              onError={() => setImgError(true)}
            />
          ) : (
            <Text size="lg" className="text-typography-500 font-bold">
              {getInitials(staff.name)}
            </Text>
          )}
        </Box>

        {/* Name + Role + Country */}
        <VStack className="flex-1 ml-4">
          <Text size="md" className="text-typography-0 font-bold">{staff.name}</Text>
          <Text size="xs" className="text-typography-0 font-semibold mt-0.5">{staff.role}</Text>
          {staff.country ? (
            <Text size="2xs" className="text-typography-500 mt-0.5">{staff.country}</Text>
          ) : null}
        </VStack>

        {/* Formation */}
        {staff.preferredFormation ? (
          <VStack className="items-end ml-3">
            <Box className="bg-background-100 rounded-lg px-3 py-2">
              <Text size="2xs" className="text-typography-500 text-center">Formation</Text>
              <Text size="sm" className="text-typography-0 font-bold text-center">{staff.preferredFormation}</Text>
            </Box>
          </VStack>
        ) : null}
      </HStack>
    </Card>
  );
}

function PlayerCard({ player }: { player: Player }) {
  const [imgError, setImgError] = useState(false);
  const playerImageUrl = `https://sports.bzzoiro.com/img/player/${player.id}/`;

  return (
    <Card size="sm" variant="elevated" className="rounded-xl mb-2 px-4 py-3.5">
      <HStack className="items-center">
        {/* Player Image */}
        <Box className="w-10 h-10 rounded-full bg-background-100 overflow-hidden items-center justify-center">
          {!imgError ? (
            <Image
              source={{ uri: playerImageUrl }}
              style={{ width: 40, height: 40, borderRadius: 20 }}
              resizeMode="cover"
              onError={() => setImgError(true)}
            />
          ) : (
            <Text size="sm" className="text-typography-500 font-bold">
              {getInitials(player.name)}
            </Text>
          )}
        </Box>

        {/* Name + Country + Position */}
        <VStack className="flex-1 ml-3">
          <HStack className="items-center gap-2">
            <Text size="sm" className="text-typography-0 font-semibold">{player.name}</Text>
            {player.availability === 'injured' && (
              <Box className="bg-error-500 rounded px-1.5 py-0.5">
                <Text size="2xs" className="text-white font-bold">INJ</Text>
              </Box>
            )}
          </HStack>
          <Text size="2xs" className="text-typography-500 mt-0.5">
            {player.nationality} · {player.specificPosition || player.position}
          </Text>
        </VStack>

        {/* Jersey + Market Value */}
        <VStack className="items-end ml-2">
          <Box className="w-7 h-7 rounded-full bg-background-100 items-center justify-center mb-1">
            <Text size="2xs" className="text-typography-500 font-bold">
              {player.jerseyNumber ?? '—'}
            </Text>
          </Box>
          {player.marketValueEur != null && (
            <Text size="xs" className="text-success-500 font-bold">
              €{formatMarketValue(player.marketValueEur)}
            </Text>
          )}
        </VStack>
      </HStack>
    </Card>
  );
}

function InfoCard({ icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <Card size="sm" variant="elevated" className="rounded-xl flex-1 px-4 py-3.5">
      <HStack className="items-center gap-2 mb-1">
        <HugeiconsIcon icon={icon} size={16} color="#0D9F68" />
        <Text size="xs" className="text-typography-500">{label}</Text>
      </HStack>
      <Text size="sm" className="text-typography-0 font-semibold ml-[22px]" numberOfLines={1}>{value}</Text>
    </Card>
  );
}

function getInitials(name: string): string {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

function uniqueByNameOrId(items: CoachStaff[]): CoachStaff[] {
  const seen = new Set<string>();
  return items.filter(item => {
    const nameKey = item.name.toLowerCase().trim();
    if (seen.has(nameKey)) return false;
    seen.add(nameKey);
    seen.add(item.id);
    return true;
  });
}

function groupByPosition(players: Player[]): Record<string, Player[]> {
  const groups: Record<string, Player[]> = {};
  for (const p of players) {
    const pos = POSITION_ORDER[p.position] || p.position;
    if (!groups[pos]) groups[pos] = [];
    groups[pos].push(p);
  }
  return groups;
}

function formatMarketValue(amount: number): string {
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)}m`;
  if (amount >= 1_000) return `${(amount / 1_000).toFixed(0)}k`;
  return String(amount);
}

function resolveLeagueName(leagueId: string): string {
  const league = FEATURED_LEAGUES.find(l => l.id === leagueId);
  return league?.name || leagueId;
}
