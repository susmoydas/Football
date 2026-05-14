import React, { useState, useEffect } from 'react';
import { StatusBar, Platform, ActivityIndicator, View } from 'react-native';
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
import { Screen, Match } from './src/types';
import { getSelectedLeague } from './src/services/storage';
import { setupNotificationHandler } from './src/services/notifications';

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

import './global.css';

const queryClient = new QueryClient();
const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const NAV_ITEMS: { id: string; icon: any; label: string }[] = [
  { id: 'Home', icon: Home01Icon, label: 'Home' },
  { id: 'Fixtures', icon: Calendar03Icon, label: 'Matches' },
  { id: 'Teams', icon: UserGroupIcon, label: 'Teams' },
  { id: 'Standings', icon: ChartIcon, label: 'Standings' },
  { id: 'More', icon: Menu02Icon, label: 'More' },
];

function BottomNav({ state, navigation }: { state: any; navigation: any }) {
  const active = state.routes[state.index].name;
  return (
    <Box className="bg-background-0" style={{ paddingTop: 4, paddingBottom: Platform.OS === 'ios' ? 8 : 4 }}>
      <HStack className="items-start justify-around">
        {NAV_ITEMS.map(item => {
          const isActive = active === item.id;
          return (
            <Pressable
              key={item.id}
              className="items-center"
              style={{ width: 56 }}
              onPress={() => navigation.navigate(item.id)}
            >
              <Box
                className="items-center justify-center"
                style={{
                  width: 40,
                  height: 32,
                  borderRadius: 10,
                  backgroundColor: isActive ? '#0D9F68' + '15' : 'transparent',
                }}
              >
                <HugeiconsIcon icon={item.icon} size={22} color={isActive ? '#0D9F68' : '#5A5A6E'} />
              </Box>
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: isActive ? '700' : '500',
                  color: isActive ? '#0D9F68' : '#5A5A6E',
                  marginTop: 3,
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
    default:
      return undefined;
  }
};

function HomeStack({ selectedLeagueId }: { selectedLeagueId: string; }) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeMain">
        {({ navigation }) => (
          <HomeScreen
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

function FixturesStack({ selectedLeagueId }: { selectedLeagueId: string; }) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
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
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="TeamsMain">
        {({ navigation }) => (
          <TeamsScreen
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
        {() => <MoreScreen selectedLeagueId={selectedLeagueId} onLeagueChange={onLeagueChange} />}
      </Stack.Screen>
    </Stack.Navigator>
  );
}

function MainTabs({ selectedLeagueId, onLeagueChange }: { selectedLeagueId: string; onLeagueChange: (id: string) => void; }) {
  return (
    <Tab.Navigator tabBar={props => <BottomNav {...props} />} screenOptions={{ headerShown: false, tabBarStyle: { padding: 0, margin: 0, backgroundColor: 'transparent', borderTopWidth: 0, elevation: 0 } }}>
      <Tab.Screen name="Home">
        {() => (
          <HomeStack
            selectedLeagueId={selectedLeagueId}
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
        {() => <StandingsStack selectedLeagueId={selectedLeagueId} />}
      </Tab.Screen>
      <Tab.Screen name="More">
        {() => <MoreStack selectedLeagueId={selectedLeagueId} onLeagueChange={onLeagueChange} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    Lexend_400Regular,
    Lexend_500Medium,
    Lexend_600SemiBold,
    Lexend_700Bold,
    Lexend_800ExtraBold,
  });
  const [showSplash, setShowSplash] = useState(true);
  const [selectedLeagueId, setSelectedLeagueId] = useState('1');

  const LEGACY_LEAGUE_MAP: Record<string, string> = {
    '4328': '1', '4335': '3', '4331': '5', '4332': '4',
    '4334': '6', '4480': '7', '4346': '18',
  };

  useEffect(() => {
    setupNotificationHandler();
    getSelectedLeague().then(league => {
      setSelectedLeagueId(LEGACY_LEAGUE_MAP[league] ?? league);
    });
  }, []);

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, backgroundColor: '#000000', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#0D9F68" />
      </View>
    );
  }

  if (showSplash) {
    return (
      <QueryClientProvider client={queryClient}>
        <StatusBar barStyle="light-content" backgroundColor="#000000" />
        <SplashScreen onFinish={() => setShowSplash(false)} />
      </QueryClientProvider>
    );
  }

  return (
    <GluestackUIProvider mode="dark">
      <QueryClientProvider client={queryClient}>
        <SafeAreaProvider>
          <StatusBar barStyle="light-content" backgroundColor="#000000" />
          <NavigationContainer>
            <SafeAreaView style={{ flex: 1, backgroundColor: '#000000' }} edges={['bottom']}>
              <MainTabs
                selectedLeagueId={selectedLeagueId}
                onLeagueChange={setSelectedLeagueId}
              />
            </SafeAreaView>
          </NavigationContainer>
        </SafeAreaProvider>
      </QueryClientProvider>
    </GluestackUIProvider>
  );
}

