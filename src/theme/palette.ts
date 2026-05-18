import { Appearance } from 'react-native';
import { useJournalStore } from '../memory/store';
import { AccentColor } from '../types';

const lightPalette = {
  background: '#f6faff',       // Soft cream/light blue
  slate: '#ffffff',            // White surface
  primary: '#031f41',          // Deep Navy primary text
  secondary: '#586158',        // Sage green secondary
  tertiary: '#002425',         // Terracotta/deep teal
  onSurface: '#001e2e',        // Very dark blue text
  onSurfaceVariant: '#44474e',  // Muted gray-blue body
  outline: '#c4c6cf',          // Thin border outline
  outlineVariant: '#e1e3eb',
  primaryContainer: '#dff0ff', // Soft sky blue highlight container
  secondaryContainer: '#dce5d9',
  white: '#FFFFFF',
  black: '#000000',
  glow: 'rgba(3, 31, 65, 0.15)',
  red: '#ba1a1a',

  // === Compatibility Aliases ===
  green: '#031f41',
  greenSoft: '#dff0ff',
  ink: '#001e2e',
  muted: '#44474e',
  paper: '#f6faff',
  cream: '#ffffff',
  mint: '#eaf5ff',
  blue: '#485f84',
  line: '#c4c6cf',
  coral: '#002425',
};

const darkPalette = {
  background: '#0B132B',       // Deep Navy Base
  slate: '#1C2541',            // Slate surface
  primary: '#5BC0BE',          // Neon Teal accent
  secondary: '#4A607C',        // Trust Blue
  tertiary: '#924B29',         // Terracotta Accent
  onSurface: '#FFFFFF',        // High contrast text
  onSurfaceVariant: '#dbe1ff',  // Soft high contrast text
  outline: 'rgba(255, 255, 255, 0.1)',  // Borders
  outlineVariant: 'rgba(255, 255, 255, 0.2)', // Top-weighted borders
  primaryContainer: 'rgba(91, 192, 190, 0.15)', // Glass glow
  secondaryContainer: 'rgba(74, 96, 124, 0.15)', // Glass secondary
  white: '#FFFFFF',
  black: '#000000',
  glow: 'rgba(91, 192, 190, 0.4)',
  red: '#BA1A1A',

  // === Compatibility Aliases ===
  green: '#5BC0BE',
  greenSoft: 'rgba(91, 192, 190, 0.15)',
  ink: '#FFFFFF',
  muted: '#dbe1ff',
  paper: '#0B132B',
  cream: 'rgba(28, 37, 65, 0.7)',
  mint: 'rgba(91, 192, 190, 0.08)',
  blue: '#4A607C',
  line: 'rgba(255, 255, 255, 0.08)',
  coral: '#924B29',
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
    primary: '#4A3C6B',
    primaryContainer: '#E2DDF0',
    glow: 'rgba(74, 60, 107, 0.15)',
    background: '#f5f2fa',
    slate: '#ffffff',
  },
  terracotta: {
    primary: '#8E3E26',
    primaryContainer: '#F5D6CD',
    glow: 'rgba(142, 62, 38, 0.15)',
    background: '#faf4f1',
    slate: '#ffffff',
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
    primary: '#BCA8EB',
    primaryContainer: 'rgba(188, 168, 235, 0.15)',
    glow: 'rgba(188, 168, 235, 0.4)',
    background: '#130F1A',
    slate: '#1D1728',
  },
  terracotta: {
    primary: '#E88C74',
    primaryContainer: 'rgba(232, 140, 116, 0.15)',
    glow: 'rgba(232, 140, 116, 0.4)',
    background: '#1A100E',
    slate: '#281C19',
  },
};

const getActivePalette = () => {
  try {
    const store = useJournalStore.getState();
    const storeTheme = store?.settings?.theme;
    const accent = store?.settings?.accentColor || 'navy';
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
