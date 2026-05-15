import axios from 'axios';
import { Match, Team, Standing, League, MatchStatus, LineupResponse, NewsArticle, Player, CoachStaff } from '../types';
import { BSD } from '../config';

const api = axios.create({
  baseURL: BSD.BASE_URL,
  timeout: 15000,
  headers: { Authorization: `Token ${BSD.TOKEN}` },
});

// ─── Country → Flag Emoji ─────────────────────────────────────────────────────

export function countryToFlag(country: string): string {
  if (!country) return '⚽';
  const map: Record<string, string> = {
    'england': '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    'spain': '🇪🇸',
    'germany': '🇩🇪',
    'italy': '🇮🇹',
    'france': '🇫🇷',
    'portugal': '🇵🇹',
    'netherlands': '🇳🇱',
    'holland': '🇳🇱',
    'belgium': '🇧🇪',
    'brazil': '🇧🇷',
    'argentina': '🇦🇷',
    'usa': '🇺🇸',
    'united states': '🇺🇸',
    'united states of america': '🇺🇸',
    'canada': '🇨🇦',
    'mexico': '🇲🇽',
    'scotland': '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
    'wales': '🏴󠁧󠁢󠁷󠁬󠁳󠁿',
    'ireland': '🇮🇪',
    'republic of ireland': '🇮🇪',
    'northern ireland': '🇬🇧',
    'switzerland': '🇨🇭',
    'austria': '🇦🇹',
    'sweden': '🇸🇪',
    'norway': '🇳🇴',
    'denmark': '🇩🇰',
    'poland': '🇵🇱',
    'ukraine': '🇺🇦',
    'russia': '🇷🇺',
    'turkey': '🇹🇷',
    'türkiye': '🇹🇷',
    'greece': '🇬🇷',
    'croatia': '🇭🇷',
    'czech republic': '🇨🇿',
    'czechia': '🇨🇿',
    'serbia': '🇷🇸',
    'slovakia': '🇸🇰',
    'slovenia': '🇸🇮',
    'hungary': '🇭🇺',
    'romania': '🇷🇴',
    'bulgaria': '🇧🇬',
    'albania': '🇦🇱',
    'montenegro': '🇲🇪',
    'bosnia': '🇧🇦',
    'bosnia and herzegovina': '🇧🇦',
    'kosovo': '🇽🇰',
    'north macedonia': '🇲🇰',
    'macedonia': '🇲🇰',
    'finland': '🇫🇮',
    'iceland': '🇮🇸',
    'israel': '🇮🇱',
    'georgia': '🇬🇪',
    'armenia': '🇦🇲',
    'azerbaijan': '🇦🇿',
    'kazakhstan': '🇰🇿',
    'cyprus': '🇨🇾',
    'japan': '🇯🇵',
    'south korea': '🇰🇷',
    'korea republic': '🇰🇷',
    'korea': '🇰🇷',
    'china': '🇨🇳',
    'india': '🇮🇳',
    'iran': '🇮🇷',
    'iraq': '🇮🇶',
    'qatar': '🇶🇦',
    'uae': '🇦🇪',
    'united arab emirates': '🇦🇪',
    'saudi arabia': '🇸🇦',
    'australia': '🇦🇺',
    'new zealand': '🇳🇿',
    'colombia': '🇨🇴',
    'uruguay': '🇺🇾',
    'chile': '🇨🇱',
    'peru': '🇵🇪',
    'paraguay': '🇵🇾',
    'ecuador': '🇪🇨',
    'venezuela': '🇻🇪',
    'bolivia': '🇧🇴',
    'nigeria': '🇳🇬',
    'ghana': '🇬🇭',
    'cameroon': '🇨🇲',
    'ivory coast': '🇨🇮',
    "côte d'ivoire": '🇨🇮',
    'senegal': '🇸🇳',
    'morocco': '🇲🇦',
    'egypt': '🇪🇬',
    'tunisia': '🇹🇳',
    'algeria': '🇩🇿',
    'south africa': '🇿🇦',
    'congo': '🇨🇬',
    'dr congo': '🇨🇩',
    'democratic republic of the congo': '🇨🇩',
    'mali': '🇲🇱',
    'zambia': '🇿🇲',
    'international': '🌍',
    'europe': '🏆',
    'uk': '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    'great britain': '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
  };
  return map[country.toLowerCase()] || '⚽';
}

// ─── flagsapi.com World Cup flag URLs ─────────────────────────────────────────

