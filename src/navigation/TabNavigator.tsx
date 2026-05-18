import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React, { useState } from 'react';
import { AddMomentSheet } from '../components/AddMomentSheet';
import { BottomTabs } from '../components/BottomTabs';
import { CalendarEventPicker } from '../components/CalendarEventPicker';
import { MomentComposer } from '../components/MomentComposer';
import { useJournalStore } from '../memory/store';
import { DayScreen } from '../screens/DayScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { MeScreen } from '../screens/MeScreen';
import { ReelScreen } from '../screens/ReelScreen';
import { pickMomentImage } from '../services/imagePicker';
import { calendarEventToDraft, getTodayCalendarEvents } from '../skills/calendar';
import { requestLocationAccess } from '../skills/permissions';
import { CalendarEventDraft, ComposerDraft, ComposerMode, Entry } from '../types';

const Tab = createBottomTabNavigator();

export function TabNavigator() {
  const {
    entries,
    reels,
    settings,
    addEntry: storeAddEntry,
    saveSuggestion,
    discardSuggestion,
    updateSettings,
    resetEntries,
  } = useJournalStore();

  const [sheetVisible, setSheetVisible] = useState(false);
  const [composerVisible, setComposerVisible] = useState(false);
  const [calendarPickerVisible, setCalendarPickerVisible] = useState(false);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEventDraft[]>([]);
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
      const result = await getTodayCalendarEvents();
      await updateSettings('calendarPermissionStatus', result.status);
      await updateSettings('allowCalendar', result.status === 'granted');
      setSheetVisible(false);

      if (result.events.length > 0) {
        setCalendarEvents(result.events);
        setCalendarPickerVisible(true);
        return;
      }

      nextDraft.calendarText = 'Mốc từ lịch';
    }

    if (settings.allowLocation) {
      const locationResult = await requestLocationAccess();
      nextDraft.locationName = locationResult.locationName;
      await updateSettings('locationPermissionStatus', locationResult.status);
      await updateSettings('allowLocation', locationResult.status === 'granted');
    }

    setComposerDraft(nextDraft);
    setSheetVisible(false);
    setComposerVisible(true);
  };

  const addEntry = async (entry: Entry) => {
    await storeAddEntry(entry);
    setComposerVisible(false);
    setSelectedDate(entry.date);
  };

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayDate = yesterday.toISOString().slice(0, 10);

  return (
    <>
      <Tab.Navigator
        tabBar={(props) => <BottomTabs {...props} onAddPress={() => setSheetVisible(true)} />}
        screenOptions={{ headerShown: false }}
        sceneContainerStyle={{ backgroundColor: 'transparent' }}
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
                const nextSettings = typeof s === 'function' ? s(settings) : s;
                Object.keys(nextSettings).forEach((k) => {
                  if (nextSettings[k as keyof typeof nextSettings] !== settings[k as keyof typeof settings]) {
                    updateSettings(k as any, nextSettings[k as keyof typeof nextSettings]);
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
      <CalendarEventPicker
        visible={calendarPickerVisible}
        events={calendarEvents}
        onClose={() => setCalendarPickerVisible(false)}
        onCreateBlank={() => {
          setCalendarPickerVisible(false);
          setComposerDraft({ mode: 'calendar', calendarText: 'Mốc từ lịch' });
          setComposerVisible(true);
        }}
        onSelect={(event) => {
          setCalendarPickerVisible(false);
          setComposerDraft(calendarEventToDraft(event));
          setComposerVisible(true);
        }}
      />
      <MomentComposer
        visible={composerVisible}
        draft={composerDraft}
        onClose={() => setComposerVisible(false)}
        onSave={addEntry}
      />
    </>
  );
}
