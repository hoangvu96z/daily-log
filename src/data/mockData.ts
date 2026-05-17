import { Mood, Settings, TabItem } from '../types';

// === Default Settings (empty state) ===
export const defaultSettings: Settings = {
  allowPhotos: false,
  allowLocation: false,
  allowUsage: false,
  allowCalendar: false,
  faceIDEnabled: false,
  theme: 'system',
  language: 'vi',
};

// === Mood Emoji & Labels ===

export const moodEmoji: Record<Mood, string> = {
  very_bad: '😞',
  bad: '😐',
  neutral: '🙂',
  good: '😊',
  great: '🤩',
};

export const moodLabels: Record<Mood, string> = {
  very_bad: 'Tệ',
  bad: 'Chậm',
  neutral: 'Bình thường',
  good: 'Ổn',
  great: 'Tuyệt',
};

// All 5 moods with emoji
export const moodOptions: Array<{ value: Mood; label: string; emoji: string }> = [
  { value: 'very_bad', label: 'Tệ', emoji: '😞' },
  { value: 'bad', label: 'Chậm', emoji: '😐' },
  { value: 'neutral', label: 'Bình thường', emoji: '🙂' },
  { value: 'good', label: 'Ổn', emoji: '😊' },
  { value: 'great', label: 'Tuyệt', emoji: '🤩' },
];

// === Tab Items ===
export const tabItems: TabItem[] = [
  { key: 'home', label: 'Home', icon: 'home-outline' },
  { key: 'day', label: 'Ngày', icon: 'calendar-outline' },
  { key: 'reel', label: 'Reel', icon: 'play-circle-outline' },
  { key: 'me', label: 'Me', icon: 'person-outline' },
];
