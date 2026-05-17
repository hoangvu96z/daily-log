import { Appearance } from 'react-native';
import { useJournalStore } from '../memory/store';

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

const getActivePalette = () => {
  try {
    const store = useJournalStore.getState();
    const storeTheme = store?.settings?.theme;
    if (storeTheme === 'dark') {
      return darkPalette;
    }
    if (storeTheme === 'light') {
      return lightPalette;
    }
    // system or default fallback
    const systemColorScheme = Appearance.getColorScheme();
    return systemColorScheme === 'dark' ? darkPalette : lightPalette;
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
