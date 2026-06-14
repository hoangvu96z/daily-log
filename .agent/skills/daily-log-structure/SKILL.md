---
name: "Daily Log Project Structure"
description: "Information Architecture, File Structure, and Data Model for the Auto Diary application."
tags: ["react-native", "expo", "architecture", "structure", "data-model", "report"]
---

# Daily Log — Comprehensive Codebase Blueprint
> Updated: 2026-06-14 · Powered by CodeGraph live indexing
> Purpose: Single source of truth for BAs, AI Agents, and Developers

---

## App Interface Preview
![Home Screen](/Users/hoangvu96z/.gemini/antigravity-ide/brain/1a99c314-4408-4638-af84-425bc83b7789/home_screen.png)

---

## 1. Project Overview

**Daily Log** là ứng dụng nhật ký tự động, local-first, hướng quyền riêng tư, xây dựng bằng **React Native + Expo SDK 51**.

**Core Positioning:** "Nhật ký tự động, riêng tư" — App chạy âm thầm, tự thu thập tín hiệu từ thiết bị (ảnh, vị trí, lịch), gợi ý entry cho user mà không cần upload bất kỳ dữ liệu nào lên cloud.

**Target User:** Gen Z Việt Nam, hướng nội, muốn lưu giữ kỷ niệm cá nhân mà không cần mạng xã hội.

### Tech Stack đầy đủ
| Layer | Package | Mục đích |
|-------|---------|----------|
| Framework | `react-native` 0.74.5 + `expo` SDK 51 | Cross-platform iOS/Android/Web |
| Language | TypeScript (strict mode) | Type safety toàn bộ |
| Navigation | `@react-navigation/native` 6 + `native-stack` + `bottom-tabs` | Stack + Tab routing |
| State | `zustand` 5 | Global store (entries, settings, reels, UI) |
| Database | `expo-sqlite` | SQLite trên thiết bị, không cloud |
| Secure Storage | `expo-secure-store` | Chỉ lưu PIN hash, không lưu SQLite |
| Font | `@expo-google-fonts/plus-jakarta-sans` | Typography thống nhất |
| Animations | `react-native-reanimated` 3 + `Animated` API | Slideshow, transitions |
| Background | `expo-background-fetch` + `expo-task-manager` | Auto-tracking mỗi 15 phút |
| Media | `expo-image-picker` + `expo-media-library` | Chọn/đọc ảnh từ gallery |
| Location | `expo-location` | Foreground location cho entries |
| Calendar | `expo-calendar` | Đọc sự kiện thiết bị |
| Biometrics | `expo-local-authentication` | Face ID / Fingerprint |
| Icons | `@expo/vector-icons` (Ionicons + MaterialCommunityIcons) | UI icons |
| Bottom Sheet | `@gorhom/bottom-sheet` | FAB "Add Moment" sheet |
| Backup | `expo-document-picker` + `expo-file-system` + `expo-sharing` | Export/import .dailylog |
| Notifications | `expo-notifications` | Nhắc nhở hàng ngày / hàng tuần |
| Video | `expo-av` | Phát video trong DetailScreen |
| IAP | `react-native-purchases` (RevenueCat ready) | Mua Premium |
| i18n | Custom hook `useTranslation()` | vi/en (bi-directional) |
| Code Intelligence | `@colbymchenry/codegraph` | Codebase knowledge graph (dev tool) |

---

## 2. Directory Structure Chi Tiết

