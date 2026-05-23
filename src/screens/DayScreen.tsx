import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, Pressable, ScrollView, View } from 'react-native';
import { Text } from '../components/AppText';
import { AnimatedCard } from '../components/AnimatedCard';
import { useTranslation } from '../i18n/translations';
import { ImagePlaceholder } from '../components/ImagePlaceholder';
import { moodEmoji, moodLabels } from '../data/mockData';
import { styles } from '../styles';
import { palette } from '../theme/palette';
import { Entry } from '../types';
import { useFocusEffect } from '@react-navigation/native';
import { ensureAutoTrackerFreshness } from '../skills/autoTracker';

export function DayScreen({
  entries,
  selectedDate,
  onChangeDate,
  onSaveSuggestion,
  onDiscardSuggestion,
}: {
  entries: Entry[];
  selectedDate: string;
  onChangeDate: (date: string) => void;
  onSaveSuggestion: (id: string) => void;
  onDiscardSuggestion: (id: string) => void;
}) {
  const { t, locale } = useTranslation();

  useFocusEffect(
    React.useCallback(() => {
      ensureAutoTrackerFreshness();
    }, [])
  );

  const dayEntries = entries.filter((entry) => entry.date === selectedDate);

  return (
    <ScrollView contentContainerStyle={styles.screenContent}>
      <View style={styles.dayHeader}>
        <View>
          <Text style={styles.screenTitle}>{formatDateTitle(selectedDate, locale)}</Text>
          <Text style={styles.screenSubtitle}>{t.day.momentsInDay(dayEntries.length)}</Text>
        </View>
        <View style={styles.dateNav}>
          <Pressable accessibilityRole="button" style={styles.iconButton} onPress={() => onChangeDate(shiftDate(selectedDate, -1))}>
            <Ionicons name="chevron-back" size={21} color={palette.green} />
          </Pressable>
          <Pressable accessibilityRole="button" style={styles.iconButton} onPress={() => onChangeDate(shiftDate(selectedDate, 1))}>
            <Ionicons name="chevron-forward" size={21} color={palette.green} />
          </Pressable>
        </View>
      </View>
      <View style={styles.timeline}>
        {dayEntries.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="journal-outline" size={28} color={palette.green} />
            <Text style={styles.emptyTitle}>{t.day.emptyTitle}</Text>
            <Text style={styles.emptyText}>{t.day.emptyText}</Text>
          </View>
        )}
        {dayEntries.map((entry, index) => (
          <TimelineCard
            key={entry.id}
            entry={entry}
            index={index}
            onSave={() => onSaveSuggestion(entry.id)}
            onDiscard={() => onDiscardSuggestion(entry.id)}
            t={t}
          />
        ))}
      </View>
    </ScrollView>
  );
}

function shiftDate(date: string, days: number) {
  const next = new Date(`${date}T12:00:00`);
  next.setDate(next.getDate() + days);
  return next.toISOString().slice(0, 10);
}

function formatDateTitle(date: string, locale: string) {
  return new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(`${date}T12:00:00`));
}

function TimelineCard({ entry, index, onSave, onDiscard, t }: { entry: Entry; index: number; onSave: () => void; onDiscard: () => void; t: any }) {
  const suggested = entry.status === 'suggested';

  const moodBgColors: Record<string, string> = {
    very_bad: 'rgba(229, 57, 53, 0.15)',
    bad: 'rgba(251, 140, 0, 0.15)',
    neutral: 'rgba(158, 158, 158, 0.15)',
    good: 'rgba(67, 160, 71, 0.15)',
    great: 'rgba(126, 87, 194, 0.15)',
  };
  const moodTextColors: Record<string, string> = {
    very_bad: '#E53935',
    bad: '#FB8C00',
    neutral: '#9E9E9E',
    good: '#43A047',
    great: '#7E57C2',
  };

  return (
    <AnimatedCard variant="fadeInDown" delay={index * 80} style={styles.timelineRow}>
      <View style={styles.timelineRail}>
        <Text style={styles.timeText}>{entry.time}</Text>
        <View style={styles.railDot} />
        <View style={styles.railLine} />
      </View>
      <View style={[styles.entryCard, suggested && styles.suggestedCard, entry.imageUri ? { padding: 0 } : null]}>
        {entry.imageUri && (
          <Image
            source={{ uri: entry.imageUri }}
            style={{ width: '100%', aspectRatio: 16 / 9 }}
            resizeMode="cover"
          />
        )}
        <View style={{ padding: 16 }}>
          <View style={styles.entryTopRow}>
            <Text style={styles.entryTime}>{entry.time}</Text>
            <View style={[styles.moodChip, { backgroundColor: moodBgColors[entry.mood] || 'rgba(158,158,158,0.15)' }]}>
              <Text style={[styles.moodText, { color: moodTextColors[entry.mood] || '#9E9E9E' }]}>
                {moodEmoji[entry.mood]} {t.mood[entry.mood]}
              </Text>
            </View>
            {suggested && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginLeft: 'auto' }}>
                <Ionicons name="sparkles" size={14} color={palette.primary} />
                <Text style={styles.suggestedLabel}>{t.day.suggested}</Text>
              </View>
            )}
          </View>
          <Text style={styles.entryText}>{entry.text}</Text>
          {!entry.imageUri && entry.imageLocalId && (
            <ImagePlaceholder label={entry.imageLocalId} uri={entry.imageUri} />
          )}
          {suggested && (
            <View style={styles.miniActionRow}>
              <Pressable style={styles.miniPrimary} onPress={onSave}>
                <Text style={styles.miniPrimaryText}>{t.common.save}</Text>
              </Pressable>
              <Pressable style={styles.miniSecondary} onPress={onDiscard}>
                <Text style={styles.miniSecondaryText}>{t.common.discard}</Text>
              </Pressable>
            </View>
          )}
        </View>
      </View>
    </AnimatedCard>
  );
}
