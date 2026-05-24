export type Language = 'vi' | 'en';

export type TranslationKeys = typeof vi;

// === Vietnamese (default) ===

import { vi } from './vi';
import { en } from './en';

// === Translation Map ===
const translations: Record<Language, typeof vi> = { vi, en };

// === Access Function ===

let currentLanguage: Language = 'vi';

export function setLanguage(lang: Language): void {
  currentLanguage = lang;
}

export function getLanguage(): Language {
  return currentLanguage;
}

export function t(): typeof vi {
  return translations[currentLanguage];
}

import { useJournalStore } from '../memory/store';

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
  return currentLanguage === 'vi' ? 'vi-VN' : 'en-US';
}

