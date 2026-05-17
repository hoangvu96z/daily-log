import 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { SafeAreaView, Text, View, Image, Appearance, StyleSheet } from 'react-native';
import { useTranslation } from './src/i18n/translations';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useJournalStore } from './src/memory/store';
import { AppNavigator } from './src/navigation/AppNavigator';
import { checkBiometricAvailability } from './src/services/permissions';
import { styles } from './src/styles';
import { palette } from './src/theme/palette';

export default function App() {
  const { hydrated, initStore, updateSettings, settings } = useJournalStore();
  const { t } = useTranslation();

  useEffect(() => {
    initStore();
  }, [initStore]);

  useEffect(() => {
    checkBiometricAvailability().then((available) => {
      updateSettings('biometricAvailable', available);
    });
  }, [updateSettings]);

  const storeTheme = settings?.theme;
  const systemColorScheme = Appearance.getColorScheme();
  const activeTheme = storeTheme === 'system' ? (systemColorScheme || 'light') : (storeTheme || 'light');

  if (!hydrated) {
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
            {activeTheme === 'light' ? (
              <View style={StyleSheet.absoluteFill} pointerEvents="none">
                <Image
                  source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBiR4uweHpx9LV4fjLnzHs0Mvm763u_O9nGeoJC5ZZ8BnETlTzKAO2nC2UZX6Gccs_lkZK8YYSKHlJwsPR2X1fyGrsVXvRFy_OZkvpCuGSJ8KGJOeQ4f73IC9B6durF8FKt7pRtbii6qWbLWRNyHHiMgrDP26RQyuBO74WTsG-ttFsbHthMkQ1pR2-wdSbbB1fys2Xyne-eH6-wuXhCuR17W3KFOUyNf-q6ggHwrIFJW1nbqjjZDPEYdMbldo8zBwQjBud0Ub274obu' }}
                  style={[StyleSheet.absoluteFill, { opacity: 0.6 }]}
                  resizeMode="cover"
                />
                <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(246, 250, 255, 0.65)' }]} />
              </View>
            ) : (
              <>
                <View style={styles.luminousBlob1} pointerEvents="none" />
                <View style={styles.luminousBlob2} pointerEvents="none" />
                <View style={styles.luminousBlob3} pointerEvents="none" />
              </>
            )}
            <AppNavigator />
          </View>
        </SafeAreaView>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}
