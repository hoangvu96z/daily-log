import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, Switch, TextInput, View } from 'react-native';
import { Text } from '../components/AppText';
import { useTranslation } from '../i18n/translations';
import { ScreenHeader } from '../components/ScreenHeader';
import { requestCalendarAccess } from '../skills/calendar';
import { requestLocationAccess, requestPhotoAccess } from '../skills/permissions';
import {
  cancelAllReminders,
  getNotificationPermission,
  requestNotificationPermission,
  scheduleDailyReminder,
  scheduleWeeklyReminder,
} from '../skills/notifications';
import { styles } from '../styles';
import { palette } from '../theme/palette';
import { MoodCalendar } from '../components/MoodCalendar';
import { AccentColor, Settings, ThemeMode } from '../types';
import { pickMomentMedia } from '../services/imagePicker';
import { PaywallModal } from '../components/PaywallModal';
import * as BackgroundFetch from 'expo-background-fetch';
import { getAutoTrackerStatus, registerAutoTracker, runAutoTrackerOnce, unregisterAutoTracker, refreshAutoSuggestions } from '../skills/autoTracker';

import { Entry } from '../types';
import { exportBackup, exportBackupWeb, importBackup, importBackupWeb } from '../skills/backup';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SettingsCard, SettingsRow, ToggleRow } from '../components/settings/SettingsUI';
import { PrivacyExplanationDialog } from '../components/settings/PrivacyDialog';
import { ThemeDialog } from '../components/settings/ThemeDialog';
import { AccentColorDialog, accentColorLabel } from '../components/settings/AccentColorDialog';
import { WallpaperDialog } from '../components/settings/WallpaperDialog';
import { NotificationsDialog, permissionText } from '../components/settings/NotificationsDialog';
import { BackupDialog } from '../components/settings/BackupDialog';
import { DeleteJournalDialog } from '../components/settings/DeleteJournalDialog';
import { HighlightBar } from '../components/HighlightBar';

import { useJournalStore } from '../memory/store';