const WORLD_CUP_FLAG_CODES: Record<string, string> = {
  'afghanistan': 'AF',
  'albania': 'AL',
  'algeria': 'DZ',
  'american samoa': 'AS',
  'andorra': 'AD',
  'angola': 'AO',
  'anguilla': 'AI',
  'antigua and barbuda': 'AG',
  'argentina': 'AR',
  'armenia': 'AM',
  'aruba': 'AW',
  'australia': 'AU',
  'austria': 'AT',
  'azerbaijan': 'AZ',
  'bahamas': 'BS',
  'bahrain': 'BH',
  'bangladesh': 'BD',
  'barbados': 'BB',
  'belarus': 'BY',
  'belgium': 'BE',
  'belize': 'BZ',
  'benin': 'BJ',
  'bermuda': 'BM',
  'bhutan': 'BT',
  'bolivia': 'BO',
  'bonaire': 'BQ',
  'bosnia and herzegovina': 'BA',
  'bosnia': 'BA',
  'botswana': 'BW',
  'brazil': 'BR',
  'british virgin islands': 'VG',
  'brunei': 'BN',
  'bulgaria': 'BG',
  'burkina faso': 'BF',
  'burundi': 'BI',
  'cambodia': 'KH',
  'cameroon': 'CM',
  'canada': 'CA',
  'cape verde': 'CV',
  'cayman islands': 'KY',
  'central african republic': 'CF',
  'chad': 'TD',
  'chile': 'CL',
  'china': 'CN',
  'chinese taipei': 'TW',
  'colombia': 'CO',
  'comoros': 'KM',
  'congo': 'CG',
  'cook islands': 'CK',
  'costa rica': 'CR',
  'croatia': 'HR',
  'cuba': 'CU',
  'curacao': 'CW',
  'cyprus': 'CY',
  'czech republic': 'CZ',
  'czechia': 'CZ',
  'denmark': 'DK',
  'djibouti': 'DJ',
  'dominica': 'DM',
  'dominican republic': 'DO',
  'dr congo': 'CD',
  'democratic republic of the congo': 'CD',
  'ecuador': 'EC',
  'egypt': 'EG',
  'el salvador': 'SV',
  'england': 'GB',
  'equatorial guinea': 'GQ',
  'eritrea': 'ER',
  'estonia': 'EE',
  'eswatini': 'SZ',
  'ethiopia': 'ET',
  'faroe islands': 'FO',
  'fiji': 'FJ',
  'finland': 'FI',
  'france': 'FR',
  'french guiana': 'GF',
  'french polynesia': 'PF',
  'gabon': 'GA',
  'gambia': 'GM',
  'the gambia': 'GM',
  'georgia': 'GE',
  'germany': 'DE',
  'ghana': 'GH',
  'gibraltar': 'GI',
  'great britain': 'GB',
  'greece': 'GR',
  'grenada': 'GD',
  'guadeloupe': 'GP',
  'guam': 'GU',
  'guatemala': 'GT',
  'guinea': 'GN',
  'guinea-bissau': 'GW',
  'guyana': 'GY',
  'haiti': 'HT',
  'honduras': 'HN',
  'hong kong': 'HK',
  'hungary': 'HU',
  'iceland': 'IS',
  'india': 'IN',
  'indonesia': 'ID',
  'iran': 'IR',
  'ir iran': 'IR',
  'iraq': 'IQ',
  'ireland': 'IE',
  'republic of ireland': 'IE',
  'israel': 'IL',
  'italy': 'IT',
  'ivory coast': 'CI',
  "côte d'ivoire": 'CI',
  'jamaica': 'JM',
  'japan': 'JP',
  'jordan': 'JO',
  'kazakhstan': 'KZ',
  'kenya': 'KE',
  'kosovo': 'XK',
  'kuwait': 'KW',
  'kyrgyzstan': 'KG',
  'laos': 'LA',
  'latvia': 'LV',
  'lebanon': 'LB',
  'lesotho': 'LS',
  'liberia': 'LR',
  'libya': 'LY',
  'liechtenstein': 'LI',
  'lithuania': 'LT',
  'luxembourg': 'LU',
  'macau': 'MO',
  'madagascar': 'MG',
  'malawi': 'MW',
  'malaysia': 'MY',
  'maldives': 'MV',
  'mali': 'ML',
  'malta': 'MT',
  'mauritania': 'MR',
  'mauritius': 'MU',
  'mexico': 'MX',
  'moldova': 'MD',
  'mongolia': 'MN',
  'montenegro': 'ME',
  'montserrat': 'MS',
  'morocco': 'MA',
  'mozambique': 'MZ',
  'myanmar': 'MM',
  'namibia': 'NA',
  'nepal': 'NP',
  'netherlands': 'NL',
  'holland': 'NL',
  'new caledonia': 'NC',
  'new zealand': 'NZ',
  'nicaragua': 'NI',
  'niger': 'NE',
  'nigeria': 'NG',
  'north korea': 'KP',
  'north macedonia': 'MK',
  'macedonia': 'MK',
  'northern ireland': 'GB',
  'norway': 'NO',
  'oman': 'OM',
  'pakistan': 'PK',
  'palestine': 'PS',
  'panama': 'PA',
  'papua new guinea': 'PG',
  'paraguay': 'PY',
  'peru': 'PE',
  'philippines': 'PH',
  'poland': 'PL',
  'portugal': 'PT',
  'puerto rico': 'PR',
  'qatar': 'QA',
  'romania': 'RO',
  'russia': 'RU',
  'rwanda': 'RW',
  'samoa': 'WS',
  'san marino': 'SM',
  'sao tome and principe': 'ST',
  'saudi arabia': 'SA',
  'scotland': 'GB',
  'senegal': 'SN',
  'serbia': 'RS',
  'seychelles': 'SC',
  'sierra leone': 'SL',
  'singapore': 'SG',
  'slovakia': 'SK',
  'slovenia': 'SI',
  'solomon islands': 'SB',
  'somalia': 'SO',
  'south africa': 'ZA',
  'south korea': 'KR',
  'korea republic': 'KR',
  'korea': 'KR',
  'south sudan': 'SS',
  'spain': 'ES',
  'sri lanka': 'LK',
  'st. kitts and nevis': 'KN',
  'st. lucia': 'LC',
  'st. martin': 'MF',
  'st. vincent and the grenadines': 'VC',
  'sudan': 'SD',
  'suriname': 'SR',
  'sweden': 'SE',
  'switzerland': 'CH',
  'syria': 'SY',
  'tahiti': 'PF',
  'tajikistan': 'TJ',
  'tanzania': 'TZ',
  'thailand': 'TH',
  'timor-leste': 'TL',
  'togo': 'TG',
  'tonga': 'TO',
  'trinidad and tobago': 'TT',
  'tunisia': 'TN',
  'turkey': 'TR',
  'türkiye': 'TR',
  'turkmenistan': 'TM',
  'turks and caicos islands': 'TC',
  'uganda': 'UG',
  'ukraine': 'UA',
  'united arab emirates': 'AE',
  'uae': 'AE',
  'uruguay': 'UY',
  'usa': 'US',
  'united states': 'US',
  'united states of america': 'US',
  'uzbekistan': 'UZ',
  'vanuatu': 'VU',
  'venezuela': 'VE',
  'vietnam': 'VN',
  'wales': 'GB',
  'yemen': 'YE',
  'zambia': 'ZM',
  'zimbabwe': 'ZW',
};

