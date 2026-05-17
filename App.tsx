import 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { SafeAreaView, Text, View } from 'react-native';
import { useTranslation } from './src/i18n/translations';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useJournalStore } from './src/memory/store';
import { AppNavigator } from './src/navigation/AppNavigator';
import { checkBiometricAvailability } from './src/services/permissions';
import { styles } from './src/styles';
import { palette } from './src/theme/palette';

export default function App() {
  const { hydrated, initStore, updateSettings } = useJournalStore();
  const { t } = useTranslation();

  useEffect(() => {
    initStore();
  }, [initStore]);

  useEffect(() => {
    checkBiometricAvailability().then((available) => {
      updateSettings('biometricAvailable', available);
    });
  }, [updateSettings]);

  if (!hydrated) {
    return (
      <SafeAreaView style={styles.root}>
        <StatusBar style="dark" />
        <View style={[styles.phone, { justifyContent: 'center', alignItems: 'center' }]}>
          <Ionicons name="journal-outline" size={48} color={palette.green} />
          <Text style={[styles.loadingText, { marginTop: 16 }]}>{t.common.loading}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        <SafeAreaView style={styles.root}>
          <StatusBar style="dark" />
          <View style={styles.phone}>
            <AppNavigator />
          </View>
        </SafeAreaView>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}