```text
/
├── App.tsx                     # Root: khởi động font, hydrate store, render AppNavigator
├── index.js                    # Entry point (expo-router)
├── app.json                    # Expo config (name, bundleId, permissions)
├── tsconfig.json               # TypeScript strict mode
├── package.json                # Dependencies + codegraph scripts
│
├── scripts/
│   ├── screenshot_app.cjs      # Puppeteer: chụp màn hình web preview
│   ├── smoke_test.js           # Smoke test
│   └── ui_test.js              # UI test
│
└── src/
    ├── components/             # Reusable UI components (stateless/minimal state)
    │   ├── settings/           # Dialog components cho SettingsScreen
    │   │   ├── AccentColorDialog.tsx   # Picker 6 màu accent
    │   │   ├── BackupDialog.tsx        # Export/Import .dailylog
    │   │   ├── DeleteJournalDialog.tsx # Xoá toàn bộ (yêu cầu gõ "XÓA")
    │   │   ├── NotificationsDialog.tsx # Bật/tắt nhắc nhở
    │   │   ├── PrivacyDialog.tsx       # Giải thích 3 điều khoản quyền riêng tư
    │   │   ├── SettingsUI.tsx          # SettingsCard + SettingsRow + ToggleRow atoms
    │   │   ├── ThemeDialog.tsx         # Chọn Light/Dark/System
    │   │   └── WallpaperDialog.tsx     # Chọn ảnh nền app
    │   │
    │   ├── AddMomentSheet.tsx          # Bottom sheet: 3 mode chọn (Photo/Note/Calendar)
    │   ├── AnimatedCard.tsx            # Wrapper fade-in/scale-in dùng chung
    │   ├── AppText.tsx                 # Text component với Plus Jakarta Sans
    │   ├── BottomTabs.tsx              # Custom tab bar với nút + ở giữa
    │   ├── CalendarEventPicker.tsx     # Modal liệt kê sự kiện lịch hôm nay
    │   ├── DailyInsightDialog.tsx      # Modal "Insights" từ entries
    │   ├── HighlightBar.tsx            # Bar hiển thị các HighlightCollection
    │   ├── HighlightPickerSheet.tsx    # Sheet thêm entry vào highlight
    │   ├── HighlightTile.tsx           # Tile 2×2 bento grid (HomeScreen)
    │   ├── ImagePlaceholder.tsx        # Placeholder khi ảnh chưa load
    │   ├── ImageViewer.tsx             # Zoomable full-screen image viewer (native)
    │   ├── ImageViewer.web.tsx         # Web fallback cho ImageViewer
    │   ├── LocationPicker.tsx          # Modal chọn vị trí thủ công
    │   ├── MediaCarousel.tsx           # Carousel nhiều ảnh/video trong 1 entry
    │   ├── MomentComposer.tsx          # Full-screen modal tạo/sửa entry
    │   ├── MoodCalendar.tsx            # Calendar hiển thị mood 7/30 ngày
    │   ├── MoodTrendChart.tsx          # Biểu đồ xu hướng mood (react-native-chart-kit)
    │   ├── PaywallModal.tsx            # Màn hình upgrade Premium
    │   ├── PhotoGrid.tsx               # Grid ảnh trong DetailScreen
    │   ├── ScreenHeader.tsx            # Header dùng chung (title + subtitle)
    │   └── TimelineCard.tsx            # Card entry trong DayScreen timeline
    │
    ├── data/
    │   ├── mockData.ts                 # defaultSettings, moodEmoji map, moodLabels
    │   └── seedEntries.ts              # 3 demo entries cho lần chạy đầu tiên
    │
    ├── i18n/
    │   ├── translations.ts             # useTranslation() hook + merge vi/en
    │   ├── vi.ts                       # Toàn bộ string tiếng Việt (~350+ keys)
    │   └── en.ts                       # Toàn bộ string tiếng Anh (~350+ keys)
    │
    ├── memory/                         # LAYER DUY NHẤT được phép access storage
    │   ├── database.ts                 # SQLite schema, migration, CRUD (getAllEntries, insertEntry, ...)
    │   ├── secureStore.ts              # PIN hash: savePinCode, verifyPin, clearPin, hasPinCode
    │   └── store.ts                    # Zustand store: toàn bộ state + actions
    │
    ├── navigation/
    │   ├── AppNavigator.tsx            # Root: gate Onboarding / Lock / Tabs
    │   └── TabNavigator.tsx            # 4 tabs + mount global overlays
    │
    ├── screens/                        # 12 màn hình
    │   ├── HomeScreen.tsx              # Bento grid + Peace Index + Insights
    │   ├── DayScreen.tsx               # Timeline entries theo ngày
    │   ├── ReelScreen.tsx              # Weekly reels + Today Last Year
    │   ├── MeScreen.tsx                # Profile + nút vào Settings + upgrade
    │   ├── SettingsScreen.tsx          # Toàn bộ cài đặt chi tiết
    │   ├── DetailScreen.tsx            # Full-screen 1 entry (photo + text + video)
    │   ├── SearchScreen.tsx            # Tìm kiếm entries
    │   ├── SlideshowScreen.tsx         # TikTok-style slideshow player
    │   ├── OnboardingScreen.tsx        # 4-slide welcome carousel
    │   ├── LockScreen.tsx              # Biometric auth gate
    │   ├── PinSetupScreen.tsx          # Setup/đổi/tắt PIN
    │   └── PinUnlockScreen.tsx         # Nhập PIN để mở khoá
    │
    ├── services/
    │   ├── imagePicker.ts              # pickMomentMedia(): wrapper ImagePicker + MediaLibrary
    │   └── subscription.ts             # IAP layer: SimulatedPurchaseService + NativePurchaseService
    │
    ├── skills/                         # Background logic, KHÔNG import UI components
    │   ├── aiService.ts                # GeminiAISuggestionService (real + mock fallback)
    │   ├── autoTracker.ts              # runAutoTrackerOnce() + background fetch registration
    │   ├── backup.ts                   # exportBackup / importBackup (XOR+Base64 .dailylog)
    │   ├── calendar.ts                 # requestCalendarAccess + getTodayCalendarEvents
    │   ├── notifications.ts            # scheduleDailyReminder / scheduleWeeklyReminder
    │   ├── permissions.ts              # requestPhotoAccess + requestLocationAccess
    │   └── reels.ts                    # generateWeeklyReels(): thuật toán tạo reel từ entries
    │
    ├── theme/
    │   └── palette.ts                  # lightPalette + darkPalette + accentColors + Proxy export
    │
    ├── utils/
    │   └── dateUtils.ts                # getLocalDateString(), formatDateTitle(), shiftDate()
    │
    ├── styles.ts                       # StyleSheet toàn cục (~1200 dòng, single source of truth)
    └── types.ts                        # Toàn bộ TypeScript types: Entry, Settings, WeeklyReel, ...
```

---

## 3. Navigation Flow Chi Tiết

