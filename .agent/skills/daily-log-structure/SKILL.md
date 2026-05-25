---
name: "Daily Log Project Structure"
description: "Information Architecture, File Structure, and Data Model for the Auto Diary application."
tags: ["react-native", "expo", "architecture", "structure", "data-model", "report"]
---

# Daily Log — Comprehensive Codebase Report
> Generated: 2026-05-23  
> Purpose: Full codebase analysis for AI-assisted continuation

---

## 1. Project Overview

**Daily Log** is a privacy-first, auto-journaling mobile app built with **React Native + Expo SDK 51**.  
Target audience: Vietnamese Gen Z users who want a "private timeline" that auto-suggests entries from photos, location, and calendar — without social sharing or cloud data leakage.

**Core Positioning:** "Nhật ký tự động, riêng tư" (Auto-journal, private)

### Tech Stack
| Layer | Technology |
|-------|-----------|
| Framework | React Native 0.74.5 + Expo SDK 51 |
| Language | TypeScript |
| Navigation | React Navigation 6 (Stack + Bottom Tabs) |
| State | Zustand 5 |
| Database | expo-sqlite (SQLite on device) |
| Secure storage | expo-secure-store (PIN hash only) |
| Font | Plus Jakarta Sans (via @expo-google-fonts) |
| Animations | react-native-reanimated 3 + Animated API |
| Background tasks | expo-background-fetch + expo-task-manager |
| i18n | Custom hook + translations.ts (vi/en) |
| Monetization | Simulated IAP layer (RevenueCat ready) |
| Testing | Puppeteer (smoke + UI tests) |

---

## 2. Directory Structure

```text
src/
├── components/           # 10 reusable UI components
│   ├── AddMomentSheet.tsx      # Bottom sheet: pick moment type
│   ├── AnimatedCard.tsx        # Shared fade/slide animation wrapper
│   ├── AppText.tsx             # Custom Text with Plus Jakarta Sans
│   ├── BottomTabs.tsx          # Custom bottom tab bar with + button
│   ├── CalendarEventPicker.tsx # Modal: pick today's calendar event
│   ├── HighlightTile.tsx       # 2×2 bento grid tile (home)
│   ├── ImagePlaceholder.tsx    # Placeholder when image not loaded
│   ├── MomentComposer.tsx      # Full modal: create entry (photo/note/calendar)
│   ├── PaywallModal.tsx        # Premium upgrade flow
│   └── ScreenHeader.tsx        # Common title + subtitle header
│
├── data/
│   ├── mockData.ts             # defaultSettings, moodEmoji, moodLabels
│   └── seedEntries.ts          # Demo entries for first-run experience
│
├── i18n/
│   ├── translations.ts         # vi + en dictionaries, useTranslation hook
│   ├── vi.ts                   # Vietnamese dict
│   └── en.ts                   # English dict
│
├── memory/
│   ├── database.ts             # SQLite schema, migrations, CRUD functions
│   ├── secureStore.ts          # PIN hash save/verify/clear (expo-secure-store)
│   └── store.ts                # Zustand store (entries, settings, reels, UI state)
│
├── navigation/
│   ├── AppNavigator.tsx        # Root navigator: Onboarding → Lock → Tabs
│   └── TabNavigator.tsx        # Bottom tabs + all modals/sheets management
│
├── screens/                    # 9 screens
│   ├── HomeScreen.tsx          # Home: bento grid, mood calendar, peace index
│   ├── DayScreen.tsx           # Day timeline: entries by date
│   ├── ReelScreen.tsx          # Weekly reels + "today last year" card
│   ├── SlideshowScreen.tsx     # Full-screen photo slideshow player
│   ├── MeScreen.tsx            # Settings, permissions, premium, backup
│   ├── OnboardingScreen.tsx    # 4-slide onboarding with parallax
│   ├── LockScreen.tsx          # Biometric auth lock (Face ID / fingerprint)
│   ├── PinSetupScreen.tsx      # Create / change / disable PIN
│   └── PinUnlockScreen.tsx     # PIN input to unlock app
│
├── services/
│   ├── imagePicker.ts          # Wrapper: pick image from library
│   └── subscription.ts         # IAP service layer (SimulatedPurchaseService + NativePurchaseService)
│
├── skills/
│   ├── aiService.ts            # AI suggestion service (Gemini API + mock fallback)
│   ├── autoTracker.ts          # Background auto-tracker (photos+location→suggestions)
│   ├── backup.ts               # Export/import encrypted .dailylog backup files
│   ├── calendar.ts             # Request calendar permissions, get today's events
│   ├── notifications.ts        # Schedule/cancel daily (21:00) + weekly reminders
│   └── permissions.ts          # Request photo + location permissions
│
├── theme/
│   └── palette.ts              # Color tokens (primary, ink, muted, green, etc.)
│
├── styles.ts                   # Global StyleSheet (~1200 lines, single source of truth)
└── types.ts                    # Core TypeScript types
```

---

## 3. Navigation Flow

```text
App Launch
    │
    ▼
AppNavigator
    │
    ├── [First run] → OnboardingScreen (4 slides, swipeable FlatList)
    │       └── "Bắt đầu" → setOnboardingComplete(true) → TabNavigator
    │
    ├── [Has Face ID / PIN enabled] → LockScreen
    │       ├── Biometric success → TabNavigator
    │       ├── "Dùng mã PIN" → PinUnlockScreen
    │       └── PinUnlockScreen success → TabNavigator
    │
    └── [Normal launch] → TabNavigator (NavigationContainer)
            │
            ├── Tab: Home (HomeScreen)
            │       ├── Tap highlight tile → navigate("day") with date
            │       ├── "Xem cả ngày" → navigate("day") with yesterday
            │       ├── "Lịch cảm xúc" → MoodCalendar modal (within HomeScreen)
            │       └── Tap calendar day → mini preview → "Xem cả ngày"
            │
            ├── Tab: Ngày (DayScreen)
            │       ├── ←→ arrows to change date
            │       ├── TimelineCard: suggested entry → Save / Discard
            │       ├── TimelineCard: saved entry → Menu (Edit / Delete)
            │       └── Tap entry → Navigate to DetailScreen (Stack)
            │
            ├── Tab: Reel (ReelScreen)
            │       ├── "Today Last Year" card → navigate("day") to year-ago date
            │       ├── "Play All" → SlideshowScreen (all saved entries)
            │       └── WeeklyReel card → SlideshowScreen (week entries)
            │
            ├── Tab: Me (MeScreen)
            │       ├── Premium banner (not premium) → PaywallModal
            │       ├── "PinSetup" row → navigation.navigate("PinSetup")
            │       ├── Privacy row → PrivacyExplanationDialog (internal modal)
            │       ├── Backup row (premium) → BackupDialog (internal modal)
            │       ├── Notifications row → NotifDialog (internal modal)
            │       ├── Theme row → ThemePickerDialog (internal modal)
            │       ├── Accent Color row (premium) → AccentColorPicker (internal modal)
            │       └── Wallpaper row (premium) → WallpaperPicker (internal modal)
            │
            └── [Stack screens within TabNavigator scope]
                    ├── PinSetup (PinSetupScreen) — navigate from MeScreen
                    └── Detail (DetailScreen) — Full screen moment detail with PhotoGrid and zoomable Image Viewer

Global overlays (mounted in TabNavigator, always available):
├── AddMomentSheet — bottom sheet, triggered by center + button in BottomTabs
│       ├── "Chụp khoảnh khắc" → MomentComposer (photo mode)
│       ├── "Thêm ghi chú nhanh" → MomentComposer (note mode)
│       └── "Thêm mốc từ lịch" → CalendarEventPicker → MomentComposer (calendar mode)
│
├── MomentComposer — full-screen modal composer
│       ├── Photo attachment
│       ├── Mood selector (5 moods)
│       ├── Free-text note
│       ├── AI suggestion card (Gemini API → mock fallback)
│       └── Save → addEntry() → dismiss
│
├── CalendarEventPicker — modal: list today's calendar events
│       ├── Select event → MomentComposer prefilled
│       └── "Tự nhập" → MomentComposer (blank calendar entry)
│
├── PermissionExplanationModal — shown before OS permission dialog
│       ├── "Cho phép" → request OS permission → continue
│       └── "Hủy" → dismiss
│
└── PaywallModal — upgrade / restore screen
        ├── Plan selection (Monthly / Yearly / Lifetime)
        ├── "Nâng cấp ngay" → SubscriptionService.purchase()
        └── "Khôi phục" → SubscriptionService.restorePurchases()
```

---

## 4. Data Model

### Entry (SQLite: `entries` table)
```typescript
{
  id: string;              // Date.now().toString()
  date: string;            // YYYY-MM-DD
  time: string;            // HH:mm
  mood: Mood;              // 'very_bad' | 'bad' | 'neutral' | 'good' | 'great'
  text?: string;
  aiSuggestion?: string;
  media?: MediaItem[];     // Array of multiple media items (image/video)
  imageLocalId?: string;   // Legacy
  imageUri?: string;       // Legacy URI
  locationName?: string;
  locationLat?: number;
  locationLon?: number;
  source: 'auto' | 'manual';
  status: 'saved' | 'suggested';
  isHighlight: boolean;
}
```

### Settings (SQLite: `settings` table, key-value)
```typescript
{
  allowPhotos: boolean;
  allowLocation: boolean;
  allowCalendar: boolean;
  allowUsage: boolean;
  autoTrackingEnabled: boolean;
  faceIDEnabled: boolean;
  biometricAvailable?: boolean;
  pinEnabled?: boolean;
  pinSet?: boolean;
  theme: 'system' | 'light' | 'dark';
  accentColor?: 'navy' | 'sage' | 'ocean' | 'lavender' | 'terracotta';
  wallpaperUri?: string;
  language: 'vi' | 'en';
  isPremium: boolean;
  last_auto_scan_time?: string;
  bgFetch_successCount?: number;
  bgFetch_failCount?: number;
  onboardingComplete: boolean;
}
```

### WeeklyReel (SQLite: `weekly_reels` table)
```typescript
{
  weekId: string;       // "2026-W18"
  startDate: string;    // YYYY-MM-DD
  endDate: string;      // YYYY-MM-DD
  dateRange: string;    // "29.04 - 05.05"
  entryCount: number;
  coverTone: string;    // Fallback color
  entryIds: string[];   // IDs of entries in this reel
}
```

---

## 5. Feature Inventory

### ✅ DONE — Fully Implemented

#### Core Entry Flow
- [x] **AddMomentSheet** — 3 modes: photo capture / free-text note / calendar event
- [x] **MomentComposer** — full modal with photo picker, mood selector (5 levels), free-text, AI suggestion. Supports both `create` and `edit` modes.
- [x] **Mood tracking** — 5 levels: very_bad / bad / neutral / good / great with emoji (😢😔😐🙂✨)
- [x] **Photo attachment** — pick from library via `expo-image-picker`
- [x] **Save / Discard suggestion** — suggested entries in Day tab have Save/Discard actions
- [x] **Entry persistence** — SQLite database with migration support
- [x] **Date navigation** — ←→ arrows in Day tab to browse any date
- [x] **Entry Editing** — Modify text, mood, or photo of saved entries.
- [x] **Entry Deletion** — Permanently remove saved entries.

#### Home Screen
- [x] **Bento 2×2 grid** — HighlightTile with photo background + gradient + mood chip
- [x] **Peace Index** — percentage score computed from mood + keyword sentiment analysis
- [x] **Serenity state copy** — 3 message variants (optimal/moderate/mindful)
- [x] **Animated tiles** — `FadeInDown.delay(i*80)` staggered entrance
- [x] **Header collapse on scroll** — fontSize 32→22, paddingTop 28→12 with Animated.interpolate
- [x] **Insights bento tile** — Luminous Insights card with expandable modal
- [x] **Mood Calendar modal** — 7-day grid from Home, tap day → mini preview with 2 entries + "Xem cả ngày"
- [x] **"Xem cả ngày" CTA** — full-width primary button → navigate to Day tab
- [x] **"Lịch cảm xúc" CTA** — full-width secondary button → open MoodCalendar modal

#### Day Screen (Timeline)
- [x] **Timeline view** — vertical timeline with rail dots and connecting lines
- [x] **TimelineCard** — shows time, mood chip (colored), text, photo (16:9 when image present)
- [x] **Photo-first layout** — image on top, meta below
- [x] **Suggested entry CTA** — Save/Discard buttons in suggested cards
- [x] **Saved entry options** — Menu (ellipsis) for Edit and Delete actions. Deletion includes confirmation dialog.
- [x] **Empty state** — journal-outline icon + message

#### Reel Screen
- [x] **Weekly reel cards** — auto-generated, tap to play slideshow
- [x] **"Today Last Year" card** — date-matched entry count from 1 year ago
- [x] **"Play All" button** — slideshow of all saved entries with images/text
- [x] **AnimatedCard entrance** — FadeInDown.springify() per card
- [x] **SlideshowScreen** — full-screen player with:
  - Progress bars per slide
  - 4-second auto-advance
  - Long press to pause
  - Tap to advance
  - Mood chip overlay
  - Location display
  - Entry text overlay

#### Me Screen (Settings)
- [x] **Premium upgrade banner** — Pressable card → PaywallModal when not premium
- [x] **Premium active badge** — gift icon + green border when premium
- [x] **Diary Lock section:**
  - Face ID / fingerprint toggle (disabled if biometricAvailable = false)
  - PIN setup row → navigate to PinSetupScreen
  - "Use PIN to lock" toggle (if PIN is set)
- [x] **Permissions & Data section:**
  - Photos toggle
  - Location toggle
  - Calendar toggle
  - Auto-tracking toggle (with subtitle)
  - Privacy explanation row → PrivacyExplanationDialog
  - Backup row (premium-gated) → BackupDialog
  - Delete all row → confirmation dialog (type "XÓA"/"DELETE")
- [x] **Privacy microcopy strip** — "Data stored locally. No external servers."
- [x] **App & Appearance section:**
  - Notifications toggle → NotifDialog
  - Theme row → ThemePickerDialog (system/light/dark)
  - Accent color row (premium-gated) → AccentColorPicker (5 colors)
  - Custom wallpaper row (premium-gated) → WallpaperPicker
  - Language toggle (Tiếng Việt / English)
- [x] **Privacy/Terms footer links**
- [x] **MoodCalendar in Me** — mood stats section (imported from HomeScreen)

#### Auth / Lock
- [x] **Onboarding** — 4 slides with parallax icon, dot indicators, swipe + button navigation
- [x] **LockScreen** — biometric auth (Face ID/fingerprint) with pulse animation + shake on fail
- [x] **PinSetupScreen** — create/change/disable PIN (4-6 digits, 2-step confirm)
- [x] **PinUnlockScreen** — PIN entry with "Use biometric" fallback
- [x] **AppNavigator gate** — checks `faceIDEnabled || pinEnabled` on launch

#### AI Features
- [x] **GeminiAISuggestionService** — calls `generativelanguage.googleapis.com` with 3s timeout + fallback
- [x] **MockAISuggestionService** — uses i18n templates based on mode/mood/location
- [x] **buildAIPrompt()** — structured prompt: time + location + photo labels, Vietnamese output, <40 words
- [x] **AI suggestion card in Composer** — loading spinner → suggestion text → "Use" / "Dismiss"

#### Auto-Tracker
- [x] **`runAutoTrackerOnce()`** — foreground scan: reads last 24h photos from MediaLibrary
- [x] **Signal clustering** — groups photos within 60-minute windows
- [x] **De-duplication** — skips clusters already covered by existing entries
- [x] **Suggested entry creation** — inserts `status: 'suggested'` entries to SQLite
- [x] **Background fetch registration** — `expo-background-fetch` + `expo-task-manager`
- [x] **Catch-up logic** — tracks `last_auto_scan_time`, only scans new photos
- [x] **Background fetch stats** — logs success/fail counts to settings

#### Privacy / Security
- [x] **PrivacyExplanationDialog** — 3-section modal: On-Device Storage / Secure AI / No External Servers
- [x] **PIN stored in SecureStore** — `expo-secure-store`, NOT in SQLite settings
- [x] **No raw photo/text upload** — AI only receives anonymous metadata labels
- [x] **Progressive permissions** — permission explanation modal before OS dialog

#### Monetization
- [x] **PaywallModal** — 3 plans (monthly/yearly/lifetime), feature list, plan selection
- [x] **SubscriptionService** — `SimulatedPurchaseService` (web/dev) + `NativePurchaseService` (RevenueCat-ready stub)
- [x] **isPremium gating** — Backup, AccentColor, Wallpaper rows gated behind premium check
- [x] **Restore purchases** — `SubscriptionService.restorePurchases()` flow

#### Backup
- [x] **`exportBackup()`** — XOR+Base64 obfuscated `.dailylog` bundle → Share sheet (iOS/Android)
- [x] **`importBackup()`** — DocumentPicker → decode → restore entries + settings + reels
- [x] **Web fallback** — `exportBackupWeb()` / `importBackupWeb()` for browser JSON download/upload
- [x] **BackupDialog in MeScreen** — Export / Import buttons with loading state

#### Internationalization
- [x] **Full vi/en parity** — `translations.ts` with 300+ keys covering all screens
- [x] **`useTranslation()` hook** — reads from Zustand `settings.language`
- [x] **Dynamic locale** — `Intl.DateTimeFormat` for date formatting
- [x] **Language toggle** — in MeScreen → instant switch, persisted to SQLite

#### Infrastructure
- [x] **SQLite schema migrations** — `schema_version` table, versioned migration runner
- [x] **Seed entries** — demo data on first run (3 entries), auto-deleted when user creates first real entry
- [x] **Legacy ID cleanup** — removes old demo entries with IDs '1'-'5'
- [x] **PlusJakartaSans font** — loaded via `expo-font` in App.tsx
- [x] **AnimatedCard component** — shared across Home/Day/Reel with `fadeInDown` / `scaleIn` variants
- [x] **Custom BottomTabs** — center + button that opens AddMomentSheet
- [x] **Zustand persistence** — settings persisted to SQLite via `saveSetting()`
- [x] **TypeScript strict** — `tsconfig.json` with strict mode, `tsc --noEmit` passing clean

---

### ⏳ NOT DONE / Incomplete

#### P0 — Critical Gaps
| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 1 | **Real IAP integration** | ⏳ Stub only | `NativePurchaseService` delegates to `SimulatedPurchaseService`. RevenueCat commented out as TODO. |
| 2 | **Location-based auto-suggestions** | ⚠️ Partial | `autoTracker.ts` has location collection code but signal clustering is photo-only in main path. Location signals collected but not yet generating standalone location-based entries. |
| 3 | **Calendar-based auto-suggestions** | ⏳ Not implemented | Auto-tracker does NOT scan calendar events. Calendar only works when user manually taps "Add from Calendar." |
| 4 | **Background fetch iOS reliability** | ⚠️ Known issue | `expo-background-fetch` unreliable on iOS due to OS throttling. Foreground catch-up works but background doesn't fire consistently. |
| 5 | **"Thống kê cảm xúc" in Me tab** | ⏳ Not done | TODO_UI item 5.7: Replace MoodCalendar duplicate label with "Thống kê cảm xúc" — marked incomplete in TODO file. |

