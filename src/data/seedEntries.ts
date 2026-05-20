/**
 * Seed Data — First-Run Demo Entries
 *
 * Creates 3 sample entries for today so new users immediately understand
 * the auto-journal concept. Entries use `source: 'auto', status: 'suggested'`
 * to demonstrate the Lưu/Bỏ flow.
 *
 * Seed entries have IDs starting with 'seed-' so they can be identified
 * and cleaned up when the user creates their first real entry.
 */

import { Entry } from '../types';

const SEED_PREFIX = 'seed-';

/**
 * Check if an entry is a seed/demo entry.
 */
export function isSeedEntry(entry: Entry): boolean {
  return entry.id.startsWith(SEED_PREFIX);
}

/**
 * Generate seed entries for today to demo the auto-journal concept.
 * Returns 3 entries: morning, afternoon, evening — each with different moods.
 */
export function generateSeedEntries(language: 'vi' | 'en' = 'vi'): Entry[] {
  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);
  
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().slice(0, 10);

  const seeds: { vi: Omit<Entry, 'id'>[]; en: Omit<Entry, 'id'>[] } = {
    vi: [
      {
        date: yesterdayStr,
        time: '07:30',
        mood: 'good',
        text: 'Thức dậy, pha một ly cà phê và ngồi nhìn ra cửa sổ. Buổi sáng thật yên.',
        aiSuggestion: 'Một buổi sáng bắt đầu nhẹ nhàng với cà phê và khoảng lặng riêng.',
        source: 'auto',
        status: 'suggested',
        isHighlight: true,
        imageUri: 'https://images.unsplash.com/photo-1507133750040-4a8f57021571?w=500&auto=format&fit=crop&q=60',
        imageLocalId: 'photo-coffee',
        locationName: 'Nhà',
      },
      {
        date: yesterdayStr,
        time: '12:15',
        mood: 'neutral',
        text: 'Ăn trưa xong, đi dạo một vòng quanh công viên gần công ty.',
        aiSuggestion: 'Giữa ngày bận rộn, vẫn dành thời gian cho một vòng đi dạo ngắn.',
        source: 'auto',
        status: 'suggested',
        isHighlight: true,
        imageUri: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=500&auto=format&fit=crop&q=60',
        imageLocalId: 'photo-park',
        locationName: 'Công viên Lê Văn Tám',
      },
      {
        date: todayStr,
        time: '20:30',
        mood: 'great',
        text: 'Đi ăn tối với bạn bè, cười nhiều quá. Một ngày kết thúc vui vẻ.',
        aiSuggestion: 'Buổi tối ấm áp bên bạn bè, đủ để nhớ lại sau này.',
        source: 'auto',
        status: 'suggested',
        isHighlight: false,
        imageUri: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500&auto=format&fit=crop&q=60',
        imageLocalId: 'photo-dinner',
        locationName: 'Quận 1',
      },
    ],
    en: [
      {
        date: yesterdayStr,
        time: '07:30',
        mood: 'good',
        text: 'Woke up, brewed coffee, and watched the morning light through the window.',
        aiSuggestion: 'A quiet morning start with coffee and a moment of stillness.',
        source: 'auto',
        status: 'suggested',
        isHighlight: true,
        imageUri: 'https://images.unsplash.com/photo-1507133750040-4a8f57021571?w=500&auto=format&fit=crop&q=60',
        imageLocalId: 'photo-coffee',
        locationName: 'Home',
      },
      {
        date: yesterdayStr,
        time: '12:15',
        mood: 'neutral',
        text: 'Lunch break — walked around the park near the office.',
        aiSuggestion: 'A short walk in the middle of a busy day, just enough to reset.',
        source: 'auto',
        status: 'suggested',
        isHighlight: true,
        imageUri: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=500&auto=format&fit=crop&q=60',
        imageLocalId: 'photo-park',
        locationName: 'Central Park',
      },
      {
        date: todayStr,
        time: '20:30',
        mood: 'great',
        text: 'Dinner with friends, lots of laughing. A good day all around.',
        aiSuggestion: 'A warm evening with friends, the kind of moment worth keeping.',
        source: 'auto',
        status: 'suggested',
        isHighlight: false,
        imageUri: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500&auto=format&fit=crop&q=60',
        imageLocalId: 'photo-dinner',
        locationName: 'Downtown',
      },
    ],
  };

  return seeds[language].map((entry, index) => ({
    ...entry,
    id: `${SEED_PREFIX}${index + 1}`,
  })) as Entry[];
}
