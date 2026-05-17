import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { ScreenHeader } from '../components/ScreenHeader';
import { moodLabels } from '../data/mockData';
import { styles } from '../styles';
import { palette } from '../theme/palette';
import { Entry } from '../types';

export function HomeScreen({ entries, onOpenDay }: { entries: Entry[]; onOpenDay: () => void }) {
  const [calendarVisible, setCalendarVisible] = useState(false);
  const highlights = entries.filter((entry) => entry.date === '2026-05-16' && entry.isHighlight).slice(0, 4);

  return (
    <ScrollView contentContainerStyle={styles.screenContent}>
      <ScreenHeader title="Hôm qua của bạn" subtitle="Một vài khoảnh khắc nổi bật" />
      <View style={styles.heroCard}>
        <Text style={styles.cardKicker}>Không theo dõi, chỉ phản chiếu</Text>
        <Text style={styles.heroTitle}>Một ngày có nhịp riêng, đủ để nhớ lại sau này.</Text>
        <View style={styles.chipWrap}>
          {highlights.map((entry) => (
            <View key={entry.id} style={styles.eventChip}>
              <View style={styles.chipIcon}>
                <Ionicons name={entry.imageLocalId ? 'image-outline' : 'sparkles-outline'} size={15} color={palette.green} />
              </View>
              <Text style={styles.eventChipText}>{entry.text?.split(',')[0]}</Text>
            </View>
          ))}
        </View>
      </View>
      <View style={styles.actionRow}>
        <Pressable style={styles.primaryButton} onPress={onOpenDay}>
          <Text style={styles.primaryButtonText}>Xem cả ngày</Text>
        </Pressable>
        <Pressable style={styles.secondaryButton} onPress={() => setCalendarVisible(true)}>
          <Text style={styles.secondaryButtonText}>Lịch cảm xúc</Text>
        </Pressable>
      </View>
      <View style={styles.privacyStrip}>
        <Ionicons name="lock-closed-outline" size={19} color={palette.green} />
        <Text style={styles.privacyText}>Dữ liệu nằm trên máy bạn. Backup và AI cloud là tùy chọn.</Text>
      </View>
      <MoodCalendar visible={calendarVisible} entries={entries} onClose={() => setCalendarVisible(false)} />
    </ScrollView>
  );
}

function MoodCalendar({ visible, entries, onClose }: { visible: boolean; entries: Entry[]; onClose: () => void }) {
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date('2026-05-17T12:00:00');
    date.setDate(date.getDate() - (6 - index));
    const dateKey = date.toISOString().slice(0, 10);
    const dayEntries = entries.filter((entry) => entry.date === dateKey);
    const lastMood = dayEntries[dayEntries.length - 1]?.mood;
    return {
      dateKey,
      dayLabel: new Intl.DateTimeFormat('vi-VN', { weekday: 'short' }).format(date),
      dateLabel: new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit' }).format(date),
      count: dayEntries.length,
      mood: lastMood,
    };
  });

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.dialogScrim}>
        <View style={styles.dialogCard}>
          <Text style={styles.dialogTitle}>Lịch cảm xúc</Text>
          <Text style={styles.dialogText}>Tóm tắt 7 ngày gần đây từ các entry đã lưu trên máy.</Text>
          <View style={styles.moodCalendarGrid}>
            {days.map((day) => (
              <View key={day.dateKey} style={styles.moodDayCell}>
                <Text style={styles.moodDayName}>{day.dayLabel}</Text>
                <Text style={styles.moodDateText}>{day.dateLabel}</Text>
                <View style={[styles.moodDotLarge, { opacity: day.count ? 1 : 0.25 }]} />
                <Text style={styles.moodCellText}>{day.mood ? moodLabels[day.mood] : 'Trống'}</Text>
                <Text style={styles.moodCountText}>{day.count} entry</Text>
              </View>
            ))}
          </View>
          <Pressable style={styles.saveButton} onPress={onClose}>
            <Text style={styles.saveButtonText}>Đóng</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