```text
App Launch → App.tsx
    │  loadAsync(fonts)
    │  useJournalStore.initStore()   ← load SQLite + seed data + generate reels
    ▼
AppNavigator (src/navigation/AppNavigator.tsx)
    │
    │  [Chờ hydrated === true]
    │
    ├── [onboardingComplete === false]
    │       └── <OnboardingScreen>
    │               ├── Slide 1: Welcome + icon + tagline
    │               ├── Slide 2: Auto-journal features
    │               ├── Slide 3: Privacy guarantee
    │               ├── Slide 4: Permission preview (không request thật)
    │               └── "Bắt đầu" → setOnboardingComplete(true) → TabNavigator
    │
    ├── [faceIDEnabled === true && !unlocked]
    │       └── <LockScreen>
    │               ├── Pulse animation + biometric prompt
    │               ├── Success → setUnlocked(true) → TabNavigator
    │               ├── Fail 3× → shake animation + lock 30s
    │               └── "Dùng mã PIN" → <PinUnlockScreen>
    │                       └── Success → setUnlocked(true) → TabNavigator
    │
    ├── [pinEnabled === true && !faceIDEnabled && !unlocked]
    │       └── <PinUnlockScreen>
    │               └── Success → setUnlocked(true) → TabNavigator
    │
    └── [Normal launch / unlocked] → Stack.Navigator
            ├── Screen "Tabs"     → <TabNavigator>   (default)
            ├── Screen "PinSetup" → <PinSetupScreen>
            ├── Screen "Detail"   → <DetailScreen>   (params: entryId)
            ├── Screen "Search"   → <SearchScreen>
            └── Screen "Settings" → <SettingsScreen>

TabNavigator (src/navigation/TabNavigator.tsx)
    │  Mount global overlays (luôn available)
    │
    ├── Tab "Home" → <HomeScreen>
    │       Props: entries, selectedDate, isPremium
    │       ├── Bento 2×2 grid (HighlightTile × 4)
    │       │       └── onPress → setSelectedDate(date) + navigate("Tabs", tab: "day")
    │       ├── Peace Index mini tile (tile 4 của bento)
    │       ├── "Xem cả ngày" button → navigate day tab
    │       ├── "Lịch cảm xúc" button → <MoodCalendar> modal
    │       │       ├── Premium: 30-day grid
    │       │       └── Free: 7-day grid + upgrade prompt
    │       └── "Daily Insights" hint card → <DailyInsightDialog> modal
    │
    ├── Tab "Ngày" → <DayScreen>
    │       Props: entries, selectedDate, onChangeDate, onSaveSuggestion, onDiscardSuggestion
    │       ├── Header: formatted date + entry count
    │       ├── ← → date navigation (shiftDate ±1 ngày)
    │       ├── Timeline: entries.filter(date === selectedDate)
    │       │       ├── TimelineCard [status='suggested'] → Save / Discard buttons
    │       │       └── TimelineCard [status='saved'] → onPress Detail | Edit | Delete | AddToHighlight
    │       ├── Empty state: journal-outline icon
    │       ├── [edit mode] inline MomentComposer modal
    │       └── HighlightPickerSheet (thêm vào highlight collection)
    │
    ├── Tab "Reel" → <ReelScreen>
    │       Props: entries, reels, onOpenDate, onOpenDay
    │       ├── "Hôm nay năm trước" card
    │       │       └── filter: entries where date ends with MM-DD && year < current
    │       ├── "Play All" button (chỉ hiện nếu savedCount > 0)
    │       │       └── openSlideshow(all saved entries with content)
    │       ├── Section "Tuần của bạn": reels[] từ generateWeeklyReels()
    │       │       └── WeeklyReel card → openReelSlideshow(reel)
    │       │               └── map entryIds → entries → <SlideshowScreen>
    │       └── <SlideshowScreen> embedded (Modal)
    │               ├── Progress bars per slide (tự động 4 giây)
    │               ├── Long press → pause
    │               ├── Tap → next slide
    │               ├── Mood chip overlay
    │               ├── Location text overlay
    │               └── Entry text overlay
    │
    └── Tab "Me" → <MeScreen>
            Props: settings, onNavigateSettings, onShowPaywall
            ├── Premium banner (nếu chưa premium) → setPaywallVisible(true)
            ├── Premium badge (nếu đã premium: gift icon + green border)
            ├── Nút Settings (gear icon) → navigation.navigate("Settings")
            └── HighlightBar: danh sách highlight collections

Global Overlays (mounted trong TabNavigator):
├── <AddMomentSheet>  ← triggered bởi nút + ở BottomTabs
│       ├── "Chụp khoảnh khắc" → setComposerDraft({mode:'photo'}) + setComposerVisible(true)
│       ├── "Thêm ghi chú nhanh" → setComposerDraft({mode:'note'}) + setComposerVisible(true)
│       └── "Thêm mốc từ lịch" → getTodayCalendarEvents() → setCalendarPickerVisible(true)
│
├── <CalendarEventPicker>
│       ├── Chọn event → setComposerDraft({mode:'calendar', calendarText: event.title})
│       └── "Tự nhập" → blank calendar draft
│
├── <MomentComposer> [mode='create']
│       ├── Media picker (tối đa 10 ảnh/video, horizontal scroll)
│       ├── Date/Time picker (DateTimePicker modal)
│       ├── Location picker (LocationPicker modal / auto-detect)
│       ├── Mood selector: 5 options (MaterialCommunityIcons)
│       ├── Note TextInput (multiline)
│       ├── AI Suggestion card:
│       │       ├── Loading: ActivityIndicator
│       │       ├── Success: suggestion text + "Dùng" / "Bỏ qua"
│       │       └── Error: fallback text + "Dùng gợi ý dự phòng"
│       └── "Lưu" → addEntry(entry) → dismiss
│
├── <PermissionExplanationModal>
│       ├── type: 'photo' | 'location' | 'calendar'
│       ├── "Cho phép" → requestPermission() → OS dialog
│       └── "Hủy" → dismiss
│
└── <PaywallModal>
        ├── Feature list (6 features)
        ├── Plan selection: Monthly (19k) / Yearly (99k) / Lifetime (199k)
        ├── "Nâng cấp ngay" → SubscriptionService.purchase(planId)
        └── "Khôi phục mua hàng" → SubscriptionService.restorePurchases()
```

---

## 4. State Management (Zustand Store)

**File:** `src/memory/store.ts`
**Hook:** `useJournalStore()`

### Store State Schema
```typescript
interface JournalState {
  // Lifecycle
  hydrated: boolean;                    // false khi đang load từ SQLite
  onboardingComplete: boolean;

  // Core Data
  entries: Entry[];                     // Tất cả entries (saved + suggested)
  reels: WeeklyReel[];                  // Weekly reels (auto-generated)
  highlights: HighlightCollection[];    // User-curated highlight collections
  settings: Settings;

  // UI State
  activeTab: TabKey;                    // 'home' | 'day' | 'reel' | 'me'
  selectedDate: string;                 // YYYY-MM-DD đang xem ở DayScreen
  sheetVisible: boolean;                // AddMomentSheet open/close
  composerVisible: boolean;             // MomentComposer open/close

  // Actions — Entries
  initStore(): Promise<void>;
  addEntry(entry: Entry): Promise<void>;
  updateEntry(id, patch): Promise<void>;
  deleteEntry(id): Promise<void>;
  saveSuggestion(id): Promise<void>;    // Đổi status → 'saved', isHighlight = true
  discardSuggestion(id): Promise<void>; // Xoá khỏi DB
  resetEntries(): Promise<void>;
  restoreFromBackup(entries, settings, reels): Promise<void>;

  // Actions — Settings
  updateSettings(key, value): Promise<void>; // saveSetting() + set state
  setSettings(settings): void;

  // Actions — Highlights
  addHighlight(highlight): Promise<void>;
  updateHighlight(id, patch): Promise<void>;
  removeHighlight(id): Promise<void>;

  // Actions — UI
  setActiveTab(tab): void;
  setSelectedDate(date): void;
  setSheetVisible(visible): void;
  setComposerVisible(visible): void;
  setOnboardingComplete(value): Promise<void>;
}
```

### initStore() Boot Sequence
```text
initStore() [chạy 1 lần trong App.tsx useEffect]
    │
    ├── Promise.all([
    │       getAllEntries(),       ← SQLite
    │       loadSettings(),        ← SQLite key-value
    │       getAllReels(),          ← SQLite
    │       hasPinCode(),          ← expo-secure-store
    │       getAllHighlights(),     ← SQLite
    │   ])
    │
    ├── Lọc bỏ legacy demo entries (id: '1'-'5')
    │
    ├── Nếu entries rỗng: inject seedEntries (3 demo entries)
    │
    ├── Inject test entry "On This Day" (1 năm trước) — dev only
    │
    ├── settings.isPremium = true  ← HARDCODED FOR TESTING
    │
    ├── set({ entries, settings, reels, highlights, hydrated: true })
    │
    └── generateWeeklyReels(entries) → set({ reels })  ← chạy background
```

---

## 5. Database Schema Chi Tiết

**Engine:** `expo-sqlite` (native) / `localStorage` (web fallback)
**File:** `src/memory/database.ts`

### Table: `entries`
| Column | Type | Notes |
|--------|------|-------|
| `id` | TEXT PRIMARY KEY | UUID string |
| `date` | TEXT | YYYY-MM-DD |
| `time` | TEXT | HH:mm |
| `mood` | TEXT | 'very_bad'\|'bad'\|'neutral'\|'good'\|'great' |
| `text` | TEXT | Optional diary text |
| `aiSuggestion` | TEXT | AI-generated suggestion text |
| `media` | TEXT | JSON array of MediaItem[] |
| `imageLocalId` | TEXT | Legacy: local photo identifier |
| `imageUri` | TEXT | Legacy: direct URI |
| `locationName` | TEXT | Human-readable location |
| `locationLat` | REAL | Latitude |
| `locationLon` | REAL | Longitude |
| `source` | TEXT | 'auto'\|'manual' |
| `status` | TEXT | 'saved'\|'suggested' |
| `isHighlight` | INTEGER | 0 hoặc 1 |

### Table: `settings` (key-value)
| Key | Type | Default | Mô tả |
|-----|------|---------|-------|
| `allowPhotos` | boolean | false | Quyền ảnh |
| `allowLocation` | boolean | false | Quyền vị trí |
| `allowCalendar` | boolean | false | Quyền lịch |
| `allowUsage` | boolean | false | Quyền usage stats |
| `autoTrackingEnabled` | boolean | true | Bật auto-tracker |
| `faceIDEnabled` | boolean | false | Khoá Face ID |
| `biometricAvailable` | boolean | undefined | ⚠️ Chưa set khi boot |
| `pinEnabled` | boolean | false | Khoá PIN |
| `pinSet` | boolean | false | Đã tạo PIN chưa |
| `theme` | ThemeMode | 'system' | 'system'\|'light'\|'dark' |
| `accentColor` | AccentColor | undefined | 6 màu: navy/sage/ocean/lavender/terracotta/rosepink |
| `wallpaperUri` | string | undefined | URI ảnh nền app |
| `language` | string | 'vi' | 'vi'\|'en' |
| `isPremium` | boolean | false | Premium status |
| `last_auto_scan_time` | string | undefined | ISO timestamp lần scan cuối |
| `bgFetch_successCount` | number | 0 | Đếm background fetch OK |
| `bgFetch_failCount` | number | 0 | Đếm background fetch lỗi |

### Table: `weekly_reels`
| Column | Type | Notes |
|--------|------|-------|
| `weekId` | TEXT PRIMARY KEY | "2026-W24" |
| `startDate` | TEXT | YYYY-MM-DD |
| `endDate` | TEXT | YYYY-MM-DD |
| `dateRange` | TEXT | "09.06 - 15.06" |
| `entryCount` | INTEGER | Số entries trong tuần |
| `coverImageId` | TEXT | URI ảnh bìa (best mood entry) |
| `coverTone` | TEXT | Hex color fallback |
| `entryIds` | TEXT | JSON array of entry IDs |

### Table: `highlights`
| Column | Type | Notes |
|--------|------|-------|
| `id` | TEXT PRIMARY KEY | UUID |
| `title` | TEXT | Tên collection |
| `coverImageUri` | TEXT | URI ảnh bìa |
| `entryIds` | TEXT | JSON array of entry IDs |
| `createdAt` | TEXT | ISO timestamp |

### Table: `schema_version`
| Column | Type | Notes |
|--------|------|-------|
| `version` | INTEGER | Số phiên bản migration hiện tại |

### Migration System
```typescript
const MIGRATIONS = [
  `CREATE TABLE IF NOT EXISTS entries (...)`,  // v1
  `ALTER TABLE entries ADD COLUMN media TEXT`, // v2 (nếu thêm sau)
];
// initTables() chạy khi mở DB lần đầu, so sánh schema_version với MIGRATIONS.length
```

### Web Fallback
```
Platform.OS === 'web'
    ├── entries     → localStorage key: 'ad_entries' (JSON)
    ├── settings    → localStorage key: 'ad_settings' (JSON)
    ├── reels       → localStorage key: 'ad_reels' (JSON)
    └── highlights  → localStorage key: 'ad_highlights' (JSON)
```

---

## 6. Màn Hình Chi Tiết

### 6.1 HomeScreen (`src/screens/HomeScreen.tsx`)
**Props:** `{ entries, selectedDate, onSelectDate, onOpenDay, isPremium, onUpgrade }`

**Layout:**
```
ScrollView (AnimatedScrollView với header collapse)
├── [Header] "Hôm nay" / "Hôm qua" (tên ngày, fontSize 32→22 khi scroll)
│
├── [Bento 2×2 Grid] — chỉ hiện nếu highlights.length > 0
│   ├── Tile 1 (delay 100ms): HighlightTile(highlights[0]) hoặc empty placeholder
│   ├── Tile 2 (delay 180ms): HighlightTile(highlights[1]) hoặc "Hôm qua trống"
│   ├── Tile 3 (delay 260ms): HighlightTile(highlights[2]) hoặc "Gợi ý thêm"
│   └── Tile 4 (delay 340ms): Mini Peace Index (peaceIndex %)
│
├── [Peace Index Card] — chỉ hiện nếu highlights.length === 0
│   ├── Circle progress (120×120, borderWidth 6)
│   ├── Số % to (fontSize 36, fontWeight 800)
│   └── Text trạng thái (Optimal/Moderate/Mindful)
│
├── [Action Buttons Row]
│   ├── "Xem cả ngày" (primary button, flex:1)
│   └── "Lịch cảm xúc" (primary button, flex:1)
│
└── [Daily Insights Card] → DailyInsightDialog modal
```

**Peace Index Algorithm:**
```typescript
// src/screens/HomeScreen.tsx
const moodScores = { very_bad: 0, bad: 25, neutral: 50, good: 75, great: 100 };
// 1. Tính điểm trung bình mood
// 2. Phân tích keyword sentiment (text entries)
// 3. Weighted average: mood 70% + keywords 30%
```

---

### 6.2 DayScreen (`src/screens/DayScreen.tsx`)
**Props:** `{ entries, selectedDate, onChangeDate, selectedEntryId, onSaveSuggestion, onDiscardSuggestion }`

**Layout:**
```
ScrollView (ref để auto-scroll đến selectedEntryId)
├── Header
│   ├── Date title (formatDateTitle với Intl.DateTimeFormat)
│   ├── Subtitle: "{n} khoảnh khắc hôm nay"
│   └── ← → navigation buttons (shiftDate ±1)
│
├── Timeline View
│   ├── [Empty] journal-outline icon + message
│   └── [entries] dayEntries.map() → TimelineCard
│           ├── [suggested] Save + Discard buttons
│           └── [saved] Press→Detail, Edit→MomentComposer, Delete→confirm, AddToHighlight
│
├── [edit mode] MomentComposer modal (inline)
└── HighlightPickerSheet (chọn collection)
```

**useFocusEffect:** Mỗi khi Tab "Ngày" được focus → `ensureAutoTrackerFreshness()` để scan ảnh mới.

---

### 6.3 ReelScreen (`src/screens/ReelScreen.tsx`)
**Props:** `{ entries, reels, onOpenDate, onOpenDay }`

**Layout:**
```
ScrollView
├── ScreenHeader: "Ký ức của bạn" / "Reels"
│
├── "Hôm nay năm trước" card (AnimatedCard delay=0)
│   ├── onThisDayEntries: entries.filter(date.endsWith(MM-DD) && year < currentYear)
│   └── onPress → openSlideshow(onThisDayEntries)
│
├── "Play All" button (chỉ hiện nếu savedCount > 0)
│   └── openSlideshow(all entries with content)
│
├── Section "Tuần của bạn"
│   └── reels.map() → WeeklyReel card
│           ├── Thumbnail: coverImageId hoặc coverTone color
│           ├── Dark overlay + 🎞️ icon
│           ├── Play button overlay
│           ├── weekId + dateRange
│           └── "{n} khoảnh khắc" chip
│
└── SlideshowScreen (embedded modal)
```

**generateWeeklyReels Algorithm (`src/skills/reels.ts`):**
```
1. Group entries by weekId (ISO week: "2026-W24")
2. Bỏ qua entries status='suggested'
3. Mỗi tuần: tìm bestImageEntry (mood='great'/'good' + có ảnh)
4. Tìm coverTone theo mood tốt nhất (great=purple, good=blue, neutral=green, bad=orange, very_bad=red)
5. Sort entries chronological
6. insertReel() vào SQLite
7. Trả về reels sorted descending
```

---

### 6.4 MeScreen (`src/screens/MeScreen.tsx`)
**Props:** none (đọc từ useJournalStore)

**Layout:**
```
SafeAreaView
├── ScreenHeader: "Của tôi" / "Me"
├── [Nếu chưa premium] Premium banner → PaywallModal
├── [Nếu premium] Premium badge (gift icon + green border)
├── Nút Settings → navigation.navigate("Settings")
└── HighlightBar (curated highlights)
```

---

### 6.5 SettingsScreen (`src/screens/SettingsScreen.tsx`)
Màn hình cài đặt đầy đủ (tách từ MeScreen cũ).

**Layout:**
```
ScrollView
├── ScreenHeader: "Cài đặt" / "Settings"
│
├── SettingsCard: "Bảo mật Nhật ký"
│   ├── ToggleRow: Face ID / Fingerprint (disabled nếu !biometricAvailable)
│   ├── SettingsRow: "Thiết lập mã PIN" → navigate("PinSetup")
│   └── ToggleRow: "Dùng PIN để khoá" (chỉ show nếu pinSet)
│
├── SettingsCard: "Quyền & Dữ liệu"
│   ├── ToggleRow: Ảnh (requestPhotoAccess)
│   ├── ToggleRow: Vị trí (requestLocationAccess)
│   ├── ToggleRow: Lịch (requestCalendarAccess)
│   ├── ToggleRow: Tự động theo dõi (registerAutoTracker / unregisterAutoTracker)
│   ├── SettingsRow: "Quyền riêng tư" → PrivacyExplanationDialog
│   ├── SettingsRow: "Sao lưu" [Premium] → BackupDialog
│   └── SettingsRow: "Xoá toàn bộ nhật ký" → DeleteJournalDialog
│
├── SettingsCard: "Giao diện & Ứng dụng"
│   ├── SettingsRow: "Thông báo" → NotificationsDialog
│   ├── SettingsRow: "Giao diện" (Light/Dark/System) → ThemeDialog
│   ├── SettingsRow: "Màu nhấn" [Premium] → AccentColorDialog
│   ├── SettingsRow: "Hình nền" [Premium] → WallpaperDialog
│   └── ToggleRow: Ngôn ngữ (Tiếng Việt / English)
│
└── Footer: "Chính sách bảo mật" · "Điều khoản sử dụng" (links)
```

---

### 6.6 DetailScreen (`src/screens/DetailScreen.tsx`)
**Route params:** `{ entryId: string }`

**Layout:**
```
SafeAreaView
├── Back button (navigation.goBack())
├── [Nếu có ảnh] PhotoGrid (responsive grid)
│       └── onPress(index) → setViewerVisible(true) + setViewerIndex(index)
├── [Nếu có video] Video player (expo-av, ResizeMode.CONTAIN)
├── Mood chip (màu theo moodBgColors + moodTextColors)
├── Date + Time + Location text
├── AI Suggestion text (nếu có)
├── Entry text
└── ImageViewer modal (zoomable, swipeable full-screen)
```

**moodBgColors:**
```typescript
{ very_bad: '#E5393526', bad: '#FB8C0026', neutral: '#43A04726', good: '#1E88E526', great: '#8E24AA26' }
```

---

### 6.7 SearchScreen (`src/screens/SearchScreen.tsx`)
**Navigation:** Stack screen, accessible từ DayScreen header

**Tính năng:**
- TextInput search query (debounced)
- Filter entries by: text content, locationName, mood
- Kết quả hiển thị dạng TimelineCard list
- Tap → navigate("Detail", { entryId })

---

### 6.8 SlideshowScreen (`src/screens/SlideshowScreen.tsx`)
**Props:** `{ visible, entries, weekTitle, onClose }`

**Layout:**
```
Modal (fullScreen)
├── Progress bars (entries.length bars, auto-fill 4s mỗi slide)
├── Close button (top-right)
├── Background: ảnh/video full-screen hoặc color gradient
│       ├── [có imageUri/media] Image resizeMode="cover"
│       └── [không ảnh] LinearGradient theo coverTone
├── Bottom overlay:
│   ├── Mood chip
│   ├── Location text
│   └── Entry text (max 3 dòng)
│
└── Gesture handlers:
        ├── Long press → pause
        ├── Tap left 1/3 → previous slide
        └── Tap right 2/3 → next slide (hoặc auto-advance)
```

---

### 6.9 OnboardingScreen (`src/screens/OnboardingScreen.tsx`)
4 slides, swipeable FlatList horizontal:
| Slide | Title | Icon | Description |
|-------|-------|------|-------------|
| 1 | "Chào mừng đến Daily Log" | sparkles | Tagline + value prop |
| 2 | "Tự động ghi nhớ" | camera | Auto-tracking từ ảnh/location |
| 3 | "Riêng tư tuyệt đối" | shield-checkmark | 100% local, no cloud |
| 4 | "Bắt đầu ngay" | rocket | Permission preview + CTA |

