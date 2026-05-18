import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const KEYS = {
  PIN_HASH: 'auto_diary_pin_hash',
  FACE_ID_ENABLED: 'auto_diary_face_id_enabled',
} as const;

const webStore = {
  async setItem(key: string, value: string) {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(key, value);
    }
  },
  async getItem(key: string) {
    if (typeof localStorage === 'undefined') {
      return null;
    }
    return localStorage.getItem(key);
  },
  async deleteItem(key: string) {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(key);
    }
  },
};

// === PIN Code ===

/**
 * Save a hashed PIN code. Never store PIN in plain text.
 * In a real app, hash the PIN before calling this function.
 */
export async function savePinHash(hash: string): Promise<void> {
  if (Platform.OS === 'web') return webStore.setItem(KEYS.PIN_HASH, hash);
  await SecureStore.setItemAsync(KEYS.PIN_HASH, hash);
}

/**
 * Retrieve the stored PIN hash. Returns null if no PIN is set.
 */
export async function getPinHash(): Promise<string | null> {
  if (Platform.OS === 'web') return webStore.getItem(KEYS.PIN_HASH);
  return SecureStore.getItemAsync(KEYS.PIN_HASH);
}

/**
 * Remove the stored PIN hash (disable PIN lock).
 */
export async function removePinHash(): Promise<void> {
  if (Platform.OS === 'web') return webStore.deleteItem(KEYS.PIN_HASH);
  await SecureStore.deleteItemAsync(KEYS.PIN_HASH);
}

/**
 * Check if a PIN code has been set.
 */
export async function hasPinCode(): Promise<boolean> {
  const hash = await getPinHash();
  return hash != null && hash.length > 0;
}

export async function savePin(pin: string): Promise<void> {
  await savePinHash(simpleHash(pin));
}

export async function verifyPin(pin: string): Promise<boolean> {
  const currentHash = await getPinHash();
  return currentHash != null && currentHash === simpleHash(pin);
}

// === Face ID / Biometric Flag ===

/**
 * Save the Face ID / biometric enabled flag.
 */
export async function setFaceIDEnabled(enabled: boolean): Promise<void> {
  if (Platform.OS === 'web') return webStore.setItem(KEYS.FACE_ID_ENABLED, enabled ? 'true' : 'false');
  await SecureStore.setItemAsync(KEYS.FACE_ID_ENABLED, enabled ? 'true' : 'false');
}

/**
 * Check if Face ID / biometric lock is enabled.
 */
export async function isFaceIDEnabled(): Promise<boolean> {
  if (Platform.OS === 'web') return (await webStore.getItem(KEYS.FACE_ID_ENABLED)) === 'true';
  const value = await SecureStore.getItemAsync(KEYS.FACE_ID_ENABLED);
  return value === 'true';
}

// === Simple Hash Utility ===

/**
 * Simple hash function for PIN codes.
 * TODO: Replace with a proper crypto hash (e.g., SHA-256) for production.
 */
export function simpleHash(input: string): string {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36);
}
