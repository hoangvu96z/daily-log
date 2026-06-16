import SharedGroupPreferences from 'react-native-shared-group-preferences';
import { Entry } from '../types';

// The App Group ID defined in your Apple Developer account and Xcode settings
const APP_GROUP_ID = 'group.com.hoangvu96z.dailylog';

export async function syncWidgetData(entries: Entry[]) {
  try {
    const savedEntries = entries.filter(e => e.status === 'saved');
    if (savedEntries.length === 0) return;

    // Calculate Streak (Consecutive days up to today)
    const sortedDates = [...new Set(savedEntries.map(e => e.date))].sort((a, b) => b.localeCompare(a));
    let streak = 0;
    
    // Find today's mood (most recent entry of today)
    const todayStr = new Date().toISOString().split('T')[0];
    const todaysEntries = savedEntries.filter(e => e.date === todayStr);
    const latestMood = todaysEntries.length > 0 ? todaysEntries[0].mood : null;

    // A simple streak calculation
    if (sortedDates.length > 0) {
      streak = 1;
      for (let i = 0; i < sortedDates.length - 1; i++) {
        const d1 = new Date(sortedDates[i]);
        const d2 = new Date(sortedDates[i+1]);
        const diffTime = Math.abs(d1.getTime() - d2.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          streak++;
        } else {
          break;
        }
      }
    }

    const widgetData = {
      streak,
      latestMood: latestMood || 'none',
      totalEntries: savedEntries.length,
      lastUpdated: new Date().toISOString()
    };

    // Push data to Shared App Group
    if (SharedGroupPreferences?.setItem) {
      await SharedGroupPreferences.setItem('widgetData', widgetData, APP_GROUP_ID);
      console.log('[Widget] Successfully synced data to shared storage:', widgetData);
    } else {
      console.log('[Widget] SharedGroupPreferences is null (e.g. running in Expo Go / Dev Client without target module)');
    }
  } catch (error) {
    console.warn('[Widget] Failed to sync widget data:', error);
  }
}