---

### 6.10 LockScreen (`src/screens/LockScreen.tsx`)
```
Biometric authentication gate:
├── App icon với pulse animation (Reanimated)
├── "Nhấn để mở khoá" prompt
├── LocalAuthentication.authenticateAsync()
│       ├── Success → onUnlock()
│       ├── Fail → shake animation (Animated.sequence)
│       └── 3 lần fail → tạm khoá 30 giây
├── "Dùng mã PIN" fallback (nếu pinEnabled && pinSet)
└── Countdown timer khi bị khoá
```

---

### 6.11 PinSetupScreen (`src/screens/PinSetupScreen.tsx`)
**Route params:** `{ mode: 'setup' | 'change' | 'disable' }`
```
Mode 'setup':
├── Step 1: Nhập PIN mới (4-6 chữ số)
└── Step 2: Xác nhận PIN → savePinCode(hash) + updateSettings('pinEnabled', true)

Mode 'change':
├── Step 1: Nhập PIN cũ (verifyPin)
├── Step 2: Nhập PIN mới
└── Step 3: Xác nhận → savePinCode(newHash)

Mode 'disable':
├── Step 1: Nhập PIN hiện tại (verifyPin)
└── Xác nhận → clearPinCode() + updateSettings('pinEnabled', false)
```

---

### 6.12 PinUnlockScreen (`src/screens/PinUnlockScreen.tsx`)
```
├── Dot indicator (4-6 chấm, filled khi nhập)
├── Numpad (0-9 + backspace)
├── verifyPin(input) → onUnlock() hoặc shake + clear
└── "Dùng Face ID" fallback (nếu biometricAvailable)
```

---

## 7. Component Library Chi Tiết

### 7.1 MomentComposer (`src/components/MomentComposer.tsx`)
Modal full-screen, 2 mode:

**Mode 'create':**
```
├── Horizontal media scroll (tối đa 10 items, ảnh + video)
├── Date/Time picker (DateTimePicker → customDate state)
├── Location: auto-detect hoặc LocationPicker modal
├── Mood selector: 5 options (MaterialCommunityIcons icons)
├── Note TextInput (multiline)
├── AI Suggestion card (GeminiAISuggestionService)
└── "Lưu" → addEntry(newEntry)
```

**Mode 'edit':**
```
├── Pre-filled với initialEntry data
├── Không hiện Date/Time/Location pickers
└── "Lưu" → updateEntry(id, patch)
```

**AI Suggestion Flow:**
```
GeminiAISuggestionService.generateSuggestion({
    mode, mood, location, imageUri, text, language
})
├── Nếu GEMINI_API_KEY có → POST to Gemini API (3s timeout)
│       └── Race: fetch vs setTimeout(3000)
│               ├── fetch win → parse JSON → trả text
│               └── timeout win → fallback to mock
└── Nếu không có key → MockAISuggestionService
        └── Template theo mode/mood/location
```

---

### 7.2 TimelineCard (`src/components/TimelineCard.tsx`)
```
├── Timeline rail: vertical line + dot
├── [suggested] header chip "Gợi ý" (amber)
│       └── Save button + Discard button
├── [saved] ellipsis menu (Edit/Delete/AddToHighlight)
├── Time chip (HH:mm)
├── Mood chip (emoji + label, màu theo mood)
├── [có ảnh] Image 16:9 trên cùng
├── [có video] Video thumbnail với play icon
├── Text content (max 3 dòng, expandable)
└── Location text (locationName)
```

---

### 7.3 HighlightTile (`src/components/HighlightTile.tsx`)
```
Pressable (square, flex:1)
├── [có imageUri] Image full-size background
├── [không ảnh] Gradient background theo mood
├── Gradient overlay (bottom 60%)
├── Mood chip (top-right)
├── Entry text (bottom, 2 dòng)
└── Time label (bottom-right)
```

---

### 7.4 MoodCalendar (`src/components/MoodCalendar.tsx`)
```
Modal
├── Header: "Lịch cảm xúc" + close
├── Calendar grid:
│   ├── [Free] 7 ngày gần nhất
│   └── [Premium] 30 ngày (heatmap)
├── Mỗi ngày: emoji mood hoặc "-"
├── onPress(date):
│   ├── Nếu có entries → mini preview (2 entries)
│   └── "Xem cả ngày" → navigate to DayScreen
└── [Free mode] "Nâng cấp để xem 30 ngày" upgrade prompt
```

---

## 8. Theme & Design System

**File:** `src/theme/palette.ts`

### Color Palette (Violet/Purple theme)
| Token | Light | Dark |
|-------|-------|------|
| `background` | `#F5F0FF` (lavender white) | `#0D0818` (deep purple-black) |
| `primary` | `#6B21A8` (deep violet) | `#C084FC` (vivid purple) |
| `secondary` | `#9333EA` | `#A855F7` |
| `onSurface` | `#1E0B3A` | `#F3E8FF` |
| `primaryContainer` | `#EDE9FE` | `rgba(192,132,252,0.15)` |
| `outline` | `#D8C8F0` | `rgba(192,132,252,0.15)` |
| `red` | `#ba1a1a` | `#BA1A1A` |

### 6 Accent Color Sets
| Name | Primary | Background |
|------|---------|------------|
| `navy` | `#031f41` | `#f6faff` |
| `sage` | `#2E4F32` | `#f2f8f3` |
| `ocean` | `#0B3D91` | `#f0f4ff` |
| `lavender` | `#6B21A8` | `#F5F0FF` (default) |
| `terracotta` | `#7C2D12` | `#fff7f5` |
| `rosepink` | `#9D174D` | `#fff0f5` |

### Dynamic Palette (Proxy)
```typescript
// palette.ts - export dùng ES Proxy để đọc real-time
export const palette = new Proxy({} as typeof lightPalette, {
  get(target, prop) {
    const activePalette = getActivePalette();
    return activePalette[prop as keyof typeof lightPalette];
  }
});

function getActivePalette() {
  // 1. Đọc settings.theme từ Zustand
  // 2. Nếu 'system': đọc Appearance.getColorScheme()
  // 3. Apply accentColor overrides
}
```
> ⚠️ **Known issue:** Dark mode chưa apply đầy đủ vào styles.ts. Proxy hoạt động nhưng StyleSheet.create() chạy 1 lần khi mount → không reactively update.

---

## 9. Auto-Tracking Pipeline Chi Tiết

**File:** `src/skills/autoTracker.ts`

