import React from 'react';
import { Modal, View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../AppText';
import { styles } from '../../styles';
import { palette } from '../../theme/palette';
import { ThemeMode } from '../../types';
import { useTranslation } from '../../i18n/translations';

export function ThemeDialog({
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
