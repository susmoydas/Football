// ─── Colours (matches your Figma design exactly) ─────────────────────────────
export const C = {
  bg: '#07111F',
  card: '#101C2E',
  cardAlt: '#16243A',
  border: '#26364F',
  textPrimary: '#FFFFFF',
  textSecondary: '#A9B4C2',
  accent: '#20C997',       // teal / green
  gold: '#FFD166',
  red: '#EF476F',
};

// ─── API types (TheSportsDB) ──────────────────────────────────────────────────
export interface APIEvent {
  idEvent: string;
  strEvent: string;
  strLeague: string;
  strHomeTeam: string;
  strAwayTeam: string;
  intHomeScore: string | null;
  intAwayScore: string | null;
  dateEvent: string;
  strTime: string;
  strVenue: string;
  strStatus: string;
  strProgress?: string;
  idHomeTeam?: string;
  idAwayTeam?: string;
  strHomeTeamBadge?: string;
  strAwayTeamBadge?: string;
}

export interface APITeam {
  idTeam: string;
  strTeam: string;
  strTeamBadge: string;
  strLeague: string;
  strCountry: string;
  strDescriptionEN?: string;
  intFormedYear?: string;
  strStadium?: string;
  strKeywords?: string;
}

export interface APILeague {
  idLeague: string;
  strLeague: string;
  strSport: string;
  strLeagueBadge?: string;
  strCountry?: string;
}

export interface APIStanding {
  name: string;
  teamid: string;
  played: string;
  goalsfor: string;
  goalsagainst: string;
  win: string;
  draw: string;
  loss: string;
  total: string;
  badge?: string;
}

export interface APILineup {
  idPlayer: string;
  strPlayer: string;
  strPosition: string;
  strFormation: string;
}

// ─── App types ────────────────────────────────────────────────────────────────
export type MatchStatus = 'live' | 'upcoming' | 'finished';

export interface Match {
  id: string;
  league: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number | null;
  awayScore: number | null;
  status: MatchStatus;
  time: string;
  date: string;
  venue: string;
  progress?: string;
  homeTeamId?: string;
  awayTeamId?: string;
  homeBadge?: string;
  awayBadge?: string;
}

export interface Team {
  id: string;
  name: string;
  badge: string;
  league: string;
  country: string;
  stadium?: string;
  formedYear?: string;
  description?: string;
}

export interface Standing {
  position: number;
  name: string;
  teamId: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDiff: number;
  points: number;
  badge?: string;
}

export interface League {
  id: string;
  name: string;
  badge?: string;
  country?: string;
}

export type Screen = 'splash' | 'home' | 'fixtures' | 'teams' | 'standings' | 'more' | 'match-details' | 'favourites' | 'news' | 'results';
