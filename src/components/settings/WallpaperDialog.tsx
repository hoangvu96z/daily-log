import React from 'react';
import { Modal, View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../AppText';
import { styles } from '../../styles';
import { palette } from '../../theme/palette';

export function WallpaperDialog({
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
