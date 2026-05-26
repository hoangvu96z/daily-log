import { Appearance } from 'react-native';
import { useJournalStore } from '../memory/store';
import { AccentColor } from '../types';

const lightPalette = {
  background: '#F5F0FF',       // Soft lavender white
  slate: '#FDFBFF',            // Pure white-purple surface
  primary: '#6B21A8',          // Deep violet primary
  secondary: '#9333EA',        // Medium purple secondary
  tertiary: '#A855F7',         // Bright purple accent
  onSurface: '#1E0B3A',        // Very dark purple text
  onSurfaceVariant: '#5B4B8A', // Muted purple body
  outline: '#D8C8F0',          // Thin purple border
  outlineVariant: '#EDE5FB',   // Lighter border
  primaryContainer: '#EDE9FE', // Soft lavender highlight container
  secondaryContainer: '#E9D5FF',
  white: '#FFFFFF',
  black: '#000000',
  glow: 'rgba(107, 33, 168, 0.15)',
  red: '#ba1a1a',

  // === Compatibility Aliases ===
  green: '#6B21A8',
  greenSoft: '#EDE9FE',
  ink: '#1E0B3A',
  muted: '#5B4B8A',
  paper: '#F5F0FF',
  cream: '#FDFBFF',
  mint: '#F3E8FF',
  blue: '#7C3AED',
  line: '#D8C8F0',
  coral: '#6D28D9',
};

const darkPalette = {
  background: '#0D0818',       // Deep purple-black base
  slate: '#1A1030',            // Purple-dark surface
  primary: '#C084FC',          // Vivid purple accent
  secondary: '#A855F7',        // Medium purple
  tertiary: '#7C3AED',         // Deep violet
  onSurface: '#F3E8FF',        // Soft white-purple text
  onSurfaceVariant: '#D8B4FE', // Muted lavender text
  outline: 'rgba(192, 132, 252, 0.15)', // Purple borders
  outlineVariant: 'rgba(192, 132, 252, 0.25)',
  primaryContainer: 'rgba(192, 132, 252, 0.15)', // Glass purple glow
  secondaryContainer: 'rgba(168, 85, 247, 0.12)',
  white: '#FFFFFF',
  black: '#000000',
  glow: 'rgba(192, 132, 252, 0.45)',
  red: '#BA1A1A',

  // === Compatibility Aliases ===
  green: '#C084FC',
  greenSoft: 'rgba(192, 132, 252, 0.15)',
  ink: '#F3E8FF',
  muted: '#D8B4FE',
  paper: '#0D0818',
  cream: 'rgba(26, 16, 48, 0.75)',
  mint: 'rgba(192, 132, 252, 0.08)',
  blue: '#A855F7',
  line: 'rgba(192, 132, 252, 0.10)',
  coral: '#7C3AED',
};

const accentColorsLight: Record<AccentColor, { primary: string; primaryContainer: string; glow: string; background: string; slate: string }> = {
  navy: {
    primary: '#031f41',
    primaryContainer: '#dff0ff',
    glow: 'rgba(3, 31, 65, 0.15)',
    background: '#f6faff',
    slate: '#ffffff',
  },
  sage: {
    primary: '#2E4F32',
    primaryContainer: '#D0E8D3',
    glow: 'rgba(46, 79, 50, 0.15)',
    background: '#f2f8f3',
    slate: '#ffffff',
  },
  ocean: {
    primary: '#0B4F6C',
    primaryContainer: '#D1E8F2',
    glow: 'rgba(11, 79, 108, 0.15)',
    background: '#f0f7fa',
    slate: '#ffffff',
  },
  lavender: {
    primary: '#6B21A8',
    primaryContainer: '#EDE9FE',
    glow: 'rgba(107, 33, 168, 0.18)',
    background: '#F5F0FF',
    slate: '#FDFBFF',
  },
  terracotta: {
    primary: '#8E3E26',
    primaryContainer: '#F5D6CD',
    glow: 'rgba(142, 62, 38, 0.15)',
    background: '#faf4f1',
    slate: '#ffffff',
  },
  rosepink: {
    primary: '#D84B74',
    primaryContainer: '#FFEBF0',
    glow: 'rgba(216, 75, 116, 0.15)',
    background: '#FFF5F7',
    slate: '#FFFDFE',
  },
};

