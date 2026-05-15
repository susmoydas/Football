// ─── Colours (FotMob-inspired dark theme) ─────────────────────────────────────
export const C = {
  bg: '#000000',
  card: '#1D1D1D',
  cardAlt: '#353535',
  border: '#3B3B3B',
  textPrimary: '#FFFFFF',
  textSecondary: '#D9D9D9',
  accent: '#0D9F68',
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

export interface LineupPlayer {
  id: number;
  name: string;
  short_name: string;
  position: string;
  jersey_number: number | null;
  ai_score: number | null;
  card?: 'yellow' | 'red';
}

export interface TeamLineup {
  team_id: number;
  team_name: string;
  formation: string;
  confidence: number | null;
  players: LineupPlayer[];
  substitutes: LineupPlayer[];
}

export interface LineupResponse {
  event_id: number;
  lineup_status: string;
  beta: boolean;
  lineups: {
    home: TeamLineup;
    away: TeamLineup;
  };
  unavailable_players: {
    home: any[];
    away: any[];
  };
  updated_at: string;
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
  homeCountry?: string;
  awayCountry?: string;
}

export interface Team {
  id: string;
  name: string;
  badge: string;
  badgeUrl?: string;
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

export interface NewsArticle {
  id: string;
  title: string;
  source: string;
  time: string;
  featured?: boolean;
  image?: string;
  content?: string;
}

export type Screen = 'splash' | 'home' | 'fixtures' | 'teams' | 'standings' | 'more' | 'match-details' | 'news' | 'news-article' | 'results' | 'team-details' | 'player-profile' | 'coach-profile';

export interface Player {
  id: string;
  name: string;
  shortName: string;
  position: string;
  specificPosition: string;
  jerseyNumber: number | null;
  nationality: string;
  dateOfBirth: string;
  heightCm: number | null;
  weightKg: number | null;
  preferredFoot: string;
  marketValueEur: number | null;
  contractUntil: string | null;
  availability: string;
  nationalTeamId: number | null;
}

export interface CoachStaff {
  id: string;
  name: string;
  role: string;
  country: string;
  tacticalProfile?: string;
  preferredFormation?: string;
  matchesTotal?: number;
  wins?: number;
  draws?: number;
  losses?: number;
  winPct?: number;
  avgGoalsScored?: number;
  avgGoalsConceded?: number;
  avgPossession?: number | null;
  cleanSheetPct?: number;
  bttsPct?: number;
  over25Pct?: number;
}

