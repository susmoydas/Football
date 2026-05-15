import React, { useState } from 'react';
import { ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { C, Player } from '../types';
import { Text } from '@/components/ui/text';
import { Heading } from '@/components/ui/heading';
import { Card } from '@/components/ui/card';
import { Box } from '@/components/ui/box';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { Header } from '../components';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { Location01Icon, Calendar01Icon, ChartAverageIcon, FootballIcon } from '@hugeicons/core-free-icons';

interface Props {
  playerData: Player;
  navigation?: any;
}

export default function PlayerDetailsScreen({ playerData, navigation }: Props) {
  const [imgError, setImgError] = useState(false);
  const playerImageUrl = `https://sports.bzzoiro.com/img/player/${playerData.id}/`;

  const positionLabel = playerData.specificPosition || playerData.position;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }} edges={['top', 'bottom']}>
      <Header title={playerData.name} showBack onBackPress={() => navigation?.goBack()} />
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Hero Card */}
        <Card size="sm" variant="elevated" className="rounded-xl mx-4 mb-4 items-center py-6">
          <Box className="w-20 h-20 rounded-full bg-background-100 overflow-hidden items-center justify-center mb-3">
            {!imgError ? (
              <Image
                source={{ uri: playerImageUrl }}
                style={{ width: 80, height: 80, borderRadius: 40 }}
                resizeMode="cover"
                onError={() => setImgError(true)}
              />
            ) : (
              <Text size="3xl" className="text-typography-500 font-bold">
                {getInitials(playerData.name)}
              </Text>
            )}
          </Box>
          <Heading size="2xl" className="text-typography-0 font-bold">{playerData.name}</Heading>
          <HStack className="items-center gap-2 mt-1">
            {playerData.jerseyNumber && (
              <Box className="bg-background-100 rounded-lg px-2.5 py-1">
                <Text size="sm" className="text-typography-500 font-bold">#{playerData.jerseyNumber}</Text>
              </Box>
            )}
            <Box className={`rounded-lg px-2.5 py-1 ${playerData.availability === 'available' ? 'bg-success-600' : playerData.availability === 'injured' ? 'bg-error-500' : 'bg-warning-500'}`}>
              <Text size="sm" className="text-white font-bold">
                {playerData.availability === 'available' ? 'Available' : playerData.availability === 'injured' ? 'Injured' : 'Doubtful'}
              </Text>
            </Box>
          </HStack>
          <Text size="sm" className="text-typography-500 font-medium mt-2">{positionLabel}</Text>
        </Card>

        {/* Info Grid */}
        <Box className="mx-4 mb-4">
          <HStack className="gap-3 mb-3">
            <InfoCard icon={Location01Icon} label="Nationality" value={playerData.nationality || 'N/A'} />
            <InfoCard icon={Calendar01Icon} label="Date of Birth" value={playerData.dateOfBirth || 'N/A'} />
          </HStack>
          <HStack className="gap-3">
            <InfoCard icon={ChartAverageIcon} label="Height" value={playerData.heightCm ? `${playerData.heightCm} cm` : 'N/A'} />
            <InfoCard icon={FootballIcon} label="Preferred Foot" value={playerData.preferredFoot || 'N/A'} />
          </HStack>
        </Box>

        {/* Market Value & Contract */}
        <Box className="mx-4 mb-4">
          <Heading size="lg" className="text-typography-0 font-bold mb-3">Contract & Value</Heading>
          <Card size="sm" variant="elevated" className="rounded-xl px-4 py-4">
            <HStack className="items-center">
              <VStack className="flex-1">
                <Text size="2xs" className="text-typography-500">Market Value</Text>
                {playerData.marketValueEur != null ? (
                  <Text size="xl" className="text-success-500 font-bold mt-0.5">
                    €{formatMarketValue(playerData.marketValueEur)}
                  </Text>
                ) : (
                  <Text size="sm" className="text-typography-500 mt-0.5">—</Text>
                )}
              </VStack>
              <VStack className="items-end">
                <Text size="2xs" className="text-typography-500">Contract Until</Text>
                <Text size="sm" className="text-typography-0 font-semibold mt-0.5">
                  {playerData.contractUntil || '—'}
                </Text>
              </VStack>
            </HStack>
          </Card>
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

function getInitials(name: string): string {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

function formatMarketValue(amount: number): string {
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)}m`;
  if (amount >= 1_000) return `${(amount / 1_000).toFixed(0)}k`;
  return String(amount);
}
