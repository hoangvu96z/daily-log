import * as Calendar from 'expo-calendar';
import { Platform } from 'react-native';
import { CalendarEventDraft, PermissionState } from '../types';

export async function requestCalendarAccess(): Promise<PermissionState> {
  if (Platform.OS === 'web') {
    return 'unavailable';
  }

  try {
    const result = await Calendar.requestCalendarPermissionsAsync();
    return result.granted ? 'granted' : 'denied';
  } catch {
    return 'unavailable';
  }
}

export async function getTodayCalendarEvents(): Promise<{ status: PermissionState; events: CalendarEventDraft[] }> {
  const status = await requestCalendarAccess();
  if (status !== 'granted') {
    return { status, events: [] };
  }

  const now = new Date();
  const startDate = new Date(now);
  startDate.setHours(0, 0, 0, 0);
  const endDate = new Date(now);
  endDate.setHours(23, 59, 59, 999);

  const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
  const calendarIds = calendars.map((calendar) => calendar.id);
  const events = await Calendar.getEventsAsync(calendarIds, startDate, endDate);

  return {
    status: 'granted',
    events: events
      .map((event) => ({
        id: event.id,
        title: event.title || 'Calendar event',
        notes: event.notes || undefined,
        location: event.location || undefined,
        startDate: new Date(event.startDate).toISOString(),
        endDate: event.endDate ? new Date(event.endDate).toISOString() : undefined,
      }))
      .sort((a, b) => a.startDate.localeCompare(b.startDate)),
  };
}

export function calendarEventToDraft(event: CalendarEventDraft) {
  const start = new Date(event.startDate);
  const prefillTime = start.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false });
  const detail = event.notes ? ` — ${event.notes}` : '';
  return {
    mode: 'calendar' as const,
    calendarEventId: event.id,
    calendarText: `${event.title}${detail}`,
    locationName: event.location,
    prefillDate: start.toISOString().slice(0, 10),
    prefillTime,
  };
}

export interface CalendarSignal {
  type: 'calendar';
  start: Date;
  end: Date;
  title: string;
  locationName?: string;
}

export async function getCalendarSignals(): Promise<CalendarSignal[]> {
  const { status, events } = await getTodayCalendarEvents();
  if (status !== 'granted') return [];

  return events.map(e => ({
    type: 'calendar',
    start: new Date(e.startDate),
    end: e.endDate ? new Date(e.endDate) : new Date(e.startDate),
    title: e.title,
    locationName: e.location,
  }));
}
