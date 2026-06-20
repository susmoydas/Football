import React, { useState, useEffect, useRef, Component } from 'react';
import { StatusBar, Platform, ActivityIndicator, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {
  useFonts,
  Lexend_400Regular,
  Lexend_500Medium,
  Lexend_600SemiBold,
  Lexend_700Bold,
  Lexend_800ExtraBold,
} from '@expo-google-fonts/lexend';
import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Box } from '@/components/ui/box';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { Pressable } from '@/components/ui/pressable';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { Home01Icon, Calendar03Icon, UserGroupIcon, ChartIcon, Menu02Icon } from '@hugeicons/core-free-icons';
import { Screen, Match, Team, Player, CoachStaff } from './src/types';
import { getSelectedLeague, hydrateSyncCache, setCachedMatches, setCachedLeagues, setCachedTeams, setCachedNews } from './src/services/storage';
import { initNotifications } from './src/services/notifications';
import { fetchLiveEvents, fetchLeagueEvents, fetchNextEvents, fetchRecentResults, fetchLeagues, fetchFootballNews, fetchTeamsByLeague, FEATURED_LEAGUES } from './src/services/api';


import SplashScreen from './src/screens/SplashScreen';
import HomeScreen from './src/screens/HomeScreen';
import FixturesScreen from './src/screens/FixturesScreen';
import TeamsScreen from './src/screens/TeamsScreen';
import StandingsScreen from './src/screens/StandingsScreen';
import MatchDetailsScreen from './src/screens/MatchDetailsScreen';
import ResultsScreen from './src/screens/ResultsScreen';
import MoreScreen from './src/screens/MoreScreen';
import NewsScreen from './src/screens/NewsScreen';
import NewsArticleScreen from './src/screens/NewsArticleScreen';
import TeamDetailsScreen from './src/screens/TeamDetailsScreen';
import PlayerDetailsScreen from './src/screens/PlayerDetailsScreen';
import CoachDetailsScreen from './src/screens/CoachDetailsScreen';

import './global.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 2,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
      networkMode: 'offlineFirst',
    },
  },
});
const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const NAV_ITEMS: { id: string; icon: any; label: string }[] = [
  { id: 'Home', icon: Home01Icon, label: 'Home' },
  { id: 'Fixtures', icon: Calendar03Icon, label: 'Matches' },
  { id: 'Teams', icon: UserGroupIcon, label: 'Teams' },
  { id: 'Standings', icon: ChartIcon, label: 'Stand' },
  { id: 'More', icon: Menu02Icon, label: 'More' },
];