#### P1 — Should Have
| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 6 | **30-day heatmap calendar** | ⚠️ UI exists, gating partial | TODO 4.4 claims done but implementation only shows 7 days. Premium gate for >7 days not properly implemented. |
| 7 | **Media in backup** | ⚠️ Partial | `mediaIndex` is always `{}` — backup includes entry metadata but NOT image files. Image URIs are local paths that break after reinstall. |
| 8 | **Real Gemini API key config** | ⏳ Not wired | `aiService.ts` reads `process.env.GEMINI_API_KEY` but no `.env` setup or Expo config plugin. Falls back to mock in production. |
| 9 | **Mood-based accent colors** | ⏳ Not done | Accent color picker in MeScreen shows 5 colors but does not dynamically change app colors. `accentColor` stored but `palette.ts` is static. |
| 10 | **Dark mode** | ⚠️ Theme setting exists | `theme` setting stored but no dark mode stylesheet applied. All screens use light palette only. |
| 11 | **Custom wallpaper display** | ⚠️ Partial | `wallpaperUri` can be set via ImagePicker in MeScreen but not actually rendered as app background anywhere. |
| 12 | **Weekly reel generation** | ⚠️ Partial | Reel data comes from Zustand `reels` array but `getAllReels()` returns pre-populated data only — no automatic generation logic that creates new reels from entries. |
| 13 | **PinEnabledState strings in MeScreen** | ⚠️ Hardcoded | Line 251 in MeScreen still has hardcoded Vietnamese `'Đang bật PIN'` / `'Đã tạo PIN, đang tắt'` instead of using `t.settings.pinActive` / `t.settings.pinSetupDeactive`. |
| 14 | **PermissionModal "Allow" button** | ⚠️ Partial | Line 332 in TabNavigator still has `t.language === 'en' ? 'Allow' : 'Cho phép'` — should use `t.common.allow`. |
| 15 | **Biometric availability check** | ⚠️ Partial | `biometricAvailable` in settings is never set at startup. The Face ID toggle is disabled but the check relies on initial `undefined` being falsy. |
| 16 | **On-this-day entries (year ago)** | ⚠️ UI-only | ReelScreen shows count from year-ago date but doesn't fetch/display the actual entries unless user navigates to Day tab. |

#### P2 — Nice to Have / Future
| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 17 | **Push notification scheduling** | ⚠️ Service exists | `notifications.ts` has `scheduleDailyReminder()` and `scheduleWeeklyReminder()` but the "Enable/Disable" dialog in MeScreen needs testing on device. |
| 18 | **Mood trend analytics** | ⏳ Not done | No chart/graph showing mood over time. Peace Index is computed but not visualized over weeks. |
| 19 | **Search / filter** | ⏳ Not done | No search across entries. |
| 20 | **Multiple photos per entry** | ⏳ Not done | Entry type supports `imageUri` (single). PaywallModal advertises "Unlimited Photos" but this feature doesn't exist yet. |
| 21 | **Video support** | ⏳ Not done | ReelScreen/SlideshowScreen only handles images, no video playback. |
| 22 | **iCloud/Google Drive backup** | ⏳ Not done | Backup uses Share sheet only. True cloud sync not implemented. |
| 23 | **RevenueCat server receipt validation** | ⏳ Not done | Purchase just sets `isPremium: true` locally. No server-side validation. |
| 24 | **Haptic feedback** | ⏳ Not done | No `expo-haptics` integration. |
| 25 | **Widget support** | ⏳ Not done | No home screen widget. |
| 26 | **"Memories" / Year-in-review** | ⏳ Not done | Beyond "Today Last Year" card. |
| 27 | **Onboarding permission requests** | ⚠️ Partial | Slide 4 shows permission descriptions but does NOT actually request permissions during onboarding (by design per TODO 3.1 — progressive). |
| 28 | **Web platform** | ⚠️ Partial | App runs on web but SQLite is not supported (`Platform.OS === 'web'` returns mock data). Web uses localStorage for settings only. |