function getWorldCupFlagUrl(teamName: string): string {
  const key = teamName.toLowerCase().trim();
  let code = WORLD_CUP_FLAG_CODES[key];
  if (code) return `https://flagsapi.com/${code}/flat/64.png`;
  const stripped = key.replace(/ national team$/, '').trim();
  if (stripped !== key) {
    code = WORLD_CUP_FLAG_CODES[stripped];
    if (code) return `https://flagsapi.com/${code}/flat/64.png`;
  }
  code = WORLD_CUP_FLAG_CODES[key.split(' ')[0]];
  if (code) return `https://flagsapi.com/${code}/flat/64.png`;
  return '';
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
  venue?: string;
  venue_name?: string;
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
  const cached = leagueNameCache.get(id);
  if (cached) return cached;
  const featured = FEATURED_LEAGUES.find(l => l.id === String(id));
  return featured?.name ?? String(id);
}

let venueNameCache: Map<number, string> | null = null;

function extractVenueName(data: any): string {
  if (!data) return '';
  if (typeof data === 'string') return data;
  return data.name || data.venue || data.venue_name || data.strVenue || '';
}

async function getVenueName(id: number | null): Promise<string> {
  if (!id) return '';
  if (!venueNameCache) venueNameCache = new Map();
  const cached = venueNameCache.get(id);
  if (cached) return cached;

  try {
    const { data } = await api.get(`/venues/${id}`);
    const venue = extractVenueName(data);
    if (venue) {
      venueNameCache.set(id, venue);
      return venue;
    }
  } catch {}

  try {
    const { data } = await api.get('/venues/', { params: { id, limit: 1 } });
    const payload = Array.isArray(data) ? data[0] : data?.results?.[0] ?? data;
    const venue = extractVenueName(payload);
    if (venue) {
      venueNameCache.set(id, venue);
      return venue;
    }
  } catch {}

  return '';
}

