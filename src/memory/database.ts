import { Platform } from 'react-native';
import { Entry, Settings, WeeklyReel, HighlightCollection, Category } from '../types';

let SQLite: any = null;
if (Platform.OS !== 'web') {
  SQLite = require('expo-sqlite');
}
import { defaultSettings } from '../data/mockData';

const DB_NAME = 'auto_diary.db';

// === Database Instance ===
let db: any = null;

async function getDB(): Promise<any> {
  if (Platform.OS === 'web') {
    throw new Error('SQLite not supported on web in this mock');
  }
  if (!db) {
    db = await SQLite.openDatabaseAsync(DB_NAME);
    await initTables(db);
  }
  return db;
}

// === Database Migrations ===
const MIGRATIONS = [
  // Migration 1: Initial schema
  `
    CREATE TABLE IF NOT EXISTS entries (
      id TEXT PRIMARY KEY,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      mood TEXT NOT NULL DEFAULT 'neutral',
      text TEXT,
      aiSuggestion TEXT,
      imageLocalId TEXT,
      imageUri TEXT,
      locationName TEXT,
      locationLat REAL,
      locationLon REAL,
      source TEXT NOT NULL DEFAULT 'manual',
      status TEXT NOT NULL DEFAULT 'saved',
      isHighlight INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS weekly_reels (
      weekId TEXT PRIMARY KEY,
      startDate TEXT NOT NULL,
      endDate TEXT NOT NULL,
      dateRange TEXT NOT NULL,
      entryCount INTEGER NOT NULL DEFAULT 0,
      coverImageId TEXT,
      coverTone TEXT NOT NULL DEFAULT '#cbe4d6',
      entryIds TEXT NOT NULL DEFAULT '[]'
    );
  `,
  // Migration 2: Add media column for Multi-Image/Video
  `ALTER TABLE entries ADD COLUMN media TEXT DEFAULT '[]';`,
  // Migration 3: Add Highlights table
  `CREATE TABLE IF NOT EXISTS highlights (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    coverImageUri TEXT,
    entryIds TEXT NOT NULL DEFAULT '[]',
    createdAt TEXT NOT NULL
  );`,
  // Migration 4: Add voiceMemoUri
  `ALTER TABLE entries ADD COLUMN voiceMemoUri TEXT;`,
  // Migration 5: Add voiceMemoDurationMs
  `ALTER TABLE entries ADD COLUMN voiceMemoDurationMs INTEGER DEFAULT 0;`,
  // Migration 6: Add categories table and categoryId to entries
  `
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      emoji TEXT NOT NULL DEFAULT '📁',
      color TEXT NOT NULL DEFAULT '#8B5CF6',
      sortOrder INTEGER NOT NULL DEFAULT 0,
      isDefault INTEGER NOT NULL DEFAULT 0
    );
    ALTER TABLE entries ADD COLUMN categoryId TEXT;
  `
];

// === Table Initialization ===
async function initTables(database: any): Promise<void> {
  // Create schema_version table if it doesn't exist
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS schema_version (
      version INTEGER PRIMARY KEY
    );
  `);

  // Get current version
  let currentVersion = 0;
  try {
    const row = await database.getFirstAsync('SELECT MAX(version) as version FROM schema_version');
    if (row && row.version != null) {
      currentVersion = row.version as number;
    }
  } catch (error) {
    console.warn('Could not read schema_version, assuming version 0');
  }

  // Run pending migrations
  for (let i = currentVersion; i < MIGRATIONS.length; i++) {
    console.log(`Running database migration to version ${i + 1}`);
    try {
      await database.execAsync(MIGRATIONS[i]);
      await database.runAsync('INSERT OR REPLACE INTO schema_version (version) VALUES (?)', [i + 1]);
    } catch (e: any) {
      if (e?.message?.includes('duplicate column name')) {
        console.warn(`Migration ${i + 1} skipped (column already exists).`);
        await database.runAsync('INSERT OR REPLACE INTO schema_version (version) VALUES (?)', [i + 1]);
      } else {
        console.error(`Migration ${i + 1} failed:`, e);
        throw e;
      }
    }
  }
}

// === Entry CRUD ===

export async function getAllEntries(): Promise<Entry[]> {
  if (Platform.OS === 'web') {
    const raw = localStorage.getItem('ad_entries');
    return raw ? JSON.parse(raw) : [];
  }
  const database = await getDB();
  const rows = await database.getAllAsync('SELECT * FROM entries ORDER BY date, time');
  return rows.map(rowToEntry);
}

export async function getEntriesByDate(date: string): Promise<Entry[]> {
  if (Platform.OS === 'web') {
    const all = await getAllEntries();
    return all.filter((e) => e.date === date);
  }
  const database = await getDB();
  const rows = await database.getAllAsync(
    'SELECT * FROM entries WHERE date = ? ORDER BY time',
    [date],
  );
  return rows.map(rowToEntry);
}

export async function insertEntry(entry: Entry): Promise<void> {
  if (Platform.OS === 'web') {
    const all = await getAllEntries();
    const existing = all.findIndex((e) => e.id === entry.id);
    if (existing >= 0) all[existing] = entry;
    else all.push(entry);
    all.sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));
    localStorage.setItem('ad_entries', JSON.stringify(all));
    return;
  }
  const database = await getDB();
  await database.runAsync(
    `INSERT OR REPLACE INTO entries (id, categoryId, date, time, mood, text, aiSuggestion, media, imageLocalId, imageUri, voiceMemoUri, voiceMemoDurationMs, locationName, locationLat, locationLon, source, status, isHighlight)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      entry.id,
      entry.categoryId ?? null,
      entry.date,
      entry.time,
      entry.mood,
      entry.text ?? null,
      entry.aiSuggestion ?? null,
      entry.media ? JSON.stringify(entry.media) : '[]',
      entry.imageLocalId ?? null,
      entry.imageUri ?? null,
      entry.voiceMemoUri ?? null,
      entry.voiceMemoDurationMs ?? 0,
      entry.locationName ?? null,
      entry.locationLat ?? null,
      entry.locationLon ?? null,
      entry.source,
      entry.status,
      entry.isHighlight ? 1 : 0,
    ],
  );
}

