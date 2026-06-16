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
import { zip, unzip } from 'react-native-zip-archive';
import { useJournalStore } from '../memory/store';
import { getLocalDateString } from '../utils/dateUtils';
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

    const [entries, reels, settings] = await Promise.all([
      getAllEntries(),
      getAllReels(),
      loadSettings(),
    ]);

    const safeSettings: Partial<Settings> = { ...settings };
    delete (safeSettings as any).pinCodeHash;

    const stagingDir = FileSystem.cacheDirectory + 'backup_staging/';
    const mediaDir = stagingDir + 'media/';
    const voiceMemosDir = stagingDir + 'voice_memos/';
    await FileSystem.deleteAsync(stagingDir, { idempotent: true });
    await FileSystem.makeDirectoryAsync(mediaDir, { intermediates: true });
    await FileSystem.makeDirectoryAsync(voiceMemosDir, { intermediates: true });

    const bundleEntries = JSON.parse(JSON.stringify(entries));
    for (const entry of bundleEntries) {
      if (entry.imageUri && entry.imageUri.startsWith('file://')) {
        const filename = entry.imageUri.split('/').pop() || `${entry.id}.jpg`;
        try {
          await FileSystem.copyAsync({ from: entry.imageUri, to: mediaDir + filename });
          entry.imageUri = 'media/' + filename;
        } catch (e) {
          console.warn(`Backup image failed for ${entry.id}`, e);
        }
      }
      if (entry.voiceMemoUri && entry.voiceMemoUri.startsWith('file://')) {
        const filename = entry.voiceMemoUri.split('/').pop() || `${entry.id}.m4a`;
        try {
          await FileSystem.copyAsync({ from: entry.voiceMemoUri, to: voiceMemosDir + filename });
          entry.voiceMemoUri = 'voice_memos/' + filename;
        } catch (e) {
          console.warn(`Backup voice memo failed for ${entry.id}`, e);
        }
      }
    }

    const bundle: BackupBundle = {
      magic: BACKUP_MAGIC,
      exportedAt: new Date().toISOString(),
      version: 1,
      entries: bundleEntries,
      reels,
      settings: safeSettings,
      mediaIndex: {},
    };

    const plainJson = JSON.stringify(bundle);
    const obfuscated = obfuscate(plainJson);
    await FileSystem.writeAsStringAsync(stagingDir + 'metadata.json', obfuscated, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    const fileName = `daily_log_backup_${getLocalDateString()}.dailylog`;
    const zipPath = `${FileSystem.cacheDirectory}${fileName}`;
    await FileSystem.deleteAsync(zipPath, { idempotent: true });
    
    await zip(stagingDir, zipPath);
    await FileSystem.deleteAsync(stagingDir, { idempotent: true });

    const shared = await Share.share({
      title: 'Daily Log Backup',
      message: Platform.OS === 'android' ? `Backup created: ${fileName}` : undefined,
      url: zipPath,
    });

    if (shared.action === Share.dismissedAction) {
      return { success: false, error: 'Share cancelled' };
    }

    return { success: true, filePath: zipPath, entryCount: entries.length };
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

    const result = await DocumentPicker.getDocumentAsync({
      type: '*/*',
      copyToCacheDirectory: true,
      multiple: false,
    });

    if (result.canceled || !result.assets?.length) {
      return { success: false, error: 'No file selected' };
    }

    const fileUri = result.assets[0].uri;
    const extractDir = FileSystem.cacheDirectory + 'backup_extract/';
    await FileSystem.deleteAsync(extractDir, { idempotent: true });
    await FileSystem.makeDirectoryAsync(extractDir, { intermediates: true });

    try {
      await unzip(fileUri, extractDir);
    } catch (e) {
      // Fallback: If it's not a zip, maybe it's just the old JSON obfuscated file
      await FileSystem.copyAsync({ from: fileUri, to: extractDir + 'metadata.json' });
    }

    const metadataPath = extractDir + 'metadata.json';
    const metadataInfo = await FileSystem.getInfoAsync(metadataPath);
    if (!metadataInfo.exists) {
      return { success: false, error: 'Invalid backup format' };
    }

    const raw = await FileSystem.readAsStringAsync(metadataPath, { encoding: FileSystem.EncodingType.UTF8 });
    
    let bundle: BackupBundle;
    try {
      const plain = deobfuscate(raw);
      bundle = JSON.parse(plain) as BackupBundle;
    } catch {
      try {
        bundle = JSON.parse(raw) as BackupBundle;
      } catch {
        return { success: false, error: 'Invalid backup file format' };
      }
    }

    if (bundle.magic !== BACKUP_MAGIC) {
      return { success: false, error: 'Not a valid Daily Log backup file' };
    }

    const docDir = FileSystem.documentDirectory;
    const newEntries = bundle.entries ?? [];
    
    for (const entry of newEntries) {
      if (entry.imageUri && entry.imageUri.startsWith('media/')) {
        const filename = entry.imageUri.replace('media/', '');
        const sourcePath = extractDir + entry.imageUri;
        const destPath = docDir + filename;
        
        try {
          const info = await FileSystem.getInfoAsync(sourcePath);
          if (info.exists) {
            await FileSystem.copyAsync({ from: sourcePath, to: destPath });
            entry.imageUri = destPath;
          } else {
            entry.imageUri = undefined;
          }
        } catch (e) {
          entry.imageUri = undefined;
        }
      }
      if (entry.voiceMemoUri && entry.voiceMemoUri.startsWith('voice_memos/')) {
        const filename = entry.voiceMemoUri.replace('voice_memos/', '');
        const sourcePath = extractDir + entry.voiceMemoUri;
        const destPath = docDir + 'voice_memos/' + filename;
        
        try {
          await FileSystem.makeDirectoryAsync(docDir + 'voice_memos/', { intermediates: true });
          const info = await FileSystem.getInfoAsync(sourcePath);
          if (info.exists) {
            await FileSystem.copyAsync({ from: sourcePath, to: destPath });
            entry.voiceMemoUri = destPath;
          } else {
            entry.voiceMemoUri = undefined;
          }
        } catch (e) {
          entry.voiceMemoUri = undefined;
        }
      }
    }

    await FileSystem.deleteAsync(extractDir, { idempotent: true });

    // Wipe and restore Database
    await deleteAllEntries();
    for (const entry of newEntries) {
      await insertEntry(entry);
    }
    for (const reel of bundle.reels ?? []) {
      await insertReel(reel);
    }

    const SAFE_SETTINGS_KEYS: Array<keyof Settings> = [
      'theme', 'language', 'accentColor', 'autoTrackingEnabled',
      'allowPhotos', 'allowLocation', 'allowCalendar',
    ];
    for (const key of SAFE_SETTINGS_KEYS) {
      const value = bundle.settings?.[key];
      if (value !== undefined) await saveSetting(key, value);
    }

    // Refresh Zustand store to reflect UI immediately
    const store = useJournalStore.getState();
    await store.restoreFromBackup(newEntries, bundle.settings, bundle.reels ?? []);

    return { success: true, entryCount: newEntries.length };
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
    a.download = `daily_log_backup_${getLocalDateString()}.json`;
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
