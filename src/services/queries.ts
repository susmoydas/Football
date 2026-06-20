import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  fetchLiveEvents, fetchLeagueEvents, fetchNextEvents, fetchLastEvents,
  fetchTeamsByLeague, fetchStandings, fetchGroupedStandings,
  fetchTeam, fetchTeamSquad, fetchTeamCoachingStaff, fetchTeamEvents,
  fetchRecentResults, fetchLeagues, fetchFootballNews, fetchEvent, fetchLineup,
  fetchCoach, FEATURED_LEAGUES,
} from './api';
import {
  getSyncLeagues, getSyncMatches, getSyncUpcomingMatches, getSyncPastMatches,
  getSyncTeams, getSyncStandings,
  getSyncTeam, getSyncResults, getSyncTeamSquad, getSyncTeamCoaches,
  getSyncEvent, getSyncNews, getSyncLineup, getSyncCoach,
  setCachedLeagues, setCachedMatches, setCachedUpcomingMatches, setCachedPastMatches,
  setCachedTeams, setCachedStandings,
  setCachedTeam, setCachedResults, setCachedTeamSquad, setCachedTeamCoaches,
  setCachedEvent, setCachedNews, setCachedLineup, setCachedCoach,
} from './storage';
import type { Match, Team, Standing, League, NewsArticle, CoachStaff, Player, LineupResponse } from '../types';

const STALE = 5 * 60 * 1000;

export function useLeagues() {
  return useQuery<League[]>({
    queryKey: ['leagues'],
    queryFn: async () => {
      const apiLeagues = await fetchLeagues();
      const merged: League[] = [];
      const seen = new Set<string>();
      for (const l of [...FEATURED_LEAGUES, ...apiLeagues]) {
        if (!seen.has(l.id)) { seen.add(l.id); merged.push(l); }
      }
      await setCachedLeagues(merged);
      return merged;
    },
    staleTime: STALE,
    gcTime: 30 * 60 * 1000,
    initialData: () => getSyncLeagues() ?? undefined,
  });
}

export function useMatches(leagueId: string) {
  return useQuery<Match[]>({
    queryKey: ['matches', leagueId],
    queryFn: async () => {
      const [live, league, next, recent] = await Promise.all([
        fetchLiveEvents(leagueId),
        fetchLeagueEvents(leagueId),
        fetchNextEvents(leagueId),
        fetchRecentResults(leagueId),
      ]);
      const seen = new Set<string>();
      const merged = [...live, ...league, ...next, ...recent].filter(m => {
        if (seen.has(m.id)) return false;
        seen.add(m.id);
        return true;
      }).sort((a, b) => {
        if (a.date < b.date) return -1;
        if (a.date > b.date) return 1;
        return a.time.localeCompare(b.time);
      });
      await setCachedMatches(leagueId, merged);
      return merged;
    },
    staleTime: STALE,
    gcTime: 30 * 60 * 1000,
    initialData: () => getSyncMatches(leagueId) ?? undefined,
  });
}

export function useUpcomingMatches(leagueId: string) {
  return useQuery<Match[]>({
    queryKey: ['matches-upcoming', leagueId],
    queryFn: async () => {
      const data = await fetchNextEvents(leagueId);
      await setCachedUpcomingMatches(leagueId, data);
      return data;
    },
    staleTime: STALE,
    gcTime: 30 * 60 * 1000,
    initialData: () => getSyncUpcomingMatches(leagueId) ?? undefined,
  });
}

export function usePastMatches(leagueId: string) {
  return useQuery<Match[]>({
    queryKey: ['matches-past', leagueId],
    queryFn: async () => {
      const data = await fetchLastEvents(leagueId);
      await setCachedPastMatches(leagueId, data);
      return data;
    },
    staleTime: STALE,
    gcTime: 30 * 60 * 1000,
    initialData: () => getSyncPastMatches(leagueId) ?? undefined,
  });
}

export function useFixtures(leagueId: string) {
  return useQuery<{ upcoming: Match[]; past: Match[] }>({
    queryKey: ['fixtures', leagueId],
    queryFn: async () => {
      const [upcoming, past] = await Promise.all([
        fetchNextEvents(leagueId),
        fetchLastEvents(leagueId),
      ]);
      await Promise.all([
        setCachedUpcomingMatches(leagueId, upcoming),
        setCachedPastMatches(leagueId, past),
      ]);
      return { upcoming, past };
    },
    staleTime: STALE,
    gcTime: 30 * 60 * 1000,
    initialData: () => {
      const upcoming = getSyncUpcomingMatches(leagueId);
      const past = getSyncPastMatches(leagueId);
      if (upcoming || past) return { upcoming: upcoming ?? [], past: past ?? [] };
      return undefined;
    },
  });
}

export function useRecentResults(leagueId: string) {
  return useQuery<Match[]>({
    queryKey: ['results', leagueId],
    queryFn: async () => {
      const data = await fetchRecentResults(leagueId);
      await setCachedResults(leagueId, data);
      return data;
    },
    staleTime: STALE,
    gcTime: 30 * 60 * 1000,
    initialData: () => getSyncResults(leagueId) ?? undefined,
  });
}

export function useEvent(eventId: string) {
  return useQuery<Match | null>({
    queryKey: ['event', eventId],
    queryFn: async () => {
      const data = await fetchEvent(eventId);
      if (data) await setCachedEvent(eventId, data);
      return data;
    },
    staleTime: 60 * 1000,
    gcTime: 30 * 60 * 1000,
    initialData: () => getSyncEvent(eventId) ?? undefined,
  });
}