---

## 6. i18n Coverage

**File:** `src/i18n/translations.ts` (~740 lines)  
**Hook:** `useTranslation()` reads `settings.language` from Zustand

### Sections with full vi/en parity:
- `common` — save/discard/cancel/close/delete/confirm/loading/allow
- `tabs` — home/day/reel/me
- `mood` — all 5 mood levels
- `home` — all home screen keys including bento grid
- `day` — all day screen keys
- `reel` — all reel screen keys + playAll/savedMomentsCount/paused
- `addMoment` — 3 mode titles/subtitles
- `composer` — all composer keys
- `settings` — all 60+ settings keys including PIN, premium, paywall, notifications
- `auth` — unlock prompt/cancel
- `ai` — AI suggestion templates (5 mood variants)
- `onboarding` — all 4 slides + getStarted
- `calendar` — picker + event defaults
- `permissions` — biometric + photo/location/calendar explanations
- `pin` — all PIN setup/unlock strings
- `location` — web unsupported message

### Remaining inline ternaries (not yet moved to translations):
- `TabNavigator.tsx:332` — `'Allow' : 'Cho phép'` (should use `t.common.allow`)
- `MeScreen.tsx:251` — PIN status strings (partially done, old strings remain)
- `PaywallModal.tsx` — some alert strings use inline ternary
- `subscription.ts:127` — Vietnamese error string hardcoded

---

## 7. Database Schema

**File:** `src/memory/database.ts` (309 lines)  
**Engine:** expo-sqlite (not available on web)

### Tables:
1. `entries` — all diary entries (see Entry type above)
2. `settings` — key-value store for all settings
3. `weekly_reels` — reel metadata
4. `schema_version` — migration tracking

### Migration system:
- `MIGRATIONS` array of SQL strings
- `initTables()` runs on first DB open
- Checks `schema_version` to apply only new migrations
- Currently 1 migration (initial schema)

### Web fallback:
- Uses localStorage for settings (read/write)
- Entries not persisted on web (in-memory only)

---

## 8. Auto-Tracking Pipeline

**File:** `src/skills/autoTracker.ts` (484 lines)

```text
runAutoTrackerOnce()
    │
    ├── Get photo permission status
    ├── Query MediaLibrary: photos since last scan (or last 24h)
    ├── Collect location signals (if permission granted)
    │
    ├── Signal clustering:
    │   └── Group signals within 60-minute windows (Cluster)
    │
    ├── For each cluster:
    │   ├── Check if entry already exists for that time window
    │   ├── If not: call aiService.generateSuggestion()
    │   ├── Create Entry { status: 'suggested', source: 'auto' }
    │   └── insertEntry() to SQLite
    │
    ├── Update last_auto_scan_time in settings
    └── Return { newEntries, skipped }

registerAutoTracker() → BackgroundFetch.registerTaskAsync(TASK_NAME, { minimumInterval: 900 })
unregisterAutoTracker() → BackgroundFetch.unregisterTaskAsync(TASK_NAME)
getAutoTrackerStatus() → BackgroundFetch.getStatusAsync()
```

---

## 9. AI Service

**File:** `src/skills/aiService.ts` (167 lines)

```text
GeminiAISuggestionService (default, singleton)
    │
    ├── Reads GEMINI_API_KEY from process.env
    ├── If no key → falls back to MockAISuggestionService
    ├── POST to generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash
    ├── Race against 3-second timeout
    └── On error/timeout → falls back to MockAISuggestionService

MockAISuggestionService
    ├── Reads current language from t() function
    ├── calendarText → "{event} {calendarSuffix}"
    ├── photo + location → "Một khoảnh khắc ở {location}..."
    ├── photo → photoGeneric string
    └── note → noteGeneric string

buildAIPrompt(input) → Vietnamese prompt string:
    "Bạn là trợ lý nhật ký riêng tư, chỉ mô tả khoảnh khắc, không phân tích tâm lý."
    + time/period/dayOfWeek
    + location
    + photo labels
    + "Viết 1-2 câu tiếng Việt ngắn gọn (tổng dưới 40 từ)"
```

