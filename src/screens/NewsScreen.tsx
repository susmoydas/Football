import React from 'react';
import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { StarIcon } from '@hugeicons/core-free-icons';
import { C, NewsArticle } from '../types';
import { NewsFeedCard, Header } from '../components';

interface Props {
  onNavigate?: (screen: Screen, data?: any) => void;
  navigation?: any;
}

const NEWS: NewsArticle[] = [
  {
    id: '1', title: 'World Cup 2026: Complete guide to host cities and venues across USA, Canada & Mexico',
    source: 'FIFA News', time: '2 hours ago', featured: true,
    image: 'https://images.unsplash.com/photo-1577223625816-7546f13df25d?w=600&q=80',
    content: 'The 2026 FIFA World Cup will be the most expansive in history, featuring 48 teams across 16 host cities in the United States, Canada, and Mexico. The tournament marks the first time three nations will co-host the event, with matches spread across iconic venues including MetLife Stadium, AT&T Stadium, Estadio Azteca, and BC Place.',
  },
  {
    id: '2', title: 'Champions League quarter-finals: Preview of the biggest matches this week',
    source: 'UEFA.com', time: '4 hours ago',
    image: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=600&q=80',
    content: 'The UEFA Champions League quarter-finals are set to deliver high drama as Europe\'s elite clubs battle for a place in the semi-finals. This week\'s fixtures feature several mouth-watering ties that could go either way.',
  },
  {
    id: '3', title: 'Premier League title race: The key matches that will decide the champion',
    source: 'BBC Sport', time: '5 hours ago',
    image: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=600&q=80',
    content: 'The Premier League title race is heating up with several contenders separated by just a few points. With crucial head-to-head encounters remaining, every match carries enormous significance.',
  },
  {
    id: '4', title: 'La Liga: Barcelona and Real Madrid battle for top spot with crunch fixtures ahead',
    source: 'Marca', time: '7 hours ago',
    image: 'https://images.unsplash.com/photo-1489944966321-032c8f8a5a4b?w=600&q=80',
    content: 'The battle for La Liga supremacy continues as Barcelona and Real Madrid prepare for a series of challenging fixtures that could determine the destination of the title.',
  },
  {
    id: '5', title: 'Transfer news: Summer window set to be one of the most active in history',
    source: 'Sky Sports', time: '9 hours ago',
    image: 'https://images.unsplash.com/photo-1432521123158-c96e0ac24793?w=600&q=80',
    content: 'The upcoming summer transfer window is shaping up to be one of the most spectacular in football history, with several record-breaking deals expected to be completed.',
  },
  {
    id: '6', title: 'Bundesliga: Bayer Leverkusen continue incredible unbeaten run this season',
    source: 'Kicker', time: '12 hours ago',
    image: 'https://images.unsplash.com/photo-1575361204480-a430a8e7eae0?w=600&q=80',
    content: 'Bayer Leverkusen\'s remarkable unbeaten run continues to defy expectations as they dominate the Bundesliga this season.',
  },
];

export default function NewsScreen({ navigation }: Props) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }} edges={['top', 'bottom']}>
      <Header
        title="News"
        showBack
        onBackPress={() => navigation?.goBack()}
        rightAction={{
          icon: <HugeiconsIcon icon={StarIcon} size={18} color="#FFD700" />,
          onPress: () => navigation?.navigate('Favourites'),
        }}
      />
      <ScrollView
        style={{ flex: 1, backgroundColor: C.bg }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: 48 }}
      >
        {NEWS.map(n => (
          <NewsFeedCard
            key={n.id}
            article={n}
            onPress={() => navigation?.navigate('NewsArticle', { article: n })}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}