import React from 'react';
import { Modal, Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from './AppText';
import { styles } from '../styles';
import { palette } from '../theme/palette';
import { Entry } from '../types';

export function DailyInsightDialog({ visible, entries, onClose, t }: { visible: boolean; entries: Entry[]; onClose: () => void; t: any }) {
  const homeT = t.home as any;
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.dialogScrim}>
        <View style={styles.dialogCard}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <Ionicons name="sparkles" size={24} color={palette.primary} />
            <Text style={styles.dialogTitle}>{homeT.luminousInsights}</Text>
          </View>
          <Text style={styles.dialogText}>
            {homeT.insightsDesc}
          </Text>
          <View style={{
            backgroundColor: 'rgba(255, 255, 255, 0.04)',
            borderRadius: 16,
            padding: 16,
            marginTop: 12,
            borderWidth: 1,
            borderColor: palette.outline,
          }}>
            <Text style={{ color: palette.onSurface, lineHeight: 22, fontStyle: 'italic' }}>
              {homeT.insightsText}
            </Text>
          </View>
          <Pressable style={[styles.saveButton, { marginTop: 20 }]} onPress={onClose}>
            <Text style={styles.saveButtonText}>{t.common.close}</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
