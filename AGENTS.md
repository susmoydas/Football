# Football2026 — Expo + gluestack-ui + NativeWind

## Stack
- Expo SDK 54, React 19.1, React Native 0.81.5
- gluestack-ui v3 (dark mode only, bg `#1C1B23`)
- NativeWind v4 (Tailwind for RN), babel: `jsxImportSource: "nativewind"`
- Navigation: `@react-navigation` bottom tabs + native stack (all `headerShown: false`)
- APIs:
  - BSD (`src/config.ts` — base URL + hardcoded token), `@tanstack/react-query`
  - TheSportsDB (`src/config.ts` — v1 JSON, test key `3`, get own at thesportsdb.com)
- Icons: `@hugeicons/react-native` (all bumped +2px from original)
- Storage: `@react-native-async-storage/async-storage` for favourites + settings

## Commands
```sh
npm start          # expo start
npm run ios        # expo start --ios
npm run android    # expo start --android
npx tsc --noEmit   # typecheck (no lint/test scripts)
```

## Project Structure
```
src/
  screens/          # 11 screens, most still use C.* + StyleSheet (legacy)
  components/
    index.tsx       # All shared UI (gluestack migrated): TeamBadge, MatchCard,
                    # TeamCard, StandingsTable, Header, Banner, etc.
    ui/             # gluestack-ui generated wrappers (do not edit)
  services/
    api.ts          # BSD client: fetch matches/teams/leagues/standings
    sportsdb.ts     # TheSportsDB client: search team badges by name, in-memory cache
    storage.ts      # AsyncStorage wrapper for favourites/settings/notifications
  types/index.ts    # C (colors), Match, Team (has badgeUrl), Standing, League, etc.
  config.ts         # BSD.BASE_URL + BSD.TOKEN + SPORTSDB.BASE_URL + SPORTSDB.API_KEY
```

## Key Conventions
- **Dark mode only**: `GluestackUIProvider mode="dark"`, bg `#1C1B23`
- **Font sizes** bumped +2px: `2xs:12, xs:14, sm:16, base:18, lg:20, xl:22, 2xl:26, 3xl:32`
- **Card border radius**: `rounded-xl` (12px) throughout
- **Team badges** (two-step enrichment):
  1. Country flag via `countryToFlag()` (case-insensitive, `'⚽'` fallback)
  2. Real crest via TheSportsDB `searchteams.php?t={name}` (overwrites flag when found)
- **Avatar fallback**: `getTeamBgClass(name)` — deterministic hash into 20 dark-safe gluestack tokens (no `bg-primary-*`) + `getInitials(name)` for initials text
- **LinearGradient** (`expo-linear-gradient`): wrap in `Box` with `overflow-hidden` for border radius
- **TeamBadge `uri`**: TeamCard passes `badgeUrl || badge`; MatchCard passes `homeBadge`/`awayBadge` (enriched to SportsDB URL or flag emoji)
- **Icons**: all `HugeiconsIcon` sizes bumped +2px
- **Nav routing**: `buildNavigate(navigation)` maps string screen names to routes; custom `BottomNav` (teal `#20C997` accent)

## TheSportsDB Integration
- File: `src/services/sportsdb.ts`
- Endpoint: `searchteams.php?t={teamName}` — searches by team name, prefers Soccer results
- Cache: in-memory `Map<teamName, badgeUrl|null>`, deduped in-flight requests
- Concurrent fetching: 5 parallel requests per batch
- Enrichment: all match/team fetch functions in `api.ts` run SportsDB enrichment after initial BSD data load
- `Team.badgeUrl` added to types for crest URL storage (separate from `Team.badge` flag emoji)
- If SportsDB has no match → falls back to country flag → colored initials

## Gotchas
- Screens are legacy StyleSheet — they import updated gluestack components but internally use `C.*` + `react-native` View/Text
- No `dist/` in `.gitignore`
- `.npmrc` sets `legacy-peer-deps=true`
- Path alias `@/` → `./src/*` (tsconfig.json + babel module-resolver)
- gluestack-ui generated wrappers in `src/components/ui/` have pre-existing TS errors (ignore)
- SportsDB test key `3` has limited data; replace with real key for full coverage
