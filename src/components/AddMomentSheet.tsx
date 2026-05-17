import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import { styles } from '../styles';
import { palette } from '../theme/palette';
import { ComposerMode } from '../types';

export function AddMomentSheet({
  visible,
  onClose,
  onPick,
}: {
  visible: boolean;
  onClose: () => void;
  onPick: (mode: ComposerMode) => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.modalScrim} onPress={onClose} />
      <View style={styles.sheet}>
        <View style={styles.sheetHandle} />
        <Text style={styles.sheetTitle}>Thêm khoảnh khắc</Text>
        <SheetAction
          icon="camera-outline"
          title="Chụp khoảnh khắc"
          subtitle="Chụp ảnh hoặc chọn từ thư viện"
          onPress={() => onPick('photo')}
        />
        <SheetAction
          icon="create-outline"
          title="Thêm ghi chú nhanh"
          subtitle="Viết vài dòng nếu bạn muốn"
          onPress={() => onPick('note')}
        />
        <SheetAction
          icon="calendar-clear-outline"
          title="Thêm mốc từ lịch"
          subtitle="Đánh dấu một việc quan trọng"
          onPress={() => onPick('calendar')}
        />
      </View>
    </Modal>
  );
}

function SheetAction({
  icon,
  title,
  subtitle,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.sheetAction} onPress={onPress}>
      <View style={styles.sheetIcon}>
        <Ionicons name={icon} size={24} color={palette.green} />
      </View>
      <View style={styles.sheetActionText}>
        <Text style={styles.sheetActionTitle}>{title}</Text>
        <Text style={styles.sheetActionSubtitle}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={19} color="#a9b0ab" />
    </Pressable>
  );
}
