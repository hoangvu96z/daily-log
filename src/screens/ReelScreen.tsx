import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { ScreenHeader } from '../components/ScreenHeader';
import { weeklyReels } from '../data/mockData';
import { styles } from '../styles';
import { palette } from '../theme/palette';
import { Entry } from '../types';

export function ReelScreen({
  entries,
  onOpenDate,
  onOpenDay,
}: {
  entries: Entry[];
  onOpenDate: (date: string) => void;
  onOpenDay: () => void;
}) {
  const yearAgoDate = '2025-05-17';
  const yearAgoCount = entries.filter((entry) => entry.date === yearAgoDate).length || 6;
  const savedCount = entries.filter((entry) => entry.status === 'saved').length;

  return (
    <ScrollView contentContainerStyle={styles.screenContent}>
      <ScreenHeader title="Xem lại" subtitle="Nhìn lại những ngày đã qua của bạn" />
      <Pressable
        style={styles.yearAgoCard}
        onPress={() => {
          onOpenDate(yearAgoDate);
          onOpenDay();
        }}
      >
        <View style={styles.yearAgoText}>
          <Text style={styles.sectionKicker}>Hôm nay năm trước</Text>
          <Text style={styles.yearAgoTitle}>{yearAgoCount} khoảnh khắc đáng nhớ</Text>
        </View>
        <View style={styles.stackThumbs}>
          <View style={[styles.stackThumb, { backgroundColor: palette.greenSoft }]} />
          <View style={[styles.stackThumb, styles.stackThumbOffset, { backgroundColor: palette.cream }]} />
          <View style={[styles.stackThumb, styles.stackThumbLast, { backgroundColor: '#d8e5ed' }]} />
        </View>
      </Pressable>
      <Text style={styles.sectionTitle}>Tuần của bạn</Text>
      {weeklyReels.map((reel) => (
        <View key={reel.weekId} style={styles.reelCard}>
          <View style={[styles.videoThumb, { backgroundColor: reel.coverTone }]}>
            <Ionicons name="play" size={28} color={palette.white} />
          </View>
          <View style={styles.reelMeta}>
            <Text style={styles.reelTitle}>{reel.weekId}</Text>
            <Text style={styles.reelDate}>{reel.dateRange}</Text>
          </View>
          <View style={styles.countChip}>
            <Text style={styles.countChipText}>{Math.max(reel.entryCount, savedCount)} khoảnh khắc</Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}
