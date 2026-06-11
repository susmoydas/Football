import { League } from '../types';

const COUNTRY_CODE_MAP: Record<string, string> = {
  england: 'GB', spain: 'ES', germany: 'DE', italy: 'IT', france: 'FR',
  portugal: 'PT', netherlands: 'NL', belgium: 'BE', scotland: 'GB',
  turkey: 'TR', türkiye: 'TR', brazil: 'BR', argentina: 'AR',
  uruguay: 'UY', chile: 'CL', colombia: 'CO', peru: 'PE',
  usa: 'US', mexico: 'MX', canada: 'CA', japan: 'JP',
  'south korea': 'KR', 'korea republic': 'KR', china: 'CN',
  india: 'IN', australia: 'AU', 'saudi arabia': 'SA',
  nigeria: 'NG', ghana: 'GH', 'south africa': 'ZA',
  egypt: 'EG', morocco: 'MA', senegal: 'SN', cameroon: 'CM',
  'ivory coast': 'CI', tunisia: 'TN', algeria: 'DZ',
  international: 'EU', europe: 'EU', world: 'EU',
};

const PRIORITY_ORDER: string[] = [
  'World Cup 2026',
  'UEFA Champions League',
  'Premier League',
  'La Liga',
  'Serie A',
  'Bundesliga',
  'Ligue 1',
  'Europa League',
  'Conference League',
];

const REGION_MAP: Record<string, string> = {
  england: 'Europe',
  spain: 'Europe',
  germany: 'Europe',
  italy: 'Europe',
  france: 'Europe',
  portugal: 'Europe',
  netherlands: 'Europe',
  belgium: 'Europe',
  scotland: 'Europe',
  turkey: 'Europe',
  türkiye: 'Europe',
  switzerland: 'Europe',
  austria: 'Europe',
  greece: 'Europe',
  croatia: 'Europe',
  poland: 'Europe',
  ukraine: 'Europe',
  denmark: 'Europe',
  sweden: 'Europe',
  norway: 'Europe',
  finland: 'Europe',
  russia: 'Europe',
  czech: 'Europe',
  romania: 'Europe',
  hungary: 'Europe',
  serbia: 'Europe',
  bulgaria: 'Europe',
  europe: 'Europe',
  brazil: 'South America',
  argentina: 'South America',
  uruguay: 'South America',
  chile: 'South America',
  colombia: 'South America',
  peru: 'South America',
  ecuador: 'South America',
  paraguay: 'South America',
  bolivia: 'South America',
  venezuela: 'South America',
  'south america': 'South America',
  conmebol: 'South America',
  japan: 'Asia',
  'south korea': 'Asia',
  china: 'Asia',
  india: 'Asia',
  'saudi arabia': 'Asia',
  australia: 'Asia',
  iran: 'Asia',
  iraq: 'Asia',
  qatar: 'Asia',
  uae: 'Asia',
  thailand: 'Asia',
  vietnam: 'Asia',
  indonesia: 'Asia',
  malaysia: 'Asia',
  uzbekistan: 'Asia',
  asia: 'Asia',
  afc: 'Asia',
  nigeria: 'Africa',
  ghana: 'Africa',
  'south africa': 'Africa',
  egypt: 'Africa',
  morocco: 'Africa',
  senegal: 'Africa',
  cameroon: 'Africa',
  algeria: 'Africa',
  tunisia: 'Africa',
  'ivory coast': 'Africa',
  mali: 'Africa',
  zambia: 'Africa',
  drc: 'Africa',
  angola: 'Africa',
  africa: 'Africa',
  caf: 'Africa',
  usa: 'North America',
  mexico: 'North America',
  canada: 'North America',
  'costa rica': 'North America',
  honduras: 'North America',
  panama: 'North America',
  jamaica: 'North America',
  'north america': 'North America',
  concacaf: 'North America',
  international: 'International',
  world: 'International',
};

export function normalizeText(text: string): string {
  return text.toLowerCase().trim().replace(/\s+/g, ' ');
}

export function getLeagueDisplayName(league: League): string {
  return league.name;
}

export function getLeagueRegion(league: League): string {
  const name = normalizeText(league.name);
  const country = normalizeText(league.country || '');

  if (name.includes('uefa') || name.includes('champions league') || name.includes('europa') || name.includes('conference')) return 'Europe';
  if (name.includes('copa américa') || name.includes('copa libertadores') || name.includes('conmebol')) return 'South America';
  if (name.includes('afc') && (name.includes('champions') || name.includes('cup') || name.includes('asian'))) return 'Asia';
  if (name.includes('caf') || name.includes('africa cup')) return 'Africa';
  if (name.includes('concacaf') || name.includes('gold cup')) return 'North America';
  if (name.includes('world cup') || name.includes('fifa') || name.includes('international')) return 'International';

  const region = REGION_MAP[country] || REGION_MAP[country.split(' ')[0]];
  if (region) return region;

  if (country === 'international' || country === 'world') return 'International';

  return 'International';
}

export function getLeagueIcon(league: League): string {
  const country = league.country || '';
  const code = COUNTRY_CODE_MAP[normalizeText(country)]
    || COUNTRY_CODE_MAP[normalizeText(country.split(' ')[0])];
  if (code) return `https://flagsapi.com/${code}/flat/64.png`;
  if (league.name.toLowerCase().includes('champions')) return '🏆';
  return '';
}

export function filterLeaguesBySearch(leagues: League[], query: string): League[] {
  const q = normalizeText(query);
  if (!q) return leagues;
  return leagues.filter(l => {
    const name = normalizeText(l.name);
    const country = normalizeText(l.country || '');
    const region = normalizeText(getLeagueRegion(l));
    const shortForms = ['epl', 'ucl', 'afc', 'caf', 'conmebol', 'concacaf', 'fifa', 'copa'];
    if (shortForms.some(s => s === q)) {
      if (q === 'epl' && name.includes('premier')) return true;
      if (q === 'ucl' && name.includes('champions')) return true;
      if (q === 'afc' && (region.includes('asia') || name.includes('afc'))) return true;
      if (q === 'caf' && (region.includes('africa') || name.includes('caf'))) return true;
      if (q === 'conmebol' && (region.includes('south') || name.includes('copa') || name.includes('libertadores'))) return true;
      if (q === 'concacaf' && (region.includes('north') || name.includes('gold cup') || name.includes('concacaf'))) return true;
      if (q === 'fifa' && (name.includes('world cup') || name.includes('fifa'))) return true;
      if (q === 'copa' && (name.includes('copa') || name.includes('libertadores'))) return true;
    }
    return name.includes(q) || country.includes(q) || region.includes(q);
  });
}

export function sortLeaguesByPriority(leagues: League[]): League[] {
  const priority: League[] = [];
  const rest: League[] = [];
  for (const l of leagues) {
    const idx = PRIORITY_ORDER.indexOf(l.name);
    if (idx !== -1) {
      priority[idx] = l;
    } else {
      rest.push(l);
    }
  }
  const sorted = priority.filter(Boolean);
  rest.sort((a, b) => a.name.localeCompare(b.name));
  return [...sorted, ...rest];
}
