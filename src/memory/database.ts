import * as SQLite from 'expo-sqlite';
import { Entry, Settings, WeeklyReel } from '../types';
import { initialSettings } from '../data/mockData';

const DB_NAME = 'auto_diary.db';

// === Database Instance ===
let db: SQLite.SQLiteDatabase | null = null;

async function getDB(): Promise<SQLite.SQLiteDatabase> {
  if (!db) {
    db = await SQLite.openDatabaseAsync(DB_NAME);
    await initTables(db);
  }
  return db;
}

// === Table Initialization ===
async function initTables(database: SQLite.SQLiteDatabase): Promise<void> {
  await database.execAsync(`
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
  `);
}

// === Entry CRUD ===

export async function getAllEntries(): Promise<Entry[]> {
  const database = await getDB();
  const rows = await database.getAllAsync<Record<string, unknown>>('SELECT * FROM entries ORDER BY date, time');
  return rows.map(rowToEntry);
}

export async function getEntriesByDate(date: string): Promise<Entry[]> {
  const database = await getDB();
  const rows = await database.getAllAsync<Record<string, unknown>>(
    'SELECT * FROM entries WHERE date = ? ORDER BY time',
    [date],
  );
  return rows.map(rowToEntry);
}

export async function insertEntry(entry: Entry): Promise<void> {
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
  const database = await getDB();
  await database.runAsync(
    'UPDATE entries SET status = ?, isHighlight = ? WHERE id = ?',
    [status, isHighlight ? 1 : 0, id],
  );
}

export async function deleteEntry(id: string): Promise<void> {
  const database = await getDB();
  await database.runAsync('DELETE FROM entries WHERE id = ?', [id]);
}

export async function deleteAllEntries(): Promise<void> {
  const database = await getDB();
  await database.runAsync('DELETE FROM entries');
}

// === Settings ===

export async function loadSettings(): Promise<Settings> {
  const database = await getDB();
  const rows = await database.getAllAsync<{ key: string; value: string }>('SELECT * FROM settings');
  const loaded: Record<string, unknown> = {};
  for (const row of rows) {
    try {
      loaded[row.key] = JSON.parse(row.value);
    } catch {
      loaded[row.key] = row.value;
    }
  }
  return { ...initialSettings, ...loaded } as Settings;
}

export async function saveSetting(key: string, value: unknown): Promise<void> {
  const database = await getDB();
  await database.runAsync(
    'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)',
    [key, JSON.stringify(value)],
  );
}

// === Weekly Reels ===

export async function getAllReels(): Promise<WeeklyReel[]> {
  const database = await getDB();
  const rows = await database.getAllAsync<Record<string, unknown>>('SELECT * FROM weekly_reels ORDER BY startDate DESC');
  return rows.map(rowToReel);
}

export async function insertReel(reel: WeeklyReel): Promise<void> {
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
