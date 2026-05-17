import { Entry, Mood, Settings, TabItem, WeeklyReel } from '../types';
import { palette } from '../theme/palette';

export const initialEntries: Entry[] = [
  {
    id: '1',
    date: '2026-05-16',
    time: '07:12',
    mood: 'good',
    text: 'Cà phê sáng ở quán quen trước khi bắt đầu làm việc.',
    imageLocalId: 'coffee',
    locationName: 'Quán cà phê',
    source: 'auto',
    status: 'saved',
    isHighlight: true,
  },
  {
    id: '2',
    date: '2026-05-16',
    time: '09:17',
    mood: 'neutral',
    text: 'Một buổi sáng tập trung sửa lỗi và dọn lại backlog.',
    imageLocalId: 'desk',
    source: 'auto',
    status: 'saved',
    isHighlight: true,
  },
  {
    id: '3',
    date: '2026-05-16',
    time: '18:42',
    mood: 'great',
    text: 'Đi dạo tối, trời mát và đường khá yên.',
    imageLocalId: 'walk',
    locationName: 'Công viên',
    source: 'auto',
    status: 'saved',
    isHighlight: true,
  },
  {
    id: '4',
    date: '2026-05-17',
    time: '08:05',
    mood: 'neutral',
    text: 'Ly cà phê sáng và laptop mở sẵn, chuẩn bị cho một ngày mới.',
    imageLocalId: 'laptop',
    locationName: 'Nhà',
    source: 'auto',
    status: 'suggested',
    isHighlight: false,
  },
  {
    id: '5',
    date: '2026-05-17',
    time: '12:24',
    mood: 'good',
    text: 'Bữa trưa nhẹ, tạm rời màn hình một lúc.',
    source: 'auto',
    status: 'saved',
    isHighlight: false,
  },
];

export const initialSettings: Settings = {
  allowPhotos: true,
  allowLocation: false,
  allowUsage: true,
  allowCalendar: false,
  faceIDEnabled: false,
  theme: 'system',
  language: 'vi',
};

export const weeklyReels: WeeklyReel[] = [
  { weekId: 'Tuần 18', dateRange: '29.04 - 05.05', entryCount: 12, coverTone: palette.green },
  { weekId: 'Tuần 17', dateRange: '22.04 - 28.04', entryCount: 9, coverTone: palette.blue },
  { weekId: 'Tuần 16', dateRange: '15.04 - 21.04', entryCount: 15, coverTone: palette.coral },
];

export const moodLabels: Record<Mood, string> = {
  very_bad: 'Tệ',
  bad: 'Chậm',
  neutral: 'Bình thường',
  good: 'Ổn',
  great: 'Tuyệt',
};

export const moodOptions: Array<{ value: Mood; label: string }> = [
  { value: 'very_bad', label: 'Tệ' },
  { value: 'neutral', label: 'Bình thường' },
  { value: 'good', label: 'Ổn' },
  { value: 'great', label: 'Tuyệt' },
];

export const tabItems: TabItem[] = [
  { key: 'home', label: 'Home', icon: 'home-outline' },
  { key: 'day', label: 'Ngày', icon: 'calendar-outline' },
  { key: 'reel', label: 'Reel', icon: 'play-circle-outline' },
  { key: 'me', label: 'Me', icon: 'person-outline' },
];
