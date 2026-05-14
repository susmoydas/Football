import React, { useState, useEffect, useCallback } from 'react';
import { StatusBar, Platform } from 'react-native';
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
import { Home01Icon, Calendar03Icon, UserGroupIcon, ChartIcon, MoreHorizontalIcon } from '@hugeicons/core-free-icons';
import { Screen, Match, Team } from './src/types';
import { getFavMatches, getFavTeams, toggleFavMatch, toggleFavTeam, getSelectedLeague } from './src/services/storage';
import { setupNotificationHandler } from './src/services/notifications';

import SplashScreen from './src/screens/SplashScreen';
import HomeScreen from './src/screens/HomeScreen';
import FixturesScreen from './src/screens/FixturesScreen';
import TeamsScreen from './src/screens/TeamsScreen';
import StandingsScreen from './src/screens/StandingsScreen';
import FavouritesScreen from './src/screens/FavouritesScreen';
import MatchDetailsScreen from './src/screens/MatchDetailsScreen';
import ResultsScreen from './src/screens/ResultsScreen';
import MoreScreen from './src/screens/MoreScreen';
import NewsScreen from './src/screens/NewsScreen';
import NewsArticleScreen from './src/screens/NewsArticleScreen';

import './global.css';

const queryClient = new QueryClient();
const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const NAV_ITEMS: { id: string; icon: any; label: string }[] = [
  { id: 'Home', icon: Home01Icon, label: 'Home' },
  { id: 'Fixtures', icon: Calendar03Icon, label: 'Matches' },
  { id: 'Teams', icon: UserGroupIcon, label: 'Teams' },
  { id: 'Standings', icon: ChartIcon, label: 'Standings' },
  { id: 'More', icon: MoreHorizontalIcon, label: 'More' },
];

