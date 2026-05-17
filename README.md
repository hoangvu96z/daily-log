# Specification: Automatic, Private Diary App

> Note: This document serves as the foundation for AI coders or developers. The app prioritizes iOS 17+ (SwiftUI), with potential Android porting later. 
> *Current Project Note: The project is being built with React Native (Expo) to support cross-platform development instead of native iOS.*

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
1. **Home**: Summarizes “Your Yesterday”: 3–4 event chips, `View full day` button, `Mood Calendar` button.
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
- Action Buttons: `View full day` (opens Day tab for yesterday), `Mood Calendar` (opens Calendar view).

### 3.3. Tab 2 – Day (Timeline)
**Purpose:** View detailed milestones in a single day.
- Header: `DD Month, YYYY` with a DatePicker button.
- Timeline: Left column (vertical line + time markers), Right column (entry cards).
- **Saved Entry Card**: Time + mood chip, 1-2 lines of text, photo thumbnail (if any).
- **"Suggested" Entry Card**:
  - Status = `suggested`.
  - Lower opacity or dashed border.
  - Small `Suggested` label.
  - Two buttons: `Save` (primary) and `Discard` (secondary).

### 3.4. FAB & Bottom Sheet "Add Moment"
- Bottom sheet slides up, taking ~60% height.
- Options:
  1. `Capture Moment`: Opens camera. Pushes to **New Moment** with the captured photo.
  2. `Quick Note`: Pushes to **New Moment** without a photo.
  3. `Add from Calendar`: Shows today's events; selecting one pre-fills text/time in **New Moment**.

### 3.5. "New Moment" Screen
- **Photo**: Thumbnail or placeholder with `Add Photo` button.
- **Meta**: `HH:MM • Location Name`. Auto-filled from current time/location. Tap to edit.
- **Mood**: Horizontal chips (Very Bad, Bad, Neutral, Good, Great). AI selects default, user can change.
- **Note & AI Suggestion**: Multiline textarea. Below it, an **AI Suggestion Card** with 1-2 generated sentences and `Use suggestion` / `Discard` buttons.
- **Footer**: Full-width `Save` button.

### 3.6. Tab 3 – Reel (Review)
**Purpose:** Recap collections (weekly, "today last year").
- **Section 1 – Today Last Year**: Large card showing count of memorable moments and 2-3 overlapping thumbnails.
- **Section 2 – Weekly Reel**: List of vertical cards. Each has a 16:9 video thumbnail, week date range, and moment count.

### 3.7. Tab 4 – Me (Settings)
- **Permissions & Data**: Toggles for Photos, Location, Calendar. Backup options. `Delete all diary data` option.
- **Diary Protection**: Face ID / Fingerprint toggle. App PIN code.
- **App Settings**: Notifications, Theme (Light/Dark/System), Language (EN/VI).

---

## 4. Tech & Data Spec

### 4.1. Tech Stack
- Platform: iOS 17+ (and Android)
- UI/Framework: React Native (Expo)
- Navigation: `react-navigation` (Bottom Tabs, Native Stack)
- Local Storage: `expo-sqlite`, `expo-secure-store`, Zustand
- AI & Vision: Lightweight API calls (Gemini/OpenAI) for text generation. `expo-media-library`, `expo-location`.

### 4.2. Data Model
```typescript
Entry {
  id: string (UUID)
  date: string (YYYY-MM-DD)
  time: string (HH:mm)
  mood: string (very_bad, bad, neutral, good, great)
  text: string?
  imageLocalId: string?
  locationName: string?
  locationLat: number?
  locationLon: number?
  source: string (auto, manual)
  status: string (saved, suggested)
  isHighlight: boolean
}
```

### 4.3. Auto-creation Logic (Background)
1. Periodically (e.g., every few hours), read system data (new photos, location, calendar).
2. Group events into clusters (e.g., 30–60 min intervals).
3. If no entry exists for that timeframe, create a new Entry with `status = suggested` and `mood = neutral`.
4. Save to local SQLite database.