```
runAutoTrackerOnce()
    │
    ├── Kiểm tra photoPermission (expo-media-library)
    ├── Tính thời điểm scan: max(last_auto_scan_time, 24h ago)
    ├── MediaLibrary.getAssetsAsync({ after, mediaType: 'photo', sortBy: 'creationTime' })
    │       → photos[]
    │
    ├── Collect location signals (nếu locationPermission granted):
    │       Location.getCurrentPositionAsync({ accuracy: LOW })
    │
    ├── Signal Clustering (60-minute windows):
    │       signals.sort(by time)
    │       for each signal:
    │           if |signal.time - lastClusterEnd| > 60min → new Cluster
    │           else → add to current Cluster
    │
    ├── For each Cluster:
    │   ├── Tìm existing entry trong cửa sổ ±30 phút
    │   ├── Skip nếu đã có entry
    │   ├── aiService.generateSuggestion({ mode:'photo', imageUri, location })
    │   ├── Create Entry { status:'suggested', source:'auto', mood:'neutral' }
    │   └── insertEntry() vào SQLite
    │
    ├── saveSetting('last_auto_scan_time', now.toISOString())
    └── return { newEntries: number, skipped: number }

registerAutoTracker()
    └── BackgroundFetch.registerTaskAsync('AUTO_DIARY_BACKGROUND_FETCH', {
            minimumInterval: 900,  // 15 phút
            stopOnTerminate: false,
            startOnBoot: true,
        })

BACKGROUND_FETCH_TASK handler:
    └── runAutoTrackerOnce() → log success/fail counts
```

> ⚠️ **Known issue:** iOS background fetch không reliable do OS throttling. `ensureAutoTrackerFreshness()` chạy foreground khi focus DayScreen là workaround chính.

---

## 10. AI Service

**File:** `src/skills/aiService.ts`

### Architecture
```typescript
interface IAISuggestionService {
  generateSuggestion(input: AISuggestionInput): Promise<string>;
}

// Singleton export:
export const aiService: IAISuggestionService = new GeminiAISuggestionService();
```

### GeminiAISuggestionService
```
generateSuggestion(input):
    │
    ├── if (!GEMINI_API_KEY) → MockAISuggestionService.generate()
    │
    ├── buildAIPrompt(input):
    │       "Bạn là trợ lý nhật ký riêng tư, chỉ mô tả khoảnh khắc."
    │       + "Thời gian: {time} ({period}) - {dayOfWeek}"
    │       + "Địa điểm: {location}"
    │       + "Ảnh: {photoLabels}"
    │       + "Viết 1-2 câu tiếng Việt ngắn gọn (tổng dưới 40 từ)"
    │
    ├── Promise.race([
    │       fetch('generativelanguage.googleapis.com/.../gemini-1.5-flash', { body: prompt }),
    │       new Promise((_, reject) => setTimeout(() => reject('timeout'), 3000))
    │   ])
    │
    ├── Success → parse JSON → extract text
    └── Error/Timeout → MockAISuggestionService.generate()

⚠️ Known: buildAIPrompt() luôn output tiếng Việt dù app đang ở English mode
⚠️ Known: GEMINI_API_KEY đọc từ process.env nhưng không có .env setup, luôn fallback to Mock
```

### MockAISuggestionService Templates
```
mode='photo' + location   → "Một khoảnh khắc ở {location}..."
mode='photo' (no location) → t.ai.photoGeneric (theo mood)
mode='note'               → t.ai.noteGeneric
mode='calendar'           → "{calendarText} {t.ai.calendarSuffix}"
```

---

## 11. Backup System

**File:** `src/skills/backup.ts`

### Export Flow (iOS/Android)
```
exportBackup():
├── getAllEntries() + loadSettings() + getAllReels()
├── Bundle: { magic: 'DAILYLOG_BACKUP_V1', entries, settings, reels, exportedAt }
├── XOR obfuscation: key = [68, 65, 73, 76, 89] (ASCII "DAILY")
├── JSON.stringify → XOR each char → btoa()
├── FileSystem.writeAsStringAsync(cacheDir + '/backup.dailylog', encoded)
└── Sharing.shareAsync(filePath, { mimeType: 'application/octet-stream' })

importBackup():
├── DocumentPicker.getDocumentAsync({ type: '*/*' })
├── FileSystem.readAsStringAsync(uri)
├── atob() → XOR decode → JSON.parse()
├── Validate: bundle.magic === 'DAILYLOG_BACKUP_V1'
├── deleteAllEntries()
├── insertEntry() for each entry
├── saveSetting() for safe settings (exclude isPremium, pinEnabled)
└── set({ entries, reels, settings })
```

> ⚠️ **Không backup:** Image files (chỉ lưu URI → break sau reinstall), PIN hash (trong SecureStore), isPremium status.

---

## 12. Monetization

**File:** `src/services/subscription.ts`

### Plans
| Plan | Price (VND) | Label |
|------|------------|-------|
| `monthly` | 19,000/tháng | Cơ bản |
| `yearly` | 99,000/năm | Tiết kiệm 55% |
| `lifetime` | 199,000 | Tốt nhất |

### Service Architecture
```typescript
interface ISubscriptionService {
  purchase(planId: PlanId): Promise<PurchaseResult>;
  restorePurchases(): Promise<PurchaseResult>;
  checkEntitlement(): Promise<boolean>;
}

// SimulatedPurchaseService (web/dev):
//   purchase() → delay 1.5s → 5% random fail → localStorage.setItem('dl_premium_entitlement', 'true')

// NativePurchaseService (iOS/Android):
//   Hiện tại delegate toàn bộ về SimulatedPurchaseService
//   TODO: Tích hợp react-native-purchases (RevenueCat)

SubscriptionService.shared():
    Platform.OS === 'web' → SimulatedPurchaseService
    native              → NativePurchaseService
```

### Premium Features (gated by `settings.isPremium`)
- Backup (Export/Import)
- Accent Color Picker (6 màu)
- Custom Wallpaper
- MoodCalendar 30 ngày (vs 7 ngày free)

---

## 13. Internationalization (i18n)

**Files:** `src/i18n/vi.ts`, `src/i18n/en.ts`, `src/i18n/translations.ts`

### useTranslation() Hook
```typescript
// translations.ts
export function useTranslation() {
  const { settings } = useJournalStore();
  const lang = settings.language || 'vi';
  const t = lang === 'en' ? en : vi;
  const locale = lang === 'vi' ? 'vi-VN' : 'en-US';
  return { t, lang, locale };
}
```

