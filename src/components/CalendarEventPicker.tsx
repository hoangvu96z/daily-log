import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { styles } from '../styles';
import { palette } from '../theme/palette';
import { CalendarEventDraft } from '../types';

export function CalendarEventPicker({
  visible,
  events,
  onClose,
  onSelect,
  onCreateBlank,
}: {
  visible: boolean;
  events: CalendarEventDraft[];
  onClose: () => void;
  onSelect: (event: CalendarEventDraft) => void;
  onCreateBlank: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.dialogScrim}>
        <View style={styles.dialogCard}>
          <Text style={styles.dialogTitle}>Chọn mốc từ lịch</Text>
          <Text style={styles.dialogText}>
            {events.length ? 'Chọn một event hôm nay để tự điền giờ và nội dung.' : 'Hôm nay chưa có event nào trong lịch.'}
          </Text>
          <ScrollView style={styles.calendarEventList} contentContainerStyle={styles.calendarEventListContent}>
            {events.map((event) => (
              <Pressable key={event.id} style={styles.calendarEventRow} onPress={() => onSelect(event)}>
                <View style={styles.calendarEventIcon}>
                  <Ionicons name="calendar-clear-outline" size={18} color={palette.primary} />
                </View>
                <View style={styles.calendarEventTextBox}>
                  <Text style={styles.calendarEventTitle}>{event.title}</Text>
                  <Text style={styles.calendarEventMeta}>
                    {formatEventTime(event.startDate)}
                    {event.location ? ` • ${event.location}` : ''}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={palette.muted} />
              </Pressable>
            ))}
          </ScrollView>
          <View style={styles.dialogActions}>
            <Pressable style={styles.dialogSecondary} onPress={onClose}>
              <Text style={styles.dialogSecondaryText}>Hủy</Text>
            </Pressable>
            <Pressable style={styles.dialogSecondary} onPress={onCreateBlank}>
              <Text style={styles.dialogSecondaryText}>Tự nhập</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function formatEventTime(date: string) {
  return new Date(date).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false });
}
