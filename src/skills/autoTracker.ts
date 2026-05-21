/**
 * Background Auto-Tracker Skill
 *
 * Responsible for periodically collecting device signals (photos, location, calendar)
 * and generating suggested diary entries.
 *
 * Uses expo-background-fetch + expo-task-manager for periodic background execution.
 */

import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import { Platform } from 'react-native';
import * as MediaLibrary from 'expo-media-library';
import * as Location from 'expo-location';
/** Cross-platform UUID v4 — works on web, iOS, and Android without external package. */
export function uuidv4(): string {
  // crypto.randomUUID() is available in React Native 0.70+ and modern browsers
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  // Fallback using crypto.getRandomValues
  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    return [...bytes].map((b, i) =>
      [4, 6, 8, 10].includes(i) ? `-${b.toString(16).padStart(2, '0')}` : b.toString(16).padStart(2, '0')
    ).join('');
  }
  // Last resort: Math.random-based
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}
import { getAllEntries, insertEntry, saveSetting, loadSettings } from '../memory/database';
import { Entry } from '../types';
import { aiService } from './aiService';

const TASK_NAME = 'AUTO_DIARY_BACKGROUND_FETCH';

interface Signal {
  type: 'photo' | 'location';
  timestamp: number;
  data: any;
}

interface Cluster {
  startTime: number;
  endTime: number;
  signals: Signal[];
}

// === Task Definition ===

export async function runAutoTrackerOnce(): Promise<void> {
  console.log('[AutoTracker] runAutoTrackerOnce executed at', new Date().toISOString());

  // 1 & 2: Collect Signals
  const signals: Signal[] = [];

  // Photos from the last 24 hours
  try {
    const { status: mediaStatus } = await MediaLibrary.getPermissionsAsync();
    if (mediaStatus === 'granted') {
      const settings = await loadSettings();
      const lastScanTimeStr = settings['last_auto_scan_time'] as string;
      const lastScanTime = lastScanTimeStr ? Number(lastScanTimeStr) : 0;
      
      const yesterday = Date.now() - 24 * 60 * 60 * 1000;
      const createdAfter = Math.max(lastScanTime, yesterday);

      const recentPhotos = await MediaLibrary.getAssetsAsync({
        mediaType: 'photo',
        createdAfter,
        first: 50,
        sortBy: ['creationTime'],
      });
      
      for (const asset of recentPhotos.assets) {
        signals.push({
          type: 'photo',
          timestamp: asset.creationTime,
          data: asset,
        });
      }
    }
  } catch (e) {
    console.warn('[AutoTracker] Could not get media assets:', e);
  }

  // Current Location
  let hasLocationPerm = false;
  try {
    const fg = await Location.getForegroundPermissionsAsync();
    const bg = await Location.getBackgroundPermissionsAsync();
    hasLocationPerm = fg.granted || bg.granted;
  } catch (e) {
    // ignore
  }

  if (hasLocationPerm) {
    try {
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      signals.push({
        type: 'location',
        timestamp: loc.timestamp,
        data: loc,
      });
    } catch (e) {
      console.warn('[AutoTracker] Could not get location:', e);
    }
  }

  // 3. Group into clusters (30-60 min windows)
  signals.sort((a, b) => a.timestamp - b.timestamp);

  const clusters: Cluster[] = [];
  let currentCluster: Cluster | null = null;
  const CLUSTER_WINDOW_MS = 45 * 60 * 1000; // 45 minutes

  for (const signal of signals) {
    if (!currentCluster) {
      currentCluster = {
        startTime: signal.timestamp,
        endTime: signal.timestamp,
        signals: [signal],
      };
    } else {
      if (signal.timestamp - currentCluster.endTime <= CLUSTER_WINDOW_MS) {
        currentCluster.endTime = signal.timestamp;
        currentCluster.signals.push(signal);
      } else {
        clusters.push(currentCluster);
        currentCluster = {
          startTime: signal.timestamp,
          endTime: signal.timestamp,
          signals: [signal],
        };
      }
    }
  }
  if (currentCluster) {
    clusters.push(currentCluster);
  }

  // 4. Deduplicate — skip clusters that already have an entry
  const allEntries = await getAllEntries();
  
  for (const cluster of clusters) {
    const avgTime = (cluster.startTime + cluster.endTime) / 2;
    const clusterDate = new Date(avgTime);
    const dateStr = clusterDate.toISOString().split('T')[0];
    const timeStr = clusterDate.toTimeString().substring(0, 5); // HH:mm
    
    const hasDuplicate = allEntries.some(entry => {
      if (entry.date !== dateStr) return false;
      const [h, m] = entry.time.split(':').map(Number);
      const entryTimeDate = new Date(clusterDate);
      entryTimeDate.setHours(h, m, 0, 0);
      
      const diffHours = Math.abs(entryTimeDate.getTime() - avgTime) / (1000 * 60 * 60);
      return diffHours < 1.5; // Within 1.5 hours
    });

    if (hasDuplicate) {
      console.log(`[AutoTracker] Skipping cluster at ${dateStr} ${timeStr} due to existing entry`);
      continue;
    }

    // 5. Generate Entry with status='suggested', mood='neutral'
    const photos = cluster.signals.filter(s => s.type === 'photo');
    const locs = cluster.signals.filter(s => s.type === 'location');

    const mainPhoto = photos.length > 0 ? photos[Math.floor(photos.length / 2)].data : null;
    const mainLoc = locs.length > 0 ? locs[0].data : null;

    let locationName: string | undefined = undefined;
    if (mainLoc) {
      try {
        const geocode = await Location.reverseGeocodeAsync({
          latitude: mainLoc.coords.latitude,
          longitude: mainLoc.coords.longitude,
        });
        if (geocode && geocode.length > 0) {
          const place = geocode[0];
          locationName = place.name || place.street || place.city || undefined;
        }
      } catch (e) {
        console.warn('[AutoTracker] Reverse geocode failed:', e);
      }
    }

    const suggestionText = await aiService.generateSuggestion({
      mode: mainPhoto ? 'photo' : 'note',
      mood: 'neutral',
      time: timeStr,
      locationName,
    });

    const newEntry: Entry = {
      id: uuidv4(),
      date: dateStr,
      time: timeStr,
      mood: 'neutral',
      source: 'auto',
      status: 'suggested',
      text: suggestionText,
      aiSuggestion: suggestionText,
      imageLocalId: mainPhoto ? mainPhoto.id : undefined,
      imageUri: mainPhoto ? mainPhoto.uri : undefined,
      locationName,
      locationLat: mainLoc ? mainLoc.coords.latitude : undefined,
      locationLon: mainLoc ? mainLoc.coords.longitude : undefined,
      isHighlight: false,
    };

    // 6. Save to SQLite via src/memory/database.ts
    await insertEntry(newEntry);
    console.log(`[AutoTracker] Created suggested entry for ${dateStr} ${timeStr}`);
  }
  
  await saveSetting('last_auto_scan_time', Date.now().toString());
}

