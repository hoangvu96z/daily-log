/**
 * SlideshowScreen — Full-screen reel slideshow player.
 *
 * Features:
 * - Auto-advances every 4 seconds
 * - Mood-aware background gradient (no photo → colour tinted by mood)
 * - Fades between slides (calm, journal-like)
 * - Shows: photo → mood chip → entry text per slide
 * - Tap to advance, swipe to dismiss
 * - Pause on press & hold
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  Image,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { moodEmoji } from '../data/mockData';
import { Entry, Mood } from '../types';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const SLIDE_DURATION_MS = 4000;

// ─── Mood → gradient colour ───────────────────────────────────────────────────

const moodGradientBg: Record<Mood, string> = {
  very_bad: '#1a0a0a',
  bad:      '#0f1218',
  neutral:  '#0a1a12',
  good:     '#071a0e',
  great:    '#051510',
};

const moodAccent: Record<Mood, string> = {
  very_bad: 'rgba(186,26,26,0.25)',
  bad:      'rgba(60,80,120,0.25)',
  neutral:  'rgba(30,80,60,0.25)',
  good:     'rgba(50,140,90,0.25)',
  great:    'rgba(100,200,160,0.25)',
};

// ─── Component ────────────────────────────────────────────────────────────────

interface SlideshowScreenProps {
  visible: boolean;
  entries: Entry[];
  weekTitle?: string;
  onClose: () => void;
}

export function SlideshowScreen({ visible, entries, weekTitle, onClose }: SlideshowScreenProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [slideKey, setSlideKey] = useState(0);

  const progressValue = useSharedValue(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const slidableEntries = entries.filter(
    (e) => e.status === 'saved' && (e.imageUri || e.text),
  );

  const advance = useCallback(() => {
    setCurrentIndex((prev) => {
      if (prev >= slidableEntries.length - 1) {
        return 0;
      }
      return prev + 1;
    });
    setSlideKey((k) => k + 1);
  }, [slidableEntries.length]);

  const startTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    progressValue.value = 0;
    progressValue.value = withTiming(1, { duration: SLIDE_DURATION_MS });
    timerRef.current = setTimeout(() => {
      advance();
    }, SLIDE_DURATION_MS);
  }, [advance, progressValue]);

  useEffect(() => {
    if (!visible || paused || slidableEntries.length === 0) return;
    startTimer();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [currentIndex, paused, visible, slidableEntries.length, startTimer]);

  useEffect(() => {
    if (visible) {
      setCurrentIndex(0);
      setSlideKey(0);
    }
  }, [visible]);

  if (slidableEntries.length === 0) return null;

  const entry = slidableEntries[currentIndex];
  const mood = entry.mood ?? 'neutral';

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progressValue.value * 100}%`,
  }));

  return (
    <Modal
      visible={visible}
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback
        onPress={advance}
        onLongPress={() => setPaused(true)}
        onPressOut={() => setPaused(false)}
      >
        <View style={ss.container}>
          {/* Background: real photo or mood-gradient */}
          {entry.imageUri ? (
            <Animated.View
              key={`bg-${slideKey}`}
              entering={FadeIn.duration(600)}
              style={StyleSheet.absoluteFill}
            >
              <Image source={{ uri: entry.imageUri }} style={ss.bgImage} resizeMode="cover" />
            </Animated.View>
          ) : (
            <Animated.View
              key={`bg-grad-${slideKey}`}
              entering={FadeIn.duration(700)}
              style={[ss.bgGradient, { backgroundColor: moodGradientBg[mood] }]}
            >
              {/* Accent colour blob for visual interest */}
              <View style={[ss.moodBlob, { backgroundColor: moodAccent[mood] }]} />
            </Animated.View>
          )}

          {/* Dark overlay */}
          <View style={ss.overlay} />

          <SafeAreaView style={ss.safeArea}>
            {/* Progress bars */}
            <View style={ss.progressBar}>
              {slidableEntries.map((_, idx) => (
                <View key={idx} style={ss.progressTrack}>
                  {idx < currentIndex && (
                    <Animated.View style={[ss.progressFill, { width: '100%' }]} />
                  )}
                  {idx === currentIndex && (
                    <Animated.View style={[ss.progressFill, progressStyle]} />
                  )}
                </View>
              ))}
            </View>

            {/* Header */}
            <View style={ss.header}>
              {weekTitle ? <Text style={ss.weekTitle}>{weekTitle}</Text> : null}
              <Pressable onPress={onClose} style={ss.closeBtn} hitSlop={16}>
                <Text style={ss.closeBtnText}>✕</Text>
              </Pressable>
            </View>

            {/* Slide content — animated on key change */}
            <Animated.View
              key={slideKey}
              entering={FadeIn.duration(600)}
              exiting={FadeOut.duration(300)}
              style={ss.slideContent}
            >
              {/* Mood chip */}
              <View style={ss.moodChipRow}>
                <View style={[ss.moodChip, { borderColor: moodAccent[mood] }]}>
                  <Text style={ss.moodChipText}>
                    {moodEmoji[mood]}  {mood.replace('_', ' ')}
                  </Text>
                </View>
                <Text style={ss.timeText}>{entry.time}</Text>
              </View>

              {/* Entry text */}
              {entry.text ? (
                <Text style={ss.entryText} numberOfLines={5}>
                  {entry.text}
                </Text>
              ) : null}

              {/* Location name */}
              {entry.locationName ? (
                <View style={ss.locationRow}>
                  <Text style={ss.locationIcon}>📍</Text>
                  <Text style={ss.locationText}>{entry.locationName}</Text>
                </View>
              ) : null}

              {/* ✨ sparkle on great/good mood */}
              {(mood === 'great' || mood === 'good') && (
                <View style={ss.sparkleWrap}>
                  <Text style={ss.sparkle}>✨</Text>
                </View>
              )}
            </Animated.View>

            {/* Footer: counter + pause hint */}
            <View style={ss.footer}>
              <Text style={ss.counterText}>
                {currentIndex + 1} / {slidableEntries.length}
              </Text>
              {paused && (
                <Animated.View entering={FadeIn} exiting={FadeOut} style={ss.pauseBadge}>
                  <Text style={ss.pauseText}>⏸  Paused</Text>
                </Animated.View>
              )}
            </View>
          </SafeAreaView>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const ss = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0f0d',
  },
  bgImage: {
    ...StyleSheet.absoluteFillObject,
  },
  bgGradient: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  moodBlob: {
    position: 'absolute',
    bottom: -SCREEN_H * 0.15,
    left: -SCREEN_W * 0.15,
    width: SCREEN_W * 1.3,
    height: SCREEN_W * 1.3,
    borderRadius: SCREEN_W * 0.65,
    opacity: 0.8,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.50)',
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: 18,
  },
  // Progress bars
  progressBar: {
    flexDirection: 'row',
    gap: 4,
    marginTop: Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) + 12 : 12,
  },
  progressTrack: {
    flex: 1,
    height: 2.5,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 2,
  },
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
  },
  weekTitle: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 13,
    fontFamily: 'PlusJakartaSans_500Medium',
    letterSpacing: 0.4,
  },
  closeBtn: {
    marginLeft: 'auto',
  },
  closeBtnText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 18,
  },
  // Slide content
  slideContent: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: 24,
  },
  moodChipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  moodChip: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  moodChipText: {
    color: '#fff',
    fontSize: 13,
    fontFamily: 'PlusJakartaSans_500Medium',
  },
  timeText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 13,
    fontFamily: 'PlusJakartaSans_400Regular',
  },
  entryText: {
    color: 'rgba(255,255,255,0.92)',
    fontSize: 20,
    fontFamily: 'PlusJakartaSans_600SemiBold',
    lineHeight: 30,
    marginBottom: 14,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationIcon: {
    fontSize: 13,
  },
  locationText: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 13,
    fontFamily: 'PlusJakartaSans_400Regular',
  },
  sparkleWrap: {
    position: 'absolute',
    top: 0,
    right: 0,
  },
  sparkle: {
    fontSize: 22,
    opacity: 0.75,
  },
  // Footer
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 8,
  },
  counterText: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 12,
    fontFamily: 'PlusJakartaSans_400Regular',
  },
  pauseBadge: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  pauseText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    fontFamily: 'PlusJakartaSans_400Regular',
  },
});