export function SettingsScreen({
  navigation,
}: {
  navigation?: any;
}) {
  const insets = useSafeAreaInsets();
  const { settings, updateSettings, entries, resetEntries } = useJournalStore();
  const entriesCount = entries.length;
  const onChangeSettings = (updater: (current: any) => any) => {
    const newValues = updater(settings);
    for (const [key, value] of Object.entries(newValues)) {
      if (settings[key as keyof typeof settings] !== value) {
        updateSettings(key as any, value as any);
      }
    }
  };
  const onResetJournal = resetEntries;
  const { t, lang, locale } = useTranslation();
  const [deleteVisible, setDeleteVisible] = useState(false);
  const [themeVisible, setThemeVisible] = useState(false);
  const [deleteText, setDeleteText] = useState('');
  const [accentVisible, setAccentVisible] = useState(false);
  const [wallpaperVisible, setWallpaperVisible] = useState(false);
  const [notifVisible, setNotifVisible] = useState(false);
  const [privacyVisible, setPrivacyVisible] = useState(false);
  const [paywallVisible, setPaywallVisible] = useState(false);
  const [backupVisible, setBackupVisible] = useState(false);
  const [calendarVisible, setCalendarVisible] = useState(false);
  const [backupWorking, setBackupWorking] = useState(false);
  const [notifEnabled, setNotifEnabled] = useState(false);

  const updateSetting = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    onChangeSettings((current) => ({ ...current, [key]: value }));
  };

  const togglePhotos = async (value: boolean) => {
    if (!value) {
      onChangeSettings((current) => ({ ...current, allowPhotos: false }));
      return;
    }

    const status = await requestPhotoAccess();
    onChangeSettings((current) => ({ ...current, allowPhotos: status === 'granted', photoPermissionStatus: status }));
  };

  const toggleLocation = async (value: boolean) => {
    if (!value) {
      onChangeSettings((current) => ({ ...current, allowLocation: false }));
      return;
    }

    const result = await requestLocationAccess();
    onChangeSettings((current) => ({
      ...current,
      allowLocation: result.status === 'granted',
      locationPermissionStatus: result.status,
    }));
  };

  const toggleCalendar = async (value: boolean) => {
    if (!value) {
      onChangeSettings((current) => ({ ...current, allowCalendar: false }));
      return;
    }

    const status = await requestCalendarAccess();
    onChangeSettings((current) => ({
      ...current,
      allowCalendar: status === 'granted',
      calendarPermissionStatus: status,
    }));
  };

  const toggleAutoTracking = async (value: boolean) => {
    if (!value) {
      await unregisterAutoTracker();
      onChangeSettings((current) => ({ ...current, autoTrackingEnabled: false }));
      return;
    }

    const photoStatus = await requestPhotoAccess();
    const locationResult = await requestLocationAccess();
    const calendarStatus = await requestCalendarAccess();

    const allowed = photoStatus === 'granted' || locationResult.status === 'granted' || calendarStatus === 'granted';
    if (!allowed) {
      Alert.alert(
        t.settings.notifPermissionAlertTitle || 'Permission Required',
        t.settings.notifPermissionAlertText || 'Please enable permissions to use Auto-Tracking.',
        [{ text: t.common.close }]
      );
      return;
    }

    onChangeSettings((current) => ({
      ...current,
      allowPhotos: photoStatus === 'granted',
      photoPermissionStatus: photoStatus,
      allowLocation: locationResult.status === 'granted',
      locationPermissionStatus: locationResult.status,
      allowCalendar: calendarStatus === 'granted',
      calendarPermissionStatus: calendarStatus,
      autoTrackingEnabled: true,
    }));

    await registerAutoTracker();

    try {
      const status = await getAutoTrackerStatus();
      if (status === BackgroundFetch.BackgroundFetchStatus.Restricted || status === BackgroundFetch.BackgroundFetchStatus.Denied) {
        Alert.alert(
          t.settings.bgFetchWarningTitle,
          t.settings.bgFetchWarningText,
          [{ text: t.common.close }]
        );
      }
    } catch (e) {
      console.warn('[AutoTracker] Could not check Background Fetch status:', e);
    }

    try {
      await runAutoTrackerOnce();
    } catch (e) {
      console.warn('[AutoTracker] Initial foreground run failed:', e);
    }
  };

  const confirmDelete = async () => {
    if (deleteText.trim().toUpperCase() !== t.settings.deleteConfirmWord) {
      return;
    }
    await onResetJournal();
    setDeleteText('');
    setDeleteVisible(false);
  };

  return (
    <ScrollView contentContainerStyle={[styles.screenContent, { paddingTop: 12 + insets.top, paddingBottom: 120 + insets.bottom }]}>
      <ScreenHeader 
        title={t.settings.title} 
        subtitle={t.settings.subtitle} 
        rightIcon="close"
        onRightPress={() => navigation?.goBack()}
      />

      {/* Group 1: Diary Lock — privacy first */}

      {/* Group 1: Diary Lock — privacy first */}
      <SettingsCard title={t.settings.protectionGroup}>
        <ToggleRow
          title={settings.biometricAvailable ? t.settings.faceIDEnabled : t.settings.faceIDUnavailable}
          value={settings.faceIDEnabled}
          onValueChange={(value) => settings.biometricAvailable && updateSetting('faceIDEnabled', value)}
        />
        <SettingsRow
          icon="keypad-outline"
          title={t.settings.pinTitle}
          subtitle={settings.pinSet ? (settings.pinEnabled ? t.settings.pinEnabledState : t.settings.pinDisabledState) : t.settings.pinSubtitle}
          onPress={() => navigation?.navigate?.('PinSetup')}
        />
        {settings.pinSet && (
          <ToggleRow
            title={t.settings.usePinLock}
            value={Boolean(settings.pinEnabled)}
            onValueChange={(value) => updateSetting('pinEnabled', value)}
          />
        )}
      </SettingsCard>
      {/* Group 2: Permissions & Data */}
      <SettingsCard title={t.settings.permissionsGroup}>
        <SettingsRow icon="lock-closed-outline" title={t.settings.permissionsTitle} subtitle={t.settings.permissionsSubtitle} />
        <SettingsRow
          icon="shield-checkmark-outline"
          title={t.settings.privacyTitle}
          subtitle={t.settings.privacySecuredSub}
          onPress={() => setPrivacyVisible(true)}
        />
        <ToggleRow
          title={`${t.settings.photosAndVideo}${settings.photoPermissionStatus ? ` • ${permissionText(settings.photoPermissionStatus, t)}` : ''}`}
          value={settings.allowPhotos}
          onValueChange={togglePhotos}
        />
        <ToggleRow
          title={`${t.settings.location}${settings.locationPermissionStatus ? ` • ${permissionText(settings.locationPermissionStatus, t)}` : ''}`}
          value={settings.allowLocation}
          onValueChange={toggleLocation}
        />
        <ToggleRow
          title={`${t.settings.calendar}${settings.calendarPermissionStatus ? ` • ${permissionText(settings.calendarPermissionStatus, t)}` : ''}`}
          value={settings.allowCalendar}
          onValueChange={toggleCalendar}
        />
        <ToggleRow
          title={t.settings.autoTracking}
          subtitle={t.settings.autoTrackingDesc}
          value={settings.autoTrackingEnabled}
          onValueChange={toggleAutoTracking}
        />
        <SettingsRow
          icon="cloud-outline"
          title={t.settings.backupTitle}
          subtitle={settings.isPremium
            ? t.settings.backupPremiumSubtitle
            : t.settings.backupSubtitle}
          onPress={() => {
            if (!settings.isPremium) {
              setPaywallVisible(true);
            } else {
              setBackupVisible(true);
            }
          }}
        />
        <SettingsRow
          danger
          icon="trash-outline"
          title={t.settings.deleteAllTitle}
          subtitle={t.settings.deleteAllSubtitle(entriesCount)}
          onPress={() => setDeleteVisible(true)}
        />
      </SettingsCard>
      {/* Group 3: App & Appearance */}
      <SettingsCard title={t.settings.appGroup}>
        <SettingsRow
          icon="calendar-outline"
          title={(t.settings as any).moodStats}
          subtitle={(t.settings as any).moodStatsSubtitle}
          onPress={() => setCalendarVisible(true)}
        />
        <SettingsRow
          icon="notifications-outline"
          title={t.settings.notifications}
          subtitle={notifEnabled ? t.settings.notificationsEnabledSubtitle : t.settings.notificationsSubtitle}
          onPress={() => setNotifVisible(true)}
        />
        <SettingsRow
          icon="contrast-outline"
          title={t.settings.theme}
          subtitle={settings.theme === 'light' ? t.settings.themeLight : settings.theme === 'dark' ? t.settings.themeDark : t.settings.themeSystem}
          onPress={() => setThemeVisible(true)}
        />
        <SettingsRow
          icon="color-palette-outline"
          title={t.settings.accentColor}
          subtitle={accentColorLabel(settings.accentColor || 'navy', t)}
          onPress={() => setAccentVisible(true)}
        />
        <SettingsRow
          icon="image-outline"
          title={t.settings.customWallpaper}
          subtitle={settings.wallpaperUri ? t.settings.customWallpaperSet : t.settings.customWallpaperDefault}
          onPress={() => {
            if (!settings.isPremium) {
              setPaywallVisible(true);
            } else {
              setWallpaperVisible(true);
            }
          }}
        />
        <SettingsRow
          icon="language-outline"
          title={t.settings.language}
          subtitle={lang === 'vi' ? t.settings.languageVi : t.settings.languageEn}
          onPress={() => updateSetting('language', lang === 'vi' ? 'en' : 'vi')}
        />
      </SettingsCard>
      {__DEV__ && (
        <SettingsCard title="Diagnostics (Dev Only)">
          <View style={{ paddingHorizontal: 16, paddingBottom: 16 }}>
            <Text style={{ fontSize: 12, color: palette.ink, marginBottom: 4 }}>
              Last Scan: {settings.last_auto_scan_time ? new Date(Number(settings.last_auto_scan_time)).toLocaleString() : 'Never'}
            </Text>
            <Text style={{ fontSize: 12, color: palette.ink, marginBottom: 4 }}>
              Stats: {settings.last_auto_scan_stats || 'None'}
            </Text>
            <Text style={{ fontSize: 12, color: palette.ink, marginBottom: 4 }}>
              bgFetch Success: {settings.bgFetch_successCount || 0}
            </Text>
            <Text style={{ fontSize: 12, color: palette.ink, marginBottom: 4 }}>
              bgFetch Fail: {settings.bgFetch_failCount || 0}
            </Text>
            <Pressable 
              style={{ marginTop: 12, padding: 10, backgroundColor: palette.primaryContainer, borderRadius: 8, alignItems: 'center' }}
              onPress={async () => {
                const created = await refreshAutoSuggestions();
                Alert.alert('Scan Complete', `Created ${created} new suggestions.`);
              }}
            >
              <Text style={{ color: palette.primary, fontWeight: '700', fontSize: 12 }}>Trigger Manual Scan</Text>
            </Pressable>
          </View>
        </SettingsCard>
      )}
      {/* Privacy microcopy */}
      <View style={styles.privacyStrip}>
        <Ionicons name="lock-closed-outline" size={19} color={palette.primary} />
        <Text style={styles.privacyText}>{(t.settings as any).privacyMicrocopy}</Text>
      </View>
      <View style={styles.footerLinks}>
        <Text style={styles.footerLink}>{t.settings.privacyPolicy}</Text>
        <Text style={styles.footerLink}>{t.settings.termsOfUse}</Text>
      </View>
      <DeleteJournalDialog
        visible={deleteVisible}
        value={deleteText}
        onChangeText={setDeleteText}
        onCancel={() => setDeleteVisible(false)}
        onConfirm={confirmDelete}
        t={t}
      />
      <ThemeDialog
        visible={themeVisible}
        currentTheme={settings.theme}
        onCancel={() => setThemeVisible(false)}
        onPick={(theme) => {
          updateSetting('theme', theme);
          setThemeVisible(false);
        }}
        labels={{
          system: t.settings.themeSystem,
          light: t.settings.themeLight,
          dark: t.settings.themeDark,
        }}
      />
      <AccentColorDialog
        visible={accentVisible}
        currentAccent={settings.accentColor || 'navy'}
        onCancel={() => setAccentVisible(false)}
        onPick={(accent) => {
          setAccentVisible(false);
          if ((accent === 'lavender' || accent === 'terracotta' || accent === 'rosepink') && !settings.isPremium) {
            setPaywallVisible(true);
            return;
          }
          updateSetting('accentColor', accent);
        }}
        t={t}
        isPremium={settings.isPremium}
      />
      <WallpaperDialog
        visible={wallpaperVisible}
        hasWallpaper={Boolean(settings.wallpaperUri)}
        onCancel={() => setWallpaperVisible(false)}
        onPick={async () => {
          setWallpaperVisible(false);
          const media = await pickMomentMedia();
          if (media && media.length > 0) {
            updateSetting('wallpaperUri', media[0].uri);
          }
        }}
        onRemove={() => {
          updateSetting('wallpaperUri', undefined);
          setWallpaperVisible(false);
        }}
        t={t}
      />
      <NotificationsDialog
        visible={notifVisible}
        enabled={notifEnabled}
        onClose={() => setNotifVisible(false)}
        onEnable={async () => {
          const status = await requestNotificationPermission();
          if (status !== 'granted') {
            Alert.alert(t.settings.notifPermissionAlertTitle, t.settings.notifPermissionAlertText, [{ text: t.common.close }]);
            return;
          }
          await scheduleDailyReminder(21, 0);
          await scheduleWeeklyReminder();
          setNotifEnabled(true);
          setNotifVisible(false);
        }}
        onDisable={async () => {
          await cancelAllReminders();
          setNotifEnabled(false);
          setNotifVisible(false);
        }}
      />
      <PrivacyExplanationDialog
        visible={privacyVisible}
        onClose={() => setPrivacyVisible(false)}
        t={t}
      />
      <PaywallModal
        visible={paywallVisible}
        onClose={() => setPaywallVisible(false)}
        onSuccess={() => updateSetting('isPremium', true)}
      />
      <BackupDialog
        visible={backupVisible}
        working={backupWorking}
        t={t}
        onClose={() => setBackupVisible(false)}
        onExport={async () => {
          setBackupWorking(true);
          const result = Platform.OS === 'web' ? await exportBackupWeb() : await exportBackup();
          setBackupWorking(false);
          setBackupVisible(false);
          if (result.success) {
            Alert.alert(
              t.settings.exportSuccess,
              t.settings.exportSuccessDesc(result.entryCount ?? 0),
              [{ text: 'OK' }],
            );
          } else {
            Alert.alert(
              t.settings.exportError,
              result.error ?? 'Unknown error',
              [{ text: 'OK' }],
            );
          }
        }}
        onImport={async () => {
          setBackupWorking(true);
          const result = Platform.OS === 'web' ? await importBackupWeb() : await importBackup();
          setBackupWorking(false);
          setBackupVisible(false);
          if (result.success) {
            Alert.alert(
              t.settings.restoreSuccess,
              t.settings.restoreSuccessDesc(result.entryCount ?? 0),
              [{ text: 'OK' }],
            );
          } else if (result.error && result.error !== 'No file selected') {
            Alert.alert(
              t.settings.restoreError,
              result.error,
              [{ text: 'OK' }],
            );
          }
        }}
      />
      <MoodCalendar
        visible={calendarVisible}
        entries={entries}
        onClose={() => setCalendarVisible(false)}
        t={t}
        locale={locale}
        isPremium={settings.isPremium}
        onUpgrade={() => { setCalendarVisible(false); setPaywallVisible(true); }}
      />
    </ScrollView>
  );
}


