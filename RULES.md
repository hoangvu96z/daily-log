# AI Coding Guidelines: Auto Diary App

This file serves as the system rules and context for AI coders working on this repository.

## 1. Project Goal
Build a local-first, privacy-focused automatic diary application for introverts. The app runs silently, collects device signals (photos, location, calendar), and uses AI to suggest diary entries. **Data never leaves the device.**

## 2. Technology Stack (Enforced)
- **Framework**: React Native (Expo)
- **Navigation**: `@react-navigation/native`, `@react-navigation/bottom-tabs`, `@react-navigation/native-stack`
- **State Management**: `zustand` (global state like theme, language)
- **Database**: `expo-sqlite` (for all Entry and Reel data)
- **Security**: `expo-secure-store` (for PIN codes)
- **Background Tasks**: `expo-background-fetch`, `expo-task-manager`
- **UI Components**: `@gorhom/bottom-sheet` (for FAB actions), `react-native-reanimated`

## 3. Architecture & Navigation Rules
- **Bottom Tab Bar**: Must have 4 tabs: `Home`, `Day`, `Reel`, `Me`.
- **FAB**: A central `+` Floating Action Button that overlaps the tab bar and opens a Bottom Sheet (`Add Moment`).
- **File Structure**:
  - `src/navigation/`: AppNavigator, TabNavigator
  - `src/screens/`: Screen components separated by tab (Home, Day, Reel, Me)
  - `src/memory/`: `store.ts` (Zustand), `database.ts` (SQLite), `secureStore.ts`
  - `src/skills/`: `autoTracker.ts` (Background fetch logic), `permissions.ts`, `aiService.ts`

## 4. Implementation Steps & AI Instructions
1. **Mock First**: Whenever implementing AI vision or generation features, ALWAYS hardcode a mock string/stub first before attempting complex API integrations.
2. **Local-first**: Never use cloud databases (like Firebase/Supabase) for storing entries. Everything must go through `src/memory/database.ts`.
3. **Permissions**: Use progressive permission requests. Don't ask for all permissions on boot.
4. **Auto Tracking**: Background tasks must group events into "clusters" (e.g., every 30-60 mins) and generate an Entry with `status = 'suggested'`.
5. **UI/UX**: Prioritize a clean, minimalist design with soft colors (cream background, rounded corners) that feels like a private journal. No social media elements (no share buttons).

**When prompted to build a feature, always check these rules first.**
