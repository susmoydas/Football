import React, { useState } from 'react';
import { View, Text, ScrollView, Image, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { StarIcon } from '@hugeicons/core-free-icons';
import { C, NewsArticle } from '../types';
import { Header } from '../components';

interface Props {
  route?: any;
  navigation?: any;
}

export default function NewsArticleScreen({ route, navigation }: Props) {
  const article = route?.params?.article;
  const [imgError, setImgError] = useState(false);

  if (!article) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }} edges={['top', 'bottom']}>
        <Header title="News" showBack onBackPress={() => navigation?.goBack()} rightAction={{ icon: <HugeiconsIcon icon={StarIcon} size={16} color="#FFD700" />, onPress: () => navigation?.navigate('Favourites') }} />
        <View style={s.errorContainer}>
          <Text style={s.errorText}>Article not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }} edges={['top', 'bottom']}>
      <Header title="News" showBack onBackPress={() => navigation?.goBack()} rightAction={{ icon: <HugeiconsIcon icon={StarIcon} size={16} color="#FFD700" />, onPress: () => navigation?.navigate('Favourites') }} />
      <ScrollView
        style={{ flex: 1, backgroundColor: C.bg }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: 48 }}
      >
        <View style={s.imagePlaceholder}>
          {article.image && !imgError ? (
            <Image source={{ uri: article.image }} style={{ width: '100%', height: 200, borderRadius: 16 }} resizeMode="cover" onError={() => setImgError(true)} />
          ) : (
            <Text style={{ fontSize: 64 }}>📰</Text>
          )}
        </View>

        <Text style={s.title}>{article.title}</Text>

        <View style={s.meta}>
          <Text style={s.source}>{article.source}</Text>
          <Text style={s.dot}>•</Text>
          <Text style={s.time}>{article.time}</Text>
        </View>

        <View style={s.divider} />

        <Text style={s.content}>
          {article.content || `Full article content for "${article.title}" would appear here. This is a detailed view of the news article with complete information, analysis, and related coverage.`}
        </Text>
        <Text style={s.content}>
          Stay tuned for more updates on this developing story. Check back later for the latest news and analysis from our team of reporters and experts.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  imagePlaceholder: {
    width: '100%', height: 200, borderRadius: 16, overflow: 'hidden',
    backgroundColor: C.cardAlt, alignItems: 'center', justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    color: C.textPrimary, fontSize: 22, fontWeight: '800',
    lineHeight: 28, marginBottom: 12,
  },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 20 },
  source: { color: C.accent, fontSize: 13, fontWeight: '600' },
  dot: { color: C.textSecondary, fontSize: 13 },
  time: { color: C.textSecondary, fontSize: 13 },
  divider: { height: 1, backgroundColor: C.border, marginBottom: 20 },
  content: {
    color: C.textSecondary, fontSize: 15, lineHeight: 24,
    marginBottom: 16,
  },
  errorContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  errorText: { color: C.textSecondary, fontSize: 16 },
});
