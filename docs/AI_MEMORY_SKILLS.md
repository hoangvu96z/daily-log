# AI Context: Memory & Skills Definitions

This file defines the core concepts of **"Memory"** (Storage/State) and **"Skills"** (Actions/Logic) for the AI Coder building the **Auto Diary** app. The AI must understand this architecture to prevent violating the app's privacy-first principles.

---

## 1. MEMORY (Storage & State Definitions)

Because the app strictly adheres to the **"Local-first & Private"** principle, AI Coders are strictly prohibited from using Cloud Database services (Firebase, Supabase, AWS).

**The app's memory is divided into 3 main zones:**

### 1.1. Core Database (Long-term Memory)
- **Designated Tool:** `expo-sqlite`.
- **Location:** `src/memory/database.ts`.
- **Role:** Permanent storage for diaries (Entries) and data clusters (WeeklyReel).
- **AI Rules:**
  - Always store `imageLocalId` instead of Base64 strings to prevent database bloat.
  - Automatically fetched events reside here with `status: 'suggested'`.
  - Store `locationLat` and `locationLon` as numeric columns for future geo queries.
  - The `WeeklyReel` table stores `entryIds` as a JSON-encoded string array.

### 1.2. Vault (Secure Memory)
- **Designated Tool:** `expo-secure-store`.
- **Location:** `src/memory/secureStore.ts`.
- **Role:** The system's "safe". Used to store PIN code hashes and Face ID/Touch ID configuration flags.
- **AI Rules:**
  - All accesses related to the lock screen (Diary Protection section in the Me Tab) must read/write through this module.
  - Never store PIN codes in plain text. Use hashed values.
  - Never store PIN or biometric flags in AsyncStorage or SQLite — only in Secure Store.

### 1.3. Global State (Short-term Memory / UI State)
- **Designated Tool:** `zustand`.
- **Location:** `src/memory/store.ts`.
- **Role:** Holds the app's immediate state: current theme (Light/Dark), language, Bottom Sheet visibility, permission statuses, active tab, selected date.
- **AI Rules:**
  - Do not use Redux; it is too heavy for this app.
  - All system configuration-related states (Settings) should be synced from `expo-sqlite` to Zustand on app boot.
  - Zustand store should expose typed actions (`setTheme`, `setLanguage`, `togglePermission`, etc.) — not raw setters.

---

## 2. SKILLS (Action & Logic Definitions)

These are the "skills" the system needs to run silently in the background and assist the user in journaling.

### 2.1. Skill: Signal Tracking
- **Description:** The ability to automatically gather locations, new photos, and calendar events as "raw materials" for diary entries.
- **Location:** `src/skills/permissions.ts` (for requesting access), logic within `src/skills/autoTracker.ts`.
- **Designated Tools:** 
  - `expo-location` (for coordinates + reverse geocoding).
  - `expo-calendar` (for events).
  - `expo-media-library` (for the latest photos).
- **AI Rules:**
  - Must implement smooth progressive permissions during Onboarding. Never crash the app if the user denies permissions.
  - When location is unavailable (web, denied), gracefully return a fallback (e.g., `null` or a descriptive string like "Không có vị trí").
  - On web platform, mark location and background tasks as `unavailable` — do not attempt to request them.

### 2.2. Skill: Background Auto-Worker
- **Description:** The ability to "wake up" automatically to aggregate data without the user opening the app.
- **Location:** `src/skills/autoTracker.ts`.
- **Designated Tools:** `expo-background-fetch` and `expo-task-manager`.
- **AI Rules:**
  - Define a periodic background task (e.g., every 2-4 hours).
  - Upon waking, this task executes **Skill 2.1** (signal collection), groups events into "clusters" (30–60 min windows), generates a draft Entry (`status: 'suggested'`, `mood: 'neutral'`), and saves it to the **Core Database**.
  - On web platform, this skill is disabled (web does not support background fetch).
  - The task must be registered with a unique task name (e.g., `AUTO_DIARY_BACKGROUND_FETCH`).

### 2.3. Skill: AI Suggestion Generation
- **Description:** Analyzing the context (time, location, photo labels) to generate short descriptive text in Vietnamese.
- **Location:** `src/skills/aiService.ts`.
- **Designated Tools:** (Initially) Hard-coded mock logic. (Later) Lightweight LLM APIs (Gemini/OpenAI).
- **AI Rules:**
  - The AI coder must **create a standard interface (Mock Service)** that returns sample text (e.g., "Một sáng yên tĩnh ở quán cà phê quen").
  - Ensure the AI calling logic is decoupled (Dependency Injection / service interface) for easy future integration with real APIs.
  - Generated text must be 1–2 Vietnamese sentences, < 40 words, neutral tone, no psychological analysis.
  - See README.md §4.4 for the full prompt spec and examples.

### 2.4. Skill: Slideshow Playback (Reel)
- **Description:** Creating a "Your Week" review experience similar to TikTok/Reels.
- **AI Rules:**
  - Avoid using heavy mp4 rendering libraries.
  - Use `react-native-reanimated` to present a smooth photo + text slideshow with automatic transitions (auto-advance) after a few seconds.
  - Each slide shows: photo (if available), mood chip, and entry text.
  - Transition style: fade or slide, keeping it calm and journal-like (not flashy).
