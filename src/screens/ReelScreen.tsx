import { Ionicons } from '@expo/vector-icons';
import React, { useRef, useState } from 'react';
import {
  Animated as RNAnimated,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTranslation } from '../i18n/translations';
import { ScreenHeader } from '../components/ScreenHeader';
import { SlideshowScreen } from './SlideshowScreen';
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
  const { t } = useTranslation();
  const [slideshowVisible, setSlideshowVisible] = useState(false);
  const [slideshowEntries, setSlideshowEntries] = useState<Entry[]>([]);
  const [slideshowTitle, setSlideshowTitle] = useState<string | undefined>();

  const now = new Date();
  const yearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
  const yearAgoDate = yearAgo.toISOString().slice(0, 10);
  const yearAgoCount = entries.filter((entry) => entry.date === yearAgoDate).length;
  const savedCount = entries.filter((entry) => entry.status === 'saved').length;
  const hasYearAgoEntries = yearAgoCount > 0;

  const openSlideshow = (reelEntries: Entry[], title?: string) => {
    const validEntries = reelEntries.filter((e) => e.status === 'saved' && (e.imageUri || e.text));
    if (validEntries.length === 0) return;
    setSlideshowEntries(validEntries);
    setSlideshowTitle(title);
    setSlideshowVisible(true);
  };

  const openReelSlideshow = (reel: WeeklyReel) => {
    const reelEntries = entries.filter(
      (e) => e.date >= reel.startDate && e.date <= reel.endDate,
    );
    openSlideshow(reelEntries, reel.weekId);
  };

  return (
    <>
      <ScrollView contentContainerStyle={styles.screenContent}>
        <ScreenHeader title={t.reel.title} subtitle={t.reel.subtitle} />

        {/* Hôm nay năm trước */}
        <AnimatedCard delay={0}>
          <Pressable
            style={styles.yearAgoCard}
            onPress={() => {
              onOpenDate(yearAgoDate);
              onOpenDay();
            }}
          >
            <View style={styles.yearAgoText}>
              <Text style={styles.sectionKicker}>{t.reel.todayLastYear}</Text>
              <Text style={styles.yearAgoTitle}>
                {hasYearAgoEntries
                  ? t.reel.memorableMoments(yearAgoCount)
                  : t.reel.noMoments}
              </Text>
            </View>
            <View style={styles.stackThumbs}>
              <View style={[styles.stackThumb, { backgroundColor: palette.greenSoft }]} />
              <View style={[styles.stackThumb, styles.stackThumbOffset, { backgroundColor: palette.cream }]} />
              <View style={[styles.stackThumb, styles.stackThumbLast, { backgroundColor: '#d8e5ed' }]} />
            </View>
          </Pressable>
        </AnimatedCard>

        {/* Play all button */}
        {savedCount > 0 && (
          <AnimatedCard delay={80}>
            <Pressable
              style={playAllCardStyle}
              onPress={() => openSlideshow(entries)}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <View style={playIconWrap}>
                  <Ionicons name="play" size={18} color={palette.white} />
                </View>
                <View>
                  <Text style={playAllTitle}>Phát toàn bộ</Text>
                  <Text style={playAllSub}>{savedCount} khoảnh khắc đã lưu</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color={palette.green} />
            </Pressable>
          </AnimatedCard>
        )}

        {/* Tuần của bạn */}
        <Text style={styles.sectionTitle}>{t.reel.yourWeek}</Text>
        {reels.length > 0 ? (
          reels.map((reel, idx) => (
            <AnimatedCard key={reel.weekId} delay={120 + idx * 60}>
              <Pressable style={styles.reelCard} onPress={() => openReelSlideshow(reel)}>
                <View style={[styles.videoThumb, { backgroundColor: reel.coverTone }]}>
                  <Ionicons name="play" size={28} color={palette.white} />
                </View>
                <View style={styles.reelMeta}>
                  <Text style={styles.reelTitle}>{reel.weekId}</Text>
                  <Text style={styles.reelDate}>{reel.dateRange}</Text>
                </View>
                <View style={styles.countChip}>
                  <Text style={styles.countChipText}>{t.reel.momentCount(reel.entryCount)}</Text>
                </View>
              </Pressable>
            </AnimatedCard>
          ))
        ) : (
          <AnimatedCard delay={120}>
            <View style={styles.emptyState}>
              <Ionicons name="film-outline" size={28} color={palette.green} />
              <Text style={styles.emptyTitle}>{t.reel.noReelsTitle}</Text>
              <Text style={styles.emptyText}>{t.reel.noReelsDesc}</Text>
            </View>
          </AnimatedCard>
        )}
      </ScrollView>

      <SlideshowScreen
        visible={slideshowVisible}
        entries={slideshowEntries}
        weekTitle={slideshowTitle}
        onClose={() => setSlideshowVisible(false)}
      />
    </>
  );
}

/** Micro-animation wrapper — slides items in from bottom with fade */
function AnimatedCard({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <Animated.View entering={FadeInDown.delay(delay).duration(350).springify()}>
      {children}
    </Animated.View>
  );
}

// Inline styles for the "Play all" card
const playAllCardStyle: any = {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  backgroundColor: 'rgba(46,79,50,0.08)',
  borderRadius: 14,
  padding: 14,
  marginBottom: 16,
  borderWidth: 1,
  borderColor: 'rgba(46,79,50,0.15)',
};

const playIconWrap: any = {
  width: 36,
  height: 36,
  borderRadius: 18,
  backgroundColor: palette.green,
  alignItems: 'center',
  justifyContent: 'center',
};

const playAllTitle: any = {
  fontSize: 15,
  fontFamily: 'PlusJakartaSans_600SemiBold',
  color: palette.green,
};

const playAllSub: any = {
  fontSize: 12,
  fontFamily: 'PlusJakartaSans_400Regular',
  color: palette.muted,
  marginTop: 1,
};
