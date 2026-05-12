import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Match } from '../types';
import { getNotificationSettings, NotificationSettings } from './storage';

const NOTIFIED_LIVE_PREFIX = '@f26_n_live_';
const NOTIFIED_DONE_PREFIX = '@f26_n_done_';
const NOTIFIED_TODAY = '@f26_n_today';

export function setupNotificationHandler() {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

export async function requestNotificationPermissions(): Promise<boolean> {
  const { status: existing } = await Notifications.getPermissionsAsync();
  let status = existing;
  if (existing !== 'granted') {
    const response = await Notifications.requestPermissionsAsync();
    status = response.status;
  }
  if (status !== 'granted') return false;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('match-updates', {
      name: 'Match Updates',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 100, 50, 100],
    });
  }
  return true;
}

async function sendNotification(title: string, body: string, data?: Record<string, any>) {
  await Notifications.scheduleNotificationAsync({
    content: { title, body, data, sound: true },
    trigger: null,
  });
}

async function hasNotified(matchId: string, type: 'live' | 'done'): Promise<boolean> {
  const key = (type === 'live' ? NOTIFIED_LIVE_PREFIX : NOTIFIED_DONE_PREFIX) + matchId;
  return (await AsyncStorage.getItem(key)) === 'true';
}

async function markNotified(matchId: string, type: 'live' | 'done') {
  const key = (type === 'live' ? NOTIFIED_LIVE_PREFIX : NOTIFIED_DONE_PREFIX) + matchId;
  await AsyncStorage.setItem(key, 'true');
}

async function hasTodayNotified(): Promise<boolean> {
  const today = new Date().toISOString().split('T')[0];
  const stored = await AsyncStorage.getItem(NOTIFIED_TODAY);
  return stored === today;
}

async function markTodayNotified() {
  await AsyncStorage.setItem(NOTIFIED_TODAY, new Date().toISOString().split('T')[0]);
}

export async function checkAndNotifyMatches(matches: Match[], favIds: Set<string>, settings?: NotificationSettings) {
  if (!settings) settings = await getNotificationSettings();
  if (!settings.enabled) return;

  const now = new Date();
  const hour = now.getHours();

  for (const match of matches) {
    const isFav = favIds.has(match.id);

    if (match.status === 'live' && settings.matchRunning) {
      if (!(await hasNotified(match.id, 'live'))) {
        await sendNotification(
          isFav ? `⭐ ${match.homeTeam} vs ${match.awayTeam}` : `${match.homeTeam} vs ${match.awayTeam}`,
          `Match is LIVE${match.progress ? ` — ${match.progress}'` : ''} | ${match.homeScore ?? 0}–${match.awayScore ?? 0}`,
          { matchId: match.id, type: 'live' },
        );
        await markNotified(match.id, 'live');
      }
    }

    if (match.status === 'finished' && settings.matchDone) {
      if (!(await hasNotified(match.id, 'done'))) {
        await sendNotification(
          isFav ? `⭐ Full Time: ${match.homeTeam} vs ${match.awayTeam}` : `Full Time: ${match.homeTeam} vs ${match.awayTeam}`,
          `Final Score: ${match.homeScore ?? 0}–${match.awayScore ?? 0}`,
          { matchId: match.id, type: 'done' },
        );
        await markNotified(match.id, 'done');
      }
    }
  }

  if (settings.matchToday && hour >= 8 && hour <= 10) {
    const liveOrUpcoming = matches.filter(m => m.status === 'live' || m.status === 'upcoming');
    if (liveOrUpcoming.length > 0 && !(await hasTodayNotified())) {
      const favCount = liveOrUpcoming.filter(m => favIds.has(m.id)).length;
      const total = liveOrUpcoming.length;
      await sendNotification(
        '📅 Today\'s Matches',
        favCount > 0
          ? `${total} match${total > 1 ? 'es' : ''} today (${favCount} favouri${favCount > 1 ? 'tes' : 'te'})`
          : `${total} match${total > 1 ? 'es' : ''} scheduled today`,
        { type: 'today' },
      );
      await markTodayNotified();
    }
  }
}