TaskManager.defineTask(TASK_NAME, async () => {
  try {
    console.log('[AutoTracker] Background task executed at', new Date().toISOString());
    await runAutoTrackerOnce();
    
    // Log success rate
    const settings = await loadSettings();
    const successCount = Number(settings['bgFetch_successCount'] || 0) + 1;
    await saveSetting('bgFetch_successCount', successCount.toString());
    await saveSetting('bgFetch_lastRun', new Date().toISOString());

    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch (error) {
    console.error('[AutoTracker] Background task failed:', error);
    
    // Log fail rate
    const settings = await loadSettings();
    const failCount = Number(settings['bgFetch_failCount'] || 0) + 1;
    await saveSetting('bgFetch_failCount', failCount.toString());

    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

// === Registration ===

/**
 * Register the background fetch task.
 * Should be called once during app initialization (after permissions are granted).
 * Not available on web platform.
 */
export async function registerAutoTracker(): Promise<void> {
  if (Platform.OS === 'web') {
    console.log('[AutoTracker] Skipping on web platform');
    return;
  }

  try {
    const isRegistered = await TaskManager.isTaskRegisteredAsync(TASK_NAME);
    if (isRegistered) {
      console.log('[AutoTracker] Task already registered');
      return;
    }

    await BackgroundFetch.registerTaskAsync(TASK_NAME, {
      minimumInterval: 2 * 60 * 60, // 2 hours in seconds
      stopOnTerminate: false,
      startOnBoot: true,
    });

    console.log('[AutoTracker] Task registered successfully');
  } catch (error) {
    console.error('[AutoTracker] Failed to register task:', error);
  }
}

/**
 * Unregister the background fetch task.
 */
export async function unregisterAutoTracker(): Promise<void> {
  if (Platform.OS === 'web') return;

  try {
    const isRegistered = await TaskManager.isTaskRegisteredAsync(TASK_NAME);
    if (isRegistered) {
      await BackgroundFetch.unregisterTaskAsync(TASK_NAME);
      console.log('[AutoTracker] Task unregistered');
    }
  } catch (error) {
    console.error('[AutoTracker] Failed to unregister task:', error);
  }
}

/**
 * Check if background fetch task is currently registered.
 */
export async function isAutoTrackerRegistered(): Promise<boolean> {
  if (Platform.OS === 'web') return false;

  try {
    return await TaskManager.isTaskRegisteredAsync(TASK_NAME);
  } catch {
    return false;
  }
}

/**
 * Get the current background fetch status.
 */
export async function getAutoTrackerStatus(): Promise<BackgroundFetch.BackgroundFetchStatus | null> {
  if (Platform.OS === 'web') return null;

  try {
    return await BackgroundFetch.getStatusAsync();
  } catch {
    return null;
  }
}

/**
 * Foreground auto-suggestion refresh.
 *
 * Call this when the app comes to foreground or on tab switch.
 * It runs the same clustering + dedup logic as the background task
 * but synchronously in the foreground, solving the reliability issue
 * where background fetch gets killed by iOS/Android OEM battery optimization.
 *
 * Returns the number of new suggestions created.
 */
export async function refreshAutoSuggestions(): Promise<number> {
  if (Platform.OS === 'web') return 0;

  try {
    const signals: Signal[] = [];

    // Collect photos from last 48 hours
    const { status: mediaStatus } = await MediaLibrary.getPermissionsAsync();
    if (mediaStatus === 'granted') {
      const settings = await loadSettings();
      const lastScanTimeStr = settings['last_auto_scan_time'] as string;
      const lastScanTime = lastScanTimeStr ? Number(lastScanTimeStr) : 0;

      const twoDaysAgo = Date.now() - 48 * 60 * 60 * 1000;
      const createdAfter = Math.max(lastScanTime, twoDaysAgo);

      const recentPhotos = await MediaLibrary.getAssetsAsync({
        mediaType: 'photo',
        createdAfter,
        first: 50,
        sortBy: ['creationTime'],
      });

      for (const asset of recentPhotos.assets) {
        signals.push({
          type: 'photo',
          timestamp: asset.creationTime,
          data: asset,
        });
      }
    }

    // Current location if available
    let hasLocationPerm = false;
    try {
      const fg = await Location.getForegroundPermissionsAsync();
      hasLocationPerm = fg.granted;
    } catch {
      // ignore
    }

    if (hasLocationPerm) {
      try {
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        signals.push({ type: 'location', timestamp: loc.timestamp, data: loc });
      } catch {
        // ignore
      }
    }

    if (signals.length === 0) return 0;

    // Cluster signals
    signals.sort((a, b) => a.timestamp - b.timestamp);
    const clusters: Cluster[] = [];
    let currentCluster: Cluster | null = null;
    const CLUSTER_WINDOW_MS = 60 * 60 * 1000; // 60 minutes (wider for foreground)

    for (const signal of signals) {
      if (!currentCluster) {
        currentCluster = { startTime: signal.timestamp, endTime: signal.timestamp, signals: [signal] };
      } else if (signal.timestamp - currentCluster.endTime <= CLUSTER_WINDOW_MS) {
        currentCluster.endTime = signal.timestamp;
        currentCluster.signals.push(signal);
      } else {
        clusters.push(currentCluster);
        currentCluster = { startTime: signal.timestamp, endTime: signal.timestamp, signals: [signal] };
      }
    }
    if (currentCluster) clusters.push(currentCluster);

    // Deduplicate against existing entries
    const allEntries = await getAllEntries();
    let created = 0;

    for (const cluster of clusters) {
      const avgTime = (cluster.startTime + cluster.endTime) / 2;
      const clusterDate = new Date(avgTime);
      const dateStr = clusterDate.toISOString().split('T')[0];
      const timeStr = clusterDate.toTimeString().substring(0, 5);

      const hasDuplicate = allEntries.some((entry) => {
        if (entry.date !== dateStr) return false;
        const [h, m] = entry.time.split(':').map(Number);
        const entryTime = new Date(clusterDate);
        entryTime.setHours(h, m, 0, 0);
        return Math.abs(entryTime.getTime() - avgTime) / (1000 * 60 * 60) < 1.5;
      });

      if (hasDuplicate) continue;

      const photos = cluster.signals.filter((s) => s.type === 'photo');
      const locs = cluster.signals.filter((s) => s.type === 'location');
      const mainPhoto = photos.length > 0 ? photos[Math.floor(photos.length / 2)].data : null;
      const mainLoc = locs.length > 0 ? locs[0].data : null;

      let locationName: string | undefined;
      if (mainLoc) {
        try {
          const geocode = await Location.reverseGeocodeAsync({
            latitude: mainLoc.coords.latitude,
            longitude: mainLoc.coords.longitude,
          });
          if (geocode?.length > 0) {
            const place = geocode[0];
            locationName = place.name || place.street || place.city || undefined;
          }
        } catch {
          // ignore
        }
      }

      const suggestionText = await aiService.generateSuggestion({
        mode: mainPhoto ? 'photo' : 'note',
        mood: 'neutral',
        time: timeStr,
        locationName,
      });

      const newEntry: Entry = {
        id: uuidv4(),
        date: dateStr,
        time: timeStr,
        mood: 'neutral',
        source: 'auto',
        status: 'suggested',
        text: suggestionText,
        aiSuggestion: suggestionText,
        imageLocalId: mainPhoto?.id,
        imageUri: mainPhoto?.uri,
        locationName,
        locationLat: mainLoc?.coords.latitude,
        locationLon: mainLoc?.coords.longitude,
        isHighlight: false,
      };

      await insertEntry(newEntry);
      created++;
      console.log(`[AutoTracker:Foreground] Created suggestion for ${dateStr} ${timeStr}`);
    }

    await saveSetting('last_auto_scan_time', Date.now().toString());
    return created;
  } catch (error) {
    console.error('[AutoTracker:Foreground] refreshAutoSuggestions failed:', error);
    return 0;
  }
}
