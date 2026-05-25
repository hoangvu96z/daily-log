import { Entry, WeeklyReel } from '../types';
import { getLocalDateString } from '../utils/dateUtils';
import { insertReel } from '../memory/database';

function getISOWeekBounds(dateStr: string) {
  const d = new Date(`${dateStr}T12:00:00`);
  const day = d.getDay() || 7; // 1 (Mon) to 7 (Sun)
  
  const start = new Date(d.getTime());
  start.setDate(d.getDate() - day + 1); // Monday
  
  const end = new Date(d.getTime());
  end.setDate(d.getDate() - day + 7); // Sunday
  
  return { start, end };
}

function getISOWeek(d: Date) {
  const date = new Date(d.getTime());
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
  const week1 = new Date(date.getFullYear(), 0, 4);
  return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
}

function getWeekIdentifier(dateStr: string) {
  const { start, end } = getISOWeekBounds(dateStr);
  const weekNumber = getISOWeek(start);
  return {
    weekId: `${start.getFullYear()}-W${String(weekNumber).padStart(2, '0')}`,
    start,
    end
  };
}

export async function generateWeeklyReels(entries: Entry[]): Promise<WeeklyReel[]> {
  const grouped = new Map<string, { entries: Entry[], start: Date, end: Date }>();
  
  for (const entry of entries) {
    if (entry.status !== 'saved') continue;
    
    const { weekId, start, end } = getWeekIdentifier(entry.date);
    if (!grouped.has(weekId)) {
      grouped.set(weekId, { entries: [], start, end });
    }
    grouped.get(weekId)!.entries.push(entry);
  }

  const moodTones: Record<string, string> = {
    great: '#8E24AA',   // vibrant purple
    good: '#1E88E5',    // bright blue
    neutral: '#43A047', // calm green
    bad: '#FB8C00',     // orange
    very_bad: '#E53935',// red
  };

  const newReels: WeeklyReel[] = [];

  for (const [weekId, weekData] of grouped.entries()) {
    const weekEntries = weekData.entries;
    if (weekEntries.length === 0) continue;

    let coverImageId: string | undefined;
    let coverTone = '#cbe4d6'; // Default calming green fallback
    
    // Find cover image: prioritize 'great'/'good' mood with image
    const entriesWithImage = weekEntries.filter(e => e.imageUri);
    const bestImageEntry = entriesWithImage.find(e => e.mood === 'great' || e.mood === 'good') || entriesWithImage[0];
    
    if (bestImageEntry) {
      coverImageId = bestImageEntry.imageUri;
    }

    // Find best tone based on overall best mood
    const bestMoodEntry = weekEntries.find(e => e.mood === 'great') 
      || weekEntries.find(e => e.mood === 'good') 
      || weekEntries.find(e => e.mood === 'neutral') 
      || weekEntries[0];

    if (bestMoodEntry) {
      coverTone = moodTones[bestMoodEntry.mood] || coverTone;
    }

    const { start, end } = weekData;
    
    const formatDate = (d: Date) => getLocalDateString(d);
    const formatDisplay = (d: Date) => `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}`;
    
    // Sort chronological for playback
    const sortedEntries = weekEntries.sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));

    const reel: WeeklyReel = {
      weekId,
      startDate: formatDate(start),
      endDate: formatDate(end),
      dateRange: `${formatDisplay(start)} - ${formatDisplay(end)}`,
      entryCount: sortedEntries.length,
      coverImageId,
      coverTone,
      entryIds: sortedEntries.map(e => e.id)
    };

    newReels.push(reel);
    await insertReel(reel);
  }

  // Sort reels descending
  return newReels.sort((a, b) => b.weekId.localeCompare(a.weekId));
}
