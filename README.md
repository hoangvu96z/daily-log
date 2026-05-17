# Specification: Automatic, Private Diary App

> **Platform:** React Native (Expo) — Android, iOS, and Web (demo only).  
> This document serves as the foundation for AI coders or developers building this app.

---

## 1. Product & UX Spec

### 1.1. Product Description
- A mobile app that helps introverts **maintain a daily diary with almost no manual writing**.
- The app automatically collects device signals (photos, time, location, calendar events) and uses AI to suggest diary entries. Users simply tap to confirm or edit slightly.
- Core Principles:
  - **"No tracking – only reflecting"**: Not a social network. No feeds, likes, or sharing.
  - **"Local‑first & private"**: Data stays on the device. Backups are optional. Total transparency regarding permissions and data deletion.

### 1.2. Target Audience & Needs
- Gen Z / Millennials working in offices or remote, who use their phones frequently, take photos, but are too busy/lazy to write a diary.
- Needs:
  - A place to **review "yesterday / this week / last year"** through photos + short texts.
  - Total privacy. No personal stories posted online or used for uncontrolled AI training.

### 1.3. Key Messages
- "A private diary, not a social network."
- "The app posts nothing anywhere. It's just for you to look back at your life."
- "Data lives on your device. You can delete it entirely at any time."

---

## 2. Information Architecture & Navigation

### 2.1. Tab Structure
Bottom tab bar (4 tabs) + FAB in the center:
1. **Home**: Summarizes "Your Yesterday": 3–4 event chips, `View full day` button, `Mood Calendar` button.
2. **Day**: Detailed timeline of 1 day: time markers, mood, short text, photos, "suggested" entries pending confirmation.
3. **Reel**: `Today last year`, `Weekly Reel` list (30–60s clips from photos & moods).
4. **Me**: Settings: Permissions & Data, Diary Protection, App Preferences (theme, language, notifications).

### 2.2. Bottom Navigation & FAB
- **Tab bar**: 4 items `Home`, `Day`, `Reel`, `Me`.
  - Active tab: outlined icon + dark blue label, small dot on top.
  - Inactive tab: gray icon, light gray label.
- **FAB**: Round `+` button in dark blue, white plus icon, centered, slightly overlapping the nav bar.
- FAB opens a "Add Moment" bottom sheet with primary actions.

---

## 3. Detailed UX by Screen

### 3.1. Onboarding
Objective: Sell the **private & automatic** story, request permissions without scaring the user.

Suggested 3–4 slides:
1. **Introduction**: "An automatic diary just for you." / "The app quietly records moments every day without you needing to write."
2. **Privacy**: "No social networks, no strangers. Your diary stays on your device."
3. **Permissions**: List permissions (Photos, Location, Calendar...) with `Allow` / `Later` options (progressive permissions).

### 3.2. Tab 1 – Home
**Purpose:** Quick summary of "yesterday", guiding users to details or the mood calendar.
- Header: `Your Yesterday` / `A few highlighted moments`
- Summary Card: Cream background, rounded corners, full width.
  - Contains 3–4 **event chips**: small round icon + short text (e.g., `Morning Coffee`, `Fixing bugs`, `Evening walk`).
  - Uses `isHighlight` flag on Entry data.
- Action Buttons: `View full day` (opens Day tab for yesterday), `Mood Calendar` (opens Calendar view).

### 3.3. Tab 2 – Day (Timeline)
**Purpose:** View detailed milestones in a single day.
- Header: `DD Month, YYYY` with a DatePicker button.
- Timeline: Left column (vertical line + time markers), Right column (entry cards).
- **Saved Entry Card**: Time + mood chip, 1-2 lines of text, photo thumbnail (if any). White/cream background, rounded corners.
- **"Suggested" Entry Card**:
  - Status = `suggested`.
  - Lower opacity or dashed border.
  - Small `Suggested` label.
  - Two buttons: `Save` (primary) and `Discard` (secondary).
  - When user taps `Save`: status → `saved`, card becomes normal entry.
  - When user taps `Discard`: entry is removed or flagged as `deleted`.

### 3.4. FAB & Bottom Sheet "Add Moment"
When user taps `+`:
- Bottom sheet slides up from bottom, taking ~60% height.
- Title: "Thêm khoảnh khắc" (Add Moment).
- 3 options:
  1. `Capture Moment`: Opens camera/gallery. Pushes to **New Moment** with the captured photo.
  2. `Quick Note`: Pushes to **New Moment** without a photo.
  3. `Add from Calendar`: Shows today's events; selecting one pre-fills text/time in **New Moment**.

### 3.5. "New Moment" Screen
Shared screen for all 3 actions above.

