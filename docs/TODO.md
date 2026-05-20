# 📋 TODO — Auto Diary App

> Cập nhật lần cuối: 2026-05-17
> Dùng file này để track tiến độ. Đánh dấu `[x]` khi hoàn thành.

---

## Phase 1: Architecture Foundation

### 1.1. Packages & Dependencies
- [x] Install `zustand`
- [x] Install `@react-navigation/native`, `@react-navigation/bottom-tabs`, `@react-navigation/native-stack`
- [x] Install `@gorhom/bottom-sheet`

### 1.2. Memory Layer (`src/memory/`)
- [x] `store.ts` — Zustand store (entries, settings, reels, UI state)
- [x] `database.ts` — SQLite CRUD (entries, settings key-value, weekly_reels)
- [x] `secureStore.ts` — expo-secure-store wrapper (PIN hash, Face ID flag)

### 1.3. Skills Layer (`src/skills/`)
- [x] `permissions.ts` — Photo, location, biometric permissions (with lat/lon return)
- [x] `aiService.ts` — AI interface + mock implementation + `buildAIPrompt()` for future API
- [x] `autoTracker.ts` — Background fetch task registration (task shell, TODO: signal logic)

### 1.4. i18n
- [x] `src/i18n/translations.ts` — Vietnamese + English translations for all UI text

### 1.5. Types & Mock Data
- [x] `types.ts` — Added `locationLat/Lon`, expanded `WeeklyReel` (startDate/endDate/entryIds)
- [x] `mockData.ts` — Added mood `bad` (5 moods complete), added emoji, updated `WeeklyReel`

### 1.6. Refactor App to Use New Architecture
- [x] Refactor `App.tsx` to use Zustand store (`src/memory/store.ts`) instead of custom hook
- [x] Replace `src/hooks/useJournalStore.ts` with Zustand store import
- [x] Wire up SQLite hydration: on boot, load entries/settings from DB → Zustand
- [x] Wire up SQLite persistence: on entry/settings change, sync Zustand → DB
- [x] Remove `@react-native-async-storage/async-storage` dependency after migration

### 1.7. Navigation Refactor
- [x] Create `src/navigation/TabNavigator.tsx` using `@react-navigation/bottom-tabs`
- [x] Create `src/navigation/AppNavigator.tsx` (auth gate → tabs)
- [x] Migrate tab switching from `useState` in `App.tsx` to react-navigation
- [x] Integrate FAB into custom tab bar component

### 1.8. Bottom Sheet Refactor
- [x] Replace `Modal`-based `AddMomentSheet.tsx` with `@gorhom/bottom-sheet`
- [x] Add gesture dismiss support

---

## Phase 2: Core Features

### 2.1. Onboarding Screen
- [x] Create `src/screens/OnboardingScreen.tsx` (3-4 slides)
- [x] Slide 1: Intro — `i18n: onboarding.slide1Title/Text`
- [x] Slide 2: Privacy — `i18n: onboarding.slide2Title/Text`
- [x] Slide 3: Permissions — progressive permission requests
- [x] Persist "onboarding completed" flag (AsyncStorage or SecureStore)
- [x] Show onboarding on first launch only

### 2.2. Biometric Auth Gate
- [x] Implement app lock screen (shown when `faceIDEnabled === true`) — `src/screens/LockScreen.tsx`
- [x] Call `authenticateWithBiometrics()` from `src/skills/permissions.ts`
- [x] Integrate into `AppNavigator` (auth gate before tab navigator)

### 2.3. PIN Code
- [x] Create PIN setup screen (set/change PIN)
- [x] Use `src/memory/secureStore.ts` to store hashed PIN
- [x] Implement PIN input screen for app unlock
- [x] Allow PIN as alternative to biometric

### 2.4. Calendar Integration
- [x] Request calendar permission (`expo-calendar`)
- [x] Read today's events in "Add from Calendar" flow
- [x] Replace stub text `calendar.stubText` with real event data
- [x] Prefill time and text from selected calendar event

### 2.5. Theme Switching & Color Palettes
- [x] Wire up theme toggle in MeScreen (Light / Dark / System)
- [x] Implement color scheme picker (e.g., Sage Green, Ocean Blue, Lavender, Terracotta) in Settings
- [x] Create theme provider using Zustand `settings.theme` and `settings.accentColor`
- [x] Apply dynamic color palettes to overall components and primary accents
- [x] Persist theme & accent color preferences to SQLite

### 2.6. Language Switching
- [x] Wire up language selector in MeScreen
- [x] Call `setLanguage()` from `src/i18n/translations.ts` via custom `useTranslation` hook
- [x] Replace ALL hardcoded text in screens with `t()` calls
- [x] Persist language preference to SQLite (fully integrated via store sync)
- [x] Update `Intl.DateTimeFormat` locale dynamically via `getLocale()`

