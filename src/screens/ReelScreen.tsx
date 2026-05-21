import { Ionicons } from '@expo/vector-icons';
import React, { useRef, useState } from 'react';
import { Animated as RNAnimated,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  View } from 'react-native';
import { Text } from '../components/AppText';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { AnimatedCard } from '../components/AnimatedCard';
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

  /** Pick the first entry with an image for a given reel */
  const getCoverEntry = (reel: WeeklyReel): Entry | undefined => {
    return entries.find(
      (e) =>
        e.date >= reel.startDate &&
        e.date <= reel.endDate &&
        e.status === 'saved' &&
        e.imageUri,
    );
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
                  <Text style={playAllTitle}>{t.reel.playAll}</Text>
                  <Text style={playAllSub}>{t.reel.savedMomentsCount(savedCount)}</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color={palette.green} />
            </Pressable>
          </AnimatedCard>
        )}

        {/* Tuần của bạn */}
        <Text style={styles.sectionTitle}>{t.reel.yourWeek}</Text>
        {reels.length > 0 ? (
          reels.map((reel, idx) => {
            const coverEntry = getCoverEntry(reel);
            return (
              <AnimatedCard key={reel.weekId} delay={120 + idx * 60}>
                <Pressable style={styles.reelCard} onPress={() => openReelSlideshow(reel)}>
                  {/* Thumbnail: real image or colour fallback */}
                  <View style={ss.thumbWrap}>
                    {coverEntry?.imageUri ? (
                      <Image
                        source={{ uri: coverEntry.imageUri }}
                        style={ss.thumbImage}
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={[ss.thumbPlaceholder, { backgroundColor: reel.coverTone }]} />
                    )}
                    {/* Dark overlay */}
                    <View style={ss.thumbOverlay} />
                    {/* 🎞️ icon in corner */}
                    <View style={ss.thumbIconWrap}>
                      <Text style={ss.thumbIcon}>🎞️</Text>
                    </View>
                    {/* Play button */}
                    <View style={ss.thumbPlayBtn}>
                      <Ionicons name="play" size={16} color={palette.white} />
                    </View>
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
            );
          })
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

// ─── Local styles ─────────────────────────────────────────────────────────────

const ss = StyleSheet.create({
  thumbWrap: {
    width: 104,
    aspectRatio: 16 / 9,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#d8e5ed',
  },
  thumbImage: {
    ...StyleSheet.absoluteFillObject,
  },
  thumbPlaceholder: {
    ...StyleSheet.absoluteFillObject,
  },
  thumbOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.22)',
  },
  thumbIconWrap: {
    position: 'absolute',
    top: 4,
    right: 5,
  },
  thumbIcon: {
    fontSize: 11,
  },
  thumbPlayBtn: {
    position: 'absolute',
    bottom: 5,
    left: 5,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

// ─── Inline styles for the "Play all" card ────────────────────────────────────

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
