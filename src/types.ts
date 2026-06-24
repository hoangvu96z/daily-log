import { Ionicons } from '@expo/vector-icons';

// === Core Enums ===
export type TabKey = 'home' | 'day' | 'reel' | 'me';
export type Mood = 'very_bad' | 'bad' | 'neutral' | 'good' | 'great';
export type EntryStatus = 'saved' | 'suggested';
export type EntrySource = 'auto' | 'manual';
export type ComposerMode = 'photo' | 'note' | 'calendar' | 'voice';
export type PermissionState = 'unknown' | 'granted' | 'denied' | 'unavailable';
export type ThemeMode = 'system' | 'light' | 'dark';
export type AccentColor = 'navy' | 'sage' | 'ocean' | 'lavender' | 'terracotta' | 'rosepink';
export type MediaType = 'image' | 'video';

export type MediaItem = {
  uri: string;
  type: MediaType;
  width?: number;
  height?: number;
  duration?: number; // For videos
  thumbnailUri?: string; // Extracted cover image for video
};

// === Category ===
export type Category = {
  id: string;
  name: string;
  emoji: string;
  color: string;
  sortOrder: number;
  isDefault: boolean;
};

// === Entry ===
export type Entry = {
  id: string;
  categoryId?: string;       // Foreign key to Category.id
  date: string;              // YYYY-MM-DD
  time: string;              // HH:mm
  mood: Mood;
  text?: string;
  aiSuggestion?: string;
  media?: MediaItem[];       // Array of multiple media items (image/video)
  imageLocalId?: string;     // Legacy
  imageUri?: string;         // Legacy URI for display
  voiceMemoUri?: string;     // URI to local audio file
  voiceMemoDurationMs?: number; // Duration of the voice memo
  locationName?: string;     // Human-readable location name
  locationLat?: number;      // Latitude
  locationLon?: number;      // Longitude
  source: EntrySource;       // 'auto' | 'manual'
  status: EntryStatus;       // 'saved' | 'suggested'
  isHighlight: boolean;
};

// === Settings ===
export type Settings = {
  allowPhotos: boolean;
  allowLocation: boolean;
  allowUsage: boolean;
  allowCalendar: boolean;
  autoTrackingEnabled: boolean;
  photoPermissionStatus?: PermissionState;
  locationPermissionStatus?: PermissionState;
  calendarPermissionStatus?: PermissionState;
  faceIDEnabled: boolean;
  biometricAvailable?: boolean;
  pinEnabled?: boolean;
  pinSet?: boolean;
  theme: ThemeMode;
  accentColor?: AccentColor;
  wallpaperUri?: string;
  language: 'vi' | 'en';
  isPremium: boolean;
  last_auto_scan_time?: string;
  last_auto_scan_stats?: string;
  bgFetch_lastRun?: string;
  bgFetch_successCount?: number;
  bgFetch_failCount?: number;
  // Note: pinCodeHash is stored in expo-secure-store, NOT here
};

// === Weekly Reel ===
export type WeeklyReel = {
  weekId: string;            // e.g. "2026-W18" or display "Tuần 18"
  startDate: string;         // YYYY-MM-DD
  endDate: string;           // YYYY-MM-DD
  dateRange: string;         // Display string e.g. "29.04 - 05.05"
  entryCount: number;
  coverImageId?: string;     // Local photo identifier for cover
  coverTone: string;         // Fallback color when no cover image
  entryIds: string[];        // UUIDs of entries in this reel
};

// === Highlights ===
export type HighlightCollection = {
  id: string;
  title: string;
  coverImageUri?: string;
  entryIds: string[]; // UUIDs of the entries in this highlight
  createdAt: string;
};

// === Composer Draft ===
export type ComposerDraft = {
  mode: ComposerMode;
  media?: MediaItem[];
  imageUri?: string; // Legacy
  voiceMemoUri?: string;
  categoryId?: string;
  locationName?: string;
  locationLat?: number;
  locationLon?: number;
  calendarText?: string;
  calendarEventId?: string;
  prefillDate?: string;
  prefillTime?: string;
};

export type CalendarEventDraft = {
  id: string;
  title: string;
  notes?: string;
  location?: string;
  startDate: string;
  endDate?: string;
};

// === Tab Item ===
export type TabItem = {
  key: TabKey;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
};

// === Navigation ===
export type RootStackParamList = {
  Onboarding: undefined;
  Tabs: undefined;
  PinSetup: {
    mode: 'setup' | 'change' | 'disable';
  };
  Detail: {
    entryId: string;
  };
  Search: undefined;
  Settings: undefined;
  CategoriesSettings: undefined;
  DevDiagnostics: undefined;
};
