import React from 'react';
import { Modal, View, TextInput, Pressable } from 'react-native';
import { Text } from '../AppText';
import { styles } from '../../styles';

export function DeleteJournalDialog({
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
