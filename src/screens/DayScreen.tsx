import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { Alert, Image, Pressable, ScrollView, View, Dimensions, Modal } from 'react-native';
import { Text } from '../components/AppText';
import { AnimatedCard } from '../components/AnimatedCard';
import { PhotoGrid } from '../components/PhotoGrid';
import { ImagePlaceholder } from '../components/ImagePlaceholder';
import { TimelineCard } from '../components/TimelineCard';
import { useTranslation } from '../i18n/translations';
import { styles } from '../styles';
import { palette } from '../theme/palette';
import { Entry } from '../types';
import { useFocusEffect } from '@react-navigation/native';
import { ensureAutoTrackerFreshness } from '../skills/autoTracker';
import { useJournalStore } from '../memory/store';
import { MomentComposer } from '../components/MomentComposer';

import { useNavigation } from '@react-navigation/native';
import { SlideOutRight, LinearTransition } from 'react-native-reanimated';
import { getLocalDateString } from '../utils/dateUtils';
import { Video, ResizeMode } from 'expo-av';

const SCREEN_WIDTH = Dimensions.get('window').width;

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
  const navigation = useNavigation<any>();
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
              onPress={() => navigation.navigate('Detail', { entryId: entry.id })}
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
        visible={!!editingEntry}
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