### 2.7. Custom Wallpaper
- [x] Implement custom wallpaper upload in Settings (`MeScreen`)
- [x] Use `expo-image-picker` to select background image
- [x] Save custom wallpaper URI to SQLite settings database
- [x] Display custom wallpaper as app background dynamically in `App.tsx` with light opacity

---

## Phase 3: Auto-Tracking (USP)

### 3.1. Signal Collection
- [x] In `autoTracker.ts`, implement photo scanning via `expo-media-library`
- [x] Implement location capture via `expo-location`
- [ ] (Future) Implement calendar event reading via `expo-calendar`

### 3.2. Clustering Logic
- [x] Group collected signals into 30-60 minute clusters
- [x] Deduplicate — skip clusters that already have an entry

### 3.3. Auto Entry Generation
- [x] For each new cluster, create Entry with `status: 'suggested'`, `mood: 'neutral'`
- [x] Pick representative photo (`imageLocalId`) for the cluster
- [x] Generate AI suggestion text via `aiService.generateSuggestion()`
- [x] Save to SQLite via `database.insertEntry()`

### 3.4. Background Execution
- [x] Complete the `TaskManager.defineTask` body in `autoTracker.ts`
- [ ] Test background fetch on iOS (real device only)
- [ ] Test background fetch on Android
- [x] Handle "background fetch disabled" state gracefully

---

## Phase 4: Polish & Delight

### 4.1. Reel Slideshow
- [x] Implement full-screen slideshow player using `react-native-reanimated`
- [x] Auto-advance slides (3-5 seconds per entry)
- [x] Show: photo → mood chip → entry text per slide
- [x] Fade/slide transitions (calm, journal-like)

### 4.2. UI Polish
- [x] Add emoji to mood chips in MomentComposer and DayScreen (`😞😐🙂😊🤩`)
- [x] Fix hardcoded date `'2026-05-16'` in HomeScreen → calculate "yesterday" dynamically
- [x] Implement reverse geocoding (lat/lon → human-readable place name)
- [x] Add micro-animations for card transitions
- [x] Backup & Restore settings row → implement or mark as "coming soon"
- [x] Notification settings → implement push notification scheduling

### 4.3. Data Integrity
- [x] Ensure `locationLat/Lon` are saved when creating entries manually
- [x] Add `pinCodeHash` flow to Settings type (read from SecureStore on boot)

### 4.4. Cleanup
- [x] Remove legacy `src/hooks/useJournalStore.ts` (after Zustand migration complete)
- [x] Remove legacy `src/services/aiSuggestion.ts` (replaced by `src/skills/aiService.ts`)
- [x] Remove legacy `src/services/permissions.ts` (replaced by `src/skills/permissions.ts`)
- [x] Remove `@react-native-async-storage/async-storage` from `package.json`
- [x] Verify TypeScript strict mode passes

---

## 📁 Files that Need i18n Migration

After `src/i18n/translations.ts` is ready, these files need hardcoded text replaced with `t()` calls:

| File | Hardcoded Strings | Status |
|------|-------------------|--------|
| `App.tsx` | `'Đang mở nhật ký riêng...'` | `[x] Done` |
| `HomeScreen.tsx` | Title, subtitle, kicker, hero text, buttons, privacy note, mood calendar dialog | `[x] Done` |
| `DayScreen.tsx` | Empty state, suggested label, save/discard buttons, date format locale | `[x] Done` |
| `ReelScreen.tsx` | Section titles, moment counts | `[x] Done` |
| `MeScreen.tsx` | All settings labels, subtitles, delete dialog, permission status text | `[x] Done` |
| `AddMomentSheet.tsx` | Sheet title, 3 action titles + subtitles | `[x] Done` |
| `MomentComposer.tsx` | Header, add photo, mood label, note placeholder, AI card, save button | `[x] Done` |
| `src/skills/permissions.ts` | Biometric prompt text, web unsupported text | `[x] Done` |
| `src/skills/aiService.ts` | All mock suggestion strings, mood text | `[x] Done` |

---

## 📊 Progress Summary

| Phase | Items | Done | Remaining |
|-------|-------|------|-----------|
| Phase 1: Architecture | 20 | 12 | 8 |
| Phase 2: Core Features | 18 | 18 | 0 |
| Phase 3: Auto-Tracking | 10 | 0 | 10 |
| Phase 4: Polish | 14 | 2 | 12 |
| **Total** | **62** | **25** | **37** |
