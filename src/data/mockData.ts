import { Mood, Settings, TabItem } from '../types';

export const defaultSettings: Settings = {
  allowPhotos: false,
  allowLocation: false,
  allowUsage: false,
  allowCalendar: false,
  autoTrackingEnabled: false,
  faceIDEnabled: false,
  pinEnabled: false,
  pinSet: false,
  theme: 'light',
  accentColor: 'navy',
  wallpaperUri: undefined,
  language: 'vi',
  isPremium: false,
};

export const moodEmoji: Record<Mood, any> = {
  very_bad: 'emoticon-cry-outline',
  bad: 'emoticon-sad-outline',
  neutral: 'emoticon-neutral-outline',
  good: 'emoticon-happy-outline',
  great: 'emoticon-excited-outline',
};

export const moodLabels: Record<Mood, string> = {
  very_bad: 'Tệ',
  bad: 'Chậm',
  neutral: 'Bình thường',
  good: 'Ổn',
  great: 'Tuyệt',
};

export const moodOptions: Array<{ value: Mood; label: string; emoji: any }> = [
  { value: 'very_bad', label: 'Tệ', emoji: 'emoticon-cry-outline' },
  { value: 'bad', label: 'Chậm', emoji: 'emoticon-sad-outline' },
  { value: 'neutral', label: 'Bình thường', emoji: 'emoticon-neutral-outline' },
  { value: 'good', label: 'Ổn', emoji: 'emoticon-happy-outline' },
  { value: 'great', label: 'Tuyệt', emoji: 'emoticon-excited-outline' },
];

export const tabItems: TabItem[] = [
  { key: 'home', label: 'Home', icon: 'home-outline' },
  { key: 'day', label: 'Ngày', icon: 'calendar-outline' },
  { key: 'reel', label: 'Reel', icon: 'play-circle-outline' },
  { key: 'me', label: 'Me', icon: 'person-outline' },
];
