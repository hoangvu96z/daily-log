---
name: "Daily Log Rules & Memory"
description: "Core rules, technology stack, and memory/skills definitions for the Auto Diary application."
tags: ["react-native", "expo", "architecture", "rules", "context"]
---

# Daily Log Architecture & Rules

This skill defines the core rules, architecture, and technology stack for the Auto Diary app.
**You must follow these rules strictly whenever working on this repository.**

## 1. Project Goal
Build a local-first, privacy-focused automatic diary application for introverts. The app runs silently, collects device signals (photos, location, calendar), and uses AI to suggest diary entries. **Data never leaves the device.** The app runs on Android, iOS, and Web (demo only).

## 2. Technology Stack (Enforced)

| Category | Package | Purpose |
|----------|---------|---------|
| Framework | `expo` (SDK 51) + `react-native` | Cross-platform runtime |
| Navigation | `@react-navigation/native`, `@react-navigation/bottom-tabs`, `@react-navigation/native-stack` | Tab bar (4 tabs) + stack navigation per tab |
| State | `zustand` | Global UI state: theme, language, permissions, bottom sheet |
| Database | `expo-sqlite` | All Entry and WeeklyReel data. **No cloud DB** |
| Security | `expo-secure-store` | PIN codes, biometric flags |
| Background | `expo-background-fetch`, `expo-task-manager` | Auto-tracking task every 2-4 hours |
| Bottom Sheet | `@gorhom/bottom-sheet` | FAB "Add Moment" sheet |
| Animations | `react-native-reanimated` | Smooth transitions, Reel slideshow |
| Image Picker | `expo-image-picker` | Capture / pick photos |
| Location | `expo-location` | Foreground location for entries |
| Calendar | `expo-calendar` | Read device calendar events |
| Media Library | `expo-media-library` | Access recently captured photos |
| Biometrics | `expo-local-authentication` | Face ID / Fingerprint auth |
| Icons | `@expo/vector-icons` (Ionicons) | UI icons |

### Forbidden
- ❌ Cloud databases: Firebase, Supabase, AWS, MongoDB Atlas
- ❌ Redux (too heavy for this app)
- ❌ Social features: share buttons, feed, comments, likes
- ❌ Heavy video rendering libraries for Reel

## 3. Architecture Rules
- **Bottom Tab Bar**: Must have exactly 4 tabs: `Home`, `Day`, `Reel`, `Me`.
- **FAB**: A central `+` Floating Action Button that overlaps the tab bar and opens a Bottom Sheet (`Add Moment`).
- **Memory layer** (`src/memory/`): All persistent data access goes through here. Screens/components never call SQLite or SecureStore directly.
- **Skills layer** (`src/skills/`): All background logic and system integrations. Decoupled from UI.

## 4. Implementation Rules

### 4.1. Mock First
When implementing AI vision or generation features, **always hardcode a mock string/stub first** before attempting complex API integrations. Create a standard interface so the mock can be swapped for a real implementation later.

### 4.2. Local-First (Strict)
Never use cloud databases for storing entries. Everything must go through `src/memory/database.ts`. Photos are stored via `imageLocalId` (local identifier), never as Base64 in the database.

### 4.3. Progressive Permissions
Use progressive permission requests. Don't ask for all permissions on first boot. Present permissions during Onboarding with `Allow` / `Later` options. The app must gracefully handle denied permissions without crashing.

### 4.4. UI/UX Principles
- Prioritize a clean, minimalist design with soft colors (cream background, rounded corners) that feels like a private journal.
- No social media elements (no share buttons, no feeds, no likes).
- Mood chips should include emoji: `😞 Tệ`, `😐 Bình thường`, `🙂 Ổn`, `😊 Vui`, `🤩 Tuyệt`.
- Vietnamese is the primary language. English as secondary.

### 4.5. Internationalization (i18n) (STRICT)
- **NEVER** hardcode any text strings or labels in UI components. 
- All texts must be extracted and managed through the translation dictionary `useTranslation()` (`t` object) via `src/i18n/vi.ts` and `src/i18n/en.ts`.
- If you add a new feature, you must update both language files simultaneously to maintain type parity.

