import { League } from '../types';

export function normalizeText(text: string): string {
  return (text || '').toLowerCase().trim().replace(/\s+/g, ' ');
}

export function removeYearFromLeagueName(name: string): string {
  if (!name) return name;
  return name.replace(/\s*\(?\b\d{4}\b\)?$/i, '').trim();
}

export function normalizeLeagueName(name: string): string {
  if (!name) return name;
  const withoutYear = removeYearFromLeagueName(name);
  return withoutYear
    .replace(/^(world cup|worldcup)/i, 'FIFA World Cup')
    .replace(/^(euro|euro\s?\d{4}|european championship)/i, 'UEFA Euro')
    .replace(/^(asia cup|asian cup|afc asian cup)/i, 'AFC Asian Cup')
    .replace(/^(africa cup of nations|afcon)/i, 'Africa Cup of Nations')
    .replace(/^(copa america)/i, 'Copa America')
    .trim();
}

export function getCleanLeagueDisplayName(league: League): string {
  const name = league.name || '';
  const normalized = normalizeLeagueName(name);
  if (normalized !== removeYearFromLeagueName(name)) return normalized;
  return removeYearFromLeagueName(name);
}

export function cleanLeagueName(league: League): string {
  return getCleanLeagueDisplayName(league);
}

const BSD_BASE = 'https://sports.bzzoiro.com/img/league';

export function getOfficialLeagueLogo(league: League): string {
  return `${BSD_BASE}/${league.id}/`;
}

// ─── Category-based grouping ─────────────────────────────────────────────────

interface CategoryDef {
  name: string;
  keywords: string[];
  preferredOrder: string[];
}

const COMPETITION_CATEGORIES: CategoryDef[] = [
  {
    name: 'International Competitions',
    keywords: ['world cup', 'fifa', 'asian cup', 'africa cup', 'afcon', 'copa america', 'copa américa', 'nations league', 'club world cup'],
    preferredOrder: ['FIFA World Cup', 'FIFA Club World Cup', 'AFC Asian Cup', 'Africa Cup of Nations', 'Copa America', 'UEFA Nations League'],
  },
  {
    name: 'European Competitions',
    keywords: ['champions league', 'europa league', 'super cup', 'premier league', 'la liga', 'bundesliga', 'serie a', 'ligue 1', 'eredivisie', 'liga portugal', 'super lig', 'scottish premiership', 'pro league'],
    preferredOrder: ['UEFA Champions League', 'UEFA Europa League', 'UEFA Super Cup', 'Premier League', 'La Liga', 'Bundesliga', 'Serie A', 'Ligue 1'],
  },
  {
    name: 'Asian Competitions',
    keywords: ['afc champions', 'saudi pro league', 'j1 league', 'j league', 'k league', 'indian super league'],
    preferredOrder: ['AFC Champions League', 'Saudi Pro League', 'J1 League', 'K League 1', 'Indian Super League'],
  },
  {
    name: 'African Competitions',
    keywords: ['caf champions', 'caf confederation', 'egyptian premier', 'botola'],
    preferredOrder: ['CAF Champions League', 'CAF Confederation Cup', 'Egyptian Premier League', 'Botola Pro'],
  },
  {
    name: 'North American Competitions',
    keywords: ['mls', 'liga mx', 'concacaf'],
    preferredOrder: ['MLS', 'Liga MX', 'CONCACAF Champions Cup'],
  },
  {
    name: 'South American Competitions',
    keywords: ['copa libertadores', 'copa sudamericana', 'brasileir', 'primera divisi', 'argentine'],
    preferredOrder: ['Copa Libertadores', 'Copa Sudamericana', 'Brasileir'],
  },
];

function leagueMatchesCategory(league: League, cat: CategoryDef): boolean {
  const name = normalizeText(cleanLeagueName(league));
  const raw = normalizeText(league.name);
  for (const kw of cat.keywords) {
    if (name.includes(kw) || raw.includes(kw)) return true;
  }
  return false;
}

function sortCategoryLeagues(leagues: League[], cat: CategoryDef): League[] {
  const sorted: League[] = [];
  const rest: League[] = [];
  for (const l of leagues) {
    const display = normalizeText(cleanLeagueName(l));
    const idx = cat.preferredOrder.findIndex(p => normalizeText(p) === display || display.includes(normalizeText(p)) || normalizeText(p).includes(display));
    if (idx !== -1) {
      sorted[idx] = l;
    } else {
      rest.push(l);
    }
  }
  rest.sort((a, b) => a.name.localeCompare(b.name));
  return [...sorted.filter(Boolean), ...rest];
}

export interface LeagueGroup {
  region: string;
  leagues: League[];
}

export function groupLeaguesByCategory(leagues: League[]): LeagueGroup[] {
  const filtered = leagues.filter(l => {
    const name = (l.name || '').toLowerCase();
    return !name.includes('qualification');
  });

  const matchedIds = new Set<string>();
  const groups: LeagueGroup[] = [];

  for (const cat of COMPETITION_CATEGORIES) {
    const matched = filtered.filter(l => {
      if (matchedIds.has(l.id)) return false;
      if (leagueMatchesCategory(l, cat)) {
        matchedIds.add(l.id);
        return true;
      }
      return false;
    });
    if (matched.length > 0) {
      groups.push({ region: cat.name, leagues: sortCategoryLeagues(matched, cat) });
    }
  }

  const unmatched = filtered.filter(l => !matchedIds.has(l.id));
  if (unmatched.length > 0) {
    unmatched.sort((a, b) => a.name.localeCompare(b.name));
    groups.push({ region: 'Other Competitions', leagues: unmatched });
  }

  return groups;
}