export async function updateEntryStatus(id: string, status: string, isHighlight: boolean): Promise<void> {
  if (Platform.OS === 'web') {
    const all = await getAllEntries();
    const idx = all.findIndex((e) => e.id === id);
    if (idx >= 0) {
      all[idx].status = status as any;
      all[idx].isHighlight = isHighlight;
      localStorage.setItem('ad_entries', JSON.stringify(all));
    }
    return;
  }
  const database = await getDB();
  await database.runAsync(
    'UPDATE entries SET status = ?, isHighlight = ? WHERE id = ?',
    [status, isHighlight ? 1 : 0, id],
  );
}

export async function updateEntry(id: string, patch: Partial<Entry>): Promise<void> {
  if (Platform.OS === 'web') {
    const all = await getAllEntries();
    const idx = all.findIndex((e) => e.id === id);
    if (idx >= 0) {
      all[idx] = { ...all[idx], ...patch };
      localStorage.setItem('ad_entries', JSON.stringify(all));
    }
    return;
  }
  const database = await getDB();
  const entries = Object.entries(patch);
  if (entries.length === 0) return;

  const setClause = entries.map(([k]) => `${k} = ?`).join(', ');
  const values = entries.map(([k, v]) => {
    if (k === 'media' && v !== undefined && v !== null) return JSON.stringify(v);
    if (typeof v === 'boolean') return v ? 1 : 0;
    return v ?? null;
  });
  values.push(id);

  await database.runAsync(`UPDATE entries SET ${setClause} WHERE id = ?`, values);
}

export async function deleteEntry(id: string): Promise<void> {
  if (Platform.OS === 'web') {
    const all = await getAllEntries();
    const filtered = all.filter((e) => e.id !== id);
    localStorage.setItem('ad_entries', JSON.stringify(filtered));
    return;
  }
  const database = await getDB();
  await database.runAsync('DELETE FROM entries WHERE id = ?', [id]);
}

export async function deleteAllEntries(): Promise<void> {
  if (Platform.OS === 'web') {
    localStorage.removeItem('ad_entries');
    return;
  }
  const database = await getDB();
  await database.runAsync('DELETE FROM entries');
}

// === Settings ===

export async function loadSettings(): Promise<Settings> {
  if (Platform.OS === 'web') {
    const raw = localStorage.getItem('ad_settings');
    const loaded = raw ? JSON.parse(raw) : {};
    return { ...defaultSettings, ...loaded } as Settings;
  }
  const database = await getDB();
  const rows = await database.getAllAsync('SELECT * FROM settings');
  const loaded: Record<string, unknown> = {};
  for (const row of rows) {
    try {
      loaded[row.key] = JSON.parse(row.value);
    } catch {
      loaded[row.key] = row.value;
    }
  }
  return { ...defaultSettings, ...loaded } as Settings;
}

