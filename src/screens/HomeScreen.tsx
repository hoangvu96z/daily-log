import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { useTranslation, getLocale } from '../i18n/translations';
import { ScreenHeader } from '../components/ScreenHeader';
import { moodEmoji, moodLabels } from '../data/mockData';
import { styles } from '../styles';
import { palette } from '../theme/palette';
import { Entry } from '../types';

export function HomeScreen({ entries, onOpenDay }: { entries: Entry[]; onOpenDay: () => void }) {
  const { t } = useTranslation();
  const [calendarVisible, setCalendarVisible] = useState(false);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayDate = yesterday.toISOString().slice(0, 10);
  const highlights = entries.filter((entry) => entry.date === yesterdayDate && entry.isHighlight).slice(0, 4);
  const hasEntries = entries.length > 0;

  return (
    <ScrollView contentContainerStyle={styles.screenContent}>
      <ScreenHeader title={t.home.title} subtitle={t.home.subtitle} />
      <View style={styles.heroCard}>
        <Text style={styles.cardKicker}>{t.home.kicker}</Text>
        {highlights.length > 0 ? (
          <>
            <Text style={styles.heroTitle}>{t.home.heroText}</Text>
            <View style={styles.chipWrap}>
              {highlights.map((entry) => (
                <View key={entry.id} style={styles.eventChip}>
                  <View style={styles.chipIcon}>
                    <Ionicons name={entry.imageLocalId ? 'image-outline' : 'sparkles-outline'} size={15} color={palette.green} />
                  </View>
                  <Text style={styles.eventChipText}>{entry.text?.split(',')[0]}</Text>
                </View>
              ))}
            </View>
          </>
        ) : (
          <Text style={styles.heroTitle}>
            {hasEntries
              ? t.home.emptyYesterday
              : t.home.welcomeText}
          </Text>
        )}
      </View>
      <View style={styles.actionRow}>
        <Pressable style={styles.primaryButton} onPress={onOpenDay}>
          <Text style={styles.primaryButtonText}>{t.home.viewFullDay}</Text>
        </Pressable>
        <Pressable style={styles.secondaryButton} onPress={() => setCalendarVisible(true)}>
          <Text style={styles.secondaryButtonText}>{t.home.moodCalendar}</Text>
        </Pressable>
      </View>
      <View style={styles.privacyStrip}>
        <Ionicons name="lock-closed-outline" size={19} color={palette.green} />
        <Text style={styles.privacyText}>{t.home.privacyNote}</Text>
      </View>
      <MoodCalendar visible={calendarVisible} entries={entries} onClose={() => setCalendarVisible(false)} t={t} />
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
