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
import { AccentColor, Settings, ThemeMode } from '../types';
import { pickMomentMedia } from '../services/imagePicker';
import { PaywallModal } from '../components/PaywallModal';
import * as BackgroundFetch from 'expo-background-fetch';
import { getAutoTrackerStatus, registerAutoTracker, runAutoTrackerOnce, unregisterAutoTracker, refreshAutoSuggestions } from '../skills/autoTracker';
import { MoodCalendar } from './HomeScreen';
import { Entry } from '../types';
import { exportBackup, exportBackupWeb, importBackup, importBackupWeb } from '../skills/backup';
import { Platform } from 'react-native';

export function MeScreen({
  navigation,
  settings,
  onChangeSettings,
  entriesCount,
  entries = [],
  onResetJournal,
}: {
  navigation?: any;
  settings: Settings;
  onChangeSettings: React.Dispatch<React.SetStateAction<Settings>>;
  entriesCount: number;
  entries?: Entry[];
  onResetJournal: () => Promise<void>;
}) {
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
    <ScrollView contentContainerStyle={styles.screenContent}>
      <ScreenHeader title={t.settings.title} subtitle={t.settings.subtitle} />
      {!settings.isPremium ? (
        <Pressable
          style={{
            marginHorizontal: 16,
            marginBottom: 16,
            borderRadius: 16,
            padding: 16,
            backgroundColor: palette.primary,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            shadowColor: palette.primary,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.15,
            shadowRadius: 10,
            elevation: 4,
          }}
          onPress={() => setPaywallVisible(true)}
        >
          <View style={{ gap: 4, flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Ionicons name="sparkles" size={16} color={palette.white} />
              <Text style={{ color: palette.white, fontSize: 14, fontWeight: '800' }}>
                Daily Log Premium
              </Text>
            </View>
            <Text style={{ color: palette.white, opacity: 0.85, fontSize: 11.5 }}>
              {t.settings.premiumUpgradeDesc}
            </Text>
          </View>
          <View style={{
            backgroundColor: palette.white,
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderRadius: 12,
          }}>
            <Text style={{ color: palette.primary, fontSize: 12, fontWeight: '800' }}>
              {t.settings.premiumUpgradeBtn}
            </Text>
          </View>
        </Pressable>
      ) : (
        <View
          style={{
            marginHorizontal: 16,
            marginBottom: 16,
            borderRadius: 16,
            padding: 14,
            backgroundColor: palette.primaryContainer,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            borderWidth: 1,
            borderColor: palette.primary,
          }}
        >
          <View style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: palette.white,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
            <Ionicons name="gift" size={20} color={palette.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: palette.ink, fontSize: 13, fontWeight: '800' }}>
              {t.settings.premiumActiveTitle}
            </Text>
            <Text style={{ color: palette.muted, fontSize: 11 }}>
              {t.settings.premiumActiveDesc}
            </Text>
          </View>
        </View>
      )}
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
      {/* Privacy microcopy */}
      <View style={styles.privacyStrip}>
        <Ionicons name="lock-closed-outline" size={19} color={palette.primary} />
        <Text style={styles.privacyText}>{(t.settings as any).privacyMicrocopy}</Text>
      </View>
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
          if ((accent === 'lavender' || accent === 'terracotta') && !settings.isPremium) {
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

function PrivacyExplanationDialog({
  visible,
  onClose,
  t,
}: {
  visible: boolean;
  onClose: () => void;
  t: any;
}) {
  const setT = t.settings as any;
  const sections = [
    {
      icon: 'phone-portrait-outline' as const,
      title: setT.privacyOnDeviceTitle,
      desc: setT.privacyOnDeviceDesc,
    },
    {
      icon: 'sparkles-outline' as const,
      title: setT.privacyAITitle,
      desc: setT.privacyAIDesc,
    },
    {
      icon: 'cloud-offline-outline' as const,
      title: setT.privacyServerTitle,
      desc: setT.privacyServerDesc,
    },
  ];

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.dialogScrim}>
        <View style={[styles.dialogCard, { width: '90%', paddingVertical: 24 }]}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Text style={[styles.dialogTitle, { fontSize: 18, marginRight: 8, flex: 1 }]}>{setT.privacyTitle}</Text>
            <Pressable onPress={onClose} style={{ padding: 4 }}>
              <Ionicons name="close" size={24} color={palette.muted} />
            </Pressable>
          </View>

          <ScrollView style={{ maxHeight: 320 }} showsVerticalScrollIndicator={false}>
            {sections.map((section, idx) => (
              <View key={idx} style={{ flexDirection: 'row', gap: 14, marginBottom: 20 }}>
                <View style={{
                  width: 38,
                  height: 38,
                  borderRadius: 19,
                  backgroundColor: palette.primaryContainer,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginTop: 2
                }}>
                  <Ionicons name={section.icon} size={18} color={palette.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: '700', color: palette.ink, marginBottom: 4 }}>
                    {section.title}
                  </Text>
                  <Text style={{ fontSize: 12.5, color: palette.muted, lineHeight: 18 }}>
                    {section.desc}
                  </Text>
                </View>
              </View>
            ))}
          </ScrollView>

          <Pressable
            style={[styles.saveButton, { marginTop: 12, width: '100%' }]}
            onPress={onClose}
          >
            <Text style={styles.saveButtonText}>{t.common.close}</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

function SettingsCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.settingsCard}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function SettingsRow({
  icon,
  title,
  subtitle,
  danger,
  comingSoon,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  danger?: boolean;
  comingSoon?: boolean;
  onPress?: () => void;
}) {
  return (
    <Pressable style={styles.settingsRow} onPress={onPress}>
      <View style={[styles.settingsIcon, danger && styles.settingsIconDanger]}>
        <Ionicons name={icon} size={20} color={danger ? palette.coral : palette.primary} />
      </View>
      <View style={styles.settingsTextBox}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Text style={[styles.settingsTitle, danger && styles.dangerText]}>{title}</Text>
          {comingSoon && (
            <View style={styles.comingSoonBadge}>
              <Text style={styles.comingSoonText}>Soon</Text>
            </View>
          )}
        </View>
        <Text style={styles.settingsSubtitle}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color="#a7aea9" />
    </Pressable>
  );
}

function ToggleRow({
  title,
  subtitle,
  value,
  onValueChange,
}: {
  title: string;
  subtitle?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}) {
  return (
    <View style={styles.toggleRow}>
      <View style={{ flex: 1, paddingRight: 10 }}>
        <Text style={styles.settingsTitle}>{title}</Text>
        {subtitle ? <Text style={styles.settingsSubtitle}>{subtitle}</Text> : null}
      </View>
      <Switch value={value} onValueChange={onValueChange} trackColor={{ true: palette.greenSoft, false: '#d7dbd6' }} />
    </View>
  );
}

function DeleteJournalDialog({
  visible,
  value,
  onChangeText,
  onCancel,
  onConfirm,
  t,
}: {
  visible: boolean;
  value: string;
  onChangeText: (value: string) => void;
  onCancel: () => void;
  onConfirm: () => void;
  t: any;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.dialogScrim}>
        <View style={styles.dialogCard}>
          <Text style={styles.dialogTitle}>{t.settings.deleteDialogTitle}</Text>
          <Text style={styles.dialogText}>{t.settings.deleteDialogText}</Text>
          <TextInput
            style={styles.confirmInput}
            value={value}
            onChangeText={onChangeText}
            autoCapitalize="characters"
            placeholder={t.settings.deleteConfirmWord}
            placeholderTextColor="#9aa29c"
          />
          <View style={styles.dialogActions}>
            <Pressable style={styles.dialogSecondary} onPress={onCancel}>
              <Text style={styles.dialogSecondaryText}>{t.common.cancel}</Text>
            </Pressable>
            <Pressable style={styles.dialogDanger} onPress={onConfirm}>
              <Text style={styles.dialogDangerText}>{t.common.delete}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function ThemeDialog({
  visible,
  currentTheme,
  onCancel,
  onPick,
  labels,
}: {
  visible: boolean;
  currentTheme: ThemeMode;
  onCancel: () => void;
  onPick: (theme: ThemeMode) => void;
  labels: Record<ThemeMode, string>;
}) {
  const { t } = useTranslation();
  const options: Array<{ key: ThemeMode; icon: keyof typeof Ionicons.glyphMap }> = [
    { key: 'system', icon: 'phone-portrait-outline' },
    { key: 'light', icon: 'sunny-outline' },
    { key: 'dark', icon: 'moon-outline' },
  ];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.dialogScrim}>
        <View style={styles.dialogCard}>
          <Text style={styles.dialogTitle}>{t.settings.chooseThemeTitle}</Text>
          <Text style={styles.dialogText}>{t.settings.chooseThemeDesc}</Text>
          <View style={styles.themeOptionList}>
            {options.map((option) => (
              <Pressable
                key={option.key}
                style={[styles.themeOption, currentTheme === option.key && styles.themeOptionActive]}
                onPress={() => onPick(option.key)}
              >
                <Ionicons name={option.icon} size={20} color={palette.primary} />
                <Text style={styles.themeOptionText}>{labels[option.key]}</Text>
                {currentTheme === option.key && <Ionicons name="checkmark-circle" size={20} color={palette.primary} />}
              </Pressable>
            ))}
          </View>
          <Pressable style={styles.dialogSecondary} onPress={onCancel}>
            <Text style={styles.dialogSecondaryText}>{t.common.close}</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

function AccentColorDialog({
  visible,
  currentAccent,
  onCancel,
  onPick,
  t,
  isPremium,
}: {
  visible: boolean;
  currentAccent: AccentColor;
  onCancel: () => void;
  onPick: (accent: AccentColor) => void;
  t: any;
  isPremium: boolean;
}) {
  const options: Array<{ key: AccentColor; label: string; color: string; isPremium?: boolean }> = [
    { key: 'navy', label: t.settings.accentNavy, color: '#031f41' },
    { key: 'sage', label: t.settings.accentSage, color: '#2E4F32' },
    { key: 'ocean', label: t.settings.accentOcean, color: '#0B4F6C' },
    { key: 'lavender', label: t.settings.accentLavender, color: '#4A3C6B', isPremium: true },
    { key: 'terracotta', label: t.settings.accentTerracotta, color: '#8E3E26', isPremium: true },
  ];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.dialogScrim}>
        <View style={styles.dialogCard}>
          <Text style={styles.dialogTitle}>{t.settings.accentColor}</Text>
          <Text style={styles.dialogText}>{t.settings.accentColorDesc}</Text>
          <View style={styles.themeOptionList}>
            {options.map((option) => (
              <Pressable
                key={option.key}
                style={[styles.themeOption, currentAccent === option.key && styles.themeOptionActive]}
                onPress={() => onPick(option.key)}
              >
                <View style={{
                  width: 20,
                  height: 20,
                  borderRadius: 10,
                  backgroundColor: option.color,
                  marginRight: 6,
                }} />
                <Text style={styles.themeOptionText}>
                  {option.label} {option.isPremium && !isPremium ? '🔒' : ''}
                </Text>
                {currentAccent === option.key && <Ionicons name="checkmark-circle" size={20} color={palette.primary} />}
              </Pressable>
            ))}
          </View>
          <Pressable style={styles.dialogSecondary} onPress={onCancel}>
            <Text style={styles.dialogSecondaryText}>{t.common.close}</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

function WallpaperDialog({
  visible,
  hasWallpaper,
  onCancel,
  onPick,
  onRemove,
  t,
}: {
  visible: boolean;
  hasWallpaper: boolean;
  onCancel: () => void;
  onPick: () => void;
  onRemove: () => void;
  t: any;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.dialogScrim}>
        <View style={styles.dialogCard}>
          <Text style={styles.dialogTitle}>{t.settings.customWallpaper}</Text>
          <Text style={styles.dialogText}>{t.settings.customWallpaperDesc}</Text>
          <View style={styles.themeOptionList}>
            <Pressable style={styles.themeOption} onPress={onPick}>
              <Ionicons name="images-outline" size={20} color={palette.primary} />
              <Text style={styles.themeOptionText}>{t.settings.pickFromGallery}</Text>
            </Pressable>
            {hasWallpaper && (
              <Pressable style={[styles.themeOption, { borderColor: palette.red }]} onPress={onRemove}>
                <Ionicons name="trash-outline" size={20} color={palette.red} />
                <Text style={[styles.themeOptionText, { color: palette.red }]}>{t.settings.removeWallpaper}</Text>
              </Pressable>
            )}
          </View>
          <Pressable style={styles.dialogSecondary} onPress={onCancel}>
            <Text style={styles.dialogSecondaryText}>{t.common.cancel}</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

function accentColorLabel(accent: AccentColor, t: any) {
  switch (accent) {
    case 'navy': return t.settings.accentNavy;
    case 'sage': return t.settings.accentSage;
    case 'ocean': return t.settings.accentOcean;
    case 'lavender': return t.settings.accentLavender;
    case 'terracotta': return t.settings.accentTerracotta;
    default: return t.settings.accentNavy;
  }
}

function permissionText(status: string, t: any) {
  switch (status) {
    case 'granted':
      return t.settings.permissionGranted;
    case 'denied':
      return t.settings.permissionDenied;
    case 'unavailable':
      return t.settings.permissionUnavailable;
    default:
      return t.settings.permissionUnknown;
  }
}

function NotificationsDialog({
  visible,
  enabled,
  onClose,
  onEnable,
  onDisable,
}: {
  visible: boolean;
  enabled: boolean;
  onClose: () => void;
  onEnable: () => void;
  onDisable: () => void;
}) {
  const { t } = useTranslation();
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.dialogScrim}>
        <View style={styles.dialogCard}>
          <Text style={styles.dialogTitle}>{t.settings.notifDialogTitle}</Text>
          <Text style={styles.dialogText}>{t.settings.notifDialogDesc}</Text>
          <View style={styles.themeOptionList}>
            <Pressable
              style={[styles.themeOption, !enabled && styles.themeOptionActive]}
              onPress={onEnable}
            >
              <Ionicons name="notifications-outline" size={20} color={palette.primary} />
              <Text style={styles.themeOptionText}>{t.settings.enableNotifications}</Text>
              {!enabled && <Ionicons name="checkmark-circle" size={20} color={palette.primary} />}
            </Pressable>
            <Pressable
              style={[styles.themeOption, enabled && styles.themeOptionActive]}
              onPress={onDisable}
            >
              <Ionicons name="notifications-off-outline" size={20} color={palette.primary} />
              <Text style={styles.themeOptionText}>{t.settings.disableNotifications}</Text>
              {enabled && <Ionicons name="checkmark-circle" size={20} color={palette.primary} />}
            </Pressable>
          </View>
          <Pressable style={styles.dialogSecondary} onPress={onClose}>
            <Text style={styles.dialogSecondaryText}>{t.common.close}</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

function BackupDialog({
  visible,
  working,
  t,
  onClose,
  onExport,
  onImport,
}: {
  visible: boolean;
  working: boolean;
  t: any;
  onClose: () => void;
  onExport: () => void;
  onImport: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.dialogScrim}>
        <View style={styles.dialogCard}>
          {/* Header */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <View style={{
              width: 36, height: 36, borderRadius: 18,
              backgroundColor: palette.primaryContainer,
              alignItems: 'center', justifyContent: 'center',
            }}>
              <Ionicons name="cloud-outline" size={20} color={palette.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={styles.dialogTitle}>
                  {t.settings.backupTitle}
                </Text>
                <View style={{
                  backgroundColor: palette.primary,
                  borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2,
                }}>
                  <Text style={{ color: palette.white, fontSize: 9, fontWeight: '800' }}>
                    PREMIUM
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <Text style={[styles.dialogText, { marginBottom: 16 }]}>
            {t.settings.backupEncryption}
          </Text>

          <View style={styles.themeOptionList}>
            {/* Export */}
            <Pressable
              style={[styles.themeOption, { opacity: working ? 0.5 : 1 }]}
              onPress={working ? undefined : onExport}
            >
              <Ionicons name="cloud-upload-outline" size={20} color={palette.primary} />
              <View style={{ flex: 1 }}>
                <Text style={styles.themeOptionText}>
                  {t.settings.exportBackup}
                </Text>
                <Text style={{ fontSize: 11, color: palette.muted, marginTop: 1 }}>
                  {t.settings.exportBackupDesc}
                </Text>
              </View>
              {working && <Ionicons name="reload-outline" size={16} color={palette.primary} />}
            </Pressable>

            {/* Import */}
            <Pressable
              style={[styles.themeOption, { opacity: working ? 0.5 : 1 }]}
              onPress={working ? undefined : onImport}
            >
              <Ionicons name="cloud-download-outline" size={20} color={palette.primary} />
              <View style={{ flex: 1 }}>
                <Text style={styles.themeOptionText}>
                  {t.settings.importBackup}
                </Text>
                <Text style={{ fontSize: 11, color: palette.muted, marginTop: 1 }}>
                  {t.settings.importBackupDesc}
                </Text>
              </View>
            </Pressable>
          </View>

          {/* Warning */}
          <View style={{
            flexDirection: 'row', gap: 8, alignItems: 'flex-start',
            backgroundColor: 'rgba(186,26,26,0.06)', borderRadius: 12,
            padding: 12, marginTop: 8, marginBottom: 12,
            borderWidth: 1, borderColor: 'rgba(186,26,26,0.12)',
          }}>
            <Ionicons name="warning-outline" size={16} color={palette.red} style={{ marginTop: 1 }} />
            <Text style={{ fontSize: 12, color: palette.red, flex: 1, lineHeight: 17 }}>
              {t.settings.importWarning}
            </Text>
          </View>

          <Pressable style={styles.dialogSecondary} onPress={onClose}>
            <Text style={styles.dialogSecondaryText}>
              {t.common.close}
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
