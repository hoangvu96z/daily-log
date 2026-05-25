import React from 'react';
import { Modal, View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../AppText';
import { styles } from '../../styles';
import { palette } from '../../theme/palette';
import { useTranslation } from '../../i18n/translations';

export function NotificationsDialog({
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

export function permissionText(status: string, t: any) {
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