### Translation Key Structure (~350+ keys)
```
t.common.*      → save/cancel/delete/confirm/loading/allow/edit
t.tabs.*        → home/day/reel/me tab labels
t.mood.*        → very_bad/bad/neutral/good/great labels
t.home.*        → HomeScreen strings + dynamic (peaceIndex, bento)
t.day.*         → DayScreen + momentsInDay(n) function
t.reel.*        → ReelScreen + memorableMoments(n) / savedMomentsCount(n)
t.addMoment.*   → AddMomentSheet 3 modes
t.composer.*    → MomentComposer (addPhoto, moodLabel, aiSuggestion...)
t.settings.*    → SettingsScreen 60+ keys
t.auth.*        → LockScreen / PinUnlock prompt
t.ai.*          → AI suggestion templates (5 mood variants × mode)
t.onboarding.*  → 4 slides + getStarted
t.calendar.*    → CalendarEventPicker
t.permissions.* → Permission explanation modal text
t.pin.*         → PinSetup / PinUnlock strings
t.location.*    → Location unavailable messages
```

### Remaining Hardcoded Strings (cần fix)
| File | Dòng | Vấn đề |
|------|------|--------|
| `TabNavigator.tsx` | 332 | `t.language === 'en' ? 'Allow' : 'Cho phép'` → dùng `t.common.allow` |
| `subscription.ts` | 127 | Vietnamese error string hardcoded |

---

## 14. Feature Inventory & Roadmap

### ✅ Đã hoàn thành

| Nhóm | Tính năng |
|------|-----------|
| **Core** | Manual entry (photo/note/calendar), edit, delete, AI suggestions |
| **Auto** | Background photo scan, signal clustering, suggested entries |
| **Home** | Bento 2×2 grid, Peace Index, Daily Insights dialog, MoodCalendar |
| **Day** | Timeline view, date nav, Save/Discard suggested, edit, HighlightPickerSheet |
| **Reel** | Weekly reel auto-gen, Today Last Year, SlideshowScreen player |
| **Me/Settings** | Tất cả settings, Premium gating, Backup dialog |
| **Security** | PIN (SecureStore), Face ID/biometrics, Onboarding |
| **Backup** | XOR+Base64 .dailylog export/import |
| **i18n** | Đầy đủ vi/en parity, dynamic switch |
| **Theme** | lightPalette + darkPalette + Proxy, 6 accent colors (stored, not fully applied) |
| **Search** | SearchScreen với text/location/mood filter |
| **Detail** | Photo grid, video player, zoomable ImageViewer |
| **Highlights** | HighlightCollection CRUD, HighlightBar, HighlightPickerSheet |
| **Reels** | generateWeeklyReels() algorithm với mood-based cover |

### ⏳ Pending (Phân theo độ ưu tiên)

#### P0 — Critical
| # | Tính năng | Ghi chú |
|---|-----------|---------|
| 1 | **Real IAP (RevenueCat)** | NativePurchaseService → delegate SimulatedPurchaseService. Cần uncomment RevenueCat SDK |
| 2 | **Gemini API key wiring** | `process.env.GEMINI_API_KEY` không hoạt động trong Expo. Cần dùng `app.config.js extra` + `Constants.expoConfig.extra` |
| 3 | **biometricAvailable initialization** | Chưa call `LocalAuthentication.hasHardwareAsync()` khi boot. Face ID toggle luôn disabled |
| 4 | **Calendar auto-tracking** | autoTracker.ts không scan calendar events, chỉ manual "Add from Calendar" |

#### P1 — Should Have
| # | Tính năng | Ghi chú |
|---|-----------|---------|
| 5 | **Dark mode full apply** | Proxy hoạt động nhưng StyleSheet.create() static. Cần dynamic styles hoặc re-mount on theme change |
| 6 | **Accent color dynamic apply** | accentColor stored nhưng palette chưa override toàn bộ |
| 7 | **Custom wallpaper render** | wallpaperUri stored nhưng không render as background |
| 8 | **Media in backup** | Backup chỉ lưu URI. Cần copy file vào DocumentDirectory + bundle base64 |
| 9 | **30-day heatmap free/premium gate** | MoodCalendar code có premium check nhưng chưa enforce đúng |
| 10 | **iOS background fetch reliability** | OS throttle → ensureAutoTrackerFreshness() foreground workaround |

#### P2 — Nice to Have
| # | Tính năng |
|---|-----------|
| 11 | Haptic feedback (`expo-haptics`) |
| 12 | Home screen widget |
| 13 | Video support trong Slideshow |
| 14 | iCloud/Google Drive cloud backup |
| 15 | RevenueCat server-side receipt validation |
| 16 | Mood trend analytics (biểu đồ tuần/tháng) |
| 17 | Push notification deep-link handling |
| 18 | Crashlytics / error monitoring |
| 19 | App Store metadata + screenshots |

---

## 15. Development Guidelines cho AI Agents

### Quy tắc BẮT BUỘC

1. **Dùng CodeGraph trước khi sửa code:**
   ```bash
   codegraph explore "tên tính năng" --path /Users/hoangvu96z/Documents/daily-log
   codegraph impact "TênFunction" --path /Users/hoangvu96z/Documents/daily-log
   ```

2. **Local-First TUYỆT ĐỐI:** Không được dùng Firebase, Supabase, AWS, MongoDB Atlas. Mọi data phải qua `src/memory/database.ts`.

3. **i18n NGHIÊM NGẶT:** Không hardcode string UI. Phải thêm key vào cả `vi.ts` và `en.ts` đồng thời.

4. **Mock trước, Real sau:** AI service → implement mock interface trước, sau đó swap real.

5. **Memory layer isolation:** Screens và components KHÔNG được gọi `expo-sqlite` hay `expo-secure-store` trực tiếp.

6. **Test trên Web trước:** `npm run web` để test nhanh, sau đó test native trên device.

### Cách thêm tính năng mới
```
1. Thêm TypeScript types vào src/types.ts
2. Thêm SQLite column/table vào src/memory/database.ts (migration)
3. Thêm CRUD functions vào database.ts
4. Thêm actions vào src/memory/store.ts (useJournalStore)
5. Thêm i18n keys vào src/i18n/vi.ts VÀ en.ts
6. Build UI component trong src/components/ (nếu reusable)
7. Integrate vào screen trong src/screens/
8. Update navigation nếu cần route mới trong AppNavigator.tsx
```

### Commands hữu ích
```bash
npm run codegraph:status  # Kiểm tra index state
npm run codegraph:sync    # Sync sau khi thay đổi code
npm run typecheck         # tsc --noEmit
npm run web               # Chạy web để test
```
