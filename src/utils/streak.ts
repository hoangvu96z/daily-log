import { Entry } from '../types';
import { getLocalDateString } from './dateUtils';

export function calculateStreak(entries: Entry[]): { currentStreak: number; longestStreak: number } {
  if (!entries || entries.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  // Get unique dates that have at least one saved entry
  const savedDates = new Set(
    entries
      .filter((e) => e.status === 'saved')
      .map((e) => e.date)
  );

  const sortedDates = Array.from(savedDates).sort((a, b) => b.localeCompare(a)); // Descending order (newest first)

  if (sortedDates.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  // Calculate current streak
  let currentStreak = 0;
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const todayStr = getLocalDateString(today);
  const yesterdayStr = getLocalDateString(yesterday);

  let checkDate = new Date();
  // If today is not logged, check if yesterday is logged. If neither, streak is 0.
  if (!savedDates.has(todayStr) && !savedDates.has(yesterdayStr)) {
    currentStreak = 0;
  } else {
    // Start from today or yesterday
    if (!savedDates.has(todayStr)) {
      checkDate.setDate(checkDate.getDate() - 1);
    }
    
    while (savedDates.has(getLocalDateString(checkDate))) {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    }
  }

  // Calculate longest streak
  let longestStreak = 0;
  let tempStreak = 1;

  for (let i = 0; i < sortedDates.length - 1; i++) {
    const currentDate = new Date(sortedDates[i]);
    const previousDate = new Date(sortedDates[i + 1]);
    
    // Calculate difference in days
    const diffTime = Math.abs(currentDate.getTime() - previousDate.getTime());
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      tempStreak++;
    } else {
      longestStreak = Math.max(longestStreak, tempStreak);
      tempStreak = 1;
    }
  }
  longestStreak = Math.max(longestStreak, tempStreak);

  // Fallback: longest streak should be at least current streak
  longestStreak = Math.max(longestStreak, currentStreak);

  return { currentStreak, longestStreak };
}
