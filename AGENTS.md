# Football2026 — Expo + gluestack-ui + NativeWind

## Stack
- Expo SDK 54, React 19.1, React Native 0.81.5
- gluestack-ui v3 (dark mode only, bg `#1C1B23`)
- NativeWind v4 (Tailwind for RN), babel: `jsxImportSource: "nativewind"`
- Navigation: `@react-navigation` bottom tabs + native stack (all `headerShown: false`)
- APIs:
  - BSD (`src/config.ts` — base URL + token), `@tanstack/react-query`
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
    storage.ts      # AsyncStorage wrapper for favourites/settings/notifications
  types/index.ts    # C (colors), Match, Team (has badgeUrl), Standing, League, etc.
  config.ts         # BSD config
```

## Key Conventions
- **Dark mode only**: `GluestackUIProvider mode="dark"`, bg `#1C1B23`
- **Font sizes** bumped +2px: `2xs:12, xs:14, sm:16, base:18, lg:20, xl:22, 2xl:26, 3xl:32`
- **Card border radius**: `rounded-xl` (12px) throughout
- **Team badges** (flagsapi.com flag images via `getWorldCupFlagUrl()`, with flag emoji fallback):
  1. Flag image: `getWorldCupFlagUrl(teamName)` → direct country name match → `teamCountryCache` → league country → `https://flagsapi.com/{code}/flat/64.png`
  2. Fallback: flag emoji via `countryToFlag()` (case-insensitive, `'⚽'` fallback) then colored initials
  3. Country→code map in `WORLD_CUP_FLAG_CODES` (comprehensive, 200+ entries), handles `" National Team"` suffix + first-word fallback
- **Avatar fallback**: `getTeamBgClass(name)` — deterministic hash into 20 dark-safe gluestack tokens (no `bg-primary-*`) + `getInitials(name)` for initials text
- **LinearGradient** (`expo-linear-gradient`): wrap in `Box` with `overflow-hidden` for border radius
- **TeamBadge `uri`**: TeamCard passes `badgeUrl || badge` (`badgeUrl` = flagsapi.com URL per team country); MatchCard passes `homeBadge`/`awayBadge` (flagsapi.com URL or flag emoji)
- **Icons**: all `HugeiconsIcon` sizes bumped +2px
- **Nav routing**: `buildNavigate(navigation)` maps string screen names to routes; custom `BottomNav` (teal `#20C997` accent)

## Gotchas
- Screens are legacy StyleSheet — they import updated gluestack components but internally use `C.*` + `react-native` View/Text
- No `dist/` in `.gitignore`
- `.npmrc` sets `legacy-peer-deps=true`
- Path alias `@/` → `./src/*` (tsconfig.json + babel module-resolver)
- gluestack-ui generated wrappers in `src/components/ui/` have pre-existing TS errors (ignore)
- Node.js v26: Metro needs `--clear` flag every start (auto-set in `npm start` via package.json)

