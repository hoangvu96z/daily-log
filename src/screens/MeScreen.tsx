import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Modal, Pressable, ScrollView, Switch, Text, TextInput, View } from 'react-native';
import { useTranslation } from '../i18n/translations';
import { ScreenHeader } from '../components/ScreenHeader';
import { requestLocationAccess, requestPhotoAccess } from '../skills/permissions';
import { styles } from '../styles';
import { palette } from '../theme/palette';
import { Settings } from '../types';

export function MeScreen({
  settings,
  onChangeSettings,
  entriesCount,
  onResetJournal,
}: {
  settings: Settings;
  onChangeSettings: React.Dispatch<React.SetStateAction<Settings>>;
  entriesCount: number;
  onResetJournal: () => Promise<void>;
}) {
  const { t, lang } = useTranslation();
  const [deleteVisible, setDeleteVisible] = useState(false);
  const [deleteText, setDeleteText] = useState('');

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
        <SettingsRow icon="cloud-outline" title={t.settings.backupTitle} subtitle={t.settings.backupSubtitle} />
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
        <SettingsRow icon="keypad-outline" title={t.settings.pinTitle} subtitle={t.settings.pinSubtitle} />
      </SettingsCard>
      <SettingsCard title={t.settings.appGroup}>
        <SettingsRow icon="notifications-outline" title={t.settings.notifications} subtitle={t.settings.notificationsSubtitle} />
        <SettingsRow
          icon="contrast-outline"
          title={t.settings.theme}
          subtitle={settings.theme === 'light' ? t.settings.themeLight : settings.theme === 'dark' ? t.settings.themeDark : t.settings.themeSystem}
          onPress={() => {
            const nextTheme = settings.theme === 'light' ? 'dark' : settings.theme === 'dark' ? 'system' : 'light';
            updateSetting('theme', nextTheme);
          }}
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
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  danger?: boolean;
  onPress?: () => void;
}) {
  return (
    <Pressable style={styles.settingsRow} onPress={onPress}>
      <View style={[styles.settingsIcon, danger && styles.settingsIconDanger]}>
        <Ionicons name={icon} size={20} color={danger ? palette.coral : palette.green} />
      </View>
      <View style={styles.settingsTextBox}>
        <Text style={[styles.settingsTitle, danger && styles.dangerText]}>{title}</Text>
        <Text style={styles.settingsSubtitle}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color="#a7aea9" />
    </Pressable>
  );
}

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
