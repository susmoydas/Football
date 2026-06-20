import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Match, Team, League, Standing, NewsArticle, LineupResponse, CoachStaff } from '../types';

const syncCache = new Map<string, { data: any; ts: number }>();

export async function hydrateSyncCache(): Promise<void> {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const cacheKeys = keys.filter(k => k.startsWith('@f26_'));
    const entries = await AsyncStorage.multiGet(cacheKeys);
    for (const [key, value] of entries) {
      if (value) {
        try { syncCache.set(key, JSON.parse(value)); } catch {}
      }
    }
  } catch {}
}

function getSyncData<T>(storageKey: string, ttl: number): T | undefined {
  const entry = syncCache.get(storageKey);
  if (!entry) return undefined;
  if (Date.now() - entry.ts > ttl) {
    syncCache.delete(storageKey);
    return undefined;
  }
  return entry.data as T;
}

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
  CACHE_UPCOMING: '@f26_cache_upcoming_',
  CACHE_PAST: '@f26_cache_past_',
  CACHE_TEAMS: '@f26_cache_teams_',
  CACHE_STANDINGS: '@f26_cache_standings_',
  CACHE_TEAM: '@f26_cache_team_',
  CACHE_TEAM_SQUAD: '@f26_cache_squad_',
  CACHE_TEAM_COACHES: '@f26_cache_coaches_',
  CACHE_RESULTS: '@f26_cache_results_',
  CACHE_EVENT: '@f26_cache_event_',
  CACHE_NEWS: '@f26_cache_news',
  CACHE_LINEUP: '@f26_cache_lineup_',
  CACHE_COACH: '@f26_cache_coach_',
  CACHE_TEAM_EVENTS: '@f26_cache_team_events_',
  CACHE_TIMESTAMP: '@f26_cache_ts_',
};

const TTL = {
  LEAGUES: 7 * 24 * 60 * 60 * 1000,
  TEAMS: 7 * 24 * 60 * 60 * 1000,
  STANDINGS: 2 * 60 * 60 * 1000,
  SQUAD: 7 * 24 * 60 * 60 * 1000,
  COACHES: 7 * 24 * 60 * 60 * 1000,
  TEAM: 7 * 24 * 60 * 60 * 1000,
  MATCHES: 2 * 60 * 60 * 1000,
  RESULTS: 10 * 60 * 1000,
  EVENT: 60 * 60 * 1000,
  NEWS: 30 * 60 * 1000,
  LINEUP: 24 * 60 * 60 * 1000,
  COACH: 7 * 24 * 60 * 60 * 1000,
  TEAM_EVENTS: 2 * 60 * 60 * 1000,
};

async function setItem<T>(key: string, data: T): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify({ data, ts: Date.now() }));
  } catch {}
}

async function getCached<T>(key: string, ttl: number): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return null;
    const { data, ts } = JSON.parse(raw);
    if (Date.now() - ts > ttl) return null;
    return data as T;
  } catch {
    return null;
  }
}

// ─── Sync cache helpers (for react-query initialData) ─────────────────────────

export function getSyncLeagues(): League[] | null {
  return getSyncData<League[]>(KEYS.CACHE_LEAGUES, TTL.LEAGUES) ?? null;
}

export function getSyncMatches(leagueId: string): Match[] | null {
  return getSyncData<Match[]>(KEYS.CACHE_MATCHES + leagueId, TTL.MATCHES) ?? null;
}

export function getSyncUpcomingMatches(leagueId: string): Match[] | null {
  return getSyncData<Match[]>(KEYS.CACHE_UPCOMING + leagueId, TTL.MATCHES) ?? null;
}

export function getSyncPastMatches(leagueId: string): Match[] | null {
  return getSyncData<Match[]>(KEYS.CACHE_PAST + leagueId, TTL.MATCHES) ?? null;
}

export function getSyncTeams(leagueId: string): Team[] | null {
  return getSyncData<Team[]>(KEYS.CACHE_TEAMS + leagueId, TTL.TEAMS) ?? null;
}

export function getSyncStandings(leagueId: string): Standing[] | null {
  return getSyncData<Standing[]>(KEYS.CACHE_STANDINGS + leagueId, TTL.STANDINGS) ?? null;
}

