# Football World Cup 2026 App - Quick Start & Testing Guide

## 🚀 Quick Start

### Prerequisites
- Node.js and npm installed
- Expo CLI installed (`npm install -g expo-cli`)
- iOS/Android emulator or physical device

### Installation & Running

```bash
# Navigate to project directory
cd /Users/susmoydas/Football2026

# Install dependencies (if not already done)
npm install

# Start the app
npm start
# or
expo start

# Choose your platform:
# Press 'i' for iOS simulator
# Press 'a' for Android emulator
# Scan QR code with Expo Go app for physical device
```

---

## ✨ Feature Testing Guide

### 1. Test Notification Settings

**Path:** Settings Tab (bottom navigation) → Scroll to "Notifications" section

**Steps:**
1. Open the app and go to the Settings tab (⚙ icon)
2. Scroll down past "Default League" section
3. Look for "Notifications" section with header

**Test Cases:**
- ✅ Toggle "Enable Notifications" ON/OFF
  - Should reveal/hide child toggles
  - Toggle state should persist after closing and reopening
  
- ✅ Toggle "Match Today" when notifications enabled
  - Should work smoothly
  - State should save immediately
  
- ✅ Toggle "Match Running" when notifications enabled
  - Should work smoothly
  - State should save immediately
  
- ✅ Toggle "Match Done" when notifications enabled
  - Should work smoothly
  - State should save immediately

- ✅ Restart app and verify toggles remain in same state

---

### 2. Test Headers & Back Buttons

**Path:** All screens with navigation

**Header Locations:**
- ✅ **Fixtures** - Shows "Fixtures" header at top
- ✅ **Teams** - Shows "Teams" header at top
- ✅ **Standings** - Shows "Standings" header at top
- ✅ **Settings** - Shows "Settings" header at top
- ✅ **Match Details** - Shows "Team vs Team" header
- ✅ **News** - Shows "News" header with back button
- ✅ **Favorites** - Shows "Favourites" header with back button

**Test Cases:**
1. Navigate to each screen - header should display page name
2. Open Match Details from any match - should show custom header
3. From Match Details, click back button (left arrow) - should return to previous screen
4. From News screen, click back button - should return to Home
5. From Favorites screen, click back button - should return to Home

---

### 3. Test League Selection

**Path:** Settings Tab → "Default League" section

**Steps:**
1. Open Settings tab
2. Look for "Default League" section with 🏆 icon
3. Click to expand dropdown menu

**Test Cases:**
- ✅ See all available leagues listed
- ✅ Currently selected league has checkmark (✓)
- ✅ Select different league
  - Dropdown closes
  - Success message appears
  - Data on other screens updates (new league's matches shown)

- ✅ Check league persists:
  - Close app completely
  - Reopen app
  - Selected league should be remembered
  - Data shows correct league

---

### 4. Test Responsive Design

**iOS Testing:**
1. Run on iPhone simulator with different models:
   - iPhone 15 (regular)
   - iPhone 15 Plus (larger)
   - iPhone 15 Pro (with Dynamic Island)
   - iPhone SE (small screen)

2. Test landscape orientation:
   - Rotate device to landscape
   - All UI elements should fit properly
   - Text should remain readable
   - No overlapping elements

**Android Testing:**
1. Run on Android emulator with different configs:
   - Pixel 6 Pro (standard)
   - Pixel Fold (foldable)
   - Tab S8 (tablet size)

2. Test with different notch configurations
3. Test landscape orientation

**Visual Checks:**
- ✅ Status bar visible but not overlapping content
- ✅ Navigation bar visible but not overlapping content
- ✅ All text readable without truncation
- ✅ Buttons have adequate touch area (minimum 44x44 points)

---

### 5. Test Navigation Flow

**Complete Navigation Test:**
1. Start at Home screen
2. Click Fixtures tab → should show "Fixtures" header
3. Click on any match → should navigate to Match Details
4. Click back button → should return to Fixtures
5. Click Favorites tab → should show "Favourites" header with back button
6. Click back button → should return to Home
7. Click News (if available) → should show "News" header
8. Click back button → should return to Home
9. Click Standings → should show "Standings" header
10. Click Teams → should show "Teams" header
11. Click Settings → should show "Settings" header
12. All navigation should be smooth and consistent

---

### 6. Test Favorite Toggle

**Path:** Any match card with star icon

**Steps:**
1. Find any match card on screen
2. Look for star icon (☆ or ⭐)
3. Tap the star
4. Star should toggle between filled (⭐) and empty (☆)
5. Navigate to Favorites tab
6. Toggled match should appear in list

**Test Cases:**
- ✅ Favorite match from match card
- ✅ Favorite match from Match Details header
- ✅ Unfavorite from Favorites tab
- ✅ Favorites persist after app restart

---

## 📊 Data Persistence Test

**Verify all settings persist across app restarts:**

1. **Change notification settings:**
   - Toggle some notifications on/off
   - Close app completely (don't just minimize)
   - Reopen app
   - Go to Settings
   - Verify toggles are in same state

2. **Change league selection:**
   - Select different league
   - Close app
   - Reopen app
   - Verify new league is still selected
   - Data shown should be for that league

3. **Add/Remove favorites:**
   - Add several matches/teams to favorites
   - Close app
   - Reopen app
   - Go to Favorites
   - Verify all saved favorites still appear

---

## 🐛 Common Issues & Solutions

### Issue: Headers not showing
**Solution:** Ensure all screen imports include `Header` from components
```typescript
import { Header } from '../components';
```

### Issue: Back button not working
**Solution:** Verify navigation prop is passed to screen component
```typescript
navigation?.goBack()
```

### Issue: Toggles not saving
**Solution:** Check AsyncStorage is working (no permissions issues)
- Check app.json for async-storage configuration
- Verify phone allows app to use storage

### Issue: Responsive design looks broken
**Solution:** Test on actual device or correct emulator size
- Emulator might have wrong scaling
- Test on physical device for accurate representation

---

## ✅ Final Checklist

Before considering implementation complete, verify:

- [ ] All headers display on correct screens
- [ ] Back buttons appear on nested screens
- [ ] Back buttons navigate correctly
- [ ] Notification toggles work smoothly
- [ ] Notification settings persist
- [ ] League selection works
- [ ] League selection persists
- [ ] UI looks good on iPhone and Android
- [ ] No text is cut off or overlapped
- [ ] SafeArea doesn't hide important UI
- [ ] All navigation is smooth and responsive
- [ ] App doesn't crash during navigation
- [ ] Favorites can be added/removed
- [ ] Settings persists after app restart

---

## 📞 Next Steps

1. **Run the app** on iOS and Android
2. **Test all features** using this guide
3. **Fix any issues** that arise
4. **Convert logo** from SVG to PNG (optional)
5. **Add icon pack** from hugeicons.com (optional)
6. **Deploy** to production

---

**Happy Testing! 🎉**
