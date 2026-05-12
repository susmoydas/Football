import axios from 'axios';
import { Match, Team, Standing, League, MatchStatus } from '../types';
import { BSD } from '../config';

const api = axios.create({
  baseURL: BSD.BASE_URL,
  timeout: 15000,
  headers: { Authorization: `Token ${BSD.TOKEN}` },
});

// ─── Country → Flag Emoji ─────────────────────────────────────────────────────

function countryToFlag(country: string): string | undefined {
  const map: Record<string, string> = {
    'England': '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    'Spain': '🇪🇸',
    'Germany': '🇩🇪',
    'Italy': '🇮🇹',
    'France': '🇫🇷',
    'Portugal': '🇵🇹',
    'Netherlands': '🇳🇱',
    'Belgium': '🇧🇪',
    'Brazil': '🇧🇷',
    'Argentina': '🇦🇷',
    'USA': '🇺🇸',
    'Canada': '🇨🇦',
    'Mexico': '🇲🇽',
    'Scotland': '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
    'Wales': '🏴󠁧󠁢󠁷󠁬󠁳󠁿',
    'Ireland': '🇮🇪',
    'Switzerland': '🇨🇭',
    'Austria': '🇦🇹',
    'Sweden': '🇸🇪',
    'Norway': '🇳🇴',
    'Denmark': '🇩🇰',
    'Poland': '🇵🇱',
    'Ukraine': '🇺🇦',
    'Russia': '🇷🇺',
    'Turkey': '🇹🇷',
    'Greece': '🇬🇷',
    'Croatia': '🇭🇷',
    'Czech Republic': '🇨🇿',
    'Serbia': '🇷🇸',
    'Japan': '🇯🇵',
    'South Korea': '🇰🇷',
    'Australia': '🇦🇺',
    'Saudi Arabia': '🇸🇦',
    'International': '🌍',
    'Europe': '🏆',
  };
  return map[country];
}

// ─── BSD Event → Match mapping ────────────────────────────────────────────────

type BSDStatus =
  | 'notstarted' | '1st_half' | 'halftime' | '2nd_half'
  | 'extratime' | 'penalties' | 'inprogress' | 'finished' | 'aet'
  | 'postponed' | 'cancelled';

interface BSDEvent {
  id: number;
  league_id: number | null;
  league_name?: string;
  season_id: number | null;
  home_team_id: number | null;
  home_team: string;
  away_team_id: number | null;
  away_team: string;
  event_date: string;
  home_score: number | null;
  away_score: number | null;
  home_score_ht: number | null;
  away_score_ht: number | null;
  status: BSDStatus;
  current_minute: number | null;
  period: string;
  round_number: number | null;
  round_name: string;
  venue_id: number | null;
  live_websocket?: boolean;
}

function resolveStatus(status: BSDStatus): MatchStatus {
  switch (status) {
    case '1st_half':
    case 'halftime':
    case '2nd_half':
    case 'extratime':
    case 'penalties':
    case 'inprogress':
      return 'live';
    case 'finished':
    case 'aet':
      return 'finished';
    default:
      return 'upcoming';
  }
}

function formatTime(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
}

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toISOString().split('T')[0];
  } catch {
    return '';
  }
}

let leagueNameCache: Map<number, string> | null = null;

async function getLeagueName(id: number | null): Promise<string> {
  if (!id) return '';
  if (!leagueNameCache) {
    leagueNameCache = new Map();
    try {
      const { data } = await api.get('/leagues/', { params: { limit: 100 } });
      const list = Array.isArray(data) ? data : data?.results ?? [];
      for (const l of list) {
        leagueNameCache.set(l.id, l.name);
      }
    } catch {}
  }
  return leagueNameCache.get(id) ?? String(id);
}

async function toMatch(e: BSDEvent): Promise<Match> {
  return {
    id: String(e.id),
    league: e.league_name ?? await getLeagueName(e.league_id),
    homeTeam: e.home_team,
    awayTeam: e.away_team,
    homeScore: e.home_score,
    awayScore: e.away_score,
    status: resolveStatus(e.status),
    time: formatTime(e.event_date),
    date: formatDate(e.event_date),
    venue: '',
    progress: e.current_minute != null ? String(e.current_minute) : undefined,
    homeTeamId: e.home_team_id != null ? String(e.home_team_id) : undefined,
    awayTeamId: e.away_team_id != null ? String(e.away_team_id) : undefined,
    homeBadge: undefined,
    awayBadge: undefined,
  };
}

// ─── BSD Team → Team mapping ──────────────────────────────────────────────────

interface BSDTeam {
  id: number;
  name: string;
  short_name: string;
  country: string;
  venue_id: number | null;
}

