import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React, { useState } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import * as Calendar from 'expo-calendar';
import { Ionicons } from '@expo/vector-icons';
import { AddMomentSheet } from '../components/AddMomentSheet';
import { BottomTabs } from '../components/BottomTabs';
import { CalendarEventPicker } from '../components/CalendarEventPicker';
import { MomentComposer } from '../components/MomentComposer';
import { useJournalStore } from '../memory/store';
import { useTranslation } from '../i18n/translations';
import { DayScreen } from '../screens/DayScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { MeScreen } from '../screens/MeScreen';
import { ReelScreen } from '../screens/ReelScreen';
import { pickMomentImage } from '../services/imagePicker';
import { calendarEventToDraft, getTodayCalendarEvents } from '../skills/calendar';
import { requestLocationAccess } from '../skills/permissions';
import { CalendarEventDraft, ComposerDraft, ComposerMode, Entry } from '../types';
import { palette } from '../theme/palette';
import { styles } from '../styles';
import { PaywallModal } from '../components/PaywallModal';

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

  const { t, lang } = useTranslation();
  const [sheetVisible, setSheetVisible] = useState(false);
  const [composerVisible, setComposerVisible] = useState(false);
  const [calendarPickerVisible, setCalendarPickerVisible] = useState(false);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEventDraft[]>([]);
  const [composerDraft, setComposerDraft] = useState<ComposerDraft>({ mode: 'note' });
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [paywallVisible, setPaywallVisible] = useState(false);

  const [permissionType, setPermissionType] = useState<'photos' | 'calendar' | null>(null);
  const [pendingMode, setPendingMode] = useState<ComposerMode | null>(null);

  const checkAndRequestPermission = async (mode: ComposerMode): Promise<boolean> => {
    if (mode === 'photo') {
      const status = await ImagePicker.getMediaLibraryPermissionsAsync();
      if (status.status !== 'granted') {
        setPermissionType('photos');
        setPendingMode('photo');
        return false;
      }
    } else if (mode === 'calendar') {
      const status = await Calendar.getCalendarPermissionsAsync();
      if (status.status !== 'granted') {
        setPermissionType('calendar');
        setPendingMode('calendar');
        return false;
      }
    }
    return true;
  };

  const openComposer = async (mode: ComposerMode) => {
    const hasPermission = await checkAndRequestPermission(mode);
    if (!hasPermission) {
      setSheetVisible(false);
      return;
    }

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

      nextDraft.calendarText = t.calendar.defaultEventText;
    }

    if (settings.allowLocation) {
      const locationResult = await requestLocationAccess();
      nextDraft.locationName = locationResult.locationName;
      nextDraft.locationLat = locationResult.locationLat;
      nextDraft.locationLon = locationResult.locationLon;
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

  const getPermissionDetails = () => {
    switch (permissionType) {
      case 'photos':
        return {
          icon: 'images-outline' as const,
          title: lang === 'vi' ? 'Quyền truy cập ảnh' : 'Photo Library Access',
          desc: t.permissions.photoExplanation,
        };
      case 'calendar':
        return {
          icon: 'calendar-outline' as const,
          title: lang === 'vi' ? 'Quyền truy cập lịch' : 'Calendar Access',
          desc: t.permissions.calendarExplanation,
        };
      default:
        return null;
    }
  };

  const handleAllowPermission = async () => {
    const type = permissionType;
    const mode = pendingMode;

    setPermissionType(null);
    setPendingMode(null);

    if (!type || !mode) return;

    if (type === 'photos') {
      const status = await ImagePicker.requestMediaLibraryPermissionsAsync();
      await updateSettings('photoPermissionStatus', status.granted ? 'granted' : 'denied');
      await updateSettings('allowPhotos', status.granted);
    } else if (type === 'calendar') {
      const result = await getTodayCalendarEvents();
      await updateSettings('calendarPermissionStatus', result.status);
      await updateSettings('allowCalendar', result.status === 'granted');
    }

    openComposer(mode);
  };

  const handleDenyPermission = () => {
    setPermissionType(null);
    setPendingMode(null);
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
              isPremium={settings.isPremium}
              onUpgrade={() => setPaywallVisible(true)}
              onOpenDay={() => {
                setSelectedDate(yesterdayDate);
                props.navigation.navigate('day');
              }}
              onSelectDate={(date) => {
                setSelectedDate(date);
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
          setComposerDraft({ mode: 'calendar', calendarText: t.calendar.defaultEventText });
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
      <PermissionExplanationModal
        visible={permissionType !== null}
        type={permissionType}
        onAllow={handleAllowPermission}
        onDeny={handleDenyPermission}
        details={getPermissionDetails()}
        t={t}
      />
      <PaywallModal
        visible={paywallVisible}
        onClose={() => setPaywallVisible(false)}
        onSuccess={() => updateSettings('isPremium', true)}
      />
    </>
  );
}

interface PermissionModalProps {
  visible: boolean;
  type: 'photos' | 'location' | 'calendar' | null;
  onAllow: () => void;
  onDeny: () => void;
  details: { icon: keyof typeof Ionicons.glyphMap; title: string; desc: string } | null;
  t: any;
}

function PermissionExplanationModal({
  visible,
  onAllow,
  onDeny,
  details,
  t,
}: PermissionModalProps) {
  if (!details) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onDeny}>
      <View style={styles.dialogScrim}>
        <View style={styles.dialogCard}>
          <View style={{ alignItems: 'center', marginBottom: 12 }}>
            <View style={{
              width: 56,
              height: 56,
              borderRadius: 28,
              backgroundColor: palette.primaryContainer,
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 10
            }}>
              <Ionicons name={details.icon} size={28} color={palette.primary} />
            </View>
            <Text style={styles.dialogTitle}>{details.title}</Text>
          </View>
          <Text style={[styles.dialogText, { textAlign: 'center', lineHeight: 20 }]}>
            {details.desc}
          </Text>

          <View style={{ gap: 8, width: '100%', marginTop: 16 }}>
            <Pressable
              style={{
                backgroundColor: palette.primary,
                borderRadius: 12,
                paddingVertical: 12,
                alignItems: 'center',
                width: '100%'
              }}
              onPress={onAllow}
            >
              <Text style={{ color: palette.white, fontSize: 14, fontWeight: '700' }}>
                {t.language === 'en' ? 'Allow' : 'Cho phép'}
              </Text>
            </Pressable>

            <Pressable
              style={{
                paddingVertical: 10,
                alignItems: 'center',
                width: '100%'
              }}
              onPress={onDeny}
            >
              <Text style={{ color: palette.muted, fontSize: 13, fontWeight: '600' }}>
                {t.common.cancel}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
