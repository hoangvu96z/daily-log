import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { Pressable, SafeAreaView, Text, View } from 'react-native';
import { AddMomentSheet } from './src/components/AddMomentSheet';
import { BottomTabs } from './src/components/BottomTabs';
import { MomentComposer } from './src/components/MomentComposer';
import { useJournalStore } from './src/hooks/useJournalStore';
import { DayScreen } from './src/screens/DayScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { MeScreen } from './src/screens/MeScreen';
import { OnboardingScreen } from './src/screens/OnboardingScreen';
import { ReelScreen } from './src/screens/ReelScreen';
import { pickMomentImage } from './src/services/imagePicker';
import { checkBiometricAvailability, requestLocationAccess } from './src/services/permissions';
import { styles } from './src/styles';
import { palette } from './src/theme/palette';
import { ComposerDraft, ComposerMode, Entry, TabKey } from './src/types';

export default function App() {
  const {
    hydrated,
    entries,
    settings,
    onboardingComplete,
    setEntries,
    setSettings,
    completeOnboarding,
    resetJournal,
  } = useJournalStore();
  const [activeTab, setActiveTab] = useState<TabKey>('home');
  const [sheetVisible, setSheetVisible] = useState(false);
  const [composerVisible, setComposerVisible] = useState(false);
  const [composerDraft, setComposerDraft] = useState<ComposerDraft>({ mode: 'note' });
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));

  useEffect(() => {
    checkBiometricAvailability().then((available) => {
      setSettings((current) => ({ ...current, biometricAvailable: available }));
    });
  }, [setSettings]);

  const saveSuggestion = (id: string) => {
    setEntries((current) =>
      current.map((entry) => (entry.id === id ? { ...entry, status: 'saved', isHighlight: true } : entry)),
    );
  };

  const discardSuggestion = (id: string) => {
    setEntries((current) => current.filter((entry) => entry.id !== id));
  };

  const openComposer = async (mode: ComposerMode) => {
    const nextDraft: ComposerDraft = { mode };

    if (mode === 'photo') {
      const imageUri = await pickMomentImage();
      if (imageUri) {
        nextDraft.imageUri = imageUri;
      }
    }

    if (mode === 'calendar') {
      nextDraft.calendarText = 'Lịch: hoàn thành một việc quan trọng';
    }

    if (settings.allowLocation) {
      const locationResult = await requestLocationAccess();
      nextDraft.locationName = locationResult.locationName;
      setSettings((current) => ({
        ...current,
        locationPermissionStatus: locationResult.status,
        allowLocation: locationResult.status === 'granted',
      }));
    }

    setComposerDraft(nextDraft);
    setSheetVisible(false);
    setComposerVisible(true);
  };

  const addEntry = (entry: Entry) => {
    setEntries((current) => [entry, ...current].sort((a, b) => a.time.localeCompare(b.time)));
    setComposerVisible(false);
    setSelectedDate(entry.date);
    setActiveTab('day');
  };

  // --- Loading state ---
  if (!hydrated) {
    return (
      <SafeAreaView style={styles.root}>
        <StatusBar style="dark" />
        <View style={[styles.phone, { justifyContent: 'center', alignItems: 'center' }]}>
          <Ionicons name="journal-outline" size={48} color={palette.green} />
          <Text style={[styles.loadingText, { marginTop: 16 }]}>Đang mở nhật ký riêng...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // --- Onboarding ---
  if (!onboardingComplete) {
    return (
      <SafeAreaView style={styles.root}>
        <StatusBar style="dark" />
        <OnboardingScreen onComplete={completeOnboarding} />
      </SafeAreaView>
    );
  }

  // --- Main App ---
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayDate = yesterday.toISOString().slice(0, 10);

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar style="dark" />
      <View style={styles.phone}>
        {activeTab === 'home' && (
          <HomeScreen
            entries={entries}
            onOpenDay={() => {
              setSelectedDate(yesterdayDate);
              setActiveTab('day');
            }}
          />
        )}
        {activeTab === 'day' && (
          <DayScreen
            entries={entries}
            selectedDate={selectedDate}
            onChangeDate={setSelectedDate}
            onSaveSuggestion={saveSuggestion}
            onDiscardSuggestion={discardSuggestion}
          />
        )}
        {activeTab === 'reel' && <ReelScreen entries={entries} reels={[]} onOpenDate={setSelectedDate} onOpenDay={() => setActiveTab('day')} />}
        {activeTab === 'me' && (
          <MeScreen settings={settings} onChangeSettings={setSettings} entriesCount={entries.length} onResetJournal={resetJournal} />
        )}

        <BottomTabs activeTab={activeTab} onChangeTab={setActiveTab} />

        <Pressable style={styles.fab} onPress={() => setSheetVisible(true)}>
          <Ionicons name="add" size={30} color={palette.white} />
        </Pressable>
      </View>

      <AddMomentSheet visible={sheetVisible} onClose={() => setSheetVisible(false)} onPick={openComposer} />
      <MomentComposer
        visible={composerVisible}
        draft={composerDraft}
        onClose={() => setComposerVisible(false)}
        onSave={addEntry}
      />
    </SafeAreaView>
  );
}