export function getSyncTeam(teamId: string): Team | null {
  return getSyncData<Team>(KEYS.CACHE_TEAM + teamId, TTL.TEAM) ?? null;
}

export function getSyncResults(leagueId: string): Match[] | null {
  return getSyncData<Match[]>(KEYS.CACHE_RESULTS + leagueId, TTL.RESULTS) ?? null;
}

export function getSyncTeamSquad(teamId: string): any[] | null {
  return getSyncData<any[]>(KEYS.CACHE_TEAM_SQUAD + teamId, TTL.SQUAD) ?? null;
}

export function getSyncTeamCoaches(teamId: string): any[] | null {
  return getSyncData<any[]>(KEYS.CACHE_TEAM_COACHES + teamId, TTL.COACHES) ?? null;
}

export function getSyncEvent(eventId: string): Match | null {
  return getSyncData<Match>(KEYS.CACHE_EVENT + eventId, TTL.EVENT) ?? null;
}

export function getSyncNews(): NewsArticle[] | null {
  return getSyncData<NewsArticle[]>(KEYS.CACHE_NEWS, TTL.NEWS) ?? null;
}

export function getSyncLineup(eventId: string): LineupResponse | null {
  return getSyncData<LineupResponse>(KEYS.CACHE_LINEUP + eventId, TTL.LINEUP) ?? null;
}

export function getSyncCoach(coachId: string): CoachStaff | null {
  return getSyncData<CoachStaff>(KEYS.CACHE_COACH + coachId, TTL.COACH) ?? null;
}

// ─── League cache ─────────────────────────────────────────────────────────────

export async function getCachedLeagues(): Promise<League[] | null> {
  return getCached<League[]>(KEYS.CACHE_LEAGUES, TTL.LEAGUES);
}

export async function setCachedLeagues(data: League[]): Promise<void> {
  syncCache.set(KEYS.CACHE_LEAGUES, { data, ts: Date.now() });
  return setItem(KEYS.CACHE_LEAGUES, data);
}

// ─── Match cache ──────────────────────────────────────────────────────────────

export async function getCachedMatches(leagueId: string): Promise<Match[] | null> {
  return getCached<Match[]>(KEYS.CACHE_MATCHES + leagueId, TTL.MATCHES);
}

export async function setCachedMatches(leagueId: string, data: Match[]): Promise<void> {
  syncCache.set(KEYS.CACHE_MATCHES + leagueId, { data, ts: Date.now() });
  return setItem(KEYS.CACHE_MATCHES + leagueId, data);
}

export async function setCachedUpcomingMatches(leagueId: string, data: Match[]): Promise<void> {
  syncCache.set(KEYS.CACHE_UPCOMING + leagueId, { data, ts: Date.now() });
  return setItem(KEYS.CACHE_UPCOMING + leagueId, data);
}

export async function setCachedPastMatches(leagueId: string, data: Match[]): Promise<void> {
  syncCache.set(KEYS.CACHE_PAST + leagueId, { data, ts: Date.now() });
  return setItem(KEYS.CACHE_PAST + leagueId, data);
}

// ─── Team cache ───────────────────────────────────────────────────────────────

export async function getCachedTeams(leagueId: string): Promise<Team[] | null> {
  return getCached<Team[]>(KEYS.CACHE_TEAMS + leagueId, TTL.TEAMS);
}

export async function setCachedTeams(leagueId: string, data: Team[]): Promise<void> {
  syncCache.set(KEYS.CACHE_TEAMS + leagueId, { data, ts: Date.now() });
  return setItem(KEYS.CACHE_TEAMS + leagueId, data);
}

// ─── Standings cache ──────────────────────────────────────────────────────────

export async function getCachedStandings(leagueId: string): Promise<Standing[] | null> {
  return getCached<Standing[]>(KEYS.CACHE_STANDINGS + leagueId, TTL.STANDINGS);
}

export async function setCachedStandings(leagueId: string, data: Standing[]): Promise<void> {
  syncCache.set(KEYS.CACHE_STANDINGS + leagueId, { data, ts: Date.now() });
  return setItem(KEYS.CACHE_STANDINGS + leagueId, data);
}

// ─── Team detail cache ────────────────────────────────────────────────────────

