/**
 * useNotificationDeepLink.ts
 *
 * Hook that listens for notification taps (response received) and
 * navigates to the correct screen:
 *
 *   data.type === 'daily-reminder'   → navigates to the "day" tab (today)
 *   data.type === 'weekly-summary'   → navigates to the "reel" tab
 *   data.type === 'entry-reminder'   → navigates to "day" tab for data.date
 *
 * Usage (in AppNavigator or App.tsx, AFTER NavigationContainer is mounted):
 *
 *   const navigationRef = useNavigationContainerRef();
 *   useNotificationDeepLink(navigationRef);
 */

import { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import type { NavigationContainerRef } from '@react-navigation/native';
import { Platform } from 'react-native';
import { getLocalDateString } from '../utils/dateUtils';

export function useNotificationDeepLink(
  navigationRef: React.RefObject<NavigationContainerRef<any>>
) {
  // Track the response for when navigation isn't ready yet (cold-launch case)
  const pendingNotification = useRef<Notifications.NotificationResponse | null>(null);

  useEffect(() => {
    if (Platform.OS === 'web') return;

    // ── 1. App was OPEN: notification tap comes in via listener ──────────────
    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      if (navigationRef.current?.isReady()) {
        handleResponse(response, navigationRef.current);
      } else {
        // Nav not ready yet (race condition at cold launch) — store and retry
        pendingNotification.current = response;
      }
    });

    // ── 2. App was CLOSED: check the initial notification that launched it ──
    Notifications.getLastNotificationResponseAsync().then((response) => {
      if (response && navigationRef.current?.isReady()) {
        handleResponse(response, navigationRef.current);
      } else if (response) {
        pendingNotification.current = response;
      }
    });

    return () => subscription.remove();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── 3. Flush pending response once navigation becomes ready ────────────────
  useEffect(() => {
    if (!pendingNotification.current) return;

    const checkReady = setInterval(() => {
      if (navigationRef.current?.isReady() && pendingNotification.current) {
        handleResponse(pendingNotification.current, navigationRef.current!);
        pendingNotification.current = null;
        clearInterval(checkReady);
      }
    }, 100);

    return () => clearInterval(checkReady);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
}

// ─── Internal handler ─────────────────────────────────────────────────────────

function handleResponse(
  response: Notifications.NotificationResponse,
  nav: NavigationContainerRef<any>
) {
  const data = response.notification.request.content.data as Record<string, any>;

  if (!data) return;

  try {
    switch (data.type) {
      case 'daily-reminder': {
        // Navigate to today on the Day tab
        const today = getLocalDateString();
        nav.navigate('Tabs' as never);
        // Small delay so TabNavigator mounts before we send params
        setTimeout(() => {
          nav.navigate('Tabs', { screen: 'day', params: { date: today } } as never);
        }, 150);
        break;
      }

      case 'weekly-summary': {
        // Navigate to Reel tab
        nav.navigate('Tabs' as never);
        setTimeout(() => {
          nav.navigate('Tabs', { screen: 'reel' } as never);
        }, 150);
        break;
      }

      case 'entry-reminder': {
        // Navigate to a specific date if provided
        const date = typeof data.date === 'string' ? data.date : getLocalDateString();
        nav.navigate('Tabs' as never);
        setTimeout(() => {
          nav.navigate('Tabs', { screen: 'day', params: { date } } as never);
        }, 150);
        break;
      }

      default:
        // Fallback: just open the home tab
        nav.navigate('Tabs' as never);
    }
  } catch (e) {
    console.warn('[useNotificationDeepLink] navigation error', e);
  }
}
