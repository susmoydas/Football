import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  FAV_MATCHES: '@f26_fav_matches',
  FAV_TEAMS: '@f26_fav_teams',
  SELECTED_LEAGUE: '@f26_league',
  NOTIFICATIONS_ENABLED: '@f26_notifications_enabled',
  MATCH_TODAY_NOTIF: '@f26_match_today',
  MATCH_RUNNING_NOTIF: '@f26_match_running',
  MATCH_DONE_NOTIF: '@f26_match_done',
  CACHE_LEAGUES: '@f26_cache_leagues',
  CACHE_MATCHES: '@f26_cache_matches_',
  CACHE_TEAMS: '@f26_cache_teams_',
  CACHE_TIMESTAMP: '@f26_cache_ts_',
};

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// ─── Generic cache ────────────────────────────────────────────────────────────

async function getCacheItem<T>(key: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return null;
    const { data, ts } = JSON.parse(raw);
    if (Date.now() - ts > CACHE_TTL) return null;
    return data as T;
  } catch {
    return null;
  }
}

async function setCacheItem<T>(key: string, data: T): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify({ data, ts: Date.now() }));
  } catch {}
}

// ─── League cache ─────────────────────────────────────────────────────────────

export async function getCachedLeagues(): Promise<any[] | null> {
  return getCacheItem<any[]>(KEYS.CACHE_LEAGUES);
}

export async function setCachedLeagues(data: any[]): Promise<void> {
  return setCacheItem(KEYS.CACHE_LEAGUES, data);
}

// ─── Match cache ──────────────────────────────────────────────────────────────

export async function getCachedMatches(leagueId: string): Promise<any[] | null> {
  return getCacheItem<any[]>(KEYS.CACHE_MATCHES + leagueId);
}

export async function setCachedMatches(leagueId: string, data: any[]): Promise<void> {
  return setCacheItem(KEYS.CACHE_MATCHES + leagueId, data);
}

// ─── Team cache ───────────────────────────────────────────────────────────────

export async function getCachedTeams(leagueId: string): Promise<any[] | null> {
  return getCacheItem<any[]>(KEYS.CACHE_TEAMS + leagueId);
}

export async function setCachedTeams(leagueId: string, data: any[]): Promise<void> {
  return setCacheItem(KEYS.CACHE_TEAMS + leagueId, data);
}

// ─── Favourites ───────────────────────────────────────────────────────────────

export async function getFavMatches(): Promise<string[]> {
  const v = await AsyncStorage.getItem(KEYS.FAV_MATCHES);
  return v ? JSON.parse(v) : [];
}

export async function toggleFavMatch(id: string): Promise<boolean> {
  const favs = await getFavMatches();
  const idx = favs.indexOf(id);
  if (idx !== -1) favs.splice(idx, 1);
  else favs.push(id);
  await AsyncStorage.setItem(KEYS.FAV_MATCHES, JSON.stringify(favs));
  return idx === -1; // true = now favourite
}

export async function getFavTeams(): Promise<string[]> {
  const v = await AsyncStorage.getItem(KEYS.FAV_TEAMS);
  return v ? JSON.parse(v) : [];
}

export async function toggleFavTeam(id: string): Promise<boolean> {
  const favs = await getFavTeams();
  const idx = favs.indexOf(id);
  if (idx !== -1) favs.splice(idx, 1);
  else favs.push(id);
  await AsyncStorage.setItem(KEYS.FAV_TEAMS, JSON.stringify(favs));
  return idx === -1;
}

export async function clearAllFavourites(): Promise<void> {
  await AsyncStorage.multiRemove([KEYS.FAV_MATCHES, KEYS.FAV_TEAMS]);
}

// ─── Selected league ──────────────────────────────────────────────────────────

export async function getSelectedLeague(): Promise<string> {
  const v = await AsyncStorage.getItem(KEYS.SELECTED_LEAGUE);
  return v ?? '1'; // Default: Premier League
}

export async function saveSelectedLeague(id: string): Promise<void> {
  await AsyncStorage.setItem(KEYS.SELECTED_LEAGUE, id);
}

// ─── Notifications ────────────────────────────────────────────────────────────

export interface NotificationSettings {
  enabled: boolean;
  matchToday: boolean;
  matchRunning: boolean;
  matchDone: boolean;
}

export async function getNotificationSettings(): Promise<NotificationSettings> {
  const [enabled, today, running, done] = await Promise.all([
    AsyncStorage.getItem(KEYS.NOTIFICATIONS_ENABLED),
    AsyncStorage.getItem(KEYS.MATCH_TODAY_NOTIF),
    AsyncStorage.getItem(KEYS.MATCH_RUNNING_NOTIF),
    AsyncStorage.getItem(KEYS.MATCH_DONE_NOTIF),
  ]);
  
  return {
    enabled: enabled !== null ? enabled === 'true' : true,
    matchToday: today !== null ? today === 'true' : true,
    matchRunning: running !== null ? running === 'true' : true,
    matchDone: done !== null ? done === 'true' : true,
  };
}

export async function saveNotificationSettings(settings: NotificationSettings): Promise<void> {
  await Promise.all([
    AsyncStorage.setItem(KEYS.NOTIFICATIONS_ENABLED, settings.enabled.toString()),
    AsyncStorage.setItem(KEYS.MATCH_TODAY_NOTIF, settings.matchToday.toString()),
    AsyncStorage.setItem(KEYS.MATCH_RUNNING_NOTIF, settings.matchRunning.toString()),
    AsyncStorage.setItem(KEYS.MATCH_DONE_NOTIF, settings.matchDone.toString()),
  ]);
}

export async function updateNotificationSetting(key: keyof NotificationSettings, value: boolean): Promise<void> {
  const settings = await getNotificationSettings();
  settings[key] = value;
  await saveNotificationSettings(settings);
}