function toTeam(t: BSDTeam): Team {
  return {
    id: String(t.id),
    name: t.name,
    badge: countryToFlag(t.country) ?? '',
    league: '',
    country: t.country,
  };
}

// ─── BSD League → League mapping ──────────────────────────────────────────────

interface BSDLeague {
  id: number;
  name: string;
  country: string;
  country_code: string;
  is_women: boolean;
  is_active: boolean;
}

function toLeague(l: BSDLeague): League {
  return {
    id: String(l.id),
    name: l.name,
    country: l.country,
  };
}

// ─── BSD Standing → Standing mapping ──────────────────────────────────────────

interface BSDStandingRow {
  position: number;
  team_id: number;
  team_name: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  gf: number;
  ga: number;
  gd: number;
  pts: number;
}

function toStanding(r: BSDStandingRow): Standing {
  return {
    position: r.position,
    teamId: String(r.team_id),
    name: r.team_name,
    played: r.played,
    won: r.won,
    drawn: r.drawn,
    lost: r.lost,
    goalsFor: r.gf,
    goalsAgainst: r.ga,
    goalDiff: r.gd,
    points: r.pts,
  };
}

// ─── Featured leagues ─────────────────────────────────────────────────────────

export const FEATURED_LEAGUES: League[] = [
  { id: '27', name: 'World Cup 2026', badge: undefined, country: 'International' },
  { id: '1', name: 'Premier League', badge: undefined, country: 'England' },
  { id: '3', name: 'La Liga', badge: undefined, country: 'Spain' },
  { id: '5', name: 'Bundesliga', badge: undefined, country: 'Germany' },
  { id: '4', name: 'Serie A', badge: undefined, country: 'Italy' },
  { id: '6', name: 'Ligue 1', badge: undefined, country: 'France' },
  { id: '2', name: 'Liga Portugal Betclic', badge: undefined, country: 'Portugal' },
  { id: '10', name: 'Eredivisie', badge: undefined, country: 'Netherlands' },
  { id: '11', name: 'Trendyol Super Lig', badge: undefined, country: 'Turkey' },
  { id: '13', name: 'Scottish Premiership', badge: undefined, country: 'Scotland' },
  { id: '14', name: 'Pro League', badge: undefined, country: 'Belgium' },
];

// ─── Team country cache (name -> flag) ────────────────────────────────────────

let teamFlagCache: Map<string, string> | null = null;
let cachedLeagueTeamIds: Set<string> = new Set();

async function ensureTeamFlagCache(leagueId: string): Promise<Map<string, string>> {
  if (!teamFlagCache) teamFlagCache = new Map();
  if (cachedLeagueTeamIds.has(leagueId)) return teamFlagCache;
  cachedLeagueTeamIds.add(leagueId);
  try {
    const { data } = await api.get('/teams/', {
      params: { league_id: leagueId, limit: 100 },
    });
    const list: BSDTeam[] = Array.isArray(data) ? data : data?.results ?? [];
    for (const t of list) {
      const flag = countryToFlag(t.country) ?? '⚽';
      teamFlagCache.set(t.name.toLowerCase(), flag);
      teamFlagCache.set(String(t.id), flag);
    }
  } catch {}
  return teamFlagCache;
}

function findLeague(leagueName: string): League | undefined {
  const lower = leagueName.toLowerCase();
  return FEATURED_LEAGUES.find(l =>
    lower.includes(l.name.toLowerCase()) || l.name.toLowerCase().includes(lower)
  );
}

function enrichMatchFlags(matches: Match[], countryMap: Map<string, string>): Match[] {
  return matches.map(m => ({
    ...m,
    homeBadge: countryMap.get(m.homeTeam.toLowerCase())
      ?? countryMap.get(m.homeTeamId ?? '')
      ?? countryToFlag(findLeague(m.league)?.country ?? ''),
    awayBadge: countryMap.get(m.awayTeam.toLowerCase())
      ?? countryMap.get(m.awayTeamId ?? '')
      ?? countryToFlag(findLeague(m.league)?.country ?? ''),
  }));
}

// ─── Events ───────────────────────────────────────────────────────────────────

function extractEvents(data: any): BSDEvent[] {
  if (Array.isArray(data)) return data;
  if (data?.events && Array.isArray(data.events)) return data.events;
  if (data?.results && Array.isArray(data.results)) return data.results;
  return [];
}

async function mapEvents(data: any): Promise<Match[]> {
  return Promise.all(extractEvents(data).map(e => toMatch(e)));
}

