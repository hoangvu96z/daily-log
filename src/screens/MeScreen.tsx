import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Modal, Pressable, ScrollView, Switch, Text, TextInput, View } from 'react-native';
import { ScreenHeader } from '../components/ScreenHeader';
import { requestLocationAccess, requestPhotoAccess } from '../services/permissions';
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
    if (deleteText.trim().toUpperCase() !== 'XÓA') {
      return;
    }
    await onResetJournal();
    setDeleteText('');
    setDeleteVisible(false);
  };

  return (
    <ScrollView contentContainerStyle={styles.screenContent}>
      <ScreenHeader title="Cài đặt" subtitle="Quyền riêng tư và ứng dụng" />
      <SettingsCard title="Quyền & dữ liệu">
        <SettingsRow icon="shield-checkmark-outline" title="Quyền truy cập" subtitle="Ảnh, vị trí, hoạt động ứng dụng..." />
        <ToggleRow
          title={`Ảnh & video${settings.photoPermissionStatus ? ` • ${permissionText(settings.photoPermissionStatus)}` : ''}`}
          value={settings.allowPhotos}
          onValueChange={togglePhotos}
        />
        <ToggleRow
          title={`Vị trí${settings.locationPermissionStatus ? ` • ${permissionText(settings.locationPermissionStatus)}` : ''}`}
          value={settings.allowLocation}
          onValueChange={toggleLocation}
        />
        <SettingsRow icon="cloud-outline" title="Sao lưu & khôi phục" subtitle="Backup iCloud/Drive, khôi phục khi đổi máy" />
        <SettingsRow
          danger
          icon="trash-outline"
          title="Xóa toàn bộ nhật ký"
          subtitle={`${entriesCount} entry trên thiết bị này`}
          onPress={() => setDeleteVisible(true)}
        />
      </SettingsCard>
      <SettingsCard title="Bảo vệ nhật ký">
        <ToggleRow
          title={settings.biometricAvailable ? 'Khóa Face ID / vân tay' : 'Face ID / vân tay chưa khả dụng'}
          value={settings.faceIDEnabled}
          onValueChange={(value) => settings.biometricAvailable && updateSetting('faceIDEnabled', value)}
        />
        <SettingsRow icon="keypad-outline" title="Mã PIN mở app" subtitle="Dùng khi không muốn Face ID" />
      </SettingsCard>
      <SettingsCard title="Ứng dụng">
        <SettingsRow icon="notifications-outline" title="Thông báo" subtitle="Daily và weekly reminder" />
        <SettingsRow icon="contrast-outline" title="Giao diện" subtitle="Theo hệ thống" />
        <SettingsRow icon="language-outline" title="Ngôn ngữ" subtitle="Tiếng Việt" />
      </SettingsCard>
      <View style={styles.footerLinks}>
        <Text style={styles.footerLink}>Chính sách quyền riêng tư</Text>
        <Text style={styles.footerLink}>Điều khoản sử dụng</Text>
      </View>
      <DeleteJournalDialog
        visible={deleteVisible}
        value={deleteText}
        onChangeText={setDeleteText}
        onCancel={() => setDeleteVisible(false)}
        onConfirm={confirmDelete}
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
}: {
  visible: boolean;
  value: string;
  onChangeText: (value: string) => void;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.dialogScrim}>
        <View style={styles.dialogCard}>
          <Text style={styles.dialogTitle}>Xóa toàn bộ nhật ký?</Text>
          <Text style={styles.dialogText}>Nhập XÓA để xác nhận. Dữ liệu local sẽ bị xóa khỏi thiết bị này.</Text>
          <TextInput
            style={styles.confirmInput}
            value={value}
            onChangeText={onChangeText}
            autoCapitalize="characters"
            placeholder="XÓA"
            placeholderTextColor="#9aa29c"
          />
          <View style={styles.dialogActions}>
            <Pressable style={styles.dialogSecondary} onPress={onCancel}>
              <Text style={styles.dialogSecondaryText}>Hủy</Text>
            </Pressable>
            <Pressable style={styles.dialogDanger} onPress={onConfirm}>
              <Text style={styles.dialogDangerText}>Xóa</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function permissionText(status: string) {
  switch (status) {
    case 'granted':
      return 'đã cho phép';
    case 'denied':
      return 'bị từ chối';
    case 'unavailable':
      return 'không hỗ trợ';
    default:
      return 'chưa hỏi';
  }
}
