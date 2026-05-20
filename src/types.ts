import { Ionicons } from '@expo/vector-icons';

// === Core Enums ===
export type TabKey = 'home' | 'day' | 'reel' | 'me';
export type Mood = 'very_bad' | 'bad' | 'neutral' | 'good' | 'great';
export type EntryStatus = 'saved' | 'suggested';
export type EntrySource = 'auto' | 'manual';
export type ComposerMode = 'photo' | 'note' | 'calendar';
export type PermissionState = 'unknown' | 'granted' | 'denied' | 'unavailable';
export type ThemeMode = 'system' | 'light' | 'dark';
export type AccentColor = 'navy' | 'sage' | 'ocean' | 'lavender' | 'terracotta';

// === Entry ===
export type Entry = {
  id: string;
  date: string;              // YYYY-MM-DD
  time: string;              // HH:mm
  mood: Mood;
  text?: string;
  aiSuggestion?: string;
  imageLocalId?: string;     // Local photo identifier
  imageUri?: string;         // URI for display
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

// === Composer Draft ===
export type ComposerDraft = {
  mode: ComposerMode;
  imageUri?: string;
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
