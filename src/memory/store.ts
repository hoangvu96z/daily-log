import { create } from 'zustand';
import { Entry, Settings, TabKey, WeeklyReel, HighlightCollection, Category } from '../types';
import { defaultSettings } from '../data/mockData';
import { deleteAllEntries, deleteEntry as dbDeleteEntry, updateEntry as dbUpdateEntry, getAllEntries, getAllReels, insertEntry, loadSettings, saveSetting, updateEntryStatus, getAllHighlights, insertHighlight as dbInsertHighlight, deleteHighlight as dbDeleteHighlight, getAllCategories, insertCategory, updateCategory, deleteCategory } from './database';
import { hasPinCode } from './secureStore';
import { generateSeedEntries, isSeedEntry } from '../data/seedEntries';
import { generateWeeklyReels } from '../skills/reels';
import { syncWidgetData } from '../skills/widget';
import { getLocalDateString } from '../utils/dateUtils';
import { cleanupOrphanedVoiceMemos } from '../skills/voiceMemo';

// === Store Interface ===
interface JournalState {
  // Hydration
  hydrated: boolean;
  setHydrated: (value: boolean) => void;

  // Onboarding
  onboardingComplete: boolean;
  setOnboardingComplete: (value: boolean) => Promise<void>;

  // Categories
  categories: Category[];

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

  // Highlights
  highlights: HighlightCollection[];
  setHighlights: (highlights: HighlightCollection[]) => void;
  addHighlight: (highlight: HighlightCollection) => Promise<void>;
  updateHighlight: (id: string, patch: Partial<HighlightCollection>) => Promise<void>;
  removeHighlight: (id: string) => Promise<void>;

  // Category Actions
  addCategoryToStore: (cat: Category) => Promise<void>;
  updateCategoryInStore: (id: string, patch: Partial<Category>) => Promise<void>;
  deleteCategoryFromStore: (id: string) => Promise<void>;

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

  // Categories
  categories: [],

  // Initialization
  initStore: async () => {
    const [loadedEntries, settings, reels, pinSet, loadedHighlights, loadedCategories] = await Promise.all([
      getAllEntries(),
      loadSettings(),
      getAllReels(),
      hasPinCode(),
      getAllHighlights(),
      getAllCategories(),
    ]);
    const legacyDemoIds = new Set(['1', '2', '3', '4', '5']);
    let entries = loadedEntries.filter((entry) => !legacyDemoIds.has(entry.id));
    if (entries.length !== loadedEntries.length) {
      await Promise.all(
        loadedEntries
          .filter((entry) => legacyDemoIds.has(entry.id))
          .map((entry) => dbDeleteEntry(entry.id)),
      );
    }

    // Deduplicate 'suggested' entries: keep only the first per 1.5h window per day.
    // This cleans up any duplicates that may have been created by a prior bug.
    const seen: { date: string; minutes: number }[] = [];
    const dupIds: string[] = [];
    for (const e of entries) {
      if (e.status !== 'suggested') continue;
      const [h, m] = e.time.split(':').map(Number);
      const eMin = h * 60 + m;
      const isDup = seen.some(s => s.date === e.date && Math.abs(s.minutes - eMin) < 90);
      if (isDup) {
        dupIds.push(e.id);
      } else {
        seen.push({ date: e.date, minutes: eMin });
      }
    }
    if (dupIds.length > 0) {
      await Promise.all(dupIds.map(id => dbDeleteEntry(id)));
      entries = entries.filter(e => !dupIds.includes(e.id));
      console.log(`[Store] Cleaned up ${dupIds.length} duplicate suggested entry(s)`);
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

    // DEV ONLY: Inject a test "On this day" entry from 1 year ago to test ReelScreen
    if (__DEV__) {
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      const testEntry = {
        id: 'test-on-this-day',
        date: getLocalDateString(oneYearAgo),
        time: '10:00',
        mood: 'great',
        text: '[DEV] Khoảnh khắc này được tạo ra cách đây chính xác 1 năm!',
        source: 'manual',
        status: 'saved',
        isHighlight: true,
      } as any;
      if (!entries.find(e => e.id === 'test-on-this-day')) {
        entries.push(testEntry);
        await insertEntry(testEntry);
      }
    }

    set({
      entries,
      settings: { ...settings, pinSet, pinEnabled: pinSet ? settings.pinEnabled : false },
      reels,
      highlights: loadedHighlights,
      categories: loadedCategories,
      onboardingComplete: onboardingFlag,
      hydrated: true,
    });

    // Background generation of weekly reels
    generateWeeklyReels(entries).then((updatedReels) => {
      set({ reels: updatedReels });
    }).catch(console.error);

    // Background cleanup of orphaned voice memos
    cleanupOrphanedVoiceMemos(entries).catch(console.error);
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

    // Auto-dismiss any 'suggested' entries in the same 1.5h window on the same day.
    // This prevents a suggested entry from lingering alongside a real entry.
    if (entry.status === 'saved') {
      const [newH, newM] = entry.time.split(':').map(Number);
      const newMinutes = newH * 60 + newM;
      const currentState = useJournalStore.getState();
      const toDiscard = currentState.entries.filter((e) => {
        if (e.status !== 'suggested' || e.date !== entry.date) return false;
        const [eh, em] = e.time.split(':').map(Number);
        const eMinutes = eh * 60 + em;
        return Math.abs(eMinutes - newMinutes) < 90; // 1.5h window
      });
      for (const e of toDiscard) {
        await dbDeleteEntry(e.id);
      }
      if (toDiscard.length > 0) {
        const discardIds = new Set(toDiscard.map((e) => e.id));
        set((s) => ({ entries: s.entries.filter((e) => !discardIds.has(e.id)) }));
        console.log(`[Store] Auto-dismissed ${toDiscard.length} suggested entry(s) near ${entry.time}`);
      }
    }

    // Get fresh state after possible seed cleanup + auto-dismiss
    const currentState = useJournalStore.getState();
    const newEntries = [...currentState.entries, entry].sort((a, b) => a.time.localeCompare(b.time));
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

  // Highlights
  highlights: [],
  setHighlights: (highlights) => set({ highlights }),
  addHighlight: async (highlight) => {
    await dbInsertHighlight(highlight);
    set((state) => ({ highlights: [highlight, ...state.highlights] }));
  },
  updateHighlight: async (id, patch) => {
    const state = useJournalStore.getState();
    const existing = state.highlights.find((h) => h.id === id);
    if (!existing) return;
    const updated = { ...existing, ...patch };
    await dbInsertHighlight(updated);
    set((s) => ({
      highlights: s.highlights.map((h) => (h.id === id ? updated : h)),
    }));
  },
  removeHighlight: async (id) => {
    await dbDeleteHighlight(id);
    set((state) => ({ highlights: state.highlights.filter((h) => h.id !== id) }));
  },
  // Category Actions
  addCategoryToStore: async (cat: Category) => {
    await insertCategory(cat);
    set((state) => ({
      categories: [...state.categories, cat].sort((a, b) => a.sortOrder - b.sortOrder),
    }));
  },

  updateCategoryInStore: async (id: string, patch: Partial<Category>) => {
    await updateCategory(id, patch);
    set((state) => ({
      categories: state.categories.map(c => c.id === id ? { ...c, ...patch } : c).sort((a, b) => a.sortOrder - b.sortOrder)
    }));
  },

  deleteCategoryFromStore: async (id: string) => {
    await deleteCategory(id);
    set((state) => ({
      categories: state.categories.filter(c => c.id !== id),
      entries: state.entries.map(e => e.categoryId === id ? { ...e, categoryId: undefined } : e)
    }));
  },

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
