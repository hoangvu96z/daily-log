import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState, useEffect, useRef } from 'react';
import { Animated as RNAnimated, Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useJournalStore } from '../memory/store';
import { MomentComposer } from '../components/MomentComposer';
import { BlurView } from 'expo-blur';
import Animated, { FadeInDown, useAnimatedStyle, withRepeat, withTiming, withSequence, Easing, useSharedValue } from 'react-native-reanimated';
import { Text } from '../components/AppText';
import { AnimatedCard } from '../components/AnimatedCard';
import { MoodCalendar } from '../components/MoodCalendar';
import { DailyInsightDialog } from '../components/DailyInsightDialog';
import { useTranslation } from '../i18n/translations';
import { moodEmoji, moodLabels } from '../data/mockData';
import { styles } from '../styles';
import { palette } from '../theme/palette';
import { Entry } from '../types';
import { HighlightTile } from '../components/HighlightTile';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ensureAutoTrackerFreshness } from '../skills/autoTracker';
import { getLocalDateString } from '../utils/dateUtils';
import { mostFrequent } from '../utils/arrayUtils';

enum SentimentType {
  POSITIVE = 'positive',
  NEGATIVE = 'negative',
  MINDFUL = 'mindful',
}

const SENTIMENT_KEYWORDS = {
  vi: {
    positive: ['bình yên', 'thư giãn', 'thiền', 'nhẹ lòng', 'dễ chịu', 'biết ơn', 'vui', 'hạnh phúc'],
    negative: ['mệt', 'stress', 'bận', 'áp lực', 'lo lắng', 'tức giận', 'buồn', 'chán'],
    mindful: ['cà phê', 'trà', 'đi dạo', 'thể dục', 'đọc', 'nhạc'],
  },
  en: {
    positive: ['calm', 'peaceful', 'grateful', 'relax', 'love', 'nature', 'happy', 'joy'],
    negative: ['tired', 'busy', 'angry', 'sad', 'hate', 'stress', 'worry', 'bored'],
    mindful: ['coffee', 'tea', 'walk', 'run', 'exercise', 'read', 'music'],
  },
};