export async function saveSetting(key: string, value: unknown): Promise<void> {
  if (Platform.OS === 'web') {
    const raw = localStorage.getItem('ad_settings');
    const loaded = raw ? JSON.parse(raw) : {};
    loaded[key] = value;
    localStorage.setItem('ad_settings', JSON.stringify(loaded));
    return;
  }
  const database = await getDB();
  await database.runAsync(
    'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)',
    [key, JSON.stringify(value)],
  );
}

// === Weekly Reels ===

// === Categories ===
export async function getAllCategories(): Promise<Category[]> {
  const defaults: Category[] = [
    { id: 'cat-work', name: 'Công việc', emoji: '💼', color: '#6366F1', sortOrder: 0, isDefault: true },
    { id: 'cat-family', name: 'Gia đình', emoji: '🏠', color: '#F59E0B', sortOrder: 1, isDefault: true },
    { id: 'cat-friends', name: 'Bạn bè', emoji: '🤝', color: '#10B981', sortOrder: 2, isDefault: true },
    { id: 'cat-love', name: 'Người yêu', emoji: '💕', color: '#EC4899', sortOrder: 3, isDefault: true },
    { id: 'cat-self', name: 'Bản thân', emoji: '🌱', color: '#8B5CF6', sortOrder: 4, isDefault: true },
    { id: 'cat-travel', name: 'Du lịch', emoji: '✈️', color: '#0EA5E9', sortOrder: 5, isDefault: true },
  ];

  if (Platform.OS === 'web') {
    const raw = localStorage.getItem('ad_categories');
    if (!raw) {
      localStorage.setItem('ad_categories', JSON.stringify(defaults));
      return defaults;
    }
    return JSON.parse(raw);
  }

  const database = await getDB();
  const rows = await database.getAllAsync('SELECT * FROM categories ORDER BY sortOrder ASC');
  
  // Seed default categories if empty
  if (rows.length === 0) {
    for (const cat of defaults) {
      await insertCategory(cat);
    }
    return defaults;
  }
  
  return rows.map((r: any) => ({
    ...r,
    isDefault: Boolean(r.isDefault)
  }));
}

export async function insertCategory(cat: Category): Promise<void> {
  if (Platform.OS === 'web') {
    const categories = await getAllCategories();
    categories.push(cat);
    localStorage.setItem('ad_categories', JSON.stringify(categories));
    return;
  }
  const database = await getDB();
  await database.runAsync(
    `INSERT OR REPLACE INTO categories (id, name, emoji, color, sortOrder, isDefault) VALUES (?, ?, ?, ?, ?, ?)`,
    [cat.id, cat.name, cat.emoji, cat.color, cat.sortOrder, cat.isDefault ? 1 : 0]
  );
}

export async function updateCategory(id: string, patch: Partial<Category>): Promise<void> {
  if (Platform.OS === 'web') {
    const categories = await getAllCategories();
    const index = categories.findIndex(c => c.id === id);
    if (index >= 0) {
      categories[index] = { ...categories[index], ...patch };
      localStorage.setItem('ad_categories', JSON.stringify(categories));
    }
    return;
  }
  const database = await getDB();
  const keys = Object.keys(patch);
  if (keys.length === 0) return;
  
  const setClauses = keys.map(k => `${k} = ?`).join(', ');
  const values = keys.map(k => {
    const val = patch[k as keyof Category];
    if (k === 'isDefault') return val ? 1 : 0;
    return val;
  });
  
  await database.runAsync(`UPDATE categories SET ${setClauses} WHERE id = ?`, [...values, id]);
}

export async function deleteCategory(id: string): Promise<void> {
  if (Platform.OS === 'web') {
    const categories = await getAllCategories();
    const updated = categories.filter(c => c.id !== id);
    localStorage.setItem('ad_categories', JSON.stringify(updated));
    return;
  }
  const database = await getDB();
  // Don't delete if it's default, but UI should handle that logic. Double check here:
  await database.runAsync(`DELETE FROM categories WHERE id = ? AND isDefault = 0`, [id]);
  // Also nullify categoryId in entries
  await database.runAsync(`UPDATE entries SET categoryId = NULL WHERE categoryId = ?`, [id]);
}


export async function getAllReels(): Promise<WeeklyReel[]> {
  if (Platform.OS === 'web') {
    const raw = localStorage.getItem('ad_reels');
    return raw ? JSON.parse(raw) : [];
  }
  const database = await getDB();
  const rows = await database.getAllAsync('SELECT * FROM weekly_reels ORDER BY startDate DESC');
  return rows.map(rowToReel);
}

