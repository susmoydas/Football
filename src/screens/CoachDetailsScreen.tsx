import React, { useState, useEffect } from 'react';
import { ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { C, CoachStaff } from '../types';
import { fetchCoach } from '../services/api';
import { Text } from '@/components/ui/text';
import { Heading } from '@/components/ui/heading';
import { Card } from '@/components/ui/card';
import { Box } from '@/components/ui/box';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { LoadingSpinner, Header } from '../components';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { Location01Icon, Calendar01Icon, ChartAverageIcon, ClipboardIcon } from '@hugeicons/core-free-icons';

interface Props {
  coachData: CoachStaff;
  navigation?: any;
}

export default function CoachDetailsScreen({ coachData, navigation }: Props) {
  const [coach, setCoach] = useState<CoachStaff | null>(null);
  const [imgError, setImgError] = useState(false);
  const coachImageUrl = `https://sports.bzzoiro.com/img/manager/${coachData.id}/`;

  useEffect(() => {
    fetchCoach(coachData.id).then(setCoach);
  }, [coachData.id]);

  const data = coach || coachData;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }} edges={['top', 'bottom']}>
      <Header title={data.name} showBack onBackPress={() => navigation?.goBack()} />
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Hero Card */}
        <Card size="sm" variant="elevated" className="rounded-xl mx-4 mb-4 items-center py-6">
          <Box className="w-20 h-20 rounded-full bg-background-100 overflow-hidden items-center justify-center mb-3">
            {!imgError ? (
              <Image
                source={{ uri: coachImageUrl }}
                style={{ width: 80, height: 80, borderRadius: 40 }}
                resizeMode="cover"
                onError={() => setImgError(true)}
              />
            ) : (
              <Text size="3xl" className="text-typography-500 font-bold">
                {getInitials(data.name)}
              </Text>
            )}
          </Box>
          <Heading size="2xl" className="text-typography-0 font-bold">{data.name}</Heading>
          <Box className="bg-success-100 rounded-lg px-3 py-1 mt-2">
            <Text size="sm" className="text-success-500 font-bold">{data.role}</Text>
          </Box>
        </Card>

        {/* Info Grid */}
        <Box className="mx-4 mb-4">
          <HStack className="gap-3 mb-3">
            <InfoCard icon={Location01Icon} label="Country" value={data.country || 'N/A'} />
            <InfoCard icon={ClipboardIcon} label="Formation" value={data.preferredFormation || 'N/A'} />
          </HStack>
          <HStack className="gap-3">
            <InfoCard icon={ChartAverageIcon} label="Tactical Profile" value={capitalize(data.tacticalProfile || 'N/A')} />
            <InfoCard icon={Calendar01Icon} label="Matches" value={data.matchesTotal != null ? String(data.matchesTotal) : 'N/A'} />
          </HStack>
        </Box>

        {/* Win Rate */}
        <Box className="mx-4 mb-4">
          <Heading size="lg" className="text-typography-0 font-bold mb-3">Performance</Heading>
          <Card size="sm" variant="elevated" className="rounded-xl px-4 py-5 items-center">
            <Text size="2xs" className="text-typography-500">Win Rate</Text>
            {data.winPct != null ? (
              <Text size="5xl" className="text-success-500 font-extrabold mt-1">{data.winPct}%</Text>
            ) : (
              <Text size="3xl" className="text-typography-500 mt-1">—</Text>
            )}
            <HStack className="gap-4 mt-3">
              <RecordBadge label="W" value={data.wins ?? 0} color="#0D9F68" />
              <RecordBadge label="D" value={data.draws ?? 0} color="#FFD166" />
              <RecordBadge label="L" value={data.losses ?? 0} color="#EF476F" />
            </HStack>
          </Card>
        </Box>

        {/* Detailed Stats */}
        <Box className="mx-4 mb-4">
          <Heading size="lg" className="text-typography-0 font-bold mb-3">Statistics</Heading>
          <HStack className="gap-3 mb-3">
            <StatCard label="Goals Scored" value={data.avgGoalsScored != null ? `${data.avgGoalsScored}` : '—'} suffix="/match" />
            <StatCard label="Goals Conceded" value={data.avgGoalsConceded != null ? `${data.avgGoalsConceded}` : '—'} suffix="/match" />
          </HStack>
          <HStack className="gap-3 mb-3">
            <StatCard label="Clean Sheet" value={data.cleanSheetPct != null ? `${data.cleanSheetPct}%` : '—'} />
            <StatCard label="BTTS" value={data.bttsPct != null ? `${data.bttsPct}%` : '—'} />
          </HStack>
          <HStack className="gap-3">
            <StatCard label="Over 2.5" value={data.over25Pct != null ? `${data.over25Pct}%` : '—'} />
            <StatCard label="Avg Possession" value={data.avgPossession != null ? `${data.avgPossession}%` : '—'} />
          </HStack>
        </Box>
      </ScrollView>
    </SafeAreaView>
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

function StatCard({ label, value, suffix }: { label: string; value: string; suffix?: string }) {
  return (
    <Card size="sm" variant="elevated" className="rounded-xl flex-1 px-4 py-3.5 items-center">
      <Text size="2xs" className="text-typography-500">{label}</Text>
      <Text size="xl" className="text-typography-0 font-bold mt-1">
        {value}<Text size="xs" className="text-typography-500">{suffix || ''}</Text>
      </Text>
    </Card>
  );
}

function RecordBadge({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <VStack className="items-center">
      <Text size="lg" className="font-extrabold" style={{ color }}>{value}</Text>
      <Text size="xs" className="text-typography-500 font-bold">{label}</Text>
    </VStack>
  );
}

function getInitials(name: string): string {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

function capitalize(str: string): string {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}
