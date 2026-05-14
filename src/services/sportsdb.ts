import axios from 'axios';
import { SPORTSDB } from '../config';
import { Match, Team } from '../types';

const api = axios.create({
  baseURL: `${SPORTSDB.BASE_URL}/${SPORTSDB.API_KEY}`,
  timeout: 8000,
});

// In-memory team badge cache: lowercased team name → badge URL | null
const badgeCache = new Map<string, string | null>();

// Track in-flight requests to avoid duplicates
const inFlight = new Map<string, Promise<string | null>>();

interface SportsDBTeam {
  strTeam: string;
  strTeamBadge?: string;
  strSport?: string;
  strCountry?: string;
}

async function searchTeamBadge(teamName: string): Promise<string | null> {
  const key = teamName.toLowerCase().trim();
  if (badgeCache.has(key)) return badgeCache.get(key) ?? null;
  if (inFlight.has(key)) return inFlight.get(key) ?? null;

  const promise = (async () => {
    try {
      const { data } = await api.get('/searchteams.php', {
        params: { t: teamName },
      });
      const teams: SportsDBTeam[] = data?.teams;
      const badge = Array.isArray(teams) && teams.length > 0
        ? teams.find(t => !t.strSport || t.strSport === 'Soccer')?.strTeamBadge
          ?? teams[0].strTeamBadge
          ?? null
        : null;
      badgeCache.set(key, badge);
      return badge;
    } catch {
      badgeCache.set(key, null);
      return null;
    } finally {
      inFlight.delete(key);
    }
  })();

  inFlight.set(key, promise);
  return promise;
}

export function getCachedBadge(teamName: string): string | null | undefined {
  return badgeCache.get(teamName.toLowerCase().trim());
}

export async function fetchTeamBadge(teamName: string): Promise<string | null> {
  return searchTeamBadge(teamName);
}

export async function enrichMatchesWithBadges(matches: Match[]): Promise<Match[]> {
  const teamNames = new Set<string>();
  for (const m of matches) {
    if (m.homeTeam) teamNames.add(m.homeTeam);
    if (m.awayTeam) teamNames.add(m.awayTeam);
  }

  const badges = new Map<string, string | null>();
  const uncached = [...teamNames].filter(n => !badgeCache.has(n.toLowerCase().trim()));

  // Fetch uncached badges in parallel batches
  const concurrency = 5;
  for (let i = 0; i < uncached.length; i += concurrency) {
    await Promise.all(
      uncached.slice(i, i + concurrency).map(n => searchTeamBadge(n))
    );
  }

  // Collect all results
  for (const name of teamNames) {
    const key = name.toLowerCase().trim();
    badges.set(key, badgeCache.get(key) ?? null);
  }

  return matches.map(m => ({
    ...m,
    homeBadge: badges.get(m.homeTeam?.toLowerCase().trim()) ?? m.homeBadge,
    awayBadge: badges.get(m.awayTeam?.toLowerCase().trim()) ?? m.awayBadge,
  }));
}

export async function enrichTeamWithBadge(team: Team): Promise<Team> {
  const url = await searchTeamBadge(team.name);
  return { ...team, badgeUrl: url ?? undefined };
}

export async function enrichTeamsWithBadges(teams: Team[]): Promise<Team[]> {
  const uncached = teams.filter(t => t.name && !badgeCache.has(t.name.toLowerCase().trim()));

  const concurrency = 5;
  for (let i = 0; i < uncached.length; i += concurrency) {
    await Promise.all(
      uncached.slice(i, i + concurrency).map(t => searchTeamBadge(t.name))
    );
  }

  return teams.map(t => ({
    ...t,
    badgeUrl: badgeCache.get(t.name?.toLowerCase().trim()) ?? undefined,
  }));
}
