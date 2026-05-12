import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { C, Screen } from '../types';
import { NewsCard, Header } from '../components';

interface Props { 
  onNavigate?: (screen: Screen) => void;
  navigation?: any;
}

const NEWS = [
  { id: '1', title: 'World Cup 2026: Complete guide to host cities and venues across USA, Canada & Mexico', source: 'FIFA News', time: '2 hours ago', featured: true },
  { id: '2', title: 'Champions League quarter-finals: Preview of the biggest matches this week', source: 'UEFA.com', time: '4 hours ago' },
  { id: '3', title: 'Premier League title race: The key matches that will decide the champion', source: 'BBC Sport', time: '5 hours ago' },
  { id: '4', title: 'La Liga: Barcelona and Real Madrid battle for top spot with crunch fixtures ahead', source: 'Marca', time: '7 hours ago' },
  { id: '5', title: 'Transfer news: Summer window set to be one of the most active in history', source: 'Sky Sports', time: '9 hours ago' },
  { id: '6', title: 'Bundesliga: Bayer Leverkusen continue incredible unbeaten run this season', source: 'Kicker', time: '12 hours ago' },
];

export default function NewsScreen({ onNavigate, navigation }: Props) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }} edges={['top', 'bottom']}>
      <Header
        title="News"
        showBack={true}
        onBackPress={() => navigation?.goBack()}
      />
      <ScrollView
        style={{ flex: 1, backgroundColor: C.bg }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: 48 }}
      >
        {NEWS.map(n => <NewsCard key={n.id} title={n.title} source={n.source} time={n.time} featured={n.featured} />)}
      </ScrollView>
    </SafeAreaView>
  );
}
