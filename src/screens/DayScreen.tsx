import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { ImagePlaceholder } from '../components/ImagePlaceholder';
import { moodLabels } from '../data/mockData';
import { styles } from '../styles';
import { palette } from '../theme/palette';
import { Entry } from '../types';

export function DayScreen({
  entries,
  selectedDate,
  onChangeDate,
  onSaveSuggestion,
  onDiscardSuggestion,
}: {
  entries: Entry[];
  selectedDate: string;
  onChangeDate: (date: string) => void;
  onSaveSuggestion: (id: string) => void;
  onDiscardSuggestion: (id: string) => void;
}) {
  const dayEntries = entries.filter((entry) => entry.date === selectedDate);

  return (
    <ScrollView contentContainerStyle={styles.screenContent}>
      <View style={styles.dayHeader}>
        <View>
          <Text style={styles.screenTitle}>{formatDateTitle(selectedDate)}</Text>
          <Text style={styles.screenSubtitle}>{dayEntries.length} khoảnh khắc trong ngày</Text>
        </View>
        <View style={styles.dateNav}>
          <Pressable style={styles.iconButton} onPress={() => onChangeDate(shiftDate(selectedDate, -1))}>
            <Ionicons name="chevron-back" size={21} color={palette.green} />
          </Pressable>
          <Pressable style={styles.iconButton} onPress={() => onChangeDate(shiftDate(selectedDate, 1))}>
            <Ionicons name="chevron-forward" size={21} color={palette.green} />
          </Pressable>
        </View>
      </View>
      <View style={styles.timeline}>
        {dayEntries.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="journal-outline" size={28} color={palette.green} />
            <Text style={styles.emptyTitle}>Chưa có khoảnh khắc</Text>
            <Text style={styles.emptyText}>Bấm nút + để thêm ghi chú, ảnh hoặc mốc từ lịch cho ngày này.</Text>
          </View>
        )}
        {dayEntries.map((entry) => (
          <TimelineCard
            key={entry.id}
            entry={entry}
            onSave={() => onSaveSuggestion(entry.id)}
            onDiscard={() => onDiscardSuggestion(entry.id)}
          />
        ))}
      </View>
    </ScrollView>
  );
}

function shiftDate(date: string, days: number) {
  const next = new Date(`${date}T12:00:00`);
  next.setDate(next.getDate() + days);
  return next.toISOString().slice(0, 10);
}

function formatDateTitle(date: string) {
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(`${date}T12:00:00`));
}

function TimelineCard({ entry, onSave, onDiscard }: { entry: Entry; onSave: () => void; onDiscard: () => void }) {
  const suggested = entry.status === 'suggested';

  return (
    <View style={styles.timelineRow}>
      <View style={styles.timelineRail}>
        <Text style={styles.timeText}>{entry.time}</Text>
        <View style={styles.railDot} />
        <View style={styles.railLine} />
      </View>
      <View style={[styles.entryCard, suggested && styles.suggestedCard]}>
        <View style={styles.entryTopRow}>
          <Text style={styles.entryTime}>{entry.time}</Text>
          <View style={styles.moodChip}>
            <Text style={styles.moodText}>{moodLabels[entry.mood]}</Text>
          </View>
          {suggested && <Text style={styles.suggestedLabel}>Gợi ý</Text>}
        </View>
        <Text style={styles.entryText}>{entry.text}</Text>
        {entry.imageLocalId && <ImagePlaceholder label={entry.imageLocalId} uri={entry.imageUri} />}
        {suggested && (
          <View style={styles.miniActionRow}>
            <Pressable style={styles.miniPrimary} onPress={onSave}>
              <Text style={styles.miniPrimaryText}>Lưu</Text>
            </Pressable>
            <Pressable style={styles.miniSecondary} onPress={onDiscard}>
              <Text style={styles.miniSecondaryText}>Bỏ</Text>
            </Pressable>
          </View>
        )}
      </View>
    </View>
  );
}