export function HomeScreen({
  entries,
  onOpenDay,
  onSelectDate,
  isPremium,
  onUpgrade,
}: {
  entries: Entry[];
  onOpenDay: () => void;
  onSelectDate?: (date: string, entryId?: string) => void;
  isPremium?: boolean;
  onUpgrade?: () => void;
}) {
  const { t, lang, locale } = useTranslation();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [calendarVisible, setCalendarVisible] = useState(false);
  const [insightVisible, setInsightVisible] = useState(false);

  const scrollY = useRef(new RNAnimated.Value(0)).current;

  useFocusEffect(
    React.useCallback(() => {
      ensureAutoTrackerFreshness();
    }, [])
  );

  const headerPaddingTop = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [28 + insets.top, 12 + insets.top],
    extrapolate: 'clamp',
  });

  const titleFontSize = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [32, 22],
    extrapolate: 'clamp',
  });

  const sortedDates = [...new Set(entries.map(e => e.date))].sort((a, b) => b.localeCompare(a));
  const displayDate = sortedDates.length > 0 ? sortedDates[0] : getLocalDateString();
  const highlights = entries
    .filter((entry) => entry.date === displayDate)
    .sort((a, b) => b.time.localeCompare(a.time))
    .slice(0, 4);



  const homeT = t.home as any;
  const activeLang = lang === 'vi' ? 'vi' : 'en';
  const keywords = SENTIMENT_KEYWORDS[activeLang];

  // Advanced & Mindful Peace Index calculation
  let peaceIndex = 84; // Beautiful default baseline if no data
  if (highlights.length > 0) {
    // 1. Mood Base Score
    const moodScores = highlights.map((e) => {
      if (e.mood === 'great') return 95;
      if (e.mood === 'neutral') return 85; // Equanimity is highly peaceful
      if (e.mood === 'good') return 80;
      if (e.mood === 'bad') return 40;
      return 15; // very_bad
    });
    const baseScore = moodScores.reduce((a, b) => a + b, 0) / moodScores.length;

    // 2. Keyword Sentiment Scan
    let sentimentBonus = 0;
    highlights.forEach((e) => {
      const text = (e.text || '').toLowerCase();

      keywords.positive.forEach((word) => {
        if (text.includes(word)) sentimentBonus += 3;
      });
      keywords.negative.forEach((word) => {
        if (text.includes(word)) sentimentBonus -= 4;
      });
    });

    // 3. Mindful Activities Scan
    let activityBonus = 0;
    highlights.forEach((e) => {
      const text = (e.text || '').toLowerCase();

      keywords.mindful.forEach((word) => {
        if (text.includes(word)) activityBonus += 5;
      });
    });

    // Caps
    sentimentBonus = Math.max(-20, Math.min(15, sentimentBonus));
    activityBonus = Math.min(10, activityBonus);

    // 4. Reflection Routine Frequency Bonus
    let frequencyBonus = 0;
    if (highlights.length === 2) frequencyBonus = 5;
    else if (highlights.length >= 3) frequencyBonus = 10;

    // Final total calculation
    peaceIndex = Math.round(baseScore + sentimentBonus + activityBonus + frequencyBonus);
    peaceIndex = Math.max(10, Math.min(100, peaceIndex));
  }

  return (
    <RNAnimated.ScrollView
      contentContainerStyle={[styles.screenContent, { paddingTop: headerPaddingTop, paddingBottom: 120 + insets.bottom }]}
      onScroll={RNAnimated.event(
        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
        { useNativeDriver: false }
      )}
      scrollEventThrottle={16}
    >
      {/* Header Section */}
      <View style={[styles.header, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }]}>
        <View>
          <RNAnimated.Text style={[styles.screenTitle, { fontSize: titleFontSize }]}>{t.home.title}</RNAnimated.Text>
          <Text style={styles.screenSubtitle}>{t.home.subtitle}</Text>
        </View>
        <Pressable 
          style={{ padding: 8, backgroundColor: 'rgba(0,0,0,0.03)', borderRadius: 20 }}
          onPress={() => (navigation as any).navigate('Search')}
        >
          <Ionicons name="search" size={24} color={palette.ink} />
        </Pressable>
      </View>

      {/* Bento Grid Stack */}
      <View style={{ gap: 16 }}>
        {highlights.length > 0 ? (
          /* Render 2x2 Bento Grid */
          <View style={{ gap: 12 }}>
            
            {/* Row 1 */}
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <AnimatedCard delay={100} style={{ flex: 1 }}>
                <HighlightTile entry={highlights[0]} onPress={() => { onSelectDate?.(highlights[0].date, highlights[0].id); onOpenDay(); }} />
              </AnimatedCard>
              <AnimatedCard delay={180} style={{ flex: 1 }}>
                {highlights[1] ? (
                  <HighlightTile entry={highlights[1]} onPress={() => { onSelectDate?.(highlights[1].date, highlights[1].id); onOpenDay(); }} />
                ) : (
                  <Pressable style={localStyles.emptyTilePlaceholder} onPress={() => { useJournalStore.getState().setSelectedDate(displayDate); useJournalStore.getState().setSheetVisible(true); }}>
                    <Ionicons name="add-circle-outline" size={24} color={palette.primary} style={{ opacity: 0.5 }} />
                    <Text style={localStyles.emptyTileText}>{t.home.emptyYesterday}</Text>
                  </Pressable>
                )}
              </AnimatedCard>
            </View>
            
            {/* Row 2 */}
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <AnimatedCard delay={260} style={{ flex: 1 }}>
                {highlights[2] ? (
                  <HighlightTile entry={highlights[2]} onPress={() => { onSelectDate?.(highlights[2].date, highlights[2].id); onOpenDay(); }} />
                ) : (
                  <Pressable style={localStyles.emptyTilePlaceholder} onPress={() => { useJournalStore.getState().setSelectedDate(displayDate); useJournalStore.getState().setSheetVisible(true); }}>
                    <Ionicons name="sparkles-outline" size={24} color={palette.primary} style={{ opacity: 0.5 }} />
                    <Text style={localStyles.emptyTileText}>{homeT.suggestMore}</Text>
                  </Pressable>
                )}
              </AnimatedCard>
              <AnimatedCard delay={340} style={{ flex: 1 }}>
                {/* Tile 4: Mini Peace Index */}
                <View style={localStyles.miniPeaceTile}>
                  <Ionicons name="heart-circle-outline" size={24} color={palette.primary} />
                  <Text style={[localStyles.miniPeacePercent, { color: palette.primary }]}>{peaceIndex}%</Text>
                  <Text style={[localStyles.miniPeaceDesc, { color: palette.onSurface }]} numberOfLines={2}>
                    {homeT.peaceIndex}
                  </Text>
                </View>
              </AnimatedCard>
            </View>
          </View>
        ) : (
          /* Fallback: Old Card 1 (Daily Alignment) */
          <View style={styles.heroCard}>
            <View style={{ marginTop: 10 }}>
              <Text style={styles.heroTitle}>
                {entries.length > 0 ? t.home.emptyYesterday : t.home.welcomeText}
              </Text>
              <Text style={[styles.screenSubtitle, { marginTop: 6, fontSize: 14, opacity: 0.8 }]}>
                {entries.length > 0
                  ? homeT.emptyYesterday
                  : t.home.welcomeText}
              </Text>
            </View>
          </View>
        )}

        {/* Card 2: Peace Index Card — Only show if highlights.length === 0 to avoid duplication */}
        {highlights.length === 0 && (
          <View style={[styles.heroCard, { alignItems: 'center', paddingVertical: 24 }]}>
            <Text style={[styles.cardKicker, { marginBottom: 16 }]}>{homeT.peaceIndex}</Text>

            <View style={{
              width: 120,
              height: 120,
              borderRadius: 60,
              borderWidth: 6,
              borderColor: palette.outline,
              justifyContent: 'center',
              alignItems: 'center',
              position: 'relative',
            }}>
              <View style={{
                position: 'absolute',
                width: 108,
                height: 108,
                borderRadius: 54,
                backgroundColor: palette.primaryContainer,
                opacity: 0.15,
              }} />
              <Text style={{
                color: palette.onSurface,
                fontSize: 36,
                fontWeight: '800',
                letterSpacing: -1,
              }}>
                {peaceIndex}
                <Text style={{ fontSize: 16, color: palette.primary }}>%</Text>
              </Text>
            </View>

            <Text style={[styles.screenSubtitle, { marginTop: 16, textAlign: 'center', fontSize: 14 }]}>
              {peaceIndex >= 80
                ? homeT.serenityOptimal
                : peaceIndex >= 60
                  ? homeT.serenityModerate
                  : homeT.serenityMindful}
            </Text>
          </View>
        )}

        {/* Card 3: Action Buttons — side by side, same style */}
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Pressable
            style={[styles.primaryButton, { flex: 1, paddingVertical: 15 }]}
            onPress={() => { onSelectDate?.(displayDate); onOpenDay(); }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7, justifyContent: 'center' }}>
              <Ionicons name="eye-outline" size={17} color={palette.white} />
              <Text style={[styles.primaryButtonText, { fontSize: 14 }]}>{t.home.viewFullDay}</Text>
            </View>
          </Pressable>
          <Pressable
            style={[styles.primaryButton, { flex: 1, paddingVertical: 15 }]}
            onPress={() => setCalendarVisible(true)}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7, justifyContent: 'center' }}>
              <Ionicons name="calendar-outline" size={17} color={palette.white} />
              <Text style={[styles.primaryButtonText, { fontSize: 14 }]}>{t.home.moodCalendar}</Text>
            </View>
          </Pressable>
        </View>

        {/* Card 4: Daily Insights — warm hint card */}
        <Pressable
          style={[styles.heroCard, {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingVertical: 14,
            backgroundColor: palette.primaryContainer,
          }]}
          onPress={() => setInsightVisible(true)}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
            <Ionicons name="bulb-outline" size={20} color={palette.primary} />
            <Text style={[styles.settingsTitle, { color: palette.onSurface }]}>
              {(homeT as any).insightHint || homeT.dailyInsights}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={palette.primary} />
        </Pressable>
      </View>



      <MoodCalendar
        visible={calendarVisible}
        entries={entries}
        onClose={() => setCalendarVisible(false)}
        onSelectDate={onSelectDate}
        t={t}
        locale={locale}
        isPremium={isPremium}
        onUpgrade={() => { setCalendarVisible(false); onUpgrade?.(); }}
      />
      <DailyInsightDialog visible={insightVisible} onClose={() => setInsightVisible(false)} t={t} />
    </RNAnimated.ScrollView>
  );
}


const localStyles = StyleSheet.create({
  emptyTilePlaceholder: {
    flex: 1,
    height: 140,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: palette.outline,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
  },
  emptyTileText: {
    color: palette.onSurface,
    opacity: 0.6,
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 6,
  },
  miniPeaceTile: {
    flex: 1,
    height: 140,
    borderRadius: 20,
    backgroundColor: palette.primaryContainer,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: palette.outline,
  },
  miniPeacePercent: {
    color: palette.onSurface,
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: -1,
    marginVertical: 4,
  },
  miniPeaceKicker: {
    color: palette.onSurface,
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    opacity: 0.7,
  },
  miniPeaceDesc: {
    color: palette.onSurface,
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
    opacity: 0.8,
  },
});