async function toMatch(e: BSDEvent): Promise<Match> {
  const venueFromEvent = e.venue || e.venue_name || '';
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
    venue: venueFromEvent || await getVenueName(e.venue_id),
    progress: e.current_minute != null ? String(e.current_minute) : undefined,
    homeTeamId: e.home_team_id != null ? String(e.home_team_id) : undefined,
    awayTeamId: e.away_team_id != null ? String(e.away_team_id) : undefined,
    homeBadge: undefined,
    awayBadge: undefined,
  };
}

// ─── Country → flagsapi.com URL ──────────────────────────────────────────────

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
    badgeUrl: `https://sports.bzzoiro.com/img/team/${t.id}/`,
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
let teamCountryCache: Map<string, string> = new Map();
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
      teamCountryCache.set(t.name.toLowerCase(), t.country);
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

function enrichMatchFlags(matches: Match[]): Match[] {
  return matches.map(m => {
    const hc = teamCountryCache.get(m.homeTeam.toLowerCase()) || findLeague(m.league)?.country || '';
    const ac = teamCountryCache.get(m.awayTeam.toLowerCase()) || findLeague(m.league)?.country || '';
    return {
      ...m,
      homeBadge: m.homeTeamId
        ? `https://sports.bzzoiro.com/img/team/${m.homeTeamId}/`
        : getWorldCupFlagUrl(m.homeTeam) || getWorldCupFlagUrl(hc) || undefined,
      awayBadge: m.awayTeamId
        ? `https://sports.bzzoiro.com/img/team/${m.awayTeamId}/`
        : getWorldCupFlagUrl(m.awayTeam) || getWorldCupFlagUrl(ac) || undefined,
    };
  });
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
    return enrichMatchFlags(matches);
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
    return enrichMatchFlags(matches);
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
    return enrichMatchFlags(matches);
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
    return enrichMatchFlags(matches);
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
      return enrichMatchFlags(matches);
    }
    return matches;
  } catch {
    return [];
  }
}

export async function fetchEvent(eventId: string): Promise<Match | null> {
  try {
    const { data } = await api.get(`/events/${eventId}/`);
    if (!data) return null;
    const match = await toMatch(data);
    const enriched = enrichMatchFlags([match]);
    return enriched[0] ?? null;
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
    if (!data) return null;
    const team = toTeam(data);
    if (data.venue_id) {
      try {
        const venueRes = await api.get(`/venues/${data.venue_id}/`);
        if (venueRes.data?.name) {
          team.stadium = venueRes.data.name;
        }
      } catch {}
    }
    return team;
  } catch {
    return null;
  }
}

// ─── BSD Player → Player mapping ─────────────────────────────────────────────

interface BSDPlayer {
  id: number;
  name: string;
  short_name: string;
  position: string;
  specific_position: string;
  jersey_number: number | null;
  nationality: string;
  date_of_birth: string;
  height_cm: number | null;
  weight_kg: number | null;
  preferred_foot: string;
  market_value_eur: number | null;
  contract_until: string | null;
  availability: string;
  national_team_id: number | null;
}

function toPlayer(p: BSDPlayer): Player {
  return {
    id: String(p.id),
    name: p.name,
    shortName: p.short_name,
    position: p.position,
    specificPosition: p.specific_position,
    jerseyNumber: p.jersey_number,
    nationality: p.nationality,
    dateOfBirth: p.date_of_birth,
    heightCm: p.height_cm,
    weightKg: p.weight_kg,
    preferredFoot: p.preferred_foot || '',
    marketValueEur: p.market_value_eur,
    contractUntil: p.contract_until,
    availability: p.availability,
    nationalTeamId: p.national_team_id,
  };
}

export async function fetchTeamSquad(teamId: string): Promise<Player[]> {
  try {
    const { data } = await api.get('/players/', {
      params: { team_id: teamId, limit: 50 },
    });
    const list = Array.isArray(data) ? data : data?.results ?? [];
    return list.map(toPlayer);
  } catch {
    return [];
  }
}

