import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, Switch, Text, TextInput, View } from 'react-native';
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
import { pickMomentImage } from '../services/imagePicker';

export function MeScreen({
  navigation,
  settings,
  onChangeSettings,
  entriesCount,
  onResetJournal,
}: {
  navigation?: any;
  settings: Settings;
  onChangeSettings: React.Dispatch<React.SetStateAction<Settings>>;
  entriesCount: number;
  onResetJournal: () => Promise<void>;
}) {
  const { t, lang } = useTranslation();
  const [deleteVisible, setDeleteVisible] = useState(false);
  const [themeVisible, setThemeVisible] = useState(false);
  const [deleteText, setDeleteText] = useState('');
  const [accentVisible, setAccentVisible] = useState(false);
  const [wallpaperVisible, setWallpaperVisible] = useState(false);
  const [notifVisible, setNotifVisible] = useState(false);
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
      <SettingsCard title={t.settings.permissionsGroup}>
        <SettingsRow icon="shield-checkmark-outline" title={t.settings.permissionsTitle} subtitle={t.settings.permissionsSubtitle} />
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
        <SettingsRow
          icon="cloud-outline"
          title={t.settings.backupTitle}
          subtitle={t.settings.backupSubtitle}
          comingSoon
          onPress={() =>
            Alert.alert('Sắp ra mắt', 'Tính năng Backup & Restore sẽ được thêm vào phiên bản tiếp theo.', [{ text: 'OK' }])
          }
        />
        <SettingsRow
          danger
          icon="trash-outline"
          title={t.settings.deleteAllTitle}
          subtitle={t.settings.deleteAllSubtitle(entriesCount)}
          onPress={() => setDeleteVisible(true)}
        />
      </SettingsCard>
      <SettingsCard title={t.settings.protectionGroup}>
        <ToggleRow
          title={settings.biometricAvailable ? t.settings.faceIDEnabled : t.settings.faceIDUnavailable}
          value={settings.faceIDEnabled}
          onValueChange={(value) => settings.biometricAvailable && updateSetting('faceIDEnabled', value)}
        />
        <SettingsRow
          icon="keypad-outline"
          title={t.settings.pinTitle}
          subtitle={settings.pinSet ? (settings.pinEnabled ? 'Đang bật PIN' : 'Đã tạo PIN, đang tắt') : t.settings.pinSubtitle}
          onPress={() => navigation?.navigate?.('PinSetup')}
        />
        {settings.pinSet && (
          <ToggleRow
            title="Dùng PIN để khóa app"
            value={Boolean(settings.pinEnabled)}
            onValueChange={(value) => updateSetting('pinEnabled', value)}
          />
        )}
      </SettingsCard>
      <SettingsCard title={t.settings.appGroup}>
        <SettingsRow
          icon="notifications-outline"
          title={t.settings.notifications}
          subtitle={notifEnabled ? 'Đang bật — nhắc nhở hàng ngày' : t.settings.notificationsSubtitle}
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
          onPress={() => setWallpaperVisible(true)}
        />
        <SettingsRow
          icon="language-outline"
          title={t.settings.language}
          subtitle={lang === 'vi' ? t.settings.languageVi : t.settings.languageEn}
          onPress={() => updateSetting('language', lang === 'vi' ? 'en' : 'vi')}
        />
      </SettingsCard>
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
          updateSetting('accentColor', accent);
          setAccentVisible(false);
        }}
        t={t}
      />
      <WallpaperDialog
        visible={wallpaperVisible}
        hasWallpaper={Boolean(settings.wallpaperUri)}
        onCancel={() => setWallpaperVisible(false)}
        onPick={async () => {
          setWallpaperVisible(false);
          const uri = await pickMomentImage();
          if (uri) {
            updateSetting('wallpaperUri', uri);
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
            Alert.alert('Cần quyền thông báo', 'Vào Cài đặt máy → Thông báo → Bật cho ứng dụng này.', [{ text: 'OK' }]);
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
    </ScrollView>
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
        <Ionicons name={icon} size={20} color={danger ? palette.coral : palette.green} />
      </View>
      <View style={styles.settingsTextBox}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Text style={[styles.settingsTitle, danger && styles.dangerText]}>{title}</Text>
          {comingSoon && (
            <View style={comingSoonBadgeStyle}>
              <Text style={comingSoonTextStyle}>Soon</Text>
            </View>
          )}
        </View>
        <Text style={styles.settingsSubtitle}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color="#a7aea9" />
    </Pressable>
  );
}

const comingSoonBadgeStyle: any = {
  backgroundColor: 'rgba(46,79,50,0.1)',
  borderRadius: 8,
  paddingHorizontal: 6,
  paddingVertical: 1,
};

const comingSoonTextStyle: any = {
  fontSize: 10,
  color: palette.green,
  fontFamily: 'PlusJakartaSans_500Medium',
};

function ToggleRow({ title, value, onValueChange }: { title: string; value: boolean; onValueChange: (value: boolean) => void }) {
  return (
    <View style={styles.toggleRow}>
      <Text style={styles.settingsTitle}>{title}</Text>
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
  const options: Array<{ key: ThemeMode; icon: keyof typeof Ionicons.glyphMap }> = [
    { key: 'system', icon: 'phone-portrait-outline' },
    { key: 'light', icon: 'sunny-outline' },
    { key: 'dark', icon: 'moon-outline' },
  ];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.dialogScrim}>
        <View style={styles.dialogCard}>
          <Text style={styles.dialogTitle}>Chọn giao diện</Text>
          <Text style={styles.dialogText}>Đổi theme ngay và lưu vào cài đặt trên máy.</Text>
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
            <Text style={styles.dialogSecondaryText}>Đóng</Text>
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
}: {
  visible: boolean;
  currentAccent: AccentColor;
  onCancel: () => void;
  onPick: (accent: AccentColor) => void;
  t: any;
}) {
  const options: Array<{ key: AccentColor; label: string; color: string }> = [
    { key: 'navy', label: t.settings.accentNavy, color: '#031f41' },
    { key: 'sage', label: t.settings.accentSage, color: '#2E4F32' },
    { key: 'ocean', label: t.settings.accentOcean, color: '#0B4F6C' },
    { key: 'lavender', label: t.settings.accentLavender, color: '#4A3C6B' },
    { key: 'terracotta', label: t.settings.accentTerracotta, color: '#8E3E26' },
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
                <Text style={styles.themeOptionText}>{option.label}</Text>
                {currentAccent === option.key && <Ionicons name="checkmark-circle" size={20} color={palette.primary} />}
              </Pressable>
            ))}
          </View>
          <Pressable style={styles.dialogSecondary} onPress={onCancel}>
            <Text style={styles.dialogSecondaryText}>Đóng</Text>
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
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.dialogScrim}>
        <View style={styles.dialogCard}>
          <Text style={styles.dialogTitle}>Thông báo nhắc nhở</Text>
          <Text style={styles.dialogText}>
            Bật để nhận nhắc nhở hàng ngày lúc 21:00 và tóm tắt tuần mỗi Chủ nhật 20:00.
          </Text>
          <View style={styles.themeOptionList}>
            <Pressable
              style={[styles.themeOption, !enabled && styles.themeOptionActive]}
              onPress={onEnable}
            >
              <Ionicons name="notifications-outline" size={20} color={palette.primary} />
              <Text style={styles.themeOptionText}>Bật thông báo</Text>
              {!enabled && <Ionicons name="checkmark-circle" size={20} color={palette.primary} />}
            </Pressable>
            <Pressable
              style={[styles.themeOption, enabled && styles.themeOptionActive]}
              onPress={onDisable}
            >
              <Ionicons name="notifications-off-outline" size={20} color={palette.primary} />
              <Text style={styles.themeOptionText}>Tắt thông báo</Text>
              {enabled && <Ionicons name="checkmark-circle" size={20} color={palette.primary} />}
            </Pressable>
          </View>
          <Pressable style={styles.dialogSecondary} onPress={onClose}>
            <Text style={styles.dialogSecondaryText}>Đóng</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