export async function insertReel(reel: WeeklyReel): Promise<void> {
  if (Platform.OS === 'web') {
    const all = await getAllReels();
    const existing = all.findIndex((r) => r.weekId === reel.weekId);
    if (existing >= 0) all[existing] = reel;
    else all.push(reel);
    all.sort((a, b) => b.startDate.localeCompare(a.startDate));
    localStorage.setItem('ad_reels', JSON.stringify(all));
    return;
  }
  const database = await getDB();
  await database.runAsync(
    `INSERT OR REPLACE INTO weekly_reels (weekId, startDate, endDate, dateRange, entryCount, coverImageId, coverTone, entryIds)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      reel.weekId,
      reel.startDate,
      reel.endDate,
      reel.dateRange,
      reel.entryCount,
      reel.coverImageId ?? null,
      reel.coverTone,
      JSON.stringify(reel.entryIds),
    ],
  );
}

// === Highlights CRUD ===

export async function getAllHighlights(): Promise<HighlightCollection[]> {
  if (Platform.OS === 'web') {
    const raw = localStorage.getItem('ad_highlights');
    return raw ? JSON.parse(raw) : [];
  }
  const database = await getDB();
  const rows = await database.getAllAsync('SELECT * FROM highlights ORDER BY createdAt DESC');
  return rows.map(rowToHighlight);
}

export async function insertHighlight(highlight: HighlightCollection): Promise<void> {
  if (Platform.OS === 'web') {
    const all = await getAllHighlights();
    const existing = all.findIndex((h) => h.id === highlight.id);
    if (existing >= 0) all[existing] = highlight;
    else all.push(highlight);
    all.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    localStorage.setItem('ad_highlights', JSON.stringify(all));
    return;
  }
  const database = await getDB();
  await database.runAsync(
    `INSERT OR REPLACE INTO highlights (id, title, coverImageUri, entryIds, createdAt)
     VALUES (?, ?, ?, ?, ?)`,
    [
      highlight.id,
      highlight.title,
      highlight.coverImageUri ?? null,
      JSON.stringify(highlight.entryIds),
      highlight.createdAt,
    ],
  );
}

export async function deleteHighlight(id: string): Promise<void> {
  if (Platform.OS === 'web') {
    const all = await getAllHighlights();
    localStorage.setItem('ad_highlights', JSON.stringify(all.filter(h => h.id !== id)));
    return;
  }
  const database = await getDB();
  await database.runAsync('DELETE FROM highlights WHERE id = ?', [id]);
}

// === Row Mappers ===

function rowToEntry(row: Record<string, unknown>): Entry {
  let media = [];
  try {
    if (row.media && row.media !== '[]') {
      media = JSON.parse(row.media as string);
    }
  } catch (e) {}

  return {
    id: row.id as string,
    categoryId: (row.categoryId as string) ?? undefined,
    date: row.date as string,
    time: row.time as string,
    mood: row.mood as Entry['mood'],
    text: (row.text as string) ?? undefined,
    aiSuggestion: (row.aiSuggestion as string) ?? undefined,
    media: media.length > 0 ? media : undefined,
    imageLocalId: (row.imageLocalId as string) ?? undefined,
    imageUri: (row.imageUri as string) ?? undefined,
    voiceMemoUri: (row.voiceMemoUri as string) ?? undefined,
    voiceMemoDurationMs: (row.voiceMemoDurationMs as number) || 0,
    locationName: (row.locationName as string) ?? undefined,
    locationLat: row.locationLat != null ? Number(row.locationLat) : undefined,
    locationLon: row.locationLon != null ? Number(row.locationLon) : undefined,
    source: row.source as Entry['source'],
    status: row.status as Entry['status'],
    isHighlight: Boolean(row.isHighlight),
  };
}

function rowToReel(row: Record<string, unknown>): WeeklyReel {
  let entryIds: string[] = [];
  try {
    entryIds = JSON.parse(row.entryIds as string);
  } catch {
    entryIds = [];
  }
  return {
    weekId: row.weekId as string,
    startDate: row.startDate as string,
    endDate: row.endDate as string,
    dateRange: row.dateRange as string,
    entryCount: Number(row.entryCount),
    coverImageId: (row.coverImageId as string) ?? undefined,
    coverTone: row.coverTone as string,
    entryIds,
  };
}

function rowToHighlight(row: Record<string, unknown>): HighlightCollection {
  let entryIds: string[] = [];
  try {
    entryIds = JSON.parse(row.entryIds as string);
  } catch {
    entryIds = [];
  }
  return {
    id: row.id as string,
    title: row.title as string,
    coverImageUri: (row.coverImageUri as string) ?? undefined,
    entryIds,
    createdAt: row.createdAt as string,
  };
}