1. **Photo**: Thumbnail (if captured) or placeholder with `Add Photo` button.
2. **Meta (time & location)**: `HH:MM • Location Name`. Auto-filled from current time + location (if permission granted). Tappable to edit.
3. **Mood**: Horizontal chips: `😞 Tệ`, `😐 Bình thường`, `🙂 Ổn`, `😊 Vui`, `🤩 Tuyệt`. Selected chip has darker background. AI may pre-select a default mood.
4. **Note & AI Suggestion**:
   - Multiline textarea with placeholder: "Hôm nay có gì muốn ghi lại? (không bắt buộc)".
   - Below it: **AI Suggestion Card** (cream background, spark icon) with 1–2 Vietnamese sentences.
   - Two buttons: `Use suggestion` (fills note = suggestion) and `Discard` (hides card).
5. **Footer**: Full-width `Save` button → creates Entry (`status = saved`), returns to Day tab scrolled to the new entry.

### 3.6. Tab 3 – Reel (Review)
**Purpose:** Recap collections (weekly, "today last year").
- Header: `Xem lại` / `Nhìn lại những ngày đã qua của bạn`.
- **Section 1 – Today Last Year**: Large full-width card. Left: text + entry count. Right: 2-3 overlapping thumbnails. Tap → opens detail view of that day.
- **Section 2 – Weekly Reel**: Title: `Tuần của bạn`. Vertical card list. Each card: 16:9 video thumbnail with play icon, week label + date range, moment count chip. Tap → opens full-screen player/slideshow.

### 3.7. Tab 4 – Me (Settings)
- **Group 1 – Permissions & Data**:
  - `Permissions`: Toggles for Photos & Video, Location, App Usage, Calendar.
  - `Backup & Restore`: Backup iCloud/Drive, restore when switching devices.
  - `Delete all diary data`: Permanent delete. Confirmation dialog requires typing "XÓA".
- **Group 2 – Diary Protection**:
  - `Face ID / Fingerprint lock`: Toggle on/off.
  - `App PIN code`: Alternative to biometrics.
- **Group 3 – App Settings**:
  - `Notifications`: Daily/weekly reminder.
  - `Theme`: Light / Dark / System.
  - `Language`: Tiếng Việt / English.
- **Footer**: Privacy Policy link, Terms of Use link.

---

## 4. Tech & Data Spec

### 4.1. Tech Stack

| Layer | Tool | Purpose |
|-------|------|---------|
| **Framework** | React Native (Expo SDK 51) | Cross-platform: Android, iOS, Web (demo) |
| **Navigation** | `@react-navigation/native`, `@react-navigation/bottom-tabs`, `@react-navigation/native-stack` | TabView for 4 tabs, NavigationStack within each tab |
| **State Management** | `zustand` | Lightweight global state (theme, language, permissions, bottom sheet visibility) |
| **Core Database** | `expo-sqlite` | Permanent local storage for Entries, WeeklyReels. Local-first, no cloud DB |
| **Secure Storage** | `expo-secure-store` | PIN codes, Face ID config flags. The app's "vault" |
| **Background Tasks** | `expo-background-fetch`, `expo-task-manager` | Auto-tracking: periodic signal collection & entry generation |
| **Bottom Sheet** | `@gorhom/bottom-sheet` | FAB action sheet |
| **Animations** | `react-native-reanimated` | Smooth transitions, Reel slideshow playback |
| **Image Picker** | `expo-image-picker` | Capture photo / pick from gallery |
| **Location** | `expo-location` | Foreground location for entry metadata |
| **Calendar** | `expo-calendar` | Read device calendar events |
| **Media Library** | `expo-media-library` | Access recently captured photos for auto-tracking |
| **Biometrics** | `expo-local-authentication` | Face ID / Fingerprint lock |
| **Icons** | `@expo/vector-icons` (Ionicons) | UI icons throughout the app |
| **AI / Vision** | Lightweight API calls (Gemini/OpenAI) or on-device model | Text suggestion generation. Initially use mock/stub |

> **Strict Rule:** No cloud databases (Firebase, Supabase, AWS) for storing entries. Everything local.

### 4.2. Data Model

```typescript
// === Entry ===
Entry {
  id: string                 // UUID
  date: string               // YYYY-MM-DD (normalized)
  time: string               // HH:mm (specific time)
  mood: Mood                 // very_bad | bad | neutral | good | great
  text?: string              // User note or accepted AI suggestion
  aiSuggestion?: string      // The AI-generated suggestion text
  imageLocalId?: string      // Local photo identifier (PHAsset ID or path)
  imageUri?: string          // URI for display
  locationName?: string      // Human-readable location name
  locationLat?: number       // Latitude
  locationLon?: number       // Longitude
  source: EntrySource        // auto | manual
  status: EntryStatus        // saved | suggested
  isHighlight: boolean       // Show on Home summary card
}

// === Settings ===
Settings {
  allowPhotos: boolean
  allowLocation: boolean
  allowUsage: boolean
  allowCalendar: boolean
  photoPermissionStatus?: PermissionState
  locationPermissionStatus?: PermissionState
  faceIDEnabled: boolean
  biometricAvailable?: boolean
  pinCodeHash?: string       // Stored in expo-secure-store, NOT in DB
  theme: 'system' | 'light' | 'dark'
  language: 'vi' | 'en'
}

// === WeeklyReel ===
WeeklyReel {
  weekId: string             // e.g. "2026-W18"
  startDate: string
  endDate: string
  coverImageId?: string
  entryIds: string[]         // UUIDs of entries in this reel
}

// === Supporting Types ===
type Mood = 'very_bad' | 'bad' | 'neutral' | 'good' | 'great'
type EntryStatus = 'saved' | 'suggested'
type EntrySource = 'auto' | 'manual'
type PermissionState = 'unknown' | 'granted' | 'denied' | 'unavailable'
```