function BottomNav({ state, navigation }: { state: any; navigation: any }) {
  const active = state.routes[state.index].name;
  const currentRoute = state.routes[state.index];
  const stackState = currentRoute?.state;
  const stackRoute = stackState?.routes?.[stackState?.index ?? 0];
  const nestedRoute = stackRoute?.state?.routes?.[stackRoute.state.index ?? 0]?.name
    || stackRoute?.state?.routeNames?.[0];
  const detailScreens = ['MatchDetails', 'TeamDetails', 'PlayerProfile', 'CoachProfile'];
  const isDetail = stackState?.routes?.some((r: any) => detailScreens.includes(r.name))
    && stackState.index > 0;
  if (isDetail) return null;
  return (
    <Box style={{ backgroundColor: '#000000', paddingTop: 0, paddingBottom: Platform.OS === 'ios' ? 4 : 2 }}>
      <HStack className="items-start justify-around">
        {NAV_ITEMS.map(item => {
          const isActive = active === item.id;
          return (
            <Pressable
              key={item.id}
              className="items-center"
              style={{ width: 60 }}
              onPress={() => navigation.navigate(item.id)}
            >
              <Box
                className="items-center justify-center"
                style={{
                  width: 40,
                  height: 30,
                  borderRadius: 10,
                  backgroundColor: isActive ? '#0D9F68' + '15' : 'transparent',
                }}
              >
                <HugeiconsIcon icon={item.icon} size={24} color={isActive ? '#0D9F68' : '#5A5A6E'} />
              </Box>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: isActive ? '700' : '500',
                  color: isActive ? '#0D9F68' : '#5A5A6E',
                  marginTop: 2,
                }}
              >
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </HStack>
    </Box>
  );
}

const buildNavigate = (navigation: any) => (screen: Screen | string, data?: any) => {
  const rootNav = navigation.getParent() ?? navigation;
  if (screen === 'match-details') {
    return navigation.navigate('MatchDetails', { matchData: data });
  }

  switch (screen) {
    case 'home':
      return rootNav.navigate('Home');
    case 'fixtures':
      return rootNav.navigate('Fixtures');
    case 'teams':
      return rootNav.navigate('Teams');
    case 'standings':
      return rootNav.navigate('Standings');
    case 'more':
      return rootNav.navigate('More');
    case 'news':
      return navigation.navigate('News');
    case 'news-article':
      return navigation.navigate('NewsArticle', { article: data });
    case 'results':
      return navigation.navigate('Results');
    case 'team-details':
      return navigation.navigate('TeamDetails', { teamData: data?.team, leagueId: data?.leagueId });
    case 'player-profile':
      return navigation.navigate('PlayerProfile', { playerData: data });
    case 'coach-profile':
      return navigation.navigate('CoachProfile', { coachData: data });
    default:
      return undefined;
  }
};

function HomeStack({ selectedLeagueId, onLeagueChange }: { selectedLeagueId: string; onLeagueChange: (id: string) => void; }) {
  return (
    <Stack.Navigator screenOptions={{
      headerShown: false,
      animation: 'none',
      animationDuration: 300,
      contentStyle: { backgroundColor: '#000000' },
    }}>
      <Stack.Screen name="HomeMain">
        {({ navigation }) => (
          <HomeScreen
            selectedLeagueId={selectedLeagueId}
            onLeagueChange={onLeagueChange}
            onNavigate={buildNavigate(navigation)}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="MatchDetails">
        {({ navigation, route }: { navigation: any; route: { params?: any } }) => (
          <MatchDetailsScreen
            onNavigate={buildNavigate(navigation)}
            matchData={route.params?.matchData as Match}
            navigation={navigation}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="News">
        {({ navigation }) => <NewsScreen navigation={navigation} />}
      </Stack.Screen>
      <Stack.Screen name="NewsArticle">
        {({ navigation, route }: { navigation: any; route: { params?: any } }) => (
          <NewsArticleScreen navigation={navigation} route={route} />
        )}
      </Stack.Screen>
      <Stack.Screen name="TeamDetails">
        {({ navigation, route }: { navigation: any; route: { params?: any } }) => (
          <TeamDetailsScreen
            navigation={navigation}
            teamData={route.params?.teamData as Team}
            selectedLeagueId={route.params?.leagueId as string}
            onNavigate={buildNavigate(navigation)}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="PlayerProfile">
        {({ navigation, route }: { navigation: any; route: { params?: any } }) => (
          <PlayerDetailsScreen
            navigation={navigation}
            playerData={route.params?.playerData as Player}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="CoachProfile">
        {({ navigation, route }: { navigation: any; route: { params?: any } }) => (
          <CoachDetailsScreen
            navigation={navigation}
            coachData={route.params?.coachData as CoachStaff}
          />
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
}

function FixturesStack({ selectedLeagueId }: { selectedLeagueId: string; }) {
  return (
    <Stack.Navigator screenOptions={{
      headerShown: false,
      animation: 'none',
      animationDuration: 300,
      contentStyle: { backgroundColor: '#000000' },
    }}>
      <Stack.Screen name="FixturesMain">
        {({ navigation }) => (
          <FixturesScreen
            selectedLeagueId={selectedLeagueId}
            onNavigate={buildNavigate(navigation)}
            navigation={navigation}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="Results">
        {({ navigation }) => (
          <ResultsScreen
            selectedLeagueId={selectedLeagueId}
            onNavigate={buildNavigate(navigation)}
            navigation={navigation}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="MatchDetails">
        {({ navigation, route }: { navigation: any; route: { params?: any } }) => (
          <MatchDetailsScreen
            onNavigate={buildNavigate(navigation)}
            matchData={route.params?.matchData as Match}
            navigation={navigation}
          />
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
}

function TeamsStack({ selectedLeagueId }: { selectedLeagueId: string; }) {
  return (
    <Stack.Navigator screenOptions={{
      headerShown: false,
      animation: 'none',
      animationDuration: 300,
      contentStyle: { backgroundColor: '#000000' },
    }}>
      <Stack.Screen name="TeamsMain">
        {({ navigation }) => (
          <TeamsScreen
            selectedLeagueId={selectedLeagueId}
            navigation={navigation}
            onNavigate={buildNavigate(navigation)}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="TeamDetails">
        {({ navigation, route }: { navigation: any; route: { params?: any } }) => (
          <TeamDetailsScreen
            navigation={navigation}
            teamData={route.params?.teamData as Team}
            selectedLeagueId={route.params?.leagueId as string}
            onNavigate={buildNavigate(navigation)}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="PlayerProfile">
        {({ navigation, route }: { navigation: any; route: { params?: any } }) => (
          <PlayerDetailsScreen
            navigation={navigation}
            playerData={route.params?.playerData as Player}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="CoachProfile">
        {({ navigation, route }: { navigation: any; route: { params?: any } }) => (
          <CoachDetailsScreen
            navigation={navigation}
            coachData={route.params?.coachData as CoachStaff}
          />
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
}

function StandingsStack({ selectedLeagueId, onLeagueChange }: { selectedLeagueId: string; onLeagueChange: (id: string) => void }) {
  return (
    <Stack.Navigator screenOptions={{
      headerShown: false,
      animation: 'none',
      animationDuration: 300,
      contentStyle: { backgroundColor: '#000000' },
    }}>
      <Stack.Screen name="StandingsMain">
        {({ navigation }) => (
          <StandingsScreen
            selectedLeagueId={selectedLeagueId}
            navigation={navigation}
            onNavigate={buildNavigate(navigation)}
            onLeagueChange={onLeagueChange}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="TeamDetails">
        {({ navigation, route }: { navigation: any; route: { params?: any } }) => (
          <TeamDetailsScreen
            navigation={navigation}
            teamData={route.params?.teamData as Team}
            selectedLeagueId={route.params?.leagueId as string}
            onNavigate={buildNavigate(navigation)}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="PlayerProfile">
        {({ navigation, route }: { navigation: any; route: { params?: any } }) => (
          <PlayerDetailsScreen
            navigation={navigation}
            playerData={route.params?.playerData as Player}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="CoachProfile">
        {({ navigation, route }: { navigation: any; route: { params?: any } }) => (
          <CoachDetailsScreen
            navigation={navigation}
            coachData={route.params?.coachData as CoachStaff}
          />
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
}

function MoreStack({ selectedLeagueId, onLeagueChange }: { selectedLeagueId: string; onLeagueChange: (id: string) => void; }) {
  return (
    <Stack.Navigator screenOptions={{
      headerShown: false,
      animation: 'none',
      animationDuration: 300,
      contentStyle: { backgroundColor: '#000000' },
    }}>
      <Stack.Screen name="MoreMain">
        {() => <MoreScreen selectedLeagueId={selectedLeagueId} onLeagueChange={onLeagueChange} />}
      </Stack.Screen>
    </Stack.Navigator>
  );
}

function MainTabs({ selectedLeagueId, onLeagueChange }: { selectedLeagueId: string; onLeagueChange: (id: string) => void; }) {
  return (
    <Tab.Navigator
      tabBar={props => <BottomNav {...props} />}
      screenOptions={({ route }) => ({
        headerShown: false,
        lazy: false,
        tabBarStyle: { padding: 0, margin: 0, backgroundColor: '#000000', borderTopWidth: 0, elevation: 0 },
      })}
    >
      <Tab.Screen name="Home">
        {() => (
          <HomeStack
            selectedLeagueId={selectedLeagueId}
            onLeagueChange={onLeagueChange}
          />
        )}
      </Tab.Screen>
      <Tab.Screen name="Fixtures">
        {() => (
          <FixturesStack
            selectedLeagueId={selectedLeagueId}
          />
        )}
      </Tab.Screen>
      <Tab.Screen name="Teams">
        {() => (
          <TeamsStack
            selectedLeagueId={selectedLeagueId}
          />
        )}
      </Tab.Screen>
      <Tab.Screen name="Standings">
        {() => <StandingsStack selectedLeagueId={selectedLeagueId} onLeagueChange={onLeagueChange} />}
      </Tab.Screen>
      <Tab.Screen name="More">
        {() => <MoreStack selectedLeagueId={selectedLeagueId} onLeagueChange={onLeagueChange} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

class ErrorBoundary extends Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, backgroundColor: '#000000', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <Text style={{ color: '#0D9F68', fontSize: 18, fontWeight: '700', marginBottom: 8 }}>
            Something went wrong
          </Text>
          <Text style={{ color: '#888', fontSize: 14, textAlign: 'center' }}>
            Please close and reopen the app
          </Text>
        </View>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  const [fontsLoaded] = useFonts({
    Lexend_400Regular,
    Lexend_500Medium,
    Lexend_600SemiBold,
    Lexend_700Bold,
    Lexend_800ExtraBold,
  });
  const [splashReady, setSplashReady] = useState(false);
  const [selectedLeagueId, setSelectedLeagueId] = useState('27');

  const LEGACY_LEAGUE_MAP: Record<string, string> = {
    '4328': '1', '4335': '3', '4331': '5', '4332': '4',
    '4334': '6', '4480': '7', '4346': '18',
  };

  const splashStart = useRef(Date.now());

  useEffect(() => {
    initNotifications();
    (async () => {
      await Promise.all([
        hydrateSyncCache(),
        new Promise<void>(r => setTimeout(r, 500)),
      ]);

      const league = await getSelectedLeague();
      const lid = LEGACY_LEAGUE_MAP[league] ?? league;
      setSelectedLeagueId(lid);

      // Pre-fetch matches, leagues, and news while skeleton is showing
      queryClient.prefetchQuery({
        queryKey: ['matches', lid],
        queryFn: async () => {
          const [live, league, next, recent] = await Promise.all([
            fetchLiveEvents(lid),
            fetchLeagueEvents(lid),
            fetchNextEvents(lid),
            fetchRecentResults(lid),
          ]);
          const seen = new Set<string>();
          const merged = [...live, ...league, ...next, ...recent].filter(m => {
            if (seen.has(m.id)) return false;
            seen.add(m.id);
            return true;
          }).sort((a, b) => {
            if (a.date < b.date) return -1;
            if (a.date > b.date) return 1;
            return a.time.localeCompare(b.time);
          });
          await setCachedMatches(lid, merged);
          return merged;
        },
        staleTime: 5 * 60 * 1000,
      });

      queryClient.prefetchQuery({
        queryKey: ['leagues'],
        queryFn: async () => {
          const apiLeagues = await fetchLeagues();
          const merged: any[] = [];
          const seen = new Set<string>();
          for (const l of [...FEATURED_LEAGUES, ...apiLeagues]) {
            if (!seen.has(l.id)) { seen.add(l.id); merged.push(l); }
          }
          await setCachedLeagues(merged);
          return merged;
        },
        staleTime: 5 * 60 * 1000,
      });

      queryClient.prefetchQuery({
        queryKey: ['news'],
        queryFn: async () => {
          const data = await fetchFootballNews();
          await setCachedNews(data);
          return data;
        },
        staleTime: 10 * 60 * 1000,
      });

      queryClient.prefetchQuery({
        queryKey: ['teams', lid],
        queryFn: async () => {
          const data = await fetchTeamsByLeague(lid);
          await setCachedTeams(lid, data);
          return data;
        },
        staleTime: 5 * 60 * 1000,
      });

      // Show splash for at least 1.5s so logo is visible
      const elapsed = Date.now() - splashStart.current;
      if (elapsed < 1500) {
        await new Promise<void>(r => setTimeout(r, 1500 - elapsed));
      }

      setSplashReady(true);
    })();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <GluestackUIProvider mode="dark">
        <QueryClientProvider client={queryClient}>
          <SafeAreaProvider>
            <StatusBar barStyle="light-content" backgroundColor="#000000" />
            <NavigationContainer>
              <SafeAreaView style={{ flex: 1, backgroundColor: '#000000' }} edges={['bottom']}>
                <ErrorBoundary>
                  <MainTabs
                    selectedLeagueId={selectedLeagueId}
                    onLeagueChange={setSelectedLeagueId}
                  />
                  {(!fontsLoaded || !splashReady) && (
                    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#000000' }}>
                      {!fontsLoaded ? (
                        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#000000' }}>
                          <ActivityIndicator size="large" color="#0D9F68" />
                        </View>
                      ) : (
                        <SplashScreen />
                      )}
                    </View>
                  )}
                </ErrorBoundary>
              </SafeAreaView>
            </NavigationContainer>
          </SafeAreaProvider>
        </QueryClientProvider>
      </GluestackUIProvider>
    </GestureHandlerRootView>
  );
}
