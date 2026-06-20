import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Match } from '../types';
import { getNotificationSettings, NotificationSettings } from './storage';

const NOTIFIED_LIVE_PREFIX = '@f26_n_live_';
const NOTIFIED_DONE_PREFIX = '@f26_n_done_';
const NOTIFIED_REMINDER_PREFIX = '@f26_n_rem_';
const NOTIFIED_TODAY = '@f26_n_today';
const NOTIFIED_COUNT_TODAY = '@f26_n_count_today';
const MAX_DAILY_NOTIFICATIONS = 3;

async function ensureNotificationChannel() {
  if (Platform.OS !== 'android') return;

  await Notifications.setNotificationChannelAsync('match-updates', {
    name: 'Match Updates',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 100, 50, 100],
  });
}

export async function setupNotificationHandler() {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });

  await ensureNotificationChannel();
}

export async function requestNotificationPermissions(): Promise<boolean> {
  const { status: existing } = await Notifications.getPermissionsAsync();
  let status = existing;
  if (existing !== 'granted') {
    const response = await Notifications.requestPermissionsAsync({
      android: { allowWhileIdle: true },
    });
    status = response.status;
  }
  if (status !== 'granted') return false;

  await ensureNotificationChannel();
  return true;
}

export async function initNotifications() {
  await setupNotificationHandler();
  const settings = await getNotificationSettings();
  if (settings.enabled) {
    await requestNotificationPermissions();
  }
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

async function getDailyNotificationCount(): Promise<number> {
  const today = new Date().toISOString().split('T')[0];
  const stored = await AsyncStorage.getItem(NOTIFIED_COUNT_TODAY);
  if (!stored) return 0;
  const [date, count] = stored.split('|');
  if (date !== today) return 0;
  return parseInt(count, 10) || 0;
}

async function incrementDailyNotificationCount() {
  const today = new Date().toISOString().split('T')[0];
  const count = await getDailyNotificationCount();
  await AsyncStorage.setItem(NOTIFIED_COUNT_TODAY, `${today}|${count + 1}`);
}

async function canNotifyToday(): Promise<boolean> {
  const count = await getDailyNotificationCount();
  return count < MAX_DAILY_NOTIFICATIONS;
}

function getTodayStr(): string {
  return new Date().toISOString().split('T')[0];
}

function getTomorrowStr(): string {
  const t = new Date();
  t.setDate(t.getDate() + 1);
  return t.toISOString().split('T')[0];
}

function matchPriority(m: Match, favIds: Set<string>): number {
  const todayStr = getTodayStr();
  let score = 0;
  if (favIds.has(m.id)) score += 10;
  if (m.status === 'live') score += 8;
  if (m.date === todayStr) score += 5;
  return score;
}

async function trySendNotification(
  title: string,
  body: string,
  data: Record<string, any>,
): Promise<boolean> {
  if (!(await canNotifyToday())) return false;
  await sendNotification(title, body, data);
  await incrementDailyNotificationCount();
  return true;
}

export async function checkAndNotifyMatches(
  matches: Match[],
  favIds: Set<string>,
  settings?: NotificationSettings,
) {
  if (!settings) settings = await getNotificationSettings();
  if (!settings.enabled) return;

  const todayStr = getTodayStr();
  const tomorrowStr = getTomorrowStr();

  // Only consider today's and tomorrow's matches
  const relevant = matches.filter(
    m => m.date === todayStr || m.date === tomorrowStr,
  );
  if (relevant.length === 0) return;

  // Score and sort by priority (highest first)
  const sorted = [...relevant].sort(
    (a, b) => matchPriority(b, favIds) - matchPriority(a, favIds),
  );

  // 1. Live match alerts (most urgent)
  for (const match of sorted) {
    if (match.status !== 'live') continue;
    if (match.date !== todayStr) continue;
    if (!settings.matchRunning) continue;
    if (await hasNotified(match.id, 'live')) continue;

    const isFav = favIds.has(match.id);
    const title = isFav
      ? `⭐ LIVE: ${match.homeTeam} vs ${match.awayTeam}`
      : `LIVE: ${match.homeTeam} vs ${match.awayTeam}`;
    const body = match.progress
      ? `${match.homeScore ?? 0}–${match.awayScore ?? 0} (${match.progress}')`
      : `${match.homeScore ?? 0}–${match.awayScore ?? 0}`;

    const sent = await trySendNotification(title, body, {
      matchId: match.id,
      type: 'live',
    });
    if (sent) await markNotified(match.id, 'live');
    if (!(await canNotifyToday())) return;
  }

  // 2. Finished match results (today only)
  for (const match of sorted) {
    if (match.status !== 'finished') continue;
    if (match.date !== todayStr) continue;
    if (!settings.matchDone) continue;
    if (await hasNotified(match.id, 'done')) continue;

    const isFav = favIds.has(match.id);
    const title = isFav
      ? `⭐ FT: ${match.homeTeam} vs ${match.awayTeam}`
      : `FT: ${match.homeTeam} vs ${match.awayTeam}`;
    const body = `Final Score: ${match.homeScore ?? 0}–${match.awayScore ?? 0}`;

    const sent = await trySendNotification(title, body, {
      matchId: match.id,
      type: 'done',
    });
    if (sent) await markNotified(match.id, 'done');
    if (!(await canNotifyToday())) return;
  }

  // 3. Upcoming match reminders (today's matches first, then tomorrow's)
  for (const match of sorted) {
    if (match.status !== 'upcoming') continue;
    if (!settings.matchToday) continue;

    const remKey = NOTIFIED_REMINDER_PREFIX + match.id;
    const alreadyReminded = await AsyncStorage.getItem(remKey);
    if (alreadyReminded) continue;

    const isFav = favIds.has(match.id);
    const isToday = match.date === todayStr;

    if (isToday) {
      const title = isFav
        ? `⭐ Today: ${match.homeTeam} vs ${match.awayTeam}`
        : `Today: ${match.homeTeam} vs ${match.awayTeam}`;
      const body = `Kick-off at ${match.time}${match.venue ? ` — ${match.venue}` : ''}`;
      const sent = await trySendNotification(title, body, {
        matchId: match.id,
        type: 'reminder',
      });
      if (sent) await AsyncStorage.setItem(remKey, todayStr);
    } else {
      // Tomorrow's match — send day-before reminder
      const title = isFav
        ? `⭐ Tomorrow: ${match.homeTeam} vs ${match.awayTeam}`
        : `Tomorrow: ${match.homeTeam} vs ${match.awayTeam}`;
      const body = `Kick-off at ${match.time}${match.venue ? ` — ${match.venue}` : ''}`;
      const sent = await trySendNotification(title, body, {
        matchId: match.id,
        type: 'reminder',
      });
      if (sent) await AsyncStorage.setItem(remKey, todayStr);
    }

    if (!(await canNotifyToday())) return;
  }

  // 4. Daily summary (once per morning, lowest priority)
  if (!(await canNotifyToday())) return;
  const hour = new Date().getHours();
  if (settings.matchToday && hour >= 8 && hour <= 10 && !(await hasTodayNotified())) {
    const todayUpcoming = matches.filter(
      m => m.date === todayStr && (m.status === 'live' || m.status === 'upcoming'),
    );
    if (todayUpcoming.length > 0) {
      const favCount = todayUpcoming.filter(m => favIds.has(m.id)).length;
      const title = '📅 Today\'s Matches';
      const body =
        favCount > 0
          ? `${todayUpcoming.length} match${todayUpcoming.length > 1 ? 'es' : ''} today (${favCount} favouri${favCount > 1 ? 'tes' : 'te'})`
          : `${todayUpcoming.length} match${todayUpcoming.length > 1 ? 'es' : ''} scheduled today`;
      const sent = await trySendNotification(title, body, { type: 'today' });
      if (sent) await markTodayNotified();
    }
  }
}
