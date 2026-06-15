/**
 * Notification Skill — Push notification scheduling for diary reminders.
 *
 * Schedules:
 * - Daily reminder at a user-chosen time
 * - Weekly summary every Sunday evening
 *
 * Uses expo-notifications for permission requests and scheduling.
 */

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// === Setup handler ===
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

// === Permission ===

export async function requestNotificationPermission(): Promise<'granted' | 'denied' | 'undetermined'> {
  if (Platform.OS === 'web') return 'denied';
  const { status } = await Notifications.requestPermissionsAsync();
  return status;
}

export async function getNotificationPermission(): Promise<'granted' | 'denied' | 'undetermined'> {
  if (Platform.OS === 'web') return 'denied';
  const { status } = await Notifications.getPermissionsAsync();
  return status;
}

// === Scheduling ===

const DAILY_REMINDER_ID = 'daily-diary-reminder';
const WEEKLY_REMINDER_ID = 'weekly-diary-summary';

/**
 * Schedule a daily diary reminder at the given hour/minute (local time).
 * Cancels any existing daily reminder before scheduling a new one.
 */
export async function scheduleDailyReminder(hour: number, minute: number): Promise<void> {
  if (Platform.OS === 'web') return;

  await Notifications.cancelScheduledNotificationAsync(DAILY_REMINDER_ID).catch(() => {});

  await Notifications.scheduleNotificationAsync({
    identifier: DAILY_REMINDER_ID,
    content: {
      title: '📔 Nhật ký của bạn đang chờ',
      body: 'Dành một khoảnh khắc ghi lại điều gì đó hôm nay nhé.',
      // Deep-link payload: daily-reminder → opens DayScreen for today
      data: { type: 'daily-reminder' },
    },
    trigger: {
      hour,
      minute,
      repeats: true,
    },
  });
}

/**
 * Schedule a weekly summary reminder every Sunday at 8pm.
 */
export async function scheduleWeeklyReminder(): Promise<void> {
  if (Platform.OS === 'web') return;

  await Notifications.cancelScheduledNotificationAsync(WEEKLY_REMINDER_ID).catch(() => {});

  await Notifications.scheduleNotificationAsync({
    identifier: WEEKLY_REMINDER_ID,
    content: {
      title: '✨ Tuần của bạn — nhìn lại nhé',
      body: 'Xem lại những khoảnh khắc trong tuần qua và tạo reel kỷ niệm.',
      // Deep-link payload: weekly-summary → opens ReelScreen
      data: { type: 'weekly-summary' },
    },
    trigger: {
      weekday: 1, // Sunday (1 = Sunday in expo-notifications)
      hour: 20,
      minute: 0,
      repeats: true,
    },
  });
}

/**
 * Cancel all scheduled diary reminders.
 */
export async function cancelAllReminders(): Promise<void> {
  if (Platform.OS === 'web') return;
  await Notifications.cancelAllScheduledNotificationsAsync();
}

/**
 * Schedule a one-time entry reminder for a specific date (YYYY-MM-DD).
 * Useful for reminding the user to reflect on a particular day.
 *
 * Deep-link: tapping the notification opens DayScreen for that date.
 */
export async function scheduleEntryReminder(
  date: string,  // YYYY-MM-DD
  hour: number,
  minute: number,
  title?: string,
  body?: string,
): Promise<void> {
  if (Platform.OS === 'web') return;

  const identifier = `entry-reminder-${date}`;

  // Cancel any existing reminder for this date to avoid duplicates
  await Notifications.cancelScheduledNotificationAsync(identifier).catch(() => {});

  const [yyyy, mm, dd] = date.split('-').map(Number);
  const triggerDate = new Date(yyyy, mm - 1, dd, hour, minute, 0);

  // Don't schedule in the past
  if (triggerDate.getTime() <= Date.now()) return;

  await Notifications.scheduleNotificationAsync({
    identifier,
    content: {
      title: title ?? '📔 Nhật ký ngày hôm nay đang chờ bạn',
      body: body ?? `Hãy ghi lại khoảnh khắc của ngày ${dd}/${mm}/${yyyy} nhé.`,
      // Deep-link payload: entry-reminder → opens DayScreen for this date
      data: { type: 'entry-reminder', date },
    },
    trigger: triggerDate,
  });
}
