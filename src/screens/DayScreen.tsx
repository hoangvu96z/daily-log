import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { Alert, Image, Pressable, ScrollView, View } from 'react-native';
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
import { useJournalStore } from '../memory/store';
import { MomentComposer } from '../components/MomentComposer';
import { SlideOutRight, LinearTransition } from 'react-native-reanimated';
import { getLocalDateString } from '../utils/dateUtils';

export function DayScreen({
  entries,
  selectedDate,
  onChangeDate,
  selectedEntryId,
  onSaveSuggestion,
  onDiscardSuggestion,
}: {
  entries: Entry[];
  selectedDate: string;
  onChangeDate: (date: string) => void;
  selectedEntryId?: string | null;
  onSaveSuggestion: (id: string) => void;
  onDiscardSuggestion: (id: string) => void;
}) {
  const scrollViewRef = React.useRef<ScrollView>(null);
  const [layoutMap, setLayoutMap] = React.useState<Record<string, number>>({});

  const { t, locale } = useTranslation();
  const { updateEntry, deleteEntry } = useJournalStore();
  const [editingEntry, setEditingEntry] = React.useState<Entry | null>(null);

  const handleDelete = React.useCallback((id: string) => {
    deleteEntry(id);
  }, [deleteEntry]);

  const handleEdit = React.useCallback((entry: Entry) => {
    setEditingEntry(entry);
  }, []);

  const handleSaveEdit = React.useCallback((entry: Entry) => {
    updateEntry(entry.id, entry);
    setEditingEntry(null);
  }, [updateEntry]);

  useFocusEffect(
    React.useCallback(() => {
      ensureAutoTrackerFreshness();
    }, [])
  );

  React.useEffect(() => {
    if (selectedEntryId && layoutMap[selectedEntryId] !== undefined) {
      // Scroll to the item. We add a small offset to account for the header.
      scrollViewRef.current?.scrollTo({ y: layoutMap[selectedEntryId], animated: true });
    }
  }, [selectedEntryId, layoutMap]);

  const dayEntries = entries.filter((entry) => entry.date === selectedDate);

  return (
    <>
    <ScrollView contentContainerStyle={styles.screenContent} ref={scrollViewRef}>
      <View style={styles.dayHeader}>
        <View style={{ flex: 1, marginRight: 16 }}>
          <Text style={styles.screenTitle} numberOfLines={1} adjustsFontSizeToFit>{formatDateTitle(selectedDate, locale)}</Text>
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
          <View 
            key={entry.id} 
            onLayout={(e) => {
              const y = e.nativeEvent.layout.y;
              setLayoutMap(prev => ({ ...prev, [entry.id]: y }));
            }}
          >
            <TimelineCard
              entry={entry}
              index={index}
              onSave={() => onSaveSuggestion(entry.id)}
              onDiscard={() => onDiscardSuggestion(entry.id)}
              onEdit={() => handleEdit(entry)}
              onDelete={() => handleDelete(entry.id)}
              t={t}
            />
          </View>
        ))}
      </View>
    </ScrollView>
    {editingEntry && (
      <MomentComposer
        visible={true}
        mode="edit"
        initialEntry={editingEntry}
        onClose={() => setEditingEntry(null)}
        onSave={handleSaveEdit}
      />
    )}
    </>
  );
}

function shiftDate(date: string, days: number) {
  const next = new Date(`${date}T12:00:00`);
  next.setDate(next.getDate() + days);
  return getLocalDateString(next);
}

function formatDateTitle(date: string, locale: string) {
  const d = new Date(`${date}T12:00:00`);
  if (locale.startsWith('vi')) {
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    return `${day}/${month}/${d.getFullYear()}`;
  }
  return new Intl.DateTimeFormat('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(d);
}

function TimelineCard({ entry, index, onSave, onDiscard, onEdit, onDelete, t }: { entry: Entry; index: number; onSave: () => void; onDiscard: () => void; onEdit: () => void; onDelete: () => void; t: any }) {
  const suggested = entry.status === 'suggested';

  const moodBgColors: Record<string, string> = {
    very_bad: '#E5393526',
    bad: '#FB8C0026',
    neutral: '#43A04726',
    good: '#1E88E526',
    great: '#8E24AA26',
  };
  const moodTextColors: Record<string, string> = {
    very_bad: '#E53935',
    bad: '#FB8C00',
    neutral: '#43A047',
    good: '#1E88E5',
    great: '#8E24AA',
  };

  return (
    <AnimatedCard 
      variant="fadeInDown" 
      delay={index * 80} 
      style={styles.timelineRow}
      exiting={SlideOutRight}
      layout={LinearTransition.springify()}
    >
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
              <MaterialCommunityIcons name={moodEmoji[entry.mood]} size={16} color={moodTextColors[entry.mood]} style={{ marginRight: 4 }} />
              <Text style={[styles.entryMoodText, { color: moodTextColors[entry.mood] || '#9E9E9E' }]}>
                {t.mood[entry.mood]}
              </Text>
            </View>
            {suggested ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginLeft: 'auto' }}>
                <Ionicons name="sparkles" size={14} color={palette.primary} />
                <Text style={styles.suggestedLabel}>{t.day.suggested}</Text>
              </View>
            ) : (
              <Pressable style={{ marginLeft: 'auto', padding: 4 }} onPress={() => {
                Alert.alert(
                  t.common.optionsTitle,
                  '',
                  [
                    { text: t.common.cancel, style: 'cancel' },
                    { text: t.common.edit, onPress: onEdit },
                    { text: t.common.delete, style: 'destructive', onPress: () => {
                      Alert.alert(t.common.deleteConfirmTitle, t.common.deleteConfirmDesc, [
                        { text: t.common.cancel, style: 'cancel' },
                        { text: t.common.delete, style: 'destructive', onPress: onDelete },
                      ]);
                    }},
                  ]
                );
              }}>
                <Ionicons name="ellipsis-horizontal" size={20} color={palette.muted} />
              </Pressable>
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
