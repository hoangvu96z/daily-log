import React from 'react';
import { Modal, View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../AppText';
import { styles } from '../../styles';
import { palette } from '../../theme/palette';

export function BackupDialog({
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
