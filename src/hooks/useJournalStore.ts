import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useMemo, useState } from 'react';
import { initialEntries, initialSettings } from '../data/mockData';
import { Entry, Settings } from '../types';

const entriesKey = 'private-auto-journal.entries';
const settingsKey = 'private-auto-journal.settings';

export function useJournalStore() {
  const [entries, setEntries] = useState<Entry[]>(initialEntries);
  const [settings, setSettings] = useState<Settings>(initialSettings);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function hydrate() {
      const [entriesJson, settingsJson] = await Promise.all([AsyncStorage.getItem(entriesKey), AsyncStorage.getItem(settingsKey)]);
      if (!mounted) {
        return;
      }
      if (entriesJson) {
        setEntries(JSON.parse(entriesJson));
      }
      if (settingsJson) {
        setSettings({ ...initialSettings, ...JSON.parse(settingsJson) });
      }
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

  return useMemo(
    () => ({
      hydrated,
      entries,
      settings,
      setEntries,
      setSettings,
      resetJournal: async () => {
        setEntries([]);
        await AsyncStorage.setItem(entriesKey, JSON.stringify([]));
      },
    }),
    [entries, hydrated, settings],
  );
}
