import React, { useState, useEffect } from 'react';
import { ScrollView, RefreshControl, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { C, NewsArticle } from '../types';
import { NewsFeedCard, Header, LoadingSpinner } from '../components';
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

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }} edges={['top', 'bottom']}>
      <Header
        title="News"
        showBack
        onBackPress={() => navigation?.goBack()}
      />
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
        {loading ? (
          <LoadingSpinner />
        ) : error ? (
          <View style={{ alignItems: 'center', paddingVertical: 48, gap: 12 }}>
            <Text style={{ color: C.textSecondary, fontSize: 15, textAlign: 'center' }}>
              Unable to load news.{'\n'}Pull down to retry.
            </Text>
          </View>
        ) : articles.length === 0 ? (
          <View style={{ alignItems: 'center', paddingVertical: 48 }}>
            <Text style={{ color: C.textSecondary, fontSize: 15, textAlign: 'center' }}>
              No news available right now.
            </Text>
          </View>
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
    </SafeAreaView>
  );
}
