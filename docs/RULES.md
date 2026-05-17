# AI Coding Guidelines: Auto Diary App

This file serves as the system rules and context for AI coders working on this repository.

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

## 3. Architecture & File Structure

```
src/
├── navigation/                     # Navigation setup
│   ├── AppNavigator.tsx            # Root navigator (auth gate → tab navigator)
│   └── TabNavigator.tsx            # Bottom tabs + FAB
├── screens/                        # Screen components
│   ├── HomeScreen.tsx              # Tab 1: Yesterday summary
│   ├── DayScreen.tsx               # Tab 2: Timeline
│   ├── ReelScreen.tsx              # Tab 3: Weekly Reel + Year Ago
│   └── MeScreen.tsx                # Tab 4: Settings
├── components/                     # Reusable UI components
│   ├── AddMomentSheet.tsx          # Bottom sheet for FAB
│   ├── MomentComposer.tsx          # New Moment full-screen form
│   ├── BottomTabs.tsx              # Custom tab bar UI
│   ├── ImagePlaceholder.tsx        # Photo thumbnail / placeholder
│   └── ScreenHeader.tsx            # Reusable header
├── memory/                         # Storage & State ("Memory" layer)
│   ├── store.ts                    # Zustand store (global state)
│   ├── database.ts                 # SQLite operations (CRUD for Entry, WeeklyReel)
│   └── secureStore.ts              # expo-secure-store wrapper (PIN, biometrics)
├── skills/                         # Background logic ("Skills" layer)
│   ├── autoTracker.ts              # Background fetch + signal collection + clustering
│   ├── permissions.ts              # Progressive permission requests
│   └── aiService.ts                # AI suggestion interface (mock → real API)
├── data/
│   └── mockData.ts                 # Initial/sample data for development
├── services/
│   └── imagePicker.ts              # expo-image-picker wrapper
├── theme/
│   └── palette.ts                  # Color constants
├── styles.ts                       # All StyleSheet definitions
└── types.ts                        # TypeScript types (Entry, Settings, etc.)
```

### Architecture Rules
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

### 4.4. Auto Tracking
Background tasks must:
1. Collect signals (photos, location, calendar events).
2. Group events into "clusters" (30–60 min windows).
3. Generate an Entry with `status = 'suggested'` and `mood = 'neutral'`.
4. Save to SQLite via `src/memory/database.ts`.

### 4.5. UI/UX Principles
- Prioritize a clean, minimalist design with soft colors (cream background, rounded corners) that feels like a private journal.
- No social media elements (no share buttons, no feeds, no likes).
- Mood chips should include emoji: `😞 Tệ`, `😐 Bình thường`, `🙂 Ổn`, `😊 Vui`, `🤩 Tuyệt`.
- Vietnamese is the primary language. English as secondary.

### 4.6. Web Platform
- Web is demo-only. Background fetch, location, and biometrics are unavailable on web.
- Skills that depend on native APIs must check `Platform.OS` and gracefully skip on web.

### 4.7. Error Handling
- Never let the app crash due to a denied permission or unavailable API.
- All async operations should have try/catch with meaningful fallback behavior.

---

**When prompted to build a feature, always check these rules first.**
