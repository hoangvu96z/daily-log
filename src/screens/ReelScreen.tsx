import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { ScreenHeader } from '../components/ScreenHeader';
import { styles } from '../styles';
import { palette } from '../theme/palette';
import { Entry, WeeklyReel } from '../types';

export function ReelScreen({
  entries,
  reels,
  onOpenDate,
  onOpenDay,
}: {
  entries: Entry[];
  reels: WeeklyReel[];
  onOpenDate: (date: string) => void;
  onOpenDay: () => void;
}) {
  const now = new Date();
  const yearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
  const yearAgoDate = yearAgo.toISOString().slice(0, 10);
  const yearAgoCount = entries.filter((entry) => entry.date === yearAgoDate).length;
  const savedCount = entries.filter((entry) => entry.status === 'saved').length;
  const hasYearAgoEntries = yearAgoCount > 0;

  return (
    <ScrollView contentContainerStyle={styles.screenContent}>
      <ScreenHeader title="Xem lại" subtitle="Nhìn lại những ngày đã qua của bạn" />

      {/* Hôm nay năm trước */}
      <Pressable
        style={styles.yearAgoCard}
        onPress={() => {
          onOpenDate(yearAgoDate);
          onOpenDay();
        }}
      >
        <View style={styles.yearAgoText}>
          <Text style={styles.sectionKicker}>Hôm nay năm trước</Text>
          <Text style={styles.yearAgoTitle}>
            {hasYearAgoEntries
              ? `${yearAgoCount} khoảnh khắc đáng nhớ`
              : 'Chưa có khoảnh khắc nào'}
          </Text>
        </View>
        <View style={styles.stackThumbs}>
          <View style={[styles.stackThumb, { backgroundColor: palette.greenSoft }]} />
          <View style={[styles.stackThumb, styles.stackThumbOffset, { backgroundColor: palette.cream }]} />
          <View style={[styles.stackThumb, styles.stackThumbLast, { backgroundColor: '#d8e5ed' }]} />
        </View>
      </Pressable>

      {/* Tuần của bạn */}
      <Text style={styles.sectionTitle}>Tuần của bạn</Text>
      {reels.length > 0 ? (
        reels.map((reel) => (
          <View key={reel.weekId} style={styles.reelCard}>
            <View style={[styles.videoThumb, { backgroundColor: reel.coverTone }]}>
              <Ionicons name="play" size={28} color={palette.white} />
            </View>
            <View style={styles.reelMeta}>
              <Text style={styles.reelTitle}>{reel.weekId}</Text>
              <Text style={styles.reelDate}>{reel.dateRange}</Text>
            </View>
            <View style={styles.countChip}>
              <Text style={styles.countChipText}>{reel.entryCount} khoảnh khắc</Text>
            </View>
          </View>
        ))
      ) : (
        <View style={styles.emptyState}>
          <Ionicons name="film-outline" size={28} color={palette.green} />
          <Text style={styles.emptyTitle}>Chưa có reel nào</Text>
          <Text style={styles.emptyText}>
            Khi bạn có đủ khoảnh khắc trong tuần, reel sẽ tự động được tạo.
          </Text>
        </View>
      )}
    </ScrollView>
  );
}