**⚠️ Known issue:** `buildAIPrompt()` always writes in Vietnamese regardless of app language setting.

---

## 10. Backup System

**File:** `src/skills/backup.ts` (319 lines)

```text
exportBackup() [iOS/Android]:
    entries + reels + settings → JSON bundle
    → XOR+Base64 obfuscation (.dailylog extension)
    → Write to FileSystem.cacheDirectory
    → Share via system share-sheet

importBackup() [iOS/Android]:
    DocumentPicker → read file
    → Deobfuscate + parse JSON
    → Validate BACKUP_MAGIC header
    → deleteAllEntries()
    → Restore entries + reels + safe settings

exportBackupWeb() [Web]:
    → JSON blob download via browser

importBackupWeb() [Web]:
    → File input → parse JSON → restore

⚠️ NOT INCLUDED in backup:
    - Image files (URIs only, will break after reinstall)
    - PIN hash (in SecureStore, not SQLite)
    - isPremium status (not restored — intentional)
```

---

## 11. Subscription / IAP

**File:** `src/services/subscription.ts` (271 lines)

```text
Plans:
    lifetime  → 199,000 VND (~$9.99) — "Best Value"
    yearly    → 99,000 VND/year (~$4.99) — "Save 55%"
    monthly   → 19,000 VND/month (~$0.99)

SimulatedPurchaseService (web/dev):
    - purchase() → delays 1.5s → 5% random failure → localStorage.setItem('dl_premium_entitlement', 'true')
    - restorePurchases() → checks localStorage
    - checkEntitlement() → reads localStorage

NativePurchaseService (iOS/Android):
    - All methods delegate to SimulatedPurchaseService
    - TODO comments show how to wire RevenueCat SDK

SubscriptionService.shared():
    - web → SimulatedPurchaseService
    - native → NativePurchaseService
```

---

## 12. TODO Items Summary (from docs/TODO_UI.md)

### Remaining TODO item:
- **5.7** `[UI]` "Thống kê cảm xúc" label in Me tab — `[]` (not marked complete)  
  - Change calendar section label from duplicate "Lịch cảm xúc" → "Thống kê cảm xúc"
  - Different description text
  - Tap → MoodCalendar modal

---

## 13. Recommended Next Steps (for AI analysis)

### Immediate Fixes (bugs):
1. Fix `biometricAvailable` initialization — should call `LocalAuthentication.hasHardwareAsync()` on app start
2. Fix `PaywallModal` referencing non-existent `paywallFeature5Title/Desc` in translations
3. Complete TODO 5.7 — "Thống kê cảm xúc" label in MeScreen
4. Fix remaining inline ternaries (`t.language === 'en'` in TabNavigator)
5. Wire `t.settings.pinActive` / `t.settings.pinSetupDeactive` in MeScreen line 251

### Feature Completion:
6. Implement weekly reel auto-generation from entries (currently manual/empty)
7. Apply accent color dynamically to palette (requires runtime theme system)
8. Apply dark mode (dark stylesheet variant)
9. Render custom wallpaper as app background
10. Wire `GEMINI_API_KEY` via Expo config (app.config.js extra)
11. Calendar auto-tracking in autoTracker.ts (currently missing)
12. Image files in backup (copy to document dir, include base64 in bundle)

### Production Readiness:
13. Integrate RevenueCat for real IAP
14. Server-side premium validation
15. Privacy Policy + Terms of Use actual URLs
16. App Store metadata (screenshots, description)
17. Push notification deep-link handling
18. Crashlytics / error monitoring
