import 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { SafeAreaView, View, Image, Appearance, StyleSheet } from 'react-native';
import { Text } from './src/components/AppText';
import { useTranslation } from './src/i18n/translations';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useJournalStore } from './src/memory/store';
import { AppNavigator } from './src/navigation/AppNavigator';
import { checkBiometricAvailability } from './src/skills/permissions';
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
  const { hydrated, initStore, updateSettings, settings } = useJournalStore();
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
    checkBiometricAvailability().then((available) => {
      updateSettings('biometricAvailable', available);
    });
  }, [updateSettings]);

  const storeTheme = settings?.theme;
  const systemColorScheme = Appearance.getColorScheme();
  const activeTheme = storeTheme === 'system' ? (systemColorScheme || 'light') : (storeTheme || 'light');

  if (!hydrated || !fontsLoaded) {
    return (
      <SafeAreaView style={styles.root}>
        <StatusBar style={activeTheme === 'dark' ? 'light' : 'dark'} />
        <View style={[styles.phone, { justifyContent: 'center', alignItems: 'center' }]}>
          <Ionicons name="journal-outline" size={48} color={palette.primary} />
          <Text style={[styles.loadingText, { marginTop: 16, color: palette.primary }]}>{t.common.loading}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        <SafeAreaView style={styles.root}>
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
                  <Image
                    source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBiR4uweHpx9LV4fjLnzHs0Mvm763u_O9nGeoJC5ZZ8BnETlTzKAO2nC2UZX6Gccs_lkZK8YYSKHlJwsPR2X1fyGrsVXvRFy_OZkvpCuGSJ8KGJOeQ4f73IC9B6durF8FKt7pRtbii6qWbLWRNyHHiMgrDP26RQyuBO74WTsG-ttFsbHthMkQ1pR2-wdSbbB1fys2Xyne-eH6-wuXhCuR17W3KFOUyNf-q6ggHwrIFJW1nbqjjZDPEYdMbldo8zBwQjBud0Ub274obu' }}
                    style={[StyleSheet.absoluteFill, { opacity: 0.6 }]}
                    resizeMode="cover"
                  />
                  <View style={[StyleSheet.absoluteFill, { backgroundColor: hexToRgba(palette.background, 0.72) }]} />
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
        </SafeAreaView>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}
