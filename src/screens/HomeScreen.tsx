import { Ionicons } from '@expo/vector-icons';
import React, { useState, useEffect } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTranslation } from '../i18n/translations';
import { moodEmoji, moodLabels } from '../data/mockData';
import { styles } from '../styles';
import { palette } from '../theme/palette';
import { Entry } from '../types';
import { HighlightTile } from '../components/HighlightTile';

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
  onSelectDate?: (date: string) => void;
  isPremium?: boolean;
  onUpgrade?: () => void;
}) {
  const { t, lang, locale } = useTranslation();
  const [calendarVisible, setCalendarVisible] = useState(false);
  const [insightVisible, setInsightVisible] = useState(false);

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayDate = yesterday.toISOString().slice(0, 10);
  const highlights = entries.filter((entry) => entry.date === yesterdayDate).slice(0, 4);

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
    <ScrollView contentContainerStyle={styles.screenContent}>
      {/* Header Section */}
      <View style={styles.header}>
        <Text style={styles.screenTitle}>{t.home.title}</Text>
        <Text style={styles.screenSubtitle}>{t.home.subtitle}</Text>
      </View>

      {/* Bento Grid Stack */}
      <View style={{ gap: 16 }}>
        {highlights.length > 0 ? (
          /* Render 2x2 Bento Grid */
          <View style={{ gap: 12 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <Text style={styles.cardKicker}>{t.home.kicker}</Text>
              <Ionicons name="sparkles-sharp" size={18} color={palette.primary} />
            </View>
            
            {/* Row 1 */}
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <Animated.View entering={FadeInDown.delay(100).springify()} style={{ flex: 1 }}>
                <HighlightTile entry={highlights[0]} onPress={onOpenDay} />
              </Animated.View>
              <Animated.View entering={FadeInDown.delay(180).springify()} style={{ flex: 1 }}>
                {highlights[1] ? (
                  <HighlightTile entry={highlights[1]} onPress={onOpenDay} />
                ) : (
                  <Pressable style={localStyles.emptyTilePlaceholder} onPress={onOpenDay}>
                    <Ionicons name="add-circle-outline" size={24} color={palette.primary} style={{ opacity: 0.5 }} />
                    <Text style={localStyles.emptyTileText}>{t.home.emptyYesterday}</Text>
                  </Pressable>
                )}
              </Animated.View>
            </View>
            
            {/* Row 2 */}
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <Animated.View entering={FadeInDown.delay(260).springify()} style={{ flex: 1 }}>
                {highlights[2] ? (
                  <HighlightTile entry={highlights[2]} onPress={onOpenDay} />
                ) : (
                  <Pressable style={localStyles.emptyTilePlaceholder} onPress={onOpenDay}>
                    <Ionicons name="sparkles-outline" size={24} color={palette.primary} style={{ opacity: 0.5 }} />
                    <Text style={localStyles.emptyTileText}>Gợi ý thêm</Text>
                  </Pressable>
                )}
              </Animated.View>
              <Animated.View entering={FadeInDown.delay(340).springify()} style={{ flex: 1 }}>
                {/* Tile 4: Mini Peace Index */}
                <View style={localStyles.miniPeaceTile}>
                  <Ionicons name="heart-circle-outline" size={24} color={palette.primary} />
                  <Text style={localStyles.miniPeacePercent}>{peaceIndex}%</Text>
                  <Text style={localStyles.miniPeaceDesc} numberOfLines={2}>
                    {lang === 'vi' ? 'Chỉ số bình yên' : 'Peace index'}
                  </Text>
                </View>
              </Animated.View>
            </View>
          </View>
        ) : (
          /* Fallback: Old Card 1 (Daily Alignment) */
          <View style={styles.heroCard}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={styles.cardKicker}>{t.home.kicker}</Text>
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
          <Pressable style={[styles.primaryButton, { flex: undefined }]} onPress={onOpenDay}>
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
    </ScrollView>
  );
}

function MoodCalendar({
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
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);
  const [mode, setMode] = useState<'7day' | '30day'>('7day');

  useEffect(() => {
    if (visible) {
      setSelectedDateKey(new Date().toISOString().slice(0, 10));
      setMode(isPremium ? '30day' : '7day');
    }
  }, [visible, isPremium]);

  const moodColors: Record<string, string> = {
    very_bad: '#E53935',
    bad:      '#FB8C00',
    neutral:  '#9E9E9E',
    good:     '#43A047',
    great:    '#7E57C2',
  };

  const dayCount = mode === '30day' ? 30 : 7;
  const days = Array.from({ length: dayCount }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (dayCount - 1 - i));
    const dateKey = date.toISOString().slice(0, 10);
    const dayEntries = entries.filter(e => e.date === dateKey && e.status === 'saved');
    const dominantMood = dayEntries.length > 0 ? mostFrequent(dayEntries.map(e => e.mood)) : null;
    return {
      dateKey,
      dayLabel: new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(date),
      dayNum: date.getDate(),
      count: dayEntries.length,
      mood: dominantMood,
      isToday: dateKey === new Date().toISOString().slice(0, 10),
    };
  });

  // Streak (consecutive days from today backward)
  let streak = 0;
  for (let i = days.length - 1; i >= 0; i--) {
    if (days[i].count > 0) streak++;
    else break;
  }

  const recentDays  = days.slice(-7);
  const goodDays    = recentDays.filter(d => d.mood === 'good' || d.mood === 'great').length;
  const neutralDays = recentDays.filter(d => d.mood === 'neutral' || d.mood === 'bad').length;
  const emptyDays   = recentDays.filter(d => !d.mood).length;
  const homeT = t.home as any;

  // On-this-day (year ago)
  const yearAgo = new Date();
  yearAgo.setFullYear(yearAgo.getFullYear() - 1);
  const yearAgoKey     = yearAgo.toISOString().slice(0, 10);
  const yearAgoEntries = entries.filter(e => e.date === yearAgoKey && e.status === 'saved');

  const selectedDayEntries = selectedDateKey
    ? entries.filter(e => e.date === selectedDateKey && e.status === 'saved')
    : [];

  // 30-day: split into week rows
  const weekRows: typeof days[] = [];
  if (mode === '30day') {
    for (let i = 0; i < days.length; i += 7) weekRows.push(days.slice(i, i + 7));
  }

  const isVi = locale.startsWith('vi');

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.dialogScrim}>
        <View style={[styles.dialogCard, { width: '94%', maxHeight: '92%', paddingVertical: 20 }]}>

          {/* Header */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text style={styles.dialogTitle}>{t.home.moodCalendarTitle}</Text>
              {isPremium && (
                <View style={{ backgroundColor: palette.primary, borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2 }}>
                  <Text style={{ color: palette.white, fontSize: 9, fontWeight: '800' }}>PREMIUM</Text>
                </View>
              )}
            </View>
            <Pressable onPress={onClose} style={{ padding: 4 }}>
              <Ionicons name="close" size={22} color={palette.muted} />
            </Pressable>
          </View>

          <Text style={[styles.dialogText, { marginBottom: 8 }]}>
            {homeT.moodSummary ? homeT.moodSummary(goodDays, neutralDays, emptyDays) : t.home.moodCalendarDesc}
          </Text>

          {streak >= 3 && homeT.streakMessage && (
            <View style={{ backgroundColor: palette.primaryContainer, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 6, marginBottom: 10, alignSelf: 'flex-start' }}>
              <Text style={{ color: palette.primary, fontSize: 12, fontWeight: '700' }}>
                {homeT.streakMessage(streak)}
              </Text>
            </View>
          )}

          {/* Mode toggle */}
          <View style={{ flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: 12, padding: 3, marginBottom: 14, alignSelf: 'center' }}>
            {(['7day', '30day'] as const).map((m) => {
              const label  = m === '7day' ? (isVi ? '7 ngày' : '7 days') : (isVi ? '30 ngày' : '30 days');
              const isActive = mode === m;
              const locked   = m === '30day' && !isPremium;
              return (
                <Pressable
                  key={m}
                  style={{
                    paddingHorizontal: 18, paddingVertical: 7,
                    borderRadius: 10,
                    backgroundColor: isActive ? palette.primary : 'transparent',
                    flexDirection: 'row', alignItems: 'center', gap: 4,
                  }}
                  onPress={() => {
                    if (locked) { onUpgrade?.(); return; }
                    setMode(m);
                  }}
                >
                  {locked && <Ionicons name="lock-closed" size={11} color={isActive ? palette.white : palette.muted} />}
                  <Text style={{ color: isActive ? palette.white : palette.muted, fontSize: 12, fontWeight: '700' }}>{label}</Text>
                </Pressable>
              );
            })}
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 430 }} nestedScrollEnabled>

            {/* Grid */}
            {mode === '7day' ? (
              <View style={styles.moodCalendarGrid}>
                {days.map((day) => {
                  const isSelected = selectedDateKey === day.dateKey;
                  const intensity  = Math.min(1, 0.4 + day.count * 0.2);
                  return (
                    <Pressable
                      key={day.dateKey}
                      style={[
                        styles.moodDayCell,
                        isSelected && { borderColor: palette.primary, borderWidth: 2, backgroundColor: 'rgba(3,31,65,0.05)', borderRadius: 12, padding: 4 },
                      ]}
                      onPress={() => setSelectedDateKey(day.dateKey)}
                    >
                      <Text style={styles.moodDayName}>{day.dayLabel}</Text>
                      <Text style={styles.moodDateText}>{day.dayNum}</Text>
                      <View style={[
                        styles.moodDotLarge,
                        { backgroundColor: day.mood ? moodColors[day.mood] : palette.outline, opacity: day.count ? intensity : 0.25 },
                      ]} />
                      <Text style={[styles.moodCellText, { fontSize: day.mood ? 12 : 11 }]}>
                        {day.mood ? `${moodEmoji[day.mood as keyof typeof moodEmoji]} ${t.mood[day.mood]}` : t.home.emptyMood}
                      </Text>
                      <Text style={styles.moodCountText}>{t.home.entryCount(day.count)}</Text>
                    </Pressable>
                  );
                })}
              </View>
            ) : (
              <View style={{ gap: 5, marginBottom: 8 }}>
                <View style={{ flexDirection: 'row', gap: 4, marginBottom: 2 }}>
                  {(isVi ? ['T2','T3','T4','T5','T6','T7','CN'] : ['M','T','W','T','F','S','S']).map((d, i) => (
                    <View key={i} style={{ flex: 1, alignItems: 'center' }}>
                      <Text style={{ fontSize: 10, color: palette.muted, fontWeight: '600' }}>{d}</Text>
                    </View>
                  ))}
                </View>
                {weekRows.map((week, wIdx) => (
                  <View key={wIdx} style={{ flexDirection: 'row', gap: 4 }}>
                    {week.map((day) => {
                      const isSelected = selectedDateKey === day.dateKey;
                      const count      = day.count;
                      const intensity  = count === 0 ? 0 : count === 1 ? 0.35 : count === 2 ? 0.6 : 0.9;
                      const baseHex    = day.mood ? moodColors[day.mood] : null;
                      const alpha      = Math.round(intensity * 255).toString(16).padStart(2, '0');
                      const bgColor    = baseHex
                        ? `${baseHex}${alpha}`
                        : day.isToday ? palette.primaryContainer : 'rgba(0,0,0,0.06)';
                      return (
                        <Pressable
                          key={day.dateKey}
                          style={{
                            flex: 1, aspectRatio: 1, borderRadius: 8,
                            backgroundColor: bgColor,
                            alignItems: 'center', justifyContent: 'center',
                            borderWidth: isSelected ? 2 : day.isToday ? 1.5 : 0,
                            borderColor: isSelected ? palette.primary : day.isToday ? palette.primary : 'transparent',
                          }}
                          onPress={() => setSelectedDateKey(day.dateKey)}
                        >
                          <Text style={{ fontSize: 11, fontWeight: isSelected || day.isToday ? '800' : '500', color: count > 0 ? palette.white : palette.muted }}>
                            {day.dayNum}
                          </Text>
                          {count > 1 && (
                            <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.85)', marginTop: 1 }} />
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

            {/* Selected day detail */}
            {selectedDateKey && (
              <View style={{ marginTop: 14, padding: 12, backgroundColor: 'rgba(255,255,255,0.7)', borderRadius: 14, borderWidth: 1, borderColor: 'rgba(3,31,65,0.08)', gap: 8 }}>
                <Text style={{ fontSize: 13, fontWeight: '700', color: palette.primary }}>
                  {isVi ? 'Ngày' : 'Day'} {selectedDateKey.split('-').reverse().join('/')}
                </Text>
                {selectedDayEntries.length > 0 ? (
                  <ScrollView style={{ maxHeight: 110 }} nestedScrollEnabled>
                    {selectedDayEntries.map((e) => (
                      <View key={e.id} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 5, borderBottomWidth: 1, borderBottomColor: 'rgba(3,31,65,0.04)' }}>
                        <View style={{ flex: 1, marginRight: 8 }}>
                          <Text style={{ fontSize: 12, color: palette.ink, fontWeight: '500' }} numberOfLines={1}>
                            {e.time} • {e.text || (isVi ? 'Không có nội dung' : 'No text')}
                          </Text>
                        </View>
                        <Text style={{ fontSize: 14 }}>{moodEmoji[e.mood]}</Text>
                      </View>
                    ))}
                  </ScrollView>
                ) : (
                  <Text style={{ fontSize: 12, color: palette.muted, fontStyle: 'italic' }}>
                    {isVi ? 'Chưa ghi nhật ký ngày này.' : 'No entries for this day.'}
                  </Text>
                )}
                <Pressable
                  style={{ backgroundColor: selectedDayEntries.length > 0 ? palette.primary : 'rgba(3,31,65,0.08)', borderRadius: 10, paddingVertical: 8, alignItems: 'center' }}
                  onPress={() => { if (selectedDateKey && onSelectDate) { onSelectDate(selectedDateKey); onClose(); } }}
                >
                  <Text style={{ color: selectedDayEntries.length > 0 ? palette.white : palette.primary, fontSize: 12, fontWeight: '700' }}>
                    {selectedDayEntries.length > 0
                      ? (isVi ? 'Xem chi tiết ngày này' : 'View Day Details')
                      : (isVi ? 'Đi tới Tab Ngày' : 'Go to Day Tab')}
                  </Text>
                </Pressable>
              </View>
            )}

            {/* On-this-day year ago */}
            {yearAgoEntries.length > 0 && (
              <View style={{ marginTop: 14, padding: 12, backgroundColor: palette.primaryContainer, borderRadius: 14, gap: 6 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={{ fontSize: 13 }}>🕰️</Text>
                  <Text style={{ fontSize: 12, fontWeight: '700', color: palette.primary }}>
                    {isVi ? 'Năm ngoái hôm này' : 'One year ago today'}
                  </Text>
                </View>
                {yearAgoEntries.slice(0, 2).map((e) => (
                  <View key={e.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Text style={{ fontSize: 13 }}>{moodEmoji[e.mood]}</Text>
                    <Text style={{ fontSize: 12, color: palette.ink, flex: 1 }} numberOfLines={2}>
                      {e.text || (isVi ? 'Khoảnh khắc không có nội dung' : 'Moment without text')}
                    </Text>
                  </View>
                ))}
                <Pressable onPress={() => { onSelectDate?.(yearAgoKey); onClose(); }}>
                  <Text style={{ fontSize: 11, color: palette.primary, fontWeight: '600', textDecorationLine: 'underline' }}>
                    {isVi ? `Xem ${yearAgoEntries.length} khoảnh khắc ngày đó →` : `View ${yearAgoEntries.length} moment(s) →`}
                  </Text>
                </Pressable>
              </View>
            )}

            {/* Premium upsell (non-premium, 7day mode) */}
            {!isPremium && mode === '7day' && (
              <Pressable
                style={{ marginTop: 14, padding: 12, borderRadius: 14, borderWidth: 1, borderColor: palette.primary, borderStyle: 'dashed', flexDirection: 'row', alignItems: 'center', gap: 10 }}
                onPress={onUpgrade}
              >
                <Ionicons name="lock-closed-outline" size={18} color={palette.primary} />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 13, fontWeight: '700', color: palette.primary }}>
                    {isVi ? 'Mở khóa 30 ngày' : 'Unlock 30-day view'}
                  </Text>
                  <Text style={{ fontSize: 11, color: palette.muted, marginTop: 2 }}>
                    {isVi ? 'Heatmap 30 ngày + on-this-day năm trước' : '30-day heatmap & on-this-day insights'}
                  </Text>
                </View>
                <View style={{ backgroundColor: palette.primary, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 }}>
                  <Text style={{ color: palette.white, fontSize: 11, fontWeight: '800' }}>
                    {isVi ? 'Nâng cấp' : 'Upgrade'}
                  </Text>
                </View>
              </Pressable>
            )}
          </ScrollView>

          <Pressable style={[styles.saveButton, { marginTop: 12 }]} onPress={onClose}>
            <Text style={styles.saveButtonText}>{t.common.close}</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

function mostFrequent<T>(arr: T[]): T | null {
  if (arr.length === 0) return null;
  const freq = new Map<T, number>();
  arr.forEach(v => freq.set(v, (freq.get(v) ?? 0) + 1));
  let best: T = arr[0]; let max = 0;
  freq.forEach((count, key) => { if (count > max) { max = count; best = key; } });
  return best;
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

