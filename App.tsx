import 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { View, Image, Appearance, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Text } from './src/components/AppText';
import { useTranslation } from './src/i18n/translations';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useJournalStore } from './src/memory/store';
import { AppNavigator } from './src/navigation/AppNavigator';
import { checkBiometricAvailability } from './src/skills/permissions';
import { syncWidgetData } from './src/skills/widget';
import { registerAutoTracker, unregisterAutoTracker, runAutoTrackerOnce } from './src/skills/autoTracker';
import {
  useFonts,
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
} from '@expo-google-fonts/plus-jakarta-sans';
import { styles } from './src/styles';
import { palette } from './src/theme/palette';

export default function App() {
  const { hydrated, initStore, updateSettings, settings, entries } = useJournalStore();
  const { t } = useTranslation();

  const [fontsLoaded] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });

  useEffect(() => {
    initStore();
  }, [initStore]);

  useEffect(() => {
    if (hydrated) {
      syncWidgetData(entries);
    }
  }, [hydrated, entries]);

  useEffect(() => {
    if (!hydrated) return;
    if (settings?.autoTrackingEnabled) {
      registerAutoTracker();
      runAutoTrackerOnce().catch((err) => {
        console.warn('[App] runAutoTrackerOnce failed:', err);
      });
    } else {
      unregisterAutoTracker();
    }
  }, [hydrated, settings?.autoTrackingEnabled]);

  useEffect(() => {
    if (!hydrated) return;
    checkBiometricAvailability().then((available) => {
      updateSettings('biometricAvailable', available);
    });
  }, [hydrated, updateSettings]);

  const storeTheme = settings?.theme;
  const systemColorScheme = Appearance.getColorScheme();
  const activeTheme = storeTheme === 'system' ? (systemColorScheme || 'light') : (storeTheme || 'light');

  if (!hydrated || !fontsLoaded) {
    return (
      <SafeAreaProvider>
        <View style={[styles.root, { justifyContent: 'center', alignItems: 'center' }]}>
          <StatusBar style={activeTheme === 'dark' ? 'light' : 'dark'} />
          <Ionicons name="journal-outline" size={48} color={palette.primary} />
          <Text style={[styles.loadingText, { marginTop: 16, color: palette.primary }]}>{t.common.loading}</Text>
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <BottomSheetModalProvider>
          <View style={styles.root}>
            <StatusBar style={activeTheme === 'dark' ? 'light' : 'dark'} />
            <View style={[styles.phone, { position: 'relative', overflow: 'hidden' }]}>
              {(() => {
                const hexToRgba = (hex: string, opacity: number) => {
                  if (hex.startsWith('#')) {
                    const r = parseInt(hex.slice(1, 3), 16);
                    const g = parseInt(hex.slice(3, 5), 16);
                    const b = parseInt(hex.slice(5, 7), 16);
                    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
                  }
                  return hex;
                };
                
                return settings?.wallpaperUri ? (
                  <View style={StyleSheet.absoluteFill} pointerEvents="none">
                    <Image
                      source={{ uri: settings.wallpaperUri }}
                      style={[StyleSheet.absoluteFill, { opacity: activeTheme === 'light' ? 0.6 : 0.25 }]}
                      resizeMode="cover"
                    />
                    <View
                      style={[
                        StyleSheet.absoluteFill,
                        { backgroundColor: hexToRgba(palette.background, activeTheme === 'light' ? 0.72 : 0.85) }
                      ]}
                    />
                  </View>
                ) : activeTheme === 'light' ? (
                  <View style={StyleSheet.absoluteFill} pointerEvents="none">
                    {/* Cloud image with purple tint overlay */}
                    <Image
                      source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBiR4uweHpx9LV4fjLnzHs0Mvm763u_O9nGeoJC5ZZ8BnETlTzKAO2nC2UZX6Gccs_lkZK8YYSKHlJwsPR2X1fyGrsVXvRFy_OZkvpCuGSJ8KGJOeQ4f73IC9B6durF8FKt7pRtbii6qWbLWRNyHHiMgrDP26RQyuBO74WTsG-ttFsbHthMkQ1pR2-wdSbbB1fys2Xyne-eH6-wuXhCuR17W3KFOUyNf-q6ggHwrIFJW1nbqjjZDPEYdMbldo8zBwQjBud0Ub274obu' }}
                      style={[StyleSheet.absoluteFill, { opacity: 0.45 }]}
                      resizeMode="cover"
                    />
                    {/* Strong purple colour wash over the cloud */}
                    <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(107, 33, 168, 0.38)' }]} />
                    {/* Soft lavender base overlay */}
                    <View style={[StyleSheet.absoluteFill, { backgroundColor: hexToRgba('#F5F0FF', 0.55) }]} />
                  </View>
                ) : (
                  <>
                    <View style={styles.luminousBlob1} pointerEvents="none" />
                    <View style={styles.luminousBlob2} pointerEvents="none" />
                    <View style={styles.luminousBlob3} pointerEvents="none" />
                  </>
                );
              })()}
              <AppNavigator />
            </View>
          </View>
        </BottomSheetModalProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
