import React, { useState, useMemo } from 'react';
import { View, ScrollView, Dimensions, Pressable, Image } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Video, ResizeMode } from 'expo-av';
import ImageView from '../components/ImageViewer';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Text } from '../components/AppText';
import { PhotoGrid } from '../components/PhotoGrid';
import { useJournalStore } from '../memory/store';
import { useTranslation } from '../i18n/translations';
import { RootStackParamList } from '../types';
import { moodEmoji } from '../data/mockData';
import { styles } from '../styles';
import { palette } from '../theme/palette';

type Props = NativeStackScreenProps<RootStackParamList, 'Detail'>;

const SCREEN_WIDTH = Dimensions.get('window').width;

const moodBgColors: Record<string, string> = {
  very_bad: '#E5393526',
  bad: '#FB8C0026',
  neutral: '#43A04726',
  good: '#1E88E526',
  great: palette.primaryContainer,
};
const moodTextColors: Record<string, string> = {
  very_bad: '#E53935',
  bad: '#FB8C00',
  neutral: '#43A047',
  good: '#1E88E5',
  great: palette.primary,
};

export function DetailScreen({ route, navigation }: Props) {
  const { entryId } = route.params;
  const { entries } = useJournalStore();
  const { t, lang } = useTranslation();

  const detailEntry = useMemo(() => entries.find(e => e.id === entryId), [entries, entryId]);

  const [viewerVisible, setViewerVisible] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);

  const viewerImages = useMemo(() => {
    if (!detailEntry) return [];
    if (detailEntry.media && detailEntry.media.length > 0) {
      return detailEntry.media;
    }
    if (detailEntry.imageUri) return [{ uri: detailEntry.imageUri, type: 'image' as const }];
    return [];
  }, [detailEntry]);

  if (!detailEntry) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: palette.background, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: palette.ink }}>Entry not found.</Text>
        <Pressable onPress={() => navigation.goBack()} style={{ marginTop: 20, padding: 12, backgroundColor: palette.outline, borderRadius: 8 }}>
          <Text style={{ color: palette.ink }}>Go Back</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const formatDateTitle = (dateStr: string, locale: string) => {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    if (locale === 'vi') {
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      return `${day}/${month}/${d.getFullYear()}`;
    }
    return new Intl.DateTimeFormat('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(d);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: palette.background }} edges={['top', 'bottom']}>
      <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: palette.outline }}>
        <Pressable onPress={() => navigation.goBack()} style={{ padding: 4, marginRight: 16 }} hitSlop={10}>
          <Ionicons name="arrow-back" size={24} color={palette.ink} />
        </Pressable>
        <Text style={{ fontSize: 16, fontWeight: '600', color: palette.ink }}>
          {formatDateTitle(detailEntry.date, lang)} • {detailEntry.time}
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {(detailEntry.media && detailEntry.media.length > 0) ? (
          <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
            <PhotoGrid 
              media={detailEntry.media}
              onPressImage={(index) => {
                setViewerIndex(index);
                setViewerVisible(true);
              }}
            />
          </View>
        ) : detailEntry.imageUri ? (
          <View style={{ width: '100%', paddingHorizontal: 16, paddingTop: 16 }}>
            <Pressable 
              style={{ width: '100%', aspectRatio: 4 / 3, borderRadius: 16, overflow: 'hidden', backgroundColor: palette.outline }}
              onPress={() => { setViewerIndex(0); setViewerVisible(true); }}
            >
              <Image source={{ uri: detailEntry.imageUri }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
            </Pressable>
          </View>
        ) : null}

        <View style={{ padding: 20 }}>
          <View style={[styles.moodChip, { alignSelf: 'flex-start', marginBottom: 16, backgroundColor: moodBgColors[detailEntry.mood] || palette.outline }]}>
            <MaterialCommunityIcons name={moodEmoji[detailEntry.mood]} size={16} color={moodTextColors[detailEntry.mood]} style={{ marginRight: 4 }} />
            <Text style={[{ fontSize: 12, fontWeight: '600' }, { color: moodTextColors[detailEntry.mood] || palette.muted }]}>
              {t.mood[detailEntry.mood]}
            </Text>
          </View>
          <Text style={{ fontSize: 16, lineHeight: 24, color: palette.ink }}>{detailEntry.text}</Text>
        </View>
      </ScrollView>

      <ImageView
        images={viewerImages}
        imageIndex={viewerIndex}
        visible={viewerVisible}
        onRequestClose={() => setViewerVisible(false)}
      />
    </SafeAreaView>
  );
}
