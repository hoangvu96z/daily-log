import { Ionicons } from '@expo/vector-icons';

export type TabKey = 'home' | 'day' | 'reel' | 'me';
export type Mood = 'very_bad' | 'bad' | 'neutral' | 'good' | 'great';
export type EntryStatus = 'saved' | 'suggested';
export type EntrySource = 'auto' | 'manual';
export type ComposerMode = 'photo' | 'note' | 'calendar';

export type Entry = {
  id: string;
  date: string;
  time: string;
  mood: Mood;
  text?: string;
  aiSuggestion?: string;
  imageLocalId?: string;
  imageUri?: string;
  locationName?: string;
  source: EntrySource;
  status: EntryStatus;
  isHighlight: boolean;
};

export type Settings = {
  allowPhotos: boolean;
  allowLocation: boolean;
  allowUsage: boolean;
  allowCalendar: boolean;
  photoPermissionStatus?: PermissionState;
  locationPermissionStatus?: PermissionState;
  faceIDEnabled: boolean;
  biometricAvailable?: boolean;
  theme: 'system' | 'light' | 'dark';
  language: 'vi' | 'en';
};

export type PermissionState = 'unknown' | 'granted' | 'denied' | 'unavailable';

export type ComposerDraft = {
  mode: ComposerMode;
  imageUri?: string;
  locationName?: string;
  calendarText?: string;
};

export type WeeklyReel = {
  weekId: string;
  dateRange: string;
  entryCount: number;
  coverTone: string;
};

export type TabItem = {
  key: TabKey;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
};
