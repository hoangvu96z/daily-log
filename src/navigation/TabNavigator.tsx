import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React, { useState } from 'react';
import { AddMomentSheet } from '../components/AddMomentSheet';
import { BottomTabs } from '../components/BottomTabs';
import { MomentComposer } from '../components/MomentComposer';
import { useJournalStore } from '../memory/store';
import { DayScreen } from '../screens/DayScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { MeScreen } from '../screens/MeScreen';
import { ReelScreen } from '../screens/ReelScreen';
import { pickMomentImage } from '../services/imagePicker';
import { requestLocationAccess } from '../services/permissions';
import { ComposerDraft, ComposerMode, Entry } from '../types';

const Tab = createBottomTabNavigator();

export function TabNavigator() {
  const { entries, reels, settings, addEntry: storeAddEntry, saveSuggestion, discardSuggestion, updateSettings, resetEntries } = useJournalStore();
  const [sheetVisible, setSheetVisible] = useState(false);
  const [composerVisible, setComposerVisible] = useState(false);
  const [composerDraft, setComposerDraft] = useState<ComposerDraft>({ mode: 'note' });
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));

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
      updateSettings('locationPermissionStatus', locationResult.status);
      updateSettings('allowLocation', locationResult.status === 'granted');
    }

    setComposerDraft(nextDraft);
    setSheetVisible(false);
    setComposerVisible(true);
  };

  const addEntry = async (entry: Entry) => {
    await storeAddEntry(entry);
    setComposerVisible(false);
    setSelectedDate(entry.date);
    // Note: To navigate to Day tab, we should use a navigation ref or pass it down,
    // but React Navigation will handle tab focus via useNavigation if needed.
    // For now, setting the date is enough. We'll add navigation.navigate('day') below.
  };

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayDate = yesterday.toISOString().slice(0, 10);

  return (
    <>
      <Tab.Navigator
        tabBar={(props) => <BottomTabs {...props} onAddPress={() => setSheetVisible(true)} />}
        screenOptions={{ headerShown: false }}
      >
        <Tab.Screen name="home">
          {(props) => (
            <HomeScreen
              {...props}
              entries={entries}
              onOpenDay={() => {
                setSelectedDate(yesterdayDate);
                props.navigation.navigate('day');
              }}
            />
          )}
        </Tab.Screen>
        <Tab.Screen name="day">
          {(props) => (
            <DayScreen
              {...props}
              entries={entries}
              selectedDate={selectedDate}
              onChangeDate={setSelectedDate}
              onSaveSuggestion={saveSuggestion}
              onDiscardSuggestion={discardSuggestion}
            />
          )}
        </Tab.Screen>
        <Tab.Screen name="reel">
          {(props) => (
            <ReelScreen
              {...props}
              entries={entries}
              reels={reels}
              onOpenDate={setSelectedDate}
              onOpenDay={() => props.navigation.navigate('day')}
            />
          )}
        </Tab.Screen>
        <Tab.Screen name="me">
          {(props) => (
            <MeScreen
              {...props}
              settings={settings}
              onChangeSettings={(s) => {
                Object.keys(s).forEach((k) => {
                  if (s[k as keyof typeof s] !== settings[k as keyof typeof settings]) {
                    updateSettings(k as keyof typeof s, s[k as keyof typeof s]);
                  }
                });
              }}
              entriesCount={entries.length}
              onResetJournal={resetEntries}
            />
          )}
        </Tab.Screen>
      </Tab.Navigator>

      <AddMomentSheet visible={sheetVisible} onClose={() => setSheetVisible(false)} onPick={openComposer} />
      <MomentComposer
        visible={composerVisible}
        draft={composerDraft}
        onClose={() => setComposerVisible(false)}
        onSave={(entry) => {
          addEntry(entry);
          // Actually we don't have access to navigation here easily without useNavigation hook,
          // but we can fix that next.
        }}
      />
    </>
  );
}
