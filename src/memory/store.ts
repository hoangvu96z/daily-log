import { create } from 'zustand';
import { Entry, Settings, TabKey, WeeklyReel } from '../types';
import { initialEntries, initialSettings, weeklyReels } from '../data/mockData';

// === Store Interface ===
interface JournalState {
  // Hydration
  hydrated: boolean;
  setHydrated: (value: boolean) => void;

  // Entries
  entries: Entry[];
  addEntry: (entry: Entry) => void;
  saveSuggestion: (id: string) => void;
  discardSuggestion: (id: string) => void;
  resetEntries: () => void;
  setEntries: (entries: Entry[]) => void;

  // Settings
  settings: Settings;
  updateSettings: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
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

  // Entries — initialized with mock data, will be overwritten by DB hydration
  entries: initialEntries,
  addEntry: (entry) =>
    set((state) => ({
      entries: [...state.entries, entry].sort((a, b) => a.time.localeCompare(b.time)),
    })),
  saveSuggestion: (id) =>
    set((state) => ({
      entries: state.entries.map((e) =>
        e.id === id ? { ...e, status: 'saved' as const, isHighlight: true } : e,
      ),
    })),
  discardSuggestion: (id) =>
    set((state) => ({
      entries: state.entries.filter((e) => e.id !== id),
    })),
  resetEntries: () => set({ entries: [] }),
  setEntries: (entries) => set({ entries }),

  // Settings
  settings: initialSettings,
  updateSettings: (key, value) =>
    set((state) => ({
      settings: { ...state.settings, [key]: value },
    })),
  setSettings: (settings) => set({ settings }),

  // Weekly Reels
  reels: weeklyReels,
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