const accentColorsDark: Record<AccentColor, { primary: string; primaryContainer: string; glow: string; background: string; slate: string }> = {
  navy: {
    primary: '#5BC0BE',
    primaryContainer: 'rgba(91, 192, 190, 0.15)',
    glow: 'rgba(91, 192, 190, 0.4)',
    background: '#0B132B',
    slate: '#1C2541',
  },
  sage: {
    primary: '#8ED194',
    primaryContainer: 'rgba(142, 209, 148, 0.15)',
    glow: 'rgba(142, 209, 148, 0.4)',
    background: '#0E1A11',
    slate: '#16281B',
  },
  ocean: {
    primary: '#6AC9ED',
    primaryContainer: 'rgba(106, 201, 237, 0.15)',
    glow: 'rgba(106, 201, 237, 0.4)',
    background: '#08161D',
    slate: '#10232E',
  },
  lavender: {
    primary: '#C084FC',
    primaryContainer: 'rgba(192, 132, 252, 0.15)',
    glow: 'rgba(192, 132, 252, 0.45)',
    background: '#0D0818',
    slate: '#1A1030',
  },
  terracotta: {
    primary: '#E88C74',
    primaryContainer: 'rgba(232, 140, 116, 0.15)',
    glow: 'rgba(232, 140, 116, 0.4)',
    background: '#1A100E',
    slate: '#281C19',
  },
  rosepink: {
    primary: '#F472B6',
    primaryContainer: 'rgba(244, 114, 182, 0.15)',
    glow: 'rgba(244, 114, 182, 0.45)',
    background: '#18080F',
    slate: '#2E101D',
  },
};

const getActivePalette = () => {
  try {
    const store = useJournalStore.getState();
    const storeTheme = store?.settings?.theme;
    const accent = store?.settings?.accentColor || 'lavender'; // Purple as default
    const isDark = storeTheme === 'dark' || (storeTheme !== 'light' && Appearance.getColorScheme() === 'dark');
    
    const basePalette = isDark ? darkPalette : lightPalette;
    const accentTheme = isDark ? accentColorsDark[accent] : accentColorsLight[accent];
    
    // Parse deep dark slate for semi-transparent overlay sheets
    const slateColor = accentTheme.slate;
    const r = parseInt(slateColor.slice(1, 3), 16);
    const g = parseInt(slateColor.slice(3, 5), 16);
    const b = parseInt(slateColor.slice(5, 7), 16);
    const dynamicCream = isDark ? `rgba(${r}, ${g}, ${b}, 0.7)` : '#ffffff';

    return {
      ...basePalette,
      primary: accentTheme.primary,
      primaryContainer: accentTheme.primaryContainer,
      background: accentTheme.background,
      paper: accentTheme.background,
      slate: accentTheme.slate,
      cream: dynamicCream,
      green: accentTheme.primary,
      greenSoft: accentTheme.primaryContainer,
      glow: accentTheme.glow,
    };
  } catch (e) {
    // Fallback if accessed during early boot before store initialization
    return lightPalette;
  }
};

// === Exporting palette via Proxy for Dynamic Realtime Light/Dark switching ===
export const palette = new Proxy({} as typeof lightPalette, {
  get(target, prop) {
    const activePalette = getActivePalette();
    return activePalette[prop as keyof typeof lightPalette];
  },
  ownKeys() {
    return Reflect.ownKeys(lightPalette);
  },
  getOwnPropertyDescriptor(target, prop) {
    return Reflect.getOwnPropertyDescriptor(lightPalette, prop);
  }
});
