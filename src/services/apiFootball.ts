import axios from 'axios';
import { API_FOOTBALL } from '../config';
import { Team } from '../types';

// ─── League ID mapping: BSD league ID → API-Football league ID ───────────────
const LEAGUE_MAP: Record<string, number> = {
  '1': 39,   // Premier League
  '2': 94,   // Liga Portugal
  '3': 140,  // La Liga
  '4': 135,  // Serie A
  '5': 78,   // Bundesliga
  '6': 61,   // Ligue 1
  '10': 88,  // Eredivisie
  '11': 203, // Super Lig
  '13': 179, // Scottish Premiership
  '14': 144, // Pro League
  '27': 1,   // World Cup (season 2026)
};

// In-memory cache: lowercased team name → logo URL
const logoCache = new Map<string, string>();
// Tracks which leagues have been fetched already
const fetchedLeagues = new Set<string>();

interface ApiFootballTeam {
  team: {
    id: number;
    name: string;
    code: string;
    country: string;
    logo: string;
  };
}

async function fetchLeagueTeams(bsdLeagueId: string): Promise<void> {
  if (fetchedLeagues.has(bsdLeagueId)) return;
  const apiLeagueId = LEAGUE_MAP[bsdLeagueId];
  if (!apiLeagueId) return;
  if (!API_FOOTBALL.API_KEY) return;

  fetchedLeagues.add(bsdLeagueId);
  const season = bsdLeagueId === '27' ? 2026 : new Date().getFullYear();

  try {
    const { data } = await axios.get(`${API_FOOTBALL.BASE_URL}/teams`, {
      params: { league: apiLeagueId, season },
      headers: {
        'x-rapidapi-key': API_FOOTBALL.API_KEY,
        'x-rapidapi-host': 'v3.football.api-sports.io',
      },
      timeout: 10000,
    });

    const teams: ApiFootballTeam[] = data?.response ?? [];
    for (const t of teams) {
      const key = t.team.name.toLowerCase().trim();
      if (t.team.logo && !logoCache.has(key)) {
        logoCache.set(key, t.team.logo);
      }
      // Also store by team ID
      if (t.team.logo) {
        logoCache.set(String(t.team.id), t.team.logo);
      }
    }
  } catch {}
}

export async function enrichTeamsWithBadges(teams: Team[], leagueId: string): Promise<Team[]> {
  await fetchLeagueTeams(leagueId);

  return teams.map(t => {
    const key = t.name.toLowerCase().trim();
    const logo = logoCache.get(key);
    if (logo) {
      return { ...t, badgeUrl: logo };
    }
    return t;
  });
}

export async function enrichTeamWithBadge(team: Team, leagueId?: string): Promise<Team> {
  if (leagueId) {
    await fetchLeagueTeams(leagueId);
  }

  const key = team.name.toLowerCase().trim();
  const logo = logoCache.get(key);
  if (logo) {
    return { ...team, badgeUrl: logo };
  }
  return team;
}

export async function fetchTeamBadgeByName(teamName: string, leagueId?: string): Promise<string | undefined> {
  if (leagueId) {
    await fetchLeagueTeams(leagueId);
  }
  return logoCache.get(teamName.toLowerCase().trim());
}
