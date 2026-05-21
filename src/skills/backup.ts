/**
 * backup.ts — Encrypted Backup & Restore
 *
 * Flow:
 *  Export: gather DB data + media → JSON bundle → "encrypt" (Base64 obfuscation, real
 *          AES would require a native crypto lib) → write .dailylog file → share via
 *          system share-sheet (iCloud Drive, Google Drive, AirDrop, etc.)
 *
 *  Import: pick .dailylog file → decode → restore entries + settings + reels to DB
 *
 * Premium gate: callers must check `settings.isPremium` before invoking.
 *
 * Note on encryption:
 *  Expo's JS runtime has no native AES without a native module. We use a lightweight
 *  XOR + Base64 approach for obfuscation so the file is not human-readable.
 *  For production, swap `obfuscate/deobfuscate` with a proper AES-GCM implementation
 *  (e.g. expo-crypto + WebCrypto SubtleCrypto, which is available on SDK 51+).
 */

import { Platform, Share } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as DocumentPicker from 'expo-document-picker';
import {
  deleteAllEntries,
  getAllEntries,
  getAllReels,
  insertEntry,
  insertReel,
  loadSettings,
  saveSetting,
} from '../memory/database';
import { Entry, Settings, WeeklyReel } from '../types';

// ─── Constants ────────────────────────────────────────────────────────────────

/** Magic header so we recognise our own files */
const BACKUP_MAGIC = 'DAILYLOG_BACKUP_V1';

/** Very simple XOR key — intentionally not cryptographically strong */
const XOR_KEY = 'DailyLogPrivate2024!';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface BackupBundle {
  magic: string;
  exportedAt: string;     // ISO timestamp
  version: number;
  entries: Entry[];
  reels: WeeklyReel[];
  settings: Partial<Settings>;
  mediaIndex: Record<string, string>; // localId → base64 image data (future)
}

export interface BackupResult {
  success: boolean;
  error?: string;
  filePath?: string;
  entryCount?: number;
}

// ─── Obfuscation helpers ──────────────────────────────────────────────────────

function xorEncrypt(plain: string, key: string): string {
  let result = '';
  for (let i = 0; i < plain.length; i++) {
    result += String.fromCharCode(
      plain.charCodeAt(i) ^ key.charCodeAt(i % key.length),
    );
  }
  return result;
}

function obfuscate(plain: string): string {
  const xored = xorEncrypt(plain, XOR_KEY);
  return btoa(unescape(encodeURIComponent(xored)));
}

function deobfuscate(obfuscated: string): string {
  const decoded = decodeURIComponent(escape(atob(obfuscated)));
  return xorEncrypt(decoded, XOR_KEY);
}

// ─── Export ───────────────────────────────────────────────────────────────────

/**
 * Export all diary data to an encrypted .dailylog file and share it.
 * Returns a BackupResult describing success/failure.
 */