function BottomNav({ state, navigation }: { state: any; navigation: any }) {
  const active = state.routes[state.index].name;
  return (
    <Box className="bg-background-0 border-t border-background-900 px-1 pt-1" style={{ paddingBottom: Platform.OS === 'ios' ? 20 : 8 }}>
      <HStack className="items-center">
        {NAV_ITEMS.map(item => {
          const isActive = active === item.id;
          return (
            <Pressable
              key={item.id}
              className="flex-1 items-center py-1 relative"
              onPress={() => navigation.navigate(item.id)}
            >
              {isActive && <Box className="absolute -top-1 left-[30%] right-[30%] h-[2px] rounded-sm bg-success-500" />}
              <HugeiconsIcon icon={item.icon} size={22} color={isActive ? '#20C997' : '#4A4A5A'} />
              <Text className={`text-[10px] font-semibold mt-0.5 ${isActive ? 'text-success-500' : 'text-typography-500'}`}>{item.label}</Text>
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
    case 'favourites':
      return navigation.navigate('Favourites');
    case 'news':
      return navigation.navigate('News');
    case 'news-article':
      return navigation.navigate('NewsArticle', { article: data });
    case 'results':
      return navigation.navigate('Results');
    default:
      return undefined;
  }
};

function HomeStack({ favourites, onToggleFavourite, selectedLeagueId, allMatches, allTeams }: { favourites: Set<string>; onToggleFavourite: (id: string) => void; selectedLeagueId: string; allMatches: Match[]; allTeams: Team[]; }) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeMain">
        {({ navigation }) => (
          <HomeScreen
            favourites={favourites}
            onToggleFavourite={onToggleFavourite}
            selectedLeagueId={selectedLeagueId}
            onNavigate={buildNavigate(navigation)}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="MatchDetails">
        {({ navigation, route }: { navigation: any; route: { params?: any } }) => (
          <MatchDetailsScreen
            onNavigate={buildNavigate(navigation)}
            matchData={route.params?.matchData as Match}
            favourites={favourites}
            onToggleFavourite={onToggleFavourite}
            navigation={navigation}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="Favourites">
        {({ navigation }) => (
          <FavouritesScreen
            favourites={favourites}
            onToggleFavourite={onToggleFavourite}
            allMatches={allMatches}
            allTeams={allTeams}
            onNavigate={buildNavigate(navigation)}
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
    </Stack.Navigator>
  );
}

function FixturesStack({ favourites, onToggleFavourite, selectedLeagueId }: { favourites: Set<string>; onToggleFavourite: (id: string) => void; selectedLeagueId: string; }) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="FixturesMain">
        {({ navigation }) => (
          <FixturesScreen
            favourites={favourites}
            onToggleFavourite={onToggleFavourite}
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
            favourites={favourites}
            onToggleFavourite={onToggleFavourite}
            navigation={navigation}
          />
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
}

function TeamsStack({ favourites, onToggleFavourite, selectedLeagueId }: { favourites: Set<string>; onToggleFavourite: (id: string) => void; selectedLeagueId: string; }) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="TeamsMain">
        {({ navigation }) => (
          <TeamsScreen
            favourites={favourites}
            onToggleFavourite={onToggleFavourite}
            selectedLeagueId={selectedLeagueId}
            navigation={navigation}
          />
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
}

function StandingsStack({ selectedLeagueId }: { selectedLeagueId: string }) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="StandingsMain">
        {({ navigation }) => <StandingsScreen selectedLeagueId={selectedLeagueId} navigation={navigation} />}
      </Stack.Screen>
    </Stack.Navigator>
  );
}

function MoreStack({ selectedLeagueId, onLeagueChange }: { selectedLeagueId: string; onLeagueChange: (id: string) => void; }) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MoreMain">
        {({ navigation }) => <MoreScreen selectedLeagueId={selectedLeagueId} onLeagueChange={onLeagueChange} navigation={navigation} />}
      </Stack.Screen>
    </Stack.Navigator>
  );
}

function MainTabs({ favourites, onToggleFavourite, selectedLeagueId, allMatches, allTeams, onLeagueChange }: { favourites: Set<string>; onToggleFavourite: (id: string) => void; selectedLeagueId: string; allMatches: Match[]; allTeams: Team[]; onLeagueChange: (id: string) => void; }) {
  return (
    <Tab.Navigator tabBar={props => <BottomNav {...props} />} screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Home">
        {() => (
          <HomeStack
            favourites={favourites}
            onToggleFavourite={onToggleFavourite}
            selectedLeagueId={selectedLeagueId}
            allMatches={allMatches}
            allTeams={allTeams}
          />
        )}
      </Tab.Screen>
      <Tab.Screen name="Fixtures">
        {() => (
          <FixturesStack
            favourites={favourites}
            onToggleFavourite={onToggleFavourite}
            selectedLeagueId={selectedLeagueId}
          />
        )}
      </Tab.Screen>
      <Tab.Screen name="Teams">
        {() => (
          <TeamsStack
            favourites={favourites}
            onToggleFavourite={onToggleFavourite}
            selectedLeagueId={selectedLeagueId}
          />
        )}
      </Tab.Screen>
      <Tab.Screen name="Standings">
        {() => <StandingsStack selectedLeagueId={selectedLeagueId} />}
      </Tab.Screen>
      <Tab.Screen name="More">
        {() => <MoreStack selectedLeagueId={selectedLeagueId} onLeagueChange={onLeagueChange} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [favouriteIds, setFavouriteIds] = useState<Set<string>>(new Set());
  const [allMatches, setAllMatches] = useState<Match[]>([]);
  const [allTeams, setAllTeams] = useState<Team[]>([]);
  const [selectedLeagueId, setSelectedLeagueId] = useState('1');

  const LEGACY_LEAGUE_MAP: Record<string, string> = {
    '4328': '1', '4335': '3', '4331': '5', '4332': '4',
    '4334': '6', '4480': '7', '4346': '18',
  };

  useEffect(() => {
    setupNotificationHandler();
    Promise.all([getFavMatches(), getFavTeams(), getSelectedLeague()]).then(([m, t, league]) => {
      setFavouriteIds(new Set([...m, ...t]));
      setSelectedLeagueId(LEGACY_LEAGUE_MAP[league] ?? league);
    });
  }, []);

  const handleToggleFavourite = useCallback(async (id: string) => {
    const isMId = allMatches.some(m => m.id === id);
    if (isMId) await toggleFavMatch(id);
    else await toggleFavTeam(id);

    setFavouriteIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, [allMatches]);

  if (showSplash) {
    return (
      <QueryClientProvider client={queryClient}>
        <StatusBar barStyle="light-content" backgroundColor="#1C1B23" />
        <SplashScreen onFinish={() => setShowSplash(false)} />
      </QueryClientProvider>
    );
  }

  return (
    <GluestackUIProvider mode="dark">
      <QueryClientProvider client={queryClient}>
        <SafeAreaProvider>
          <StatusBar barStyle="light-content" backgroundColor="#1C1B23" />
          <NavigationContainer>
            <SafeAreaView style={{ flex: 1, backgroundColor: '#1C1B23' }} edges={['bottom']}>
              <MainTabs
                favourites={favouriteIds}
                onToggleFavourite={handleToggleFavourite}
                selectedLeagueId={selectedLeagueId}
                allMatches={allMatches}
                allTeams={allTeams}
                onLeagueChange={setSelectedLeagueId}
              />
            </SafeAreaView>
          </NavigationContainer>
        </SafeAreaProvider>
      </QueryClientProvider>
    </GluestackUIProvider>
  );
}