### 4.3. Auto-creation Logic (Background)

1. When app opens or via scheduled background task (every 2–4 hours), read system data from the last X hours:
   - Newly captured photos (`expo-media-library`).
   - Current location (`expo-location`).
   - (Later) Usage stats, events from Calendar (`expo-calendar`).
2. Group events into "clusters" (e.g., every 30–60 minute intervals).
3. For each cluster, if no entry exists for that timeframe:
   - Create a new Entry with:
     - `time` = midpoint of the cluster.
     - `mood` = `neutral` (default).
     - `status` = `suggested`.
     - `imageLocalId` = representative photo ID.
4. Save to local SQLite database.
5. When user opens the Day tab, display entries with `status === 'suggested'` as suggestion cards.

### 4.4. AI Suggestion (Prompt Spec)

When generating text suggestions for an entry:

**Input to model** (on-device or cloud):
- Time: `HH:MM`, period (sáng/chiều/tối), day of week.
- Location (if available): place name.
- Vision results from photo: simple labels (coffee, laptop, street, home...).

**Requirements for model**:
- Return 1–2 sentences in Vietnamese.
- Total length < 40 words.
- Neutral tone, no psychological analysis, no extreme language.

**Example prompt**:
```text
Bạn là trợ lý nhật ký riêng tư, chỉ mô tả khoảnh khắc, không phân tích tâm lý.

Dữ liệu:
- Thời gian: 08:05 sáng, Thứ Hai
- Địa điểm: quán cà phê Cộng
- Mô tả ảnh: ly cà phê, laptop, cửa kính nhìn ra đường

Hãy viết 1–2 câu tiếng Việt ngắn gọn (tổng dưới 40 từ) mô tả khoảnh khắc này. Không dùng từ quá kịch tính.
```

**Example output**:
> "Ly cà phê sáng ở quán quen, mở laptop chuẩn bị cho một ngày làm việc mới. Không khí yên, cảm giác khá bình tĩnh."

**Implementation approach**: Start with hard-coded mock suggestions. Design code so the AI calling logic is decoupled (standard interface / Mock Service) for easy future integration with real Gemini/OpenAI APIs.

---

## 5. Project File Structure

```
├── App.tsx                          # Root component
├── index.js                         # Entry point
├── app.json                         # Expo config
├── package.json
├── tsconfig.json
├── README.md                        # This file — Product & Tech Spec
├── RULES.md                         # AI Coding Guidelines
├── AI_MEMORY_SKILLS.md              # Memory & Skills architecture
└── src/
    ├── navigation/                  # App & Tab navigators
    │   ├── AppNavigator.tsx
    │   └── TabNavigator.tsx
    ├── screens/                     # Screen components by tab
    │   ├── HomeScreen.tsx
    │   ├── DayScreen.tsx
    │   ├── ReelScreen.tsx
    │   └── MeScreen.tsx
    ├── components/                  # Reusable UI components
    │   ├── AddMomentSheet.tsx
    │   ├── BottomTabs.tsx
    │   ├── MomentComposer.tsx
    │   ├── ImagePlaceholder.tsx
    │   └── ScreenHeader.tsx
    ├── memory/                      # Storage & State (the app's "memory")
    │   ├── store.ts                 # Zustand global state
    │   ├── database.ts              # SQLite operations
    │   └── secureStore.ts           # expo-secure-store wrapper
    ├── skills/                      # Background logic (the app's "skills")
    │   ├── autoTracker.ts           # Background fetch & signal collection
    │   ├── permissions.ts           # Progressive permission requests
    │   └── aiService.ts             # AI suggestion generation (mock → real)
    ├── data/
    │   └── mockData.ts              # Initial/sample data for development
    ├── theme/
    │   └── palette.ts               # Color constants
    ├── services/                    # Utility wrappers
    │   └── imagePicker.ts           # expo-image-picker wrapper
    ├── styles.ts                    # All StyleSheet definitions
    └── types.ts                     # TypeScript type definitions
```