### 4.6. Web Platform
- Web is demo-only. Background fetch, location, and biometrics are unavailable on web.
- Skills that depend on native APIs must check `Platform.OS` and gracefully skip on web.

---

## 5. MEMORY (Storage & State Definitions)

The app's memory is divided into 3 main zones:

### 5.1. Core Database (Long-term Memory)
- **Designated Tool:** `expo-sqlite`.
- **Location:** `src/memory/database.ts`.
- **Role:** Permanent storage for diaries (Entries) and data clusters (WeeklyReel).
- **AI Rules:**
  - Always store `imageLocalId` instead of Base64 strings to prevent database bloat.
  - Automatically fetched events reside here with `status: 'suggested'`.
  - Store `locationLat` and `locationLon` as numeric columns for future geo queries.
  - The `WeeklyReel` table stores `entryIds` as a JSON-encoded string array.

### 5.2. Vault (Secure Memory)
- **Designated Tool:** `expo-secure-store`.
- **Location:** `src/memory/secureStore.ts`.
- **Role:** The system's "safe". Used to store PIN code hashes and Face ID/Touch ID configuration flags.
- **AI Rules:**
  - All accesses related to the lock screen (Diary Protection section in the Me Tab) must read/write through this module.
  - Never store PIN codes in plain text. Use hashed values.
  - Never store PIN or biometric flags in AsyncStorage or SQLite — only in Secure Store.

### 5.3. Global State (Short-term Memory / UI State)
- **Designated Tool:** `zustand`.
- **Location:** `src/memory/store.ts`.
- **Role:** Holds the app's immediate state: current theme (Light/Dark), language, Bottom Sheet visibility, permission statuses, active tab, selected date.
- **AI Rules:**
  - Do not use Redux; it is too heavy for this app.
  - All system configuration-related states (Settings) should be synced from `expo-sqlite` to Zustand on app boot.
  - Zustand store should expose typed actions (`setTheme`, `setLanguage`, `togglePermission`, etc.) — not raw setters.

---

## 6. SKILLS (Action & Logic Definitions)

These are the "skills" the system needs to run silently in the background and assist the user in journaling.

### 6.1. Skill: Signal Tracking
- **Description:** The ability to automatically gather locations, new photos, and calendar events as "raw materials" for diary entries.
- **Location:** `src/skills/permissions.ts` (for requesting access), logic within `src/skills/autoTracker.ts`.
- **AI Rules:**
  - Must implement smooth progressive permissions during Onboarding. Never crash the app if the user denies permissions.
  - When location is unavailable (web, denied), gracefully return a fallback (e.g., `null` or a descriptive string like "Không có vị trí").

### 6.2. Skill: Background Auto-Worker
- **Description:** The ability to "wake up" automatically to aggregate data without the user opening the app.
- **Location:** `src/skills/autoTracker.ts`.
- **Designated Tools:** `expo-background-fetch` and `expo-task-manager`.
- **AI Rules:**
  - Define a periodic background task (e.g., every 2-4 hours).
  - Upon waking, this task executes **Skill 6.1** (signal collection), groups events into "clusters" (30–60 min windows), generates a draft Entry (`status: 'suggested'`, `mood: 'neutral'`), and saves it to the **Core Database**.
  - The task must be registered with a unique task name (e.g., `AUTO_DIARY_BACKGROUND_FETCH`).

### 6.3. Skill: AI Suggestion Generation
- **Description:** Analyzing the context (time, location, photo labels) to generate short descriptive text in Vietnamese.
- **Location:** `src/skills/aiService.ts`.
- **Designated Tools:** (Initially) Hard-coded mock logic. (Later) Lightweight LLM APIs (Gemini/OpenAI).
- **AI Rules:**
  - The AI coder must **create a standard interface (Mock Service)** that returns sample text.
  - Ensure the AI calling logic is decoupled (Dependency Injection / service interface) for easy future integration with real APIs.

### 6.4. Skill: Slideshow Playback (Reel)
- **Description:** Creating a "Your Week" review experience similar to TikTok/Reels.
- **AI Rules:**
  - Avoid using heavy mp4 rendering libraries.
  - Use `react-native-reanimated` to present a smooth photo + text slideshow with automatic transitions (auto-advance) after a few seconds.
