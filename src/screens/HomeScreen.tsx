import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { useTranslation, getLocale } from '../i18n/translations';
import { moodEmoji, moodLabels } from '../data/mockData';
import { styles } from '../styles';
import { palette } from '../theme/palette';
import { Entry } from '../types';

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

export function HomeScreen({ entries, onOpenDay }: { entries: Entry[]; onOpenDay: () => void }) {
  const { t, lang } = useTranslation();
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
        {/* Card 1: Daily Alignment / Highlight Panel */}
        <View style={styles.heroCard}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={styles.cardKicker}>{t.home.kicker}</Text>
            <Ionicons name="sparkles-sharp" size={18} color={palette.primary} />
          </View>

          {highlights.length > 0 ? (
            <>
              <Text style={styles.heroTitle}>{t.home.heroText}</Text>
              <Text style={[styles.screenSubtitle, { marginTop: 6, fontSize: 14, opacity: 0.8 }]}>
                {homeT.heroSub}
              </Text>
              <View style={styles.chipWrap}>
                {highlights.map((entry) => (
                  <View key={entry.id} style={styles.eventChip}>
                    <View style={styles.chipIcon}>
                      <Ionicons name={entry.imageLocalId ? 'image-outline' : 'sparkles-outline'} size={14} color={palette.primary} />
                    </View>
                    <Text style={styles.eventChipText}>
                      {entry.text && entry.text.length > 20 ? `${entry.text.substring(0, 20)}...` : entry.text}
                    </Text>
                  </View>
                ))}
              </View>
            </>
          ) : (
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
          )}
        </View>

        {/* Card 2: Peace Index Card */}
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

        {/* Card 3: Action Buttons row */}
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <Pressable style={styles.primaryButton} onPress={onOpenDay}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Ionicons name="eye-outline" size={18} color={palette.white} />
              <Text style={styles.primaryButtonText}>{t.home.viewFullDay}</Text>
            </View>
          </Pressable>
          <Pressable style={styles.secondaryButton} onPress={() => setCalendarVisible(true)}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Ionicons name="calendar-outline" size={18} color={palette.primary} />
              <Text style={styles.secondaryButtonText}>{t.home.moodCalendar}</Text>
            </View>
          </Pressable>
        </View>

        {/* Card 4: Additional Insights Button */}
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
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Ionicons name="bulb-outline" size={20} color={palette.primary} />
            <Text style={[styles.settingsTitle, { color: palette.onSurface }]}>{homeT.dailyInsights}</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={palette.primary} />
        </Pressable>
      </View>

      <View style={styles.privacyStrip}>
        <Ionicons name="lock-closed-outline" size={19} color={palette.primary} />
        <Text style={styles.privacyText}>{t.home.privacyNote}</Text>
      </View>

      <MoodCalendar visible={calendarVisible} entries={entries} onClose={() => setCalendarVisible(false)} t={t} />
      <DailyInsightDialog visible={insightVisible} entries={entries} onClose={() => setInsightVisible(false)} t={t} />
    </ScrollView>
  );
}

function MoodCalendar({ visible, entries, onClose, t }: { visible: boolean; entries: Entry[]; onClose: () => void; t: any }) {
  const locale = getLocale();
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - index));
    const dateKey = date.toISOString().slice(0, 10);
    const dayEntries = entries.filter((entry) => entry.date === dateKey);
    const lastMood = dayEntries[dayEntries.length - 1]?.mood;
    return {
      dateKey,
      dayLabel: new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(date),
      dateLabel: new Intl.DateTimeFormat(locale, { day: '2-digit', month: '2-digit' }).format(date),
      count: dayEntries.length,
      mood: lastMood,
    };
  });

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.dialogScrim}>
        <View style={styles.dialogCard}>
          <Text style={styles.dialogTitle}>{t.home.moodCalendarTitle}</Text>
          <Text style={styles.dialogText}>{t.home.moodCalendarDesc}</Text>
          <View style={styles.moodCalendarGrid}>
            {days.map((day) => (
              <View key={day.dateKey} style={styles.moodDayCell}>
                <Text style={styles.moodDayName}>{day.dayLabel}</Text>
                <Text style={styles.moodDateText}>{day.dateLabel}</Text>
                <View style={[styles.moodDotLarge, { opacity: day.count ? 1 : 0.25 }]} />
                <Text style={styles.moodCellText}>{day.mood ? `${moodEmoji[day.mood]} ${t.mood[day.mood]}` : t.home.emptyMood}</Text>
                <Text style={styles.moodCountText}>{t.home.entryCount(day.count)}</Text>
              </View>
            ))}
          </View>
          <Pressable style={styles.saveButton} onPress={onClose}>
            <Text style={styles.saveButtonText}>{t.common.close}</Text>
          </Pressable>
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
