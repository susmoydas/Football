import axios from 'axios';
import { Match, Team, Standing, League, MatchStatus } from '../types';
import { BSD } from '../config';

const api = axios.create({
  baseURL: BSD.BASE_URL,
  timeout: 15000,
  headers: { Authorization: `Token ${BSD.TOKEN}` },
});

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
    badge: '',
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
  { id: '1', name: 'English Premier League', badge: undefined, country: 'England' },
  { id: '3', name: 'Spanish La Liga', badge: undefined, country: 'Spain' },
  { id: '5', name: 'Bundesliga', badge: undefined, country: 'Germany' },
  { id: '4', name: 'Serie A', badge: undefined, country: 'Italy' },
  { id: '6', name: 'Ligue 1', badge: undefined, country: 'France' },
  { id: '7', name: 'UEFA Champions League', badge: undefined, country: 'Europe' },
  { id: '18', name: 'MLS', badge: undefined, country: 'USA' },
];

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

export async function fetchLiveEvents(): Promise<Match[]> {
  try {
    const { data } = await api.get('/events/live/');
    return await mapEvents(data);
  } catch {
    return [];
  }
}

export async function fetchLeagueEvents(leagueId: string): Promise<Match[]> {
  try {
    const { data } = await api.get('/events/', {
      params: { league_id: leagueId, limit: 50 },
    });
    return await mapEvents(data);
  } catch {
    return [];
  }
}

export async function fetchNextEvents(leagueId: string): Promise<Match[]> {
  try {
    const { data } = await api.get('/events/', {
      params: { league_id: leagueId, status: 'notstarted', limit: 15 },
    });
    return await mapEvents(data);
  } catch {
    return [];
  }
}

export async function fetchLastEvents(leagueId: string): Promise<Match[]> {
  try {
    const { data } = await api.get('/events/', {
      params: { league_id: leagueId, status: 'finished', limit: 15 },
    });
    return await mapEvents(data);
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
    return await mapEvents(data);
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
