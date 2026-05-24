import { Platform } from 'react-native';
import { Entry, Settings, WeeklyReel } from '../types';

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
  `
  // Add new fields (e.g. tags, sync status) as new migrations here in the future
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
      await database.runAsync('INSERT INTO schema_version (version) VALUES (?)', [i + 1]);
    } catch (e) {
      console.error(`Migration ${i + 1} failed:`, e);
      throw e;
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
    `INSERT OR REPLACE INTO entries (id, date, time, mood, text, aiSuggestion, imageLocalId, imageUri, locationName, locationLat, locationLon, source, status, isHighlight)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      entry.id,
      entry.date,
      entry.time,
      entry.mood,
      entry.text ?? null,
      entry.aiSuggestion ?? null,
      entry.imageLocalId ?? null,
      entry.imageUri ?? null,
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
  const values = entries.map(([_, v]) => {
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

// === Row Mappers ===

function rowToEntry(row: Record<string, unknown>): Entry {
  return {
    id: row.id as string,
    date: row.date as string,
    time: row.time as string,
    mood: row.mood as Entry['mood'],
    text: (row.text as string) ?? undefined,
    aiSuggestion: (row.aiSuggestion as string) ?? undefined,
    imageLocalId: (row.imageLocalId as string) ?? undefined,
    imageUri: (row.imageUri as string) ?? undefined,
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
