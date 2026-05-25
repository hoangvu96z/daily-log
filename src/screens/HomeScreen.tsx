import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState, useEffect, useRef } from 'react';
import { Animated as RNAnimated, Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useJournalStore } from '../memory/store';
import { MomentComposer } from '../components/MomentComposer';
import { BlurView } from 'expo-blur';
import Animated, { FadeInDown, useAnimatedStyle, withRepeat, withTiming, withSequence, Easing, useSharedValue } from 'react-native-reanimated';
import { Text } from '../components/AppText';
import { AnimatedCard } from '../components/AnimatedCard';
import { useTranslation } from '../i18n/translations';
import { moodEmoji, moodLabels } from '../data/mockData';
import { styles } from '../styles';
import { palette } from '../theme/palette';
import { Entry } from '../types';
import { HighlightTile } from '../components/HighlightTile';
import { useFocusEffect } from '@react-navigation/native';
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
    outputRange: [28, 12],
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

  const todayDate = getLocalDateString();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayDate = getLocalDateString(yesterday);
  let dynamicKicker = t.home.kicker;
  if (displayDate === todayDate) {
    dynamicKicker = lang === 'vi' ? 'Hôm nay của bạn' : 'Your Today';
  } else if (displayDate !== yesterdayDate) {
    dynamicKicker = new Intl.DateTimeFormat(locale, { month: 'short', day: 'numeric' }).format(new Date(`${displayDate}T12:00:00`));
  }

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
      contentContainerStyle={[styles.screenContent, { paddingTop: headerPaddingTop }]}
      onScroll={RNAnimated.event(
        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
        { useNativeDriver: false }
      )}
      scrollEventThrottle={16}
    >
      {/* Header Section */}
      <View style={styles.header}>
        <RNAnimated.Text style={[styles.screenTitle, { fontSize: titleFontSize }]}>{t.home.title}</RNAnimated.Text>
        <Text style={styles.screenSubtitle}>{t.home.subtitle}</Text>
      </View>

      {/* Bento Grid Stack */}
      <View style={{ gap: 16 }}>
        {highlights.length > 0 ? (
          /* Render 2x2 Bento Grid */
          <View style={{ gap: 12 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <Text style={styles.cardKicker}>{dynamicKicker}</Text>
              <Ionicons name="sparkles-sharp" size={18} color={palette.primary} />
            </View>
            
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
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={styles.cardKicker}>{dynamicKicker}</Text>
              <Ionicons name="sparkles-sharp" size={18} color={palette.primary} />
            </View>
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

        {/* Card 3: Action Buttons — stacked full-width */}
        <View style={{ gap: 10 }}>
          <Pressable style={[styles.primaryButton, { flex: undefined }]} onPress={() => { onSelectDate?.(displayDate); onOpenDay(); }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
              <Ionicons name="eye-outline" size={18} color={palette.white} />
              <Text style={styles.primaryButtonText}>{t.home.viewFullDay}</Text>
            </View>
          </Pressable>
          <Pressable style={[styles.secondaryButton, { flex: undefined }]} onPress={() => setCalendarVisible(true)}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
              <Ionicons name="calendar-outline" size={18} color={palette.primary} />
              <Text style={styles.secondaryButtonText}>{t.home.moodCalendar}</Text>
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

      <View style={styles.privacyStrip}>
        <Ionicons name="lock-closed-outline" size={19} color={palette.primary} />
        <Text style={styles.privacyText}>{t.home.privacyNote}</Text>
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
      <DailyInsightDialog visible={insightVisible} entries={entries} onClose={() => setInsightVisible(false)} t={t} />
    </RNAnimated.ScrollView>
  );
}

export function MoodCalendar({
  visible,
  entries,
  onClose,
  onSelectDate,
  t,
  locale,
  isPremium,
  onUpgrade,
}: {
  visible: boolean;
  entries: Entry[];
  onClose: () => void;
  onSelectDate?: (date: string) => void;
  t: any;
  locale: string;
  isPremium?: boolean;
  onUpgrade?: () => void;
}) {
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(getLocalDateString());
  const [mode, setMode] = useState<'7day' | '30day'>('7day');

  useEffect(() => {
    if (visible) {
      setSelectedDateKey(getLocalDateString());
      setMode(isPremium ? '30day' : '7day');
    }
  }, [visible, isPremium]);

  const moodColors: Record<string, string> = {
    very_bad: '#E53935',
    bad:      '#FB8C00',
    neutral:  '#43A047',
    good:     '#1E88E5',
    great:    '#8E24AA',
  };

  const dayCount = mode === '30day' ? 30 : 7;
  const days = Array.from({ length: dayCount }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (dayCount - 1 - i));
    const dateKey = getLocalDateString(date);
    const dayEntries = entries.filter(e => e.date === dateKey && e.status === 'saved');
    const dominantMood = dayEntries.length > 0 ? mostFrequent(dayEntries.map(e => e.mood)) : null;
    return {
      dateKey,
      dayLabel: new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(date),
      dayNum: date.getDate(),
      count: dayEntries.length,
      mood: dominantMood,
      isToday: dateKey === getLocalDateString(),
    };
  });

  let streak = 0;
  for (let i = days.length - 1; i >= 0; i--) {
    if (days[i].count > 0) streak++;
    else break;
  }

  const recentDays  = days.slice(-7);
  const goodDays    = recentDays.filter(d => d.mood === 'good' || d.mood === 'great').length;
  const badDays     = recentDays.filter(d => d.mood === 'bad' || d.mood === 'very_bad').length;
  const neutralDays = recentDays.filter(d => d.mood === 'neutral').length;
  const emptyDays   = recentDays.filter(d => !d.mood).length;
  const homeT = t.home as any;

  const weekRows: typeof days[] = [];
  if (mode === '30day') {
    for (let i = 0; i < days.length; i += 7) weekRows.push(days.slice(i, i + 7));
  }

  const isVi = locale.startsWith('vi');

  // Pulse animation for today
  const scale = useSharedValue(1);
  useEffect(() => {
    if (visible) {
      scale.value = withRepeat(
        withSequence(
          withTiming(1.1, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
    } else {
      scale.value = 1;
    }
  }, [visible]);

  const animatedPulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        
        <View style={{ borderTopLeftRadius: 36, borderTopRightRadius: 36, overflow: 'hidden', maxHeight: '90%' }}>
          <BlurView intensity={100} tint="light" style={StyleSheet.absoluteFill} />
          
          {/* Lớp phủ sáng màu giúp mặt kính trong vắt và dễ đọc chữ hơn */}
          <View style={{ backgroundColor: 'rgba(255,255,255,0.75)', padding: 24, paddingBottom: 50 }}>
            
            {/* Header */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text style={{ fontSize: 24, fontWeight: '800', color: palette.ink }}>{t.home.moodCalendarTitle}</Text>
              {isPremium && (
                <View style={{ backgroundColor: palette.primary, borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2 }}>
                  <Text style={{ color: palette.white, fontSize: 9, fontWeight: '800' }}>PRO</Text>
                </View>
              )}
            </View>
            <Pressable onPress={onClose} style={{ padding: 6, backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: 20 }}>
              <Ionicons name="close" size={20} color={palette.ink} />
            </Pressable>
          </View>

          {/* Stats Bar */}
          <View style={{ marginBottom: 24 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', marginBottom: 8, gap: 8 }}>
              {streak >= 3 && (
                <View style={{ backgroundColor: 'rgba(255, 140, 0, 0.1)', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Text style={{ fontSize: 14 }}>🔥</Text>
                  <Text style={{ color: '#E65100', fontSize: 12, fontWeight: '800' }}>{homeT.streakMessage ? homeT.streakMessage(streak) : `${streak} Ngày`}</Text>
                </View>
              )}
              <Text style={{ fontSize: 13, color: palette.muted, fontWeight: '600' }}>
                {goodDays > 0 ? `${goodDays} Tuyệt vời • ` : ''}{badDays > 0 ? `${badDays} Tệ • ` : ''}{neutralDays > 0 ? `${neutralDays} Bình thường` : ''}
              </Text>
            </View>
            
            <View style={{ height: 8, borderRadius: 4, flexDirection: 'row', overflow: 'hidden', backgroundColor: 'rgba(0,0,0,0.05)' }}>
              {recentDays.length > 0 && (
                <>
                  <View style={{ flex: goodDays, backgroundColor: moodColors.great }} />
                  <View style={{ flex: neutralDays, backgroundColor: moodColors.neutral }} />
                  <View style={{ flex: badDays, backgroundColor: moodColors.bad }} />
                  <View style={{ flex: emptyDays, backgroundColor: 'transparent' }} />
                </>
              )}
            </View>
          </View>

          {/* Mode Toggle */}
          <View style={{ flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.06)', borderRadius: 16, padding: 4, marginBottom: 24, alignSelf: 'center' }}>
            {(['7day', '30day'] as const).map((m) => {
              const label  = homeT.daysLabel(m === '7day' ? 7 : 30);
              const isActive = mode === m;
              const locked   = m === '30day' && !isPremium;
              return (
                <Pressable
                  key={m}
                  style={{
                    paddingHorizontal: 24, paddingVertical: 10,
                    borderRadius: 14,
                    backgroundColor: isActive ? palette.white : 'transparent',
                    flexDirection: 'row', alignItems: 'center', gap: 6,
                    shadowColor: isActive ? '#000' : 'transparent',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: isActive ? 0.05 : 0,
                    shadowRadius: 4,
                  }}
                  onPress={() => {
                    if (locked) { onUpgrade?.(); return; }
                    setMode(m);
                  }}
                >
                  {locked && <Ionicons name="lock-closed" size={12} color={isActive ? palette.primary : palette.muted} />}
                  <Text style={{ color: isActive ? palette.primary : palette.muted, fontSize: 13, fontWeight: '700' }}>{label}</Text>
                </Pressable>
              );
            })}
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 400 }}>
            {mode === '7day' ? (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16, justifyContent: 'center' }}>
                {days.map((day) => {
                  const isSelected = selectedDateKey === day.dateKey;
                  const color = day.mood ? moodColors[day.mood] : palette.muted;
                  
                  return (
                    <Pressable
                      key={day.dateKey}
                      style={[{ alignItems: 'center', width: '20%' }]}
                      onPress={() => setSelectedDateKey(day.dateKey)}
                    >
                      <Text style={{ fontSize: 12, color: day.isToday ? palette.primary : palette.muted, marginBottom: 12, fontWeight: day.isToday ? '800' : '600' }}>
                        {day.dayLabel}
                      </Text>
                      
                      <View style={{ position: 'relative', width: 56, height: 56, justifyContent: 'center', alignItems: 'center' }}>
                        {day.isToday && (
                          <Animated.View style={[{ position: 'absolute', width: 72, height: 72, borderRadius: 36, backgroundColor: color, opacity: 0.15 }, animatedPulseStyle]} />
                        )}
                        <View style={[{
                          width: 56, height: 56, borderRadius: 28,
                          backgroundColor: day.mood ? `${color}1A` : 'rgba(0,0,0,0.03)',
                          borderWidth: day.mood ? 2 : 1,
                          borderColor: day.mood ? color : 'rgba(0,0,0,0.08)',
                          alignItems: 'center', justifyContent: 'center',
                        }, isSelected && { borderWidth: 3, borderColor: palette.primary }]}>
                          {day.mood ? (
                            <MaterialCommunityIcons name={moodEmoji[day.mood as keyof typeof moodEmoji].replace('-outline', '')} size={28} color={color} />
                          ) : (
                            <Text style={{ fontSize: 14, color: palette.muted, fontWeight: '500' }}>{day.dayNum}</Text>
                          )}
                        </View>
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            ) : (
              <View style={{ gap: 8 }}>
                <View style={{ flexDirection: 'row', gap: 8, marginBottom: 4 }}>
                  {(isVi ? ['T2','T3','T4','T5','T6','T7','CN'] : ['M','T','W','T','F','S','S']).map((d, i) => (
                    <View key={i} style={{ flex: 1, alignItems: 'center' }}>
                      <Text style={{ fontSize: 11, color: palette.muted, fontWeight: '700' }}>{d}</Text>
                    </View>
                  ))}
                </View>
                {weekRows.map((week, wIdx) => (
                  <View key={wIdx} style={{ flexDirection: 'row', gap: 8 }}>
                    {week.map((day) => {
                      const isSelected = selectedDateKey === day.dateKey;
                      const count = day.count;
                      const baseHex = day.mood ? moodColors[day.mood] : null;
                      
                      // Intensity based on count
                      const intensity = count === 0 ? 0 : count === 1 ? 0.4 : count === 2 ? 0.7 : 1;
                      const alpha = Math.round(intensity * 255).toString(16).padStart(2, '0');
                      const bgColor = baseHex ? `${baseHex}${alpha}` : 'rgba(0,0,0,0.04)';
                      
                      return (
                        <Pressable
                          key={day.dateKey}
                          style={{
                            flex: 1, aspectRatio: 1, borderRadius: 12,
                            backgroundColor: bgColor,
                            alignItems: 'center', justifyContent: 'center',
                            borderWidth: isSelected ? 2.5 : day.isToday ? 2 : 0,
                            borderColor: isSelected ? palette.ink : day.isToday ? palette.primary : 'transparent',
                          }}
                          onPress={() => setSelectedDateKey(day.dateKey)}
                        >
                          <Text style={{ fontSize: 12, fontWeight: isSelected || day.isToday ? '800' : '600', color: count > 0 ? palette.white : palette.muted }}>
                            {day.dayNum}
                          </Text>
                          {count > 1 && (
                            <View style={{ position: 'absolute', top: 4, right: 4, width: 6, height: 6, borderRadius: 3, backgroundColor: palette.white }} />
                          )}
                        </Pressable>
                      );
                    })}
                    {week.length < 7 && Array.from({ length: 7 - week.length }).map((_, i) => (
                      <View key={`p${i}`} style={{ flex: 1 }} />
                    ))}
                  </View>
                ))}
              </View>
            )}
          </ScrollView>
          
          <View style={{ marginTop: 24 }}>
            <Pressable
              style={styles.primaryButton}
              onPress={() => {
                onClose();
                if (selectedDateKey) {
                  onSelectDate?.(selectedDateKey);
                }
              }}
            >
              <Text style={styles.primaryButtonText}>{t.home.viewFullDay}</Text>
            </Pressable>
          </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}


function DailyInsightDialog({ visible, entries, onClose, t }: { visible: boolean; entries: Entry[]; onClose: () => void; t: any }) {
  const homeT = t.home as any;
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.dialogScrim}>
        <View style={styles.dialogCard}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <Ionicons name="sparkles" size={24} color={palette.primary} />
            <Text style={styles.dialogTitle}>{homeT.luminousInsights}</Text>
          </View>
          <Text style={styles.dialogText}>
            {homeT.insightsDesc}
          </Text>
          <View style={{
            backgroundColor: 'rgba(255, 255, 255, 0.04)',
            borderRadius: 16,
            padding: 16,
            marginTop: 12,
            borderWidth: 1,
            borderColor: palette.outline,
          }}>
            <Text style={{ color: palette.onSurface, lineHeight: 22, fontStyle: 'italic' }}>
              {homeT.insightsText}
            </Text>
          </View>
          <Pressable style={[styles.saveButton, { marginTop: 20 }]} onPress={onClose}>
            <Text style={styles.saveButtonText}>{t.common.close}</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
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

