# AI Context: Memory & Skills Definitions

This file defines the core concepts of "Memory" (Storage/State) and "Skills" (Actions/Logic) for the AI Coder building the **Auto Diary** app. The AI must understand this architecture to prevent violating the app's privacy-first principles.

---

## 1. MEMORY (Storage & State Definitions)

Because the app strictly adheres to the **"Local-first & Private"** principle, AI Coders are strictly prohibited from using Cloud Database services (Firebase, Supabase, AWS).

**The app's memory is divided into 3 main zones:**

### 1.1. Core Database (Long-term Memory)
- **Designated Tool:** `expo-sqlite` (or `WatermelonDB`).
- **Role:** Permanent storage for diaries (Entries) and data clusters (WeeklyReel).
- **AI Rule:** When creating tables, always store `imageLocalId` instead of Base64 strings to prevent database bloat. Automatically fetched events reside here with `status: 'suggested'`.

### 1.2. Vault (Secure Memory)
- **Designated Tool:** `expo-secure-store`.
- **Role:** The system's "safe". Used to store PIN codes and Face ID/Touch ID configuration flags.
- **AI Rule:** All accesses related to the lock screen (Diary Protection Screen in the Me Tab) must read/write through this module.

### 1.3. Global State (Short-term Memory / UI State)
- **Designated Tool:** `Zustand` (recommended) or `React Context`.
- **Role:** Holds the app's immediate state (Light/Dark Theme, Language, Bottom Sheet visibility, permission status).
- **AI Rule:** Do not use Redux; it is too heavy. All system configuration-related states (Settings) should be synced from `expo-sqlite` or `AsyncStorage/MMKV` to Zustand on app boot.

---

## 2. SKILLS (Action & Logic Definitions)

These are the "skills" the system needs to run silently in the background and assist the user in journaling.

### 2.1. Skill: Signal Tracking
- **Description:** The ability to automatically gather locations, new photos, and calendar events as "raw materials" for diary entries.
- **Designated Tools:** 
  - `expo-location` (for coordinates).
  - `expo-calendar` (for events).
  - `expo-media-library` (for the latest photos).
- **AI Rule:** Must implement smooth progressive permissions during Onboarding. Never crash the app if the user denies permissions.

### 2.2. Skill: Background Auto-Worker
- **Description:** The ability to "wake up" automatically to aggregate data without the user opening the app.
- **Designated Tools:** `expo-background-fetch` and `expo-task-manager`.
- **AI Rule:** Define a periodic background task (e.g., every 2-4 hours). Upon waking, this task executes **Skill 2.1**, groups events into "clusters", generates a draft Entry (`suggested`), and saves it to the **Core Database**.

### 2.3. Skill: AI Suggestion Generation
- **Description:** Analyzing the context (time, location, photo) to generate descriptive text.
- **Designated Tools:** (Temporarily) Hard-coded logic or lightweight LLM APIs.
- **AI Rule:** When implementing this feature, the AI coder must **create a standard interface (Mock Service)** that returns sample text (e.g., "A peaceful morning at the familiar cafe"). Ensure the AI calling logic is decoupled (Dependency Injection) for easy future integration with real Gemini/OpenAI APIs.

### 2.4. Skill: Slideshow Playback (Reel)
- **Description:** Creating a "Your Week" review experience similar to TikTok/Reels.
- **AI Rule:** Avoid using heavy mp4 rendering libraries. Use `react-native-reanimated` to present a smooth photo + text slideshow with automatic transitions (auto-advance) after a few seconds.
