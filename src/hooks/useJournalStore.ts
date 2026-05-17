import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useMemo, useState } from 'react';
import { defaultSettings } from '../data/mockData';
import { Entry, Settings } from '../types';

const entriesKey = 'private-auto-journal.entries';
const settingsKey = 'private-auto-journal.settings';
const onboardingKey = 'private-auto-journal.onboarding-complete';

export function useJournalStore() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [hydrated, setHydrated] = useState(false);
  const [onboardingComplete, setOnboardingComplete] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function hydrate() {
      const [entriesJson, settingsJson, onboardingFlag] = await Promise.all([
        AsyncStorage.getItem(entriesKey),
        AsyncStorage.getItem(settingsKey),
        AsyncStorage.getItem(onboardingKey),
      ]);
      if (!mounted) {
        return;
      }
      if (entriesJson) {
        setEntries(JSON.parse(entriesJson));
      }
      if (settingsJson) {
        setSettings({ ...defaultSettings, ...JSON.parse(settingsJson) });
      }
      setOnboardingComplete(onboardingFlag === 'true');
      setHydrated(true);
    }

    hydrate().catch(() => setHydrated(true));

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (hydrated) {
      AsyncStorage.setItem(entriesKey, JSON.stringify(entries)).catch(() => undefined);
    }
  }, [entries, hydrated]);

  useEffect(() => {
    if (hydrated) {
      AsyncStorage.setItem(settingsKey, JSON.stringify(settings)).catch(() => undefined);
    }
  }, [settings, hydrated]);

  const completeOnboarding = async () => {
    setOnboardingComplete(true);
    await AsyncStorage.setItem(onboardingKey, 'true').catch(() => undefined);
  };

  return useMemo(
    () => ({
      hydrated,
      entries,
      settings,
      onboardingComplete,
      setEntries,
      setSettings,
      completeOnboarding,
      resetJournal: async () => {
        setEntries([]);
        await AsyncStorage.setItem(entriesKey, JSON.stringify([]));
      },
    }),
    [entries, hydrated, settings, onboardingComplete],
  );
}