export async function getCachedTeam(teamId: string): Promise<Team | null> {
  return getCached<Team>(KEYS.CACHE_TEAM + teamId, TTL.TEAM);
}

export async function setCachedTeam(teamId: string, data: Team): Promise<void> {
  syncCache.set(KEYS.CACHE_TEAM + teamId, { data, ts: Date.now() });
  return setItem(KEYS.CACHE_TEAM + teamId, data);
}

export async function getCachedTeamSquad(teamId: string): Promise<any[] | null> {
  return getCached<any[]>(KEYS.CACHE_TEAM_SQUAD + teamId, TTL.SQUAD);
}

export async function setCachedTeamSquad(teamId: string, data: any[]): Promise<void> {
  syncCache.set(KEYS.CACHE_TEAM_SQUAD + teamId, { data, ts: Date.now() });
  return setItem(KEYS.CACHE_TEAM_SQUAD + teamId, data);
}

export async function getCachedTeamCoaches(teamId: string): Promise<any[] | null> {
  return getCached<any[]>(KEYS.CACHE_TEAM_COACHES + teamId, TTL.COACHES);
}

export async function setCachedTeamCoaches(teamId: string, data: any[]): Promise<void> {
  syncCache.set(KEYS.CACHE_TEAM_COACHES + teamId, { data, ts: Date.now() });
  return setItem(KEYS.CACHE_TEAM_COACHES + teamId, data);
}

// ─── Results cache ────────────────────────────────────────────────────────────

export async function getCachedResults(leagueId: string): Promise<Match[] | null> {
  return getCached<Match[]>(KEYS.CACHE_RESULTS + leagueId, TTL.RESULTS);
}

export async function setCachedResults(leagueId: string, data: Match[]): Promise<void> {
  syncCache.set(KEYS.CACHE_RESULTS + leagueId, { data, ts: Date.now() });
  return setItem(KEYS.CACHE_RESULTS + leagueId, data);
}

// ─── Event cache ──────────────────────────────────────────────────────────────

export async function getCachedEvent(eventId: string): Promise<Match | null> {
  return getCached<Match>(KEYS.CACHE_EVENT + eventId, TTL.EVENT);
}

export async function setCachedEvent(eventId: string, data: Match): Promise<void> {
  syncCache.set(KEYS.CACHE_EVENT + eventId, { data, ts: Date.now() });
  return setItem(KEYS.CACHE_EVENT + eventId, data);
}

// ─── News cache ────────────────────────────────────────────────────────────────

export async function getCachedNews(): Promise<NewsArticle[] | null> {
  return getCached<NewsArticle[]>(KEYS.CACHE_NEWS, TTL.NEWS);
}

export async function setCachedNews(data: NewsArticle[]): Promise<void> {
  syncCache.set(KEYS.CACHE_NEWS, { data, ts: Date.now() });
  return setItem(KEYS.CACHE_NEWS, data);
}

// ─── Lineup cache ─────────────────────────────────────────────────────────────

export async function getCachedLineup(eventId: string): Promise<LineupResponse | null> {
  return getCached<LineupResponse>(KEYS.CACHE_LINEUP + eventId, TTL.LINEUP);
}

export async function setCachedLineup(eventId: string, data: LineupResponse): Promise<void> {
  syncCache.set(KEYS.CACHE_LINEUP + eventId, { data, ts: Date.now() });
  return setItem(KEYS.CACHE_LINEUP + eventId, data);
}

// ─── Coach cache ──────────────────────────────────────────────────────────────

export async function getCachedCoach(coachId: string): Promise<CoachStaff | null> {
  return getCached<CoachStaff>(KEYS.CACHE_COACH + coachId, TTL.COACH);
}

export async function setCachedCoach(coachId: string, data: CoachStaff): Promise<void> {
  syncCache.set(KEYS.CACHE_COACH + coachId, { data, ts: Date.now() });
  return setItem(KEYS.CACHE_COACH + coachId, data);
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
  return idx === -1;
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
  return v ?? '27';
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
    enabled: enabled !== null ? enabled === 'true' : false,
    matchToday: today !== null ? today === 'true' : false,
    matchRunning: running !== null ? running === 'true' : false,
    matchDone: done !== null ? done === 'true' : false,
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
