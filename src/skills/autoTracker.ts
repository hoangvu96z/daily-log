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

const TASK_NAME = 'AUTO_DIARY_BACKGROUND_FETCH';

// === Task Definition ===

TaskManager.defineTask(TASK_NAME, async () => {
  try {
    // TODO: Implement signal collection and entry generation
    // 1. Read new photos from expo-media-library
    // 2. Get current location from expo-location
    // 3. Read calendar events from expo-calendar
    // 4. Group into clusters (30-60 min windows)
    // 5. Generate Entry with status='suggested', mood='neutral'
    // 6. Save to SQLite via src/memory/database.ts

    console.log('[AutoTracker] Background task executed at', new Date().toISOString());

    // For now, return success without doing anything
    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch (error) {
    console.error('[AutoTracker] Background task failed:', error);
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