interface BSDManager {
  id: number;
  name: string;
  short_name: string;
  country: string;
  tactical_profile: string;
  preferred_formation: string;
  current_team_id: number;
  matches_total: number;
  wins: number;
  draws: number;
  losses: number;
  win_pct: number;
  avg_goals_scored: number;
  avg_goals_conceded: number;
  avg_possession: number | null;
  clean_sheet_pct: number;
  btts_pct: number;
  over_25_pct: number;
}

function toCoachStaff(m: BSDManager): CoachStaff {
  return {
    id: String(m.id),
    name: m.name,
    role: 'Head Coach',
    country: m.country,
    tacticalProfile: m.tactical_profile,
    preferredFormation: m.preferred_formation,
    matchesTotal: m.matches_total,
    wins: m.wins,
    draws: m.draws,
    losses: m.losses,
    winPct: m.win_pct,
    avgGoalsScored: m.avg_goals_scored,
    avgGoalsConceded: m.avg_goals_conceded,
    avgPossession: m.avg_possession,
    cleanSheetPct: m.clean_sheet_pct,
    bttsPct: m.btts_pct,
    over25Pct: m.over_25_pct,
  };
}

export async function fetchTeamCoachingStaff(teamId: string): Promise<CoachStaff[]> {
  try {
    const { data } = await api.get('/managers/', {
      params: { team_id: teamId, limit: 10 },
    });
    const list = Array.isArray(data) ? data : data?.results ?? [];
    return list.map(toCoachStaff);
  } catch {
    return [];
  }
}

export async function fetchCoach(coachId: string): Promise<CoachStaff | null> {
  try {
    const { data } = await api.get(`/managers/${coachId}/`);
    if (!data) return null;
    return toCoachStaff(data);
  } catch {
    return null;
  }
}

export async function fetchTeamEvents(teamId: string, status?: string, limit = 10): Promise<Match[]> {
  try {
    const params: Record<string, any> = { team_id: teamId, limit };
    if (status) params.status = status;
    const { data } = await api.get('/events/', { params });
    const events = extractEvents(data);
    const matches = await Promise.all(events.map(e => toMatch(e)));
    return enrichMatchFlags(matches);
  } catch {
    return [];
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
    await ensureTeamFlagCache(leagueId);
    const { data } = await api.get<BSDStandingsResponse>(`/leagues/${leagueId}/standings/`);
    const mapRow = (r: BSDStandingRow) => ({
      ...toStanding(r),
      badge: `https://sports.bzzoiro.com/img/team/${r.team_id}/`,
    });
    if (data.standings) return data.standings.map(mapRow);
    if (data.groups) {
      const all: Standing[] = [];
      for (const group of Object.values(data.groups)) {
        all.push(...group.map(mapRow));
      }
      return all;
    }
    return [];
  } catch {
    return [];
  }
}

// ─── Lineups ───────────────────────────────────────────────────────────────────

export async function fetchLineup(eventId: string): Promise<LineupResponse | null> {
  try {
    const { data } = await api.get<LineupResponse>(`/events/${eventId}/lineups/`);
    return data;
  } catch {
    return null;
  }
}

// ─── ESPN News ─────────────────────────────────────────────────────────────────

const ESPN_LEAGUES = ['fifa.world', 'eng.1', 'uefa.champions', 'esp.1', 'ita.1', 'ger.1', 'fra.1'];

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

export async function fetchFootballNews(): Promise<NewsArticle[]> {
  try {
    const responses = await Promise.all(
      ESPN_LEAGUES.map(league =>
        fetch(`https://site.api.espn.com/apis/site/v2/sports/soccer/${league}/news?limit=5`)
          .then(r => r.json())
          .catch(() => null)
      )
    );
    const raw: { article: any; published: Date }[] = [];
    const seen = new Set<string>();
    for (const data of responses) {
      if (!data?.articles) continue;
      for (const a of data.articles) {
        if (seen.has(String(a.id))) continue;
        seen.add(String(a.id));
        raw.push({ article: a, published: new Date(a.published) });
      }
    }
    raw.sort((a, b) => b.published.getTime() - a.published.getTime());
    return raw.slice(0, 30).map(({ article: a }) => {
      const image = a.images?.find((i: any) => i.type === 'header')?.url
        || a.images?.find((i: any) => i.type === 'wide')?.url
        || a.images?.[0]?.url;
      return {
        id: String(a.id),
        title: a.headline,
        source: a.byline || 'ESPN',
        time: timeAgo(a.published),
        image,
        content: a.description,
        featured: false,
      };
    });
  } catch {
    return [];
  }
}
