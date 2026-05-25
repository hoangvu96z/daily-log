import { create } from 'zustand';
import { Entry, Settings, TabKey, WeeklyReel } from '../types';
import { defaultSettings } from '../data/mockData';
import { deleteAllEntries, deleteEntry as dbDeleteEntry, updateEntry as dbUpdateEntry, getAllEntries, getAllReels, insertEntry, loadSettings, saveSetting, updateEntryStatus } from './database';
import { hasPinCode } from './secureStore';
import { generateSeedEntries, isSeedEntry } from '../data/seedEntries';
import { generateWeeklyReels } from '../skills/reels';
import { getLocalDateString } from '../utils/dateUtils';

// === Store Interface ===
interface JournalState {
  // Hydration
  hydrated: boolean;
  setHydrated: (value: boolean) => void;

  // Onboarding
  onboardingComplete: boolean;
  setOnboardingComplete: (value: boolean) => Promise<void>;

  // Initialization
  initStore: () => Promise<void>;

  // Entries
  entries: Entry[];
  addEntry: (entry: Entry) => Promise<void>;
  saveSuggestion: (id: string) => Promise<void>;
  discardSuggestion: (id: string) => Promise<void>;
  resetEntries: () => Promise<void>;
  restoreFromBackup: (entries: Entry[], settings: Partial<Settings>, reels: WeeklyReel[]) => Promise<void>;
  setEntries: (entries: Entry[]) => void;
  updateEntry: (id: string, patch: Partial<Entry>) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;

  // Settings
  settings: Settings;
  updateSettings: <K extends keyof Settings>(key: K, value: Settings[K]) => Promise<void>;
  setSettings: (settings: Settings) => void;

  // Weekly Reels
  reels: WeeklyReel[];
  setReels: (reels: WeeklyReel[]) => void;

  // UI State
  activeTab: TabKey;
  setActiveTab: (tab: TabKey) => void;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  sheetVisible: boolean;
  setSheetVisible: (visible: boolean) => void;
  composerVisible: boolean;
  setComposerVisible: (visible: boolean) => void;
}

// === Zustand Store ===
export const useJournalStore = create<JournalState>((set) => ({
  // Hydration
  hydrated: false,
  setHydrated: (value) => set({ hydrated: value }),

  // Onboarding — starts as not complete
  onboardingComplete: false,
  setOnboardingComplete: async (value) => {
    set({ onboardingComplete: value });
    await saveSetting('onboardingComplete', value);
  },

  // Initialization
  initStore: async () => {
    const [loadedEntries, settings, reels, pinSet] = await Promise.all([
      getAllEntries(),
      loadSettings(),
      getAllReels(),
      hasPinCode(),
    ]);
    const legacyDemoIds = new Set(['1', '2', '3', '4', '5']);
    const entries = loadedEntries.filter((entry) => !legacyDemoIds.has(entry.id));
    if (entries.length !== loadedEntries.length) {
      await Promise.all(
        loadedEntries
          .filter((entry) => legacyDemoIds.has(entry.id))
          .map((entry) => dbDeleteEntry(entry.id)),
      );
    }

    // Seed: if DB is completely empty, inject demo entries for first-run experience
    const lang = settings.language || 'vi';
    if (entries.length === 0) {
      const seeds = generateSeedEntries(lang);
      for (const seed of seeds) {
        await insertEntry(seed);
      }
      entries.push(...seeds);
    }

    const onboardingFlag = (settings as any).onboardingComplete === true;
    settings.isPremium = true; // FORCE UNLOCK PREMIUM FOR TESTING
    set({
      entries,
      settings: { ...settings, pinSet, pinEnabled: pinSet ? settings.pinEnabled : false },
      reels,
      onboardingComplete: onboardingFlag,
      hydrated: true,
    });

    // Background generation of weekly reels
    generateWeeklyReels(entries).then((updatedReels) => {
      set({ reels: updatedReels });
    }).catch(console.error);
  },

  // Entries — start empty, no mock data
  entries: [],
  addEntry: async (entry) => {
    // When user adds first real entry, clean up seed entries
    const state = useJournalStore.getState();
    const seedEntries = state.entries.filter(isSeedEntry);
    if (seedEntries.length > 0) {
      for (const seed of seedEntries) {
        await dbDeleteEntry(seed.id);
      }
      set((s) => ({ entries: s.entries.filter((e) => !isSeedEntry(e)) }));
    }
    await insertEntry(entry);
    const newEntries = [...s.entries, entry].sort((a, b) => a.time.localeCompare(b.time));
    set({ entries: newEntries });
    
    // Auto-update reels in background
    generateWeeklyReels(newEntries).then(reels => set({ reels })).catch(console.error);
  },
  saveSuggestion: async (id) => {
    await updateEntryStatus(id, 'saved', true);
    set((state) => {
      const newEntries = state.entries.map((e) =>
        e.id === id ? { ...e, status: 'saved' as const, isHighlight: true } : e,
      );
      generateWeeklyReels(newEntries).then(reels => set({ reels })).catch(console.error);
      return { entries: newEntries };
    });
  },
  discardSuggestion: async (id) => {
    await dbDeleteEntry(id);
    set((state) => ({
      entries: state.entries.filter((e) => e.id !== id),
    }));
  },
  resetEntries: async () => {
    await deleteAllEntries();
    set({ entries: [] });
  },
  restoreFromBackup: async (entries, settings, reels) => {
    await deleteAllEntries();
    for (const e of entries) {
      await insertEntry(e);
    }
    for (const [k, v] of Object.entries(settings)) {
      await saveSetting(k, v as any);
    }
    set((state) => ({
      entries,
      settings: { ...state.settings, ...(settings as Settings) },
      reels,
    }));
  },
  setEntries: (entries) => set({ entries }),
  updateEntry: async (id, patch) => {
    await dbUpdateEntry(id, patch);
    set((state) => {
      const newEntries = state.entries.map((e) => (e.id === id ? { ...e, ...patch } : e));
      generateWeeklyReels(newEntries).then(reels => set({ reels })).catch(console.error);
      return { entries: newEntries };
    });
  },
  deleteEntry: async (id) => {
    await dbDeleteEntry(id);
    set((state) => {
      const newEntries = state.entries.filter((e) => e.id !== id);
      generateWeeklyReels(newEntries).then(reels => set({ reels })).catch(console.error);
      return { entries: newEntries };
    });
  },

  // Settings — all permissions off by default
  settings: defaultSettings,
  updateSettings: async (key, value) => {
    await saveSetting(key as string, value);
    set((state) => ({
      settings: { ...state.settings, [key]: value },
    }));
  },
  setSettings: (settings) => set({ settings }),

  // Weekly Reels — start empty
  reels: [],
  setReels: (reels) => set({ reels }),

  // UI State
  activeTab: 'home',
  setActiveTab: (tab) => set({ activeTab: tab }),
  selectedDate: getLocalDateString(),
  setSelectedDate: (date) => set({ selectedDate: date }),
  sheetVisible: false,
  setSheetVisible: (visible) => set({ sheetVisible: visible }),
  composerVisible: false,
  setComposerVisible: (visible) => set({ composerVisible: visible }),
}));
