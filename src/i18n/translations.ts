export type Language = 'vi' | 'en';

export type TranslationKeys = typeof vi;

// === Vietnamese (default) ===

import { vi } from './vi';
import { en } from './en';

// === Translation Map ===
const translations: Record<Language, typeof vi> = { vi, en };

// === Access Function ===

import { useJournalStore } from '../memory/store';

export function getLanguage(): Language {
  try {
    return useJournalStore.getState().settings?.language || 'vi';
  } catch {
    return 'vi';
  }
}

export function t(): typeof vi {
  return translations[getLanguage()];
}

export function useTranslation() {
  const language = useJournalStore((state) => state.settings?.language || 'vi');
  return {
    t: translations[language],
    lang: language,
    locale: language === 'vi' ? 'vi-VN' : 'en-US',
  };
}

/**
 * Get the locale string for Intl.DateTimeFormat.
 */
export function getLocale(): string {
  return getLanguage() === 'vi' ? 'vi-VN' : 'en-US';
}