export async function fetchLiveEvents(leagueId?: string): Promise<Match[]> {
  try {
    const { data } = await api.get('/events/live/');
    let events = extractEvents(data);
    if (leagueId) {
      const leagueNum = parseInt(leagueId, 10);
      events = events.filter(e => e.league_id === leagueNum);
      await ensureTeamFlagCache(leagueId);
    }
    const matches = await Promise.all(events.map(e => toMatch(e)));
    return enrichMatchFlags(matches, teamFlagCache ?? new Map());
  } catch {
    return [];
  }
}

export async function fetchLeagueEvents(leagueId: string): Promise<Match[]> {
  try {
    const [eventsResp, _] = await Promise.all([
      api.get('/events/', { params: { league_id: leagueId, limit: 50 } }),
      ensureTeamFlagCache(leagueId),
    ]);
    const matches = await mapEvents(eventsResp.data);
    return enrichMatchFlags(matches, teamFlagCache ?? new Map());
  } catch {
    return [];
  }
}

export async function fetchNextEvents(leagueId: string): Promise<Match[]> {
  try {
    const [eventsResp, _] = await Promise.all([
      api.get('/events/', {
        params: { league_id: leagueId, status: 'notstarted', limit: 15 },
      }),
      ensureTeamFlagCache(leagueId),
    ]);
    const matches = await mapEvents(eventsResp.data);
    return enrichMatchFlags(matches, teamFlagCache ?? new Map());
  } catch {
    return [];
  }
}

export async function fetchLastEvents(leagueId: string): Promise<Match[]> {
  try {
    const [eventsResp, _] = await Promise.all([
      api.get('/events/', {
        params: { league_id: leagueId, status: 'finished', limit: 15 },
      }),
      ensureTeamFlagCache(leagueId),
    ]);
    const matches = await mapEvents(eventsResp.data);
    return enrichMatchFlags(matches, teamFlagCache ?? new Map());
  } catch {
    return [];
  }
}

export async function fetchRecentResults(leagueId?: string): Promise<Match[]> {
  try {
    const now = new Date();
    const past = new Date(now);
    past.setDate(past.getDate() - 14);
    const params: Record<string, any> = {
      status: 'finished',
      date_from: past.toISOString().split('T')[0],
      date_to: now.toISOString().split('T')[0],
      limit: 50,
    };
    if (leagueId) params.league_id = leagueId;
    const { data } = await api.get('/events/', { params });
    const matches = await mapEvents(data);
    if (leagueId) {
      await ensureTeamFlagCache(leagueId);
      return enrichMatchFlags(matches, teamFlagCache ?? new Map());
    }
    return matches;
  } catch {
    return [];
  }
}

export async function fetchEvent(eventId: string): Promise<Match | null> {
  try {
    const { data } = await api.get(`/events/${eventId}/`);
    return data ? await toMatch(data) : null;
  } catch {
    return null;
  }
}

// ─── Teams ────────────────────────────────────────────────────────────────────

function extractTeams(data: any): BSDTeam[] {
  if (Array.isArray(data)) return data;
  if (data?.results && Array.isArray(data.results)) return data.results;
  return [];
}

export async function fetchTeamsByLeague(leagueId: string): Promise<Team[]> {
  try {
    const { data } = await api.get('/teams/', {
      params: { league_id: leagueId, limit: 50 },
    });
    return extractTeams(data).map(toTeam);
  } catch {
    return [];
  }
}

export async function fetchTeam(teamId: string): Promise<Team | null> {
  try {
    const { data } = await api.get(`/teams/${teamId}/`);
    return data ? toTeam(data) : null;
  } catch {
    return null;
  }
}

// ─── Leagues ──────────────────────────────────────────────────────────────────

export async function fetchLeagues(): Promise<League[]> {
  try {
    const { data } = await api.get('/leagues/', { params: { limit: 100 } });
    const list = Array.isArray(data) ? data : data?.results ?? [];
    return (list ?? []).map(toLeague);
  } catch {
    return FEATURED_LEAGUES;
  }
}

// ─── Standings ────────────────────────────────────────────────────────────────

interface BSDStandingsResponse {
  standings?: BSDStandingRow[];
  groups?: Record<string, BSDStandingRow[]>;
}

export async function fetchStandings(leagueId: string, _season?: string): Promise<Standing[]> {
  try {
    const { data } = await api.get<BSDStandingsResponse>(`/leagues/${leagueId}/standings/`);
    if (data.standings) return data.standings.map(toStanding);
    if (data.groups) {
      const all: Standing[] = [];
      for (const group of Object.values(data.groups)) {
        all.push(...group.map(toStanding));
      }
      return all;
    }
    return [];
  } catch {
    return [];
  }
}
