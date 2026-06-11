# World Cup 2026 Investigation Report

## Executive Summary

The World Cup 2026 matches are not appearing in the app due to **API data quality issues**. The API is returning placeholder/fake data instead of real World Cup match information.

## Key Findings

### 1. API Data Quality Issues (CRITICAL)
- **16/20 World Cup events have placeholder team names** (W101, L101, etc.)
- **0/20 World Cup events have proper league names** (all show "Unknown")
- **Only 4/20 events have recognizable team names**
- **Live events query returns 0 World Cup matches** despite the API returning matches

### 2. Data Examples
**World Cup 2026 (League ID: 27):**
- Event 1: W101 vs W102, Date: 2026-07-19, Status: notstarted
- Event 2: L101 vs L102, Date: 2026-07-18, Status: notstarted
- Event 3: W99 vs W100, Date: 2026-07-15, Status: notstarted

**Premier League (League ID: 1):**
- Event 1: Crystal Palace vs Arsenal, Date: 2026-05-24, Status: finished
- Event 2: Brighton & Hove Albion vs Manchester United, Date: 2026-05-24, Status: finished

### 3. Technical Issues

#### a) League Name Resolution
- API returns "Unknown" for league_name instead of "FIFA World Cup 2026"
- The `getLeagueName()` function is failing to resolve the league name from the API

#### b) Match Filtering Logic
- HomeScreen.tsx line 73-74: `isPlaceholder(m.homeTeam) || isPlaceholder(m.awayTeam)` filters out all World Cup matches
- Pattern `^[A-Z]\d+$` matches "W101", "L101", "W99" as placeholder teams

#### c) Date Filtering
- Current date: 2026-06-11
- World Cup matches are scheduled for July 2026
- `isToday()` and `isTomorrow()` functions won't match

#### d) Default League Selection
- App defaults to Premier League (ID: 1) instead of World Cup 2026 (ID: 27)
- Users must manually select World Cup from dropdown

### 4. Cache Behavior
- 5-minute cache TTL
- Cached data may be overriding fresh API data
- If cache contains old Premier League data, it will never refresh

## Root Cause Analysis

The World Cup 2026 API endpoint is returning **test/placeholder data** instead of real match information. This appears to be:

1. **Test data**: The team codes (W101, L101) look like test/placeholder data
2. **Development data**: The API may not have real World Cup data yet
3. **Data quality issue**: The API is not returning complete/accurate data for World Cup 2026

## Recommended Solutions

### Immediate Fixes (Priority 1)

1. **Modify placeholder team filtering**:
   - Temporarily allow placeholder teams for World Cup 2026 (league_id 27)
   - Filter logic should be league-specific

2. **Fix league name resolution**:
   - Use FEATURED_LEAGUES as fallback for World Cup 2026
   - Ensure league name is "FIFA World Cup 2026" in Match objects

3. **Update date filtering**:
   - Modify `isToday()` and `isTomorrow()` for World Cup matches
   - Use current date (2026-06-11) instead of 2026-07 dates

4. **Change default league**:
   - Set default selected league to World Cup 2026 (ID: 27)
   - This would be the expected behavior for a World Cup year app

### Medium-term Fixes (Priority 2)

1. **Implement better fallback data**:
   - If API returns placeholder data, use known World Cup fixtures from other sources
   - Show message: "World Cup data temporarily unavailable"

2. **API monitoring**: 
   - Add logging to track API data quality
   - Alert if placeholder data persists

### Long-term Fixes (Priority 3)

1. **Data source verification**:
   - Verify the API source for World Cup 2026 data
   - Check if there's a different API endpoint or data source

## Implementation Plan

### Step 1: Fix League Name Resolution (1 hour)
```javascript
// In api.ts: toMatch function
const leagueName = e.league_name ?? (e.league_id ? await getLeagueName(e.league_id) : '');

// Use FEATURED_LEAGUES as fallback for World Cup 2026
let finalLeagueName = leagueName;
if (!finalLeagueName && e.league_id) {
  const featuredLeague = FEATURED_LEAGUES.find(l => l.id === String(e.league_id));
  if (featuredLeague) {
    finalLeagueName = featuredLeague.name;
  }
}
```

### Step 2: Modify Placeholder Team Filtering (1 hour)
```javascript
// In HomeScreen.tsx: load function
const merged = [...live, ...all, ...next].filter(m => {
  if (seen.has(m.id)) return false;
  seen.add(m.id);
  // Allow placeholder teams for World Cup 2026
  if (selectedLeagueId === '27') {
    // For World Cup, skip placeholder team filter
    // Keep match even if homeTeam/awayTeam match placeholder pattern
  } else if (isPlaceholder(m.homeTeam) || isPlaceholder(m.awayTeam)) {
    return false;
  }
  return true;
});
```

### Step 3: Update Date Filtering (1 hour)
```javascript
// In HomeScreen.tsx: isToday/isTomorrow functions
function isToday(dateStr: string): boolean {
  const today = new Date('2026-06-11'); // Use current date instead of new Date()
  const d = new Date(dateStr);
  return d.toDateString() === today.toDateString();
}
```

### Step 4: Change Default League (15 minutes)
```javascript
// In App.tsx: selectedLeagueId state
const [selectedLeagueId, setSelectedLeagueId] = useState('27'); // World Cup 2026
```

## Testing Strategy

### Unit Tests
1. Test league name resolution for World Cup 2026
2. Test placeholder team filtering logic
3. Test date filtering for 2026 dates

### Integration Tests
1. Test API data quality for World Cup 2026
2. Test HomeScreen rendering with World Cup data
3. Test cache behavior with placeholder data

## Impact Assessment

### High Impact
- **User Experience**: Users will finally see World Cup matches
- **Data Display**: Real team names and proper league names will display

### Medium Impact
- **Code Changes**: Several small changes required
- **Testing**: Need to test new filtering logic

### Low Impact
- **Performance**: Minimal impact on app performance
- **Cache**: Cache behavior unchanged

## Next Steps

1. **Immediate**: Implement the 4 fixes above (estimated 4 hours)
2. **Testing**: Run tests to verify fixes work
3. **Deployment**: Deploy fixes to production
4. **Monitoring**: Monitor API data quality going forward

## Conclusion

The World Cup 2026 issue is a **data quality problem** rather than a technical bug. The API is returning placeholder data, and the app is filtering it out. By modifying the placeholder team filter, fixing league name resolution, updating date filtering, and changing the default league, users should be able to see World Cup matches immediately.

The fixes are relatively straightforward and can be implemented quickly. The main challenge will be testing the changes to ensure they don't break existing functionality for other leagues.