export async function exportBackup(): Promise<BackupResult> {
  try {
    if (Platform.OS === 'web') {
      return { success: false, error: 'Backup not supported on web' };
    }

    // 1. Gather data
    const [entries, reels, settings] = await Promise.all([
      getAllEntries(),
      getAllReels(),
      loadSettings(),
    ]);

    // Omit sensitive fields we don't want in backup (PIN hash is in SecureStore separately)
    const safeSettings: Partial<Settings> = { ...settings };
    delete (safeSettings as any).pinCodeHash;

    // 2. Build bundle
    const bundle: BackupBundle = {
      magic: BACKUP_MAGIC,
      exportedAt: new Date().toISOString(),
      version: 1,
      entries,
      reels,
      settings: safeSettings,
      mediaIndex: {}, // Media URIs are local paths; we store metadata only for now
    };

    // 3. Serialise + obfuscate
    const plainJson = JSON.stringify(bundle);
    const obfuscated = obfuscate(plainJson);

    // 4. Write to cache dir
    const fileName = `daily_log_backup_${new Date()
      .toISOString()
      .slice(0, 10)}.dailylog`;
    const filePath = `${FileSystem.cacheDirectory}${fileName}`;
    await FileSystem.writeAsStringAsync(filePath, obfuscated, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    // 5. Share via system share-sheet
    const shared = await Share.share({
      title: 'Daily Log Backup',
      message: Platform.OS === 'android' ? `Backup created: ${fileName}` : undefined,
      url: filePath, // iOS share sheet picks up the file
    });

    if (shared.action === Share.dismissedAction) {
      return { success: false, error: 'Share cancelled' };
    }

    return {
      success: true,
      filePath,
      entryCount: entries.length,
    };
  } catch (err: any) {
    console.error('[backup] exportBackup error:', err);
    return { success: false, error: err?.message ?? 'Unknown error' };
  }
}

// ─── Import / Restore ─────────────────────────────────────────────────────────

/**
 * Let the user pick a .dailylog file and restore data from it.
 * Existing entries/reels are REPLACED (entries deleted first).
 */
export async function importBackup(): Promise<BackupResult> {
  try {
    if (Platform.OS === 'web') {
      return { success: false, error: 'Restore not supported on web' };
    }

    // 1. Let user pick file
    const result = await DocumentPicker.getDocumentAsync({
      type: '*/*',          // no MIME filter — .dailylog is custom
      copyToCacheDirectory: true,
      multiple: false,
    });

    if (result.canceled || !result.assets?.length) {
      return { success: false, error: 'No file selected' };
    }

    const asset = result.assets[0];

    // 2. Read file
    const raw = await FileSystem.readAsStringAsync(asset.uri, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    // 3. Deobfuscate + parse
    let bundle: BackupBundle;
    try {
      const plain = deobfuscate(raw);
      bundle = JSON.parse(plain) as BackupBundle;
    } catch {
      // Try treating it as plain JSON (unobfuscated / older format)
      try {
        bundle = JSON.parse(raw) as BackupBundle;
      } catch {
        return { success: false, error: 'Invalid backup file format' };
      }
    }

    // 4. Validate magic
    if (bundle.magic !== BACKUP_MAGIC) {
      return { success: false, error: 'Not a valid Daily Log backup file' };
    }

    // 5. Wipe existing data
    await deleteAllEntries();

    // 6. Restore entries
    for (const entry of bundle.entries ?? []) {
      await insertEntry(entry);
    }

    // 7. Restore reels
    for (const reel of bundle.reels ?? []) {
      await insertReel(reel);
    }

    // 8. Restore non-sensitive settings (theme, language, accentColor, etc.)
    const SAFE_SETTINGS_KEYS: Array<keyof Settings> = [
      'theme',
      'language',
      'accentColor',
      'autoTrackingEnabled',
      'allowPhotos',
      'allowLocation',
      'allowCalendar',
    ];
    for (const key of SAFE_SETTINGS_KEYS) {
      const value = bundle.settings?.[key];
      if (value !== undefined) {
        await saveSetting(key, value);
      }
    }

    return {
      success: true,
      entryCount: bundle.entries?.length ?? 0,
    };
  } catch (err: any) {
    console.error('[backup] importBackup error:', err);
    return { success: false, error: err?.message ?? 'Unknown error' };
  }
}

// ─── Web fallback: JSON download / upload ─────────────────────────────────────

/**
 * Web-only: trigger browser file download of backup JSON.
 * Call this instead of exportBackup() when Platform.OS === 'web'.
 */
export async function exportBackupWeb(): Promise<BackupResult> {
  try {
    const [entries, reels, settings] = await Promise.all([
      getAllEntries(),
      getAllReels(),
      loadSettings(),
    ]);

    const bundle: BackupBundle = {
      magic: BACKUP_MAGIC,
      exportedAt: new Date().toISOString(),
      version: 1,
      entries,
      reels,
      settings: { ...settings },
      mediaIndex: {},
    };

    const blob = new Blob([JSON.stringify(bundle, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `daily_log_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);

    return { success: true, entryCount: entries.length };
  } catch (err: any) {
    return { success: false, error: err?.message ?? 'Unknown error' };
  }
}

/**
 * Web-only: trigger browser file input to pick & restore backup JSON.
 */
export function importBackupWeb(): Promise<BackupResult> {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,.dailylog';
    input.onchange = async (e: any) => {
      const file: File = e.target.files?.[0];
      if (!file) {
        resolve({ success: false, error: 'No file selected' });
        return;
      }
      try {
        const text = await file.text();
        let bundle: BackupBundle;
        try {
          const plain = deobfuscate(text);
          bundle = JSON.parse(plain);
        } catch {
          bundle = JSON.parse(text);
        }
        if (bundle.magic !== BACKUP_MAGIC) {
          resolve({ success: false, error: 'Not a valid Daily Log backup file' });
          return;
        }
        await deleteAllEntries();
        for (const entry of bundle.entries ?? []) await insertEntry(entry);
        for (const reel of bundle.reels ?? []) await insertReel(reel);
        resolve({ success: true, entryCount: bundle.entries?.length ?? 0 });
      } catch (err: any) {
        resolve({ success: false, error: err?.message ?? 'Parse error' });
      }
    };
    input.click();
  });
}
