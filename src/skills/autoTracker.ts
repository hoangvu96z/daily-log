import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import { Platform } from 'react-native';
import * as MediaLibrary from 'expo-media-library';

export function uuidv4(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    return [...bytes].map((b, i) =>
      [4, 6, 8, 10].includes(i) ? `-${b.toString(16).padStart(2, '0')}` : b.toString(16).padStart(2, '0')
    ).join('');
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

import { getAllEntries, insertEntry, saveSetting, loadSettings } from '../memory/database';
import { Entry } from '../types';
import { aiService } from './aiService';
import { useJournalStore } from '../memory/store';
import { CalendarSignal, getCalendarSignals } from './calendar';
import { LocationSignal, getLocationSignals } from './location';

const TASK_NAME = 'AUTO_DIARY_BACKGROUND_FETCH';

// === Period Helper ===

/**
 * Returns the time-of-day period in the app's display language.
 * Used to generate contextually appropriate AI suggestions.
 */
export function getPeriod(date: Date, lang: 'vi' | 'en' = 'vi'): string {
  const h = date.getHours();
  if (lang === 'en') {
    if (h >= 5 && h < 10) return 'morning';
    if (h >= 10 && h < 13) return 'lunch';
    if (h >= 13 && h < 18) return 'afternoon';
    if (h >= 18 && h < 22) return 'evening';
    return 'night';
  }
  // Vietnamese
  if (h >= 5 && h < 10) return 'sáng';
  if (h >= 10 && h < 13) return 'trưa';
  if (h >= 13 && h < 18) return 'chiều';
  if (h >= 18 && h < 22) return 'tối';
  return 'đêm';
}

export interface PhotoSignal {
  type: 'photo';
  time: Date;
  imageUri: string;
  imageId: string;
}

export type BaseSignal = PhotoSignal | LocationSignal | CalendarSignal;

// === Pipeline: Build & Cluster ===

export async function buildSignals(lastScanTime: number): Promise<BaseSignal[]> {
  const signals: BaseSignal[] = [];

  try {
    const { status: mediaStatus } = await MediaLibrary.getPermissionsAsync();
    if (mediaStatus === 'granted') {
      const createdAfter = Math.max(lastScanTime, Date.now() - 48 * 60 * 60 * 1000); // 48 hours
      const recentPhotos = await MediaLibrary.getAssetsAsync({
        mediaType: 'photo',
        createdAfter,
        first: 50,
        sortBy: ['creationTime'],
      });

      for (const asset of recentPhotos.assets) {
        signals.push({
          type: 'photo',
          time: new Date(asset.creationTime),
          imageUri: asset.uri,
          imageId: asset.id,
        });
      }
    }
  } catch (e) {
    console.warn('[AutoTracker] Could not get media assets:', e);
  }

  const locSignals = await getLocationSignals();
  signals.push(...locSignals);

  const calSignals = await getCalendarSignals();
  signals.push(...calSignals);

  return signals;
}

export function clusterSignals(signals: BaseSignal[]): BaseSignal[][] {
  const getSignalTime = (s: BaseSignal): number => {
    if (s.type === 'calendar') return s.start.getTime() + (s.end.getTime() - s.start.getTime()) / 2;
    return s.time.getTime();
  };

  signals.sort((a, b) => getSignalTime(a) - getSignalTime(b));

  const clusters: BaseSignal[][] = [];
  let currentCluster: BaseSignal[] = [];
  const WINDOW_MS = 90 * 60 * 1000; // 90 minutes

  for (const signal of signals) {
    if (currentCluster.length === 0) {
      currentCluster.push(signal);
    } else {
      const firstSignalTime = getSignalTime(currentCluster[0]);
      if (getSignalTime(signal) - firstSignalTime <= WINDOW_MS) {
        currentCluster.push(signal);
      } else {
        clusters.push(currentCluster);
        currentCluster = [signal];
      }
    }
  }
  if (currentCluster.length > 0) {
    clusters.push(currentCluster);
  }

  return clusters;
}

async function processClustersAndSave(clusters: BaseSignal[][]): Promise<number> {
  const allEntries = await getAllEntries();
  let created = 0;

  for (const cluster of clusters) {
    if (cluster.length === 0) continue;

    const getSignalTime = (s: BaseSignal): number => {
      if (s.type === 'calendar') return s.start.getTime() + (s.end.getTime() - s.start.getTime()) / 2;
      return s.time.getTime();
    };

    const avgTime = cluster.reduce((sum, s) => sum + getSignalTime(s), 0) / cluster.length;
    const clusterDate = new Date(avgTime);
    const dateStr = clusterDate.toISOString().split('T')[0];
    const timeStr = clusterDate.toTimeString().substring(0, 5); // HH:mm

    // Only check SAVED entries — dismissed (discarded) suggestions should not
    // block new suggestions from appearing in the same time window.
    const hasDuplicate = allEntries.filter(e => e.status === 'saved').some((entry) => {
      if (entry.date !== dateStr) return false;
      const [h, m] = entry.time.split(':').map(Number);
      const entryTime = new Date(clusterDate);
      entryTime.setHours(h, m, 0, 0);
      return Math.abs(entryTime.getTime() - avgTime) / (1000 * 60 * 60) < 1.5;
    });

    // Also skip if there's ALREADY a suggested entry in the same window
    // (avoids duplicate suggestions before user decides)
    const hasPendingSuggestion = allEntries.filter(e => e.status === 'suggested').some((entry) => {
      if (entry.date !== dateStr) return false;
      const [h, m] = entry.time.split(':').map(Number);
      const entryTime = new Date(clusterDate);
      entryTime.setHours(h, m, 0, 0);
      return Math.abs(entryTime.getTime() - avgTime) / (1000 * 60 * 60) < 1.5;
    });

    if (hasDuplicate || hasPendingSuggestion) {
      console.log(`[AutoTracker] Skipping cluster at ${dateStr} ${timeStr} due to existing entry`);
      continue;
    }

    const photos = cluster.filter((s): s is PhotoSignal => s.type === 'photo');
    const locs = cluster.filter((s): s is LocationSignal => s.type === 'location');
    const calendars = cluster.filter((s): s is CalendarSignal => s.type === 'calendar');

    const mainPhoto = photos.length > 0 ? photos[Math.floor(photos.length / 2)] : null;
    const mainLoc = locs.length > 0 ? locs[0] : null;
    const mainCal = calendars.length > 0 ? calendars[0] : null;

    const locationName = mainLoc?.locationName || mainCal?.locationName || undefined;
    const calendarTitle = mainCal?.title || undefined;

    const settings = await loadSettings();
    const lang: 'vi' | 'en' = settings.language === 'en' ? 'en' : 'vi';
    const period = getPeriod(clusterDate, lang);

    let suggestionText = await aiService.generateSuggestion({
      mode: mainPhoto ? 'photo' : 'note',
      mood: 'neutral',
      time: timeStr,
      period,
      locationName,
      calendarText: calendarTitle,
      lang,
    });

    // Fallback if AI doesn't incorporate the calendar event
    if (calendarTitle && suggestionText.includes('Hôm nay có gì')) {
      suggestionText = `Sự kiện lịch: ${calendarTitle}`;
    }

    const newEntry: Entry = {
      id: uuidv4(),
      date: dateStr,
      time: timeStr,
      mood: 'neutral',
      source: 'auto',
      status: 'suggested',
      text: suggestionText,
      aiSuggestion: suggestionText,
      imageLocalId: mainPhoto?.imageId,
      imageUri: mainPhoto?.imageUri,
      locationName,
      locationLat: mainLoc?.latitude,
      locationLon: mainLoc?.longitude,
      isHighlight: false,
    };

    await insertEntry(newEntry);
    // ⚠️ Crucial: update allEntries in-place so subsequent clusters in this
    // same run can detect this newly-created entry and avoid duplicates.
    allEntries.push(newEntry);
    created++;
    console.log(`[AutoTracker] Created suggestion for ${dateStr} ${timeStr}`);
  }
  return created;
}

// === Task Definitions ===

export async function runAutoTrackerOnce(): Promise<{ newEntries: number, photosScanned: number } | void> {
  console.log('[AutoTracker] runAutoTrackerOnce executed at', new Date().toISOString());

  if (Platform.OS === 'web') return;

  const dbSettings = await loadSettings();
  if (!dbSettings.autoTrackingEnabled) {
    console.log('[AutoTracker] Auto-tracking is disabled. Skipping.');
    return;
  }

  const { status: mediaStatus } = await MediaLibrary.getPermissionsAsync();
  if (mediaStatus !== 'granted') {
    console.log('[AutoTracker] Missing photo permissions. Skipping.');
    return;
  }

  const lastScanTimeStr = dbSettings['last_auto_scan_time'] as string;
  const lastScanTime = lastScanTimeStr ? Number(lastScanTimeStr) : 0;

  const signals = await buildSignals(lastScanTime);
  const photosScanned = signals.filter(s => s.type === 'photo').length;
  const clusters = clusterSignals(signals);
  
  const created = await processClustersAndSave(clusters);
  
  const nowStr = Date.now().toString();
  const statsStr = JSON.stringify({ new_suggestions: created, photos_scanned: photosScanned });
  
  await saveSetting('last_auto_scan_time', nowStr);
  await saveSetting('last_auto_scan_stats', statsStr);
  
  // Try to update store if it's initialized (in foreground)
  try {
    const store = useJournalStore.getState();
    if (store.hydrated) {
      store.updateSettings('last_auto_scan_time', nowStr);
      store.updateSettings('last_auto_scan_stats', statsStr);
    }
  } catch (e) {
    // Ignore, running in background where UI store might not be available
  }
  
  return { newEntries: created, photosScanned };
}

TaskManager.defineTask(TASK_NAME, async () => {
  try {
    console.log('[AutoTracker] Background task executed at', new Date().toISOString());
    await runAutoTrackerOnce();
    
    const settings = await loadSettings();
    const successCount = Number(settings['bgFetch_successCount'] || 0) + 1;
    await saveSetting('bgFetch_successCount', successCount.toString());
    await saveSetting('bgFetch_lastRun', new Date().toISOString());
    
    try {
      const store = useJournalStore.getState();
      if (store.hydrated) store.updateSettings('bgFetch_successCount', successCount);
    } catch (e) {}

    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch (error) {
    console.error('[AutoTracker] Background task failed:', error);
    
    const settings = await loadSettings();
    const failCount = Number(settings['bgFetch_failCount'] || 0) + 1;
    await saveSetting('bgFetch_failCount', failCount.toString());
    
    try {
      const store = useJournalStore.getState();
      if (store.hydrated) store.updateSettings('bgFetch_failCount', failCount);
    } catch (e) {}

    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

// === Registration ===

export async function registerAutoTracker(): Promise<void> {
  if (Platform.OS === 'web') return;
  try {
    const isRegistered = await TaskManager.isTaskRegisteredAsync(TASK_NAME);
    if (isRegistered) return;
    await BackgroundFetch.registerTaskAsync(TASK_NAME, {
      minimumInterval: 2 * 60 * 60,
      stopOnTerminate: false,
      startOnBoot: true,
    });
  } catch (error) {
    console.error('[AutoTracker] Failed to register task:', error);
  }
}

export async function unregisterAutoTracker(): Promise<void> {
  if (Platform.OS === 'web') return;
  try {
    const isRegistered = await TaskManager.isTaskRegisteredAsync(TASK_NAME);
    if (isRegistered) await BackgroundFetch.unregisterTaskAsync(TASK_NAME);
  } catch (error) {
    console.error('[AutoTracker] Failed to unregister task:', error);
  }
}

export async function isAutoTrackerRegistered(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  try { return await TaskManager.isTaskRegisteredAsync(TASK_NAME); } catch { return false; }
}

export async function getAutoTrackerStatus(): Promise<BackgroundFetch.BackgroundFetchStatus | null> {
  if (Platform.OS === 'web') return null;
  try { return await BackgroundFetch.getStatusAsync(); } catch { return null; }
}

export async function refreshAutoSuggestions(): Promise<number> {
  if (Platform.OS === 'web') return 0;
  try {
    const settings = await loadSettings();
    if (!settings.autoTrackingEnabled) return 0;
    
    const { status: mediaStatus } = await MediaLibrary.getPermissionsAsync();
    if (mediaStatus !== 'granted') return 0;

    const lastScanTimeStr = settings['last_auto_scan_time'] as string;
    const lastScanTime = lastScanTimeStr ? Number(lastScanTimeStr) : 0;

    const signals = await buildSignals(lastScanTime);
    if (signals.length === 0) return 0;
    const photosScanned = signals.filter(s => s.type === 'photo').length;

    const clusters = clusterSignals(signals);
    const created = await processClustersAndSave(clusters);

    const nowStr = Date.now().toString();
    const statsStr = JSON.stringify({ new_suggestions: created, photos_scanned: photosScanned });
    
    await saveSetting('last_auto_scan_time', nowStr);
    await saveSetting('last_auto_scan_stats', statsStr);
    
    useJournalStore.getState().updateSettings('last_auto_scan_time', nowStr);
    useJournalStore.getState().updateSettings('last_auto_scan_stats', statsStr);
    
    return created;
  } catch (error) {
    console.error('[AutoTracker:Foreground] refreshAutoSuggestions failed:', error);
    return 0;
  }
}

export async function ensureAutoTrackerFreshness(): Promise<void> {
  if (Platform.OS === 'web') return;
  try {
    const settings = useJournalStore.getState().settings;
    if (!settings.autoTrackingEnabled) return;

    const lastScanTimeStr = settings.last_auto_scan_time as string;
    const lastScanTime = lastScanTimeStr ? Number(lastScanTimeStr) : 0;
    const now = Date.now();

    const fourHoursMs = 4 * 60 * 60 * 1000;
    const lastScanDateStr = new Date(lastScanTime).toDateString();
    const nowDateStr = new Date(now).toDateString();
    
    if (now - lastScanTime > fourHoursMs || lastScanDateStr !== nowDateStr) {
      console.log('[AutoTracker] Freshness check failed (>4h or different day). Triggering background run from foreground.');
      await useJournalStore.getState().updateSettings('last_auto_scan_time', now.toString());
      await runAutoTrackerOnce();
    }
  } catch (error) {
    console.error('[AutoTracker] ensureAutoTrackerFreshness error:', error);
  }
}
