import { create } from 'zustand';
import { Entry, Settings, TabKey, WeeklyReel } from '../types';
import { defaultSettings } from '../data/mockData';
import { deleteAllEntries, deleteEntry, getAllEntries, getAllReels, insertEntry, loadSettings, saveSetting, updateEntryStatus } from './database';
import { hasPinCode } from './secureStore';
import { generateSeedEntries, isSeedEntry } from '../data/seedEntries';

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
  setEntries: (entries: Entry[]) => void;

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
          .map((entry) => deleteEntry(entry.id)),
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
    set({
      entries,
      settings: { ...settings, pinSet, pinEnabled: pinSet ? settings.pinEnabled : false },
      reels,
      onboardingComplete: onboardingFlag,
      hydrated: true,
    });
  },

  // Entries — start empty, no mock data
  entries: [],
  addEntry: async (entry) => {
    // When user adds first real entry, clean up seed entries
    const state = useJournalStore.getState();
    const seedEntries = state.entries.filter(isSeedEntry);
    if (seedEntries.length > 0) {
      for (const seed of seedEntries) {
        await deleteEntry(seed.id);
      }
      set((s) => ({ entries: s.entries.filter((e) => !isSeedEntry(e)) }));
    }
    await insertEntry(entry);
    set((s) => ({
      entries: [...s.entries, entry].sort((a, b) => a.time.localeCompare(b.time)),
    }));
  },
  saveSuggestion: async (id) => {
    await updateEntryStatus(id, 'saved', true);
    set((state) => ({
      entries: state.entries.map((e) =>
        e.id === id ? { ...e, status: 'saved' as const, isHighlight: true } : e,
      ),
    }));
  },
  discardSuggestion: async (id) => {
    await deleteEntry(id);
    set((state) => ({
      entries: state.entries.filter((e) => e.id !== id),
    }));
  },
  resetEntries: async () => {
    await deleteAllEntries();
    set({ entries: [] });
  },
  setEntries: (entries) => set({ entries }),

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
  selectedDate: new Date().toISOString().slice(0, 10),
  setSelectedDate: (date) => set({ selectedDate: date }),
  sheetVisible: false,
  setSheetVisible: (visible) => set({ sheetVisible: visible }),
  composerVisible: false,
  setComposerVisible: (visible) => set({ composerVisible: visible }),
}));