export function useLineup(eventId: string) {
  return useQuery<LineupResponse | null>({
    queryKey: ['lineup', eventId],
    queryFn: async () => {
      const data = await fetchLineup(eventId);
      if (data) await setCachedLineup(eventId, data);
      return data;
    },
    staleTime: 60 * 1000,
    gcTime: 30 * 60 * 1000,
    initialData: () => getSyncLineup(eventId) ?? undefined,
    enabled: !!eventId,
  });
}

export function useTeams(leagueId: string) {
  return useQuery<Team[]>({
    queryKey: ['teams', leagueId],
    queryFn: async () => {
      const data = await fetchTeamsByLeague(leagueId);
      await setCachedTeams(leagueId, data);
      return data;
    },
    staleTime: STALE,
    gcTime: 30 * 60 * 1000,
    initialData: () => getSyncTeams(leagueId) ?? undefined,
  });
}

export function useTeam(teamId: string) {
  return useQuery<Team | null>({
    queryKey: ['team', teamId],
    queryFn: async () => {
      const data = await fetchTeam(teamId);
      if (data) await setCachedTeam(teamId, data);
      return data;
    },
    staleTime: STALE,
    gcTime: 30 * 60 * 1000,
    initialData: () => getSyncTeam(teamId) ?? undefined,
    enabled: !!teamId,
  });
}

export function useTeamSquad(teamId: string) {
  return useQuery<Player[]>({
    queryKey: ['team-squad', teamId],
    queryFn: async () => {
      const data = await fetchTeamSquad(teamId);
      await setCachedTeamSquad(teamId, data);
      return data;
    },
    staleTime: STALE,
    gcTime: 30 * 60 * 1000,
    initialData: () => getSyncTeamSquad(teamId) ?? undefined,
    enabled: !!teamId,
  });
}

export function useTeamCoaches(teamId: string) {
  return useQuery<CoachStaff[]>({
    queryKey: ['team-coaches', teamId],
    queryFn: async () => {
      const data = await fetchTeamCoachingStaff(teamId);
      await setCachedTeamCoaches(teamId, data);
      return data;
    },
    staleTime: STALE,
    gcTime: 30 * 60 * 1000,
    initialData: () => getSyncTeamCoaches(teamId) ?? undefined,
    enabled: !!teamId,
  });
}

export function useTeamEvents(teamId: string, status: string | undefined, leagueId?: string) {
  return useQuery<Match[]>({
    queryKey: ['team-events', teamId, status, leagueId],
    queryFn: () => fetchTeamEvents(teamId, status, 50, leagueId),
    staleTime: STALE,
    gcTime: 30 * 60 * 1000,
    enabled: !!teamId,
  });
}

export function useCoach(coachId: string) {
  return useQuery<CoachStaff | null>({
    queryKey: ['coach', coachId],
    queryFn: async () => {
      const data = await fetchCoach(coachId);
      if (data) await setCachedCoach(coachId, data);
      return data;
    },
    staleTime: STALE,
    gcTime: 30 * 60 * 1000,
    initialData: () => getSyncCoach(coachId) ?? undefined,
    enabled: !!coachId,
  });
}

export function useStandings(leagueId: string, useGrouped: boolean) {
  return useQuery<Standing[] | Record<string, Standing[]>>({
    queryKey: ['standings', leagueId, useGrouped],
    queryFn: async () => {
      if (useGrouped) {
        return fetchGroupedStandings(leagueId);
      }
      const data = await fetchStandings(leagueId);
      await setCachedStandings(leagueId, data);
      return data;
    },
    staleTime: STALE,
    gcTime: 30 * 60 * 1000,
    initialData: () => {
      if (!useGrouped) return getSyncStandings(leagueId) ?? undefined;
      return undefined;
    },
  });
}

export function useNews() {
  return useQuery<NewsArticle[]>({
    queryKey: ['news'],
    queryFn: async () => {
      const data = await fetchFootballNews();
      await setCachedNews(data);
      return data;
    },
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    initialData: () => getSyncNews() ?? undefined,
  });
}

export function usePrefetch() {
  const client = useQueryClient();
  return {
    prefetchMatches: (leagueId: string) => {
      client.prefetchQuery({
        queryKey: ['matches', leagueId],
        queryFn: async () => {
          const [live, league, next, recent] = await Promise.all([
            fetchLiveEvents(leagueId),
            fetchLeagueEvents(leagueId),
            fetchNextEvents(leagueId),
            fetchRecentResults(leagueId),
          ]);
          const seen = new Set<string>();
          const merged = [...live, ...league, ...next, ...recent].filter(m => {
            if (seen.has(m.id)) return false;
            seen.add(m.id);
            return true;
          });
          await setCachedMatches(leagueId, merged);
          return merged;
        },
        staleTime: STALE,
      });
    },
    prefetchTeams: (leagueId: string) => {
      client.prefetchQuery({
        queryKey: ['teams', leagueId],
        queryFn: async () => {
          const data = await fetchTeamsByLeague(leagueId);
          await setCachedTeams(leagueId, data);
          return data;
        },
        staleTime: STALE,
      });
    },
    prefetchStandings: (leagueId: string) => {
      client.prefetchQuery({
        queryKey: ['standings', leagueId, false],
        queryFn: () => fetchStandings(leagueId),
        staleTime: STALE,
      });
    },
    prefetchEvent: (eventId: string) => {
      client.prefetchQuery({
        queryKey: ['event', eventId],
        queryFn: async () => {
          const data = await fetchEvent(eventId);
          if (data) await setCachedEvent(eventId, data);
          return data;
        },
        staleTime: STALE,
      });
    },
  };
}
