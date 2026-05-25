import React from 'react';
import { Modal, View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../AppText';
import { styles } from '../../styles';
import { palette } from '../../theme/palette';
import { AccentColor } from '../../types';

export function AccentColorDialog({
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

export function accentColorLabel(accent: AccentColor, t: any) {
  switch (accent) {
    case 'navy': return t.settings.accentNavy;
    case 'sage': return t.settings.accentSage;
    case 'ocean': return t.settings.accentOcean;
    case 'lavender': return t.settings.accentLavender;
    case 'terracotta': return t.settings.accentTerracotta;
    default: return t.settings.accentNavy;
  }
}
