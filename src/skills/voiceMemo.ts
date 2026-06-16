import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { Entry } from '../types';

export const VOICE_MEMOS_DIR = FileSystem.documentDirectory + 'voice_memos/';

export async function ensureVoiceMemoDir() {
  const dirInfo = await FileSystem.getInfoAsync(VOICE_MEMOS_DIR);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(VOICE_MEMOS_DIR, { intermediates: true });
  }
}

export async function startRecording(): Promise<Audio.Recording | null> {
  try {
    const perm = await Audio.requestPermissionsAsync();
    if (perm.status !== 'granted') {
      return null;
    }
    
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });
    
    await ensureVoiceMemoDir();
    
    const { recording } = await Audio.Recording.createAsync(
      Audio.RecordingOptionsPresets.HIGH_QUALITY
    );
    return recording;
  } catch (err) {
    console.error('Failed to start recording', err);
    return null;
  }
}

export async function stopAndSaveRecording(recording: Audio.Recording, entryId: string): Promise<{ uri: string, durationMs: number } | null> {
  try {
    try {
      await recording.stopAndUnloadAsync();
    } catch (unloadErr: any) {
      if (!unloadErr.message?.includes('already been unloaded')) {
        throw unloadErr;
      }
    }
    
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
    });
    
    const uri = recording.getURI();
    let durationMs = 0;
    try {
      const status = await recording.getStatusAsync();
      durationMs = status.durationMillis;
    } catch (statusErr) {
      // Ignore if status cannot be retrieved after unload
    }
    
    if (!uri) return null;
    
    const ext = uri.split('.').pop() || 'm4a';
    const newUri = VOICE_MEMOS_DIR + `${entryId}.${ext}`;
    
    await FileSystem.moveAsync({
      from: uri,
      to: newUri,
    });
    
    return { uri: newUri, durationMs };
  } catch (err) {
    console.error('Failed to stop/save recording', err);
    return null;
  }
}

export async function deleteVoiceMemo(uri: string) {
  try {
    if (!uri) return;
    const fileInfo = await FileSystem.getInfoAsync(uri);
    if (fileInfo.exists) {
      await FileSystem.deleteAsync(uri);
    }
  } catch (err) {
    console.error('Failed to delete voice memo', err);
  }
}

export async function cleanupOrphanedVoiceMemos(entries: Entry[]) {
  try {
    const dirInfo = await FileSystem.getInfoAsync(VOICE_MEMOS_DIR);
    if (!dirInfo.exists) return;
    
    const files = await FileSystem.readDirectoryAsync(VOICE_MEMOS_DIR);
    const activeUris = new Set(entries.map(e => e.voiceMemoUri).filter(Boolean));
    
    for (const file of files) {
      const uri = VOICE_MEMOS_DIR + file;
      if (!activeUris.has(uri)) {
        await deleteVoiceMemo(uri);
        console.log('[VoiceMemo] Deleted orphaned file:', file);
      }
    }
  } catch (err) {
    console.error('Failed to cleanup voice memos', err);
  }
}

export function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}
