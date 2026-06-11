import React, { useState, useEffect } from 'react';
import { ScrollView, RefreshControl, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { C, NewsArticle } from '../types';
import { NewsFeedCard, Header, SkeletonNewsCard, FadeInView, SkeletonError } from '../components';
import { fetchFootballNews } from '../services/api';

interface Props {
  navigation?: any;
}

export default function NewsScreen({ navigation }: Props) {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(false);

  const load = async (isRefresh?: boolean) => {
    if (isRefresh) setRefreshing(true);
    setError(false);
    const data = await fetchFootballNews();
    if (data.length > 0) {
      setArticles(data);
    } else if (!isRefresh) {
      setError(true);
    }
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    load();
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }} edges={['top', 'bottom']}>
        <Header title="News" showBack onBackPress={() => navigation?.goBack()} />
        <ScrollView
          style={{ flex: 1, backgroundColor: C.bg }}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 16, paddingBottom: 48 }}
        >
          {[1, 2, 3, 4, 5].map(i => <SkeletonNewsCard key={i} />)}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }} edges={['top', 'bottom']}>
      <Header title="News" showBack onBackPress={() => navigation?.goBack()} />
      <FadeInView style={{ flex: 1 }}>
        <ScrollView
          style={{ flex: 1, backgroundColor: C.bg }}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 16, paddingBottom: 48 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => load(true)}
              tintColor={C.accent}
              colors={[C.accent]}
            />
          }
        >
          {error ? (
            <SkeletonError onRetry={() => load()} />
          ) : articles.length === 0 ? (
            <SkeletonError message="No news available right now. Pull to retry." onRetry={() => load(true)} />
          ) : (
            articles.map(n => (
              <NewsFeedCard
                key={n.id}
                article={n}
                onPress={() => navigation?.navigate('NewsArticle', { article: n })}
              />
            ))
          )}
        </ScrollView>
      </FadeInView>
    </SafeAreaView>
  );
}
