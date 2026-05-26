import React from 'react';
import { ScrollView, View, Pressable, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from './AppText';
import { useJournalStore } from '../memory/store';
import { useTranslation } from '../i18n/translations';
import { palette } from '../theme/palette';

interface HighlightBarProps {
  onPressNew: () => void;
  onPressHighlight: (highlightId: string) => void;
}

export function HighlightBar({ onPressNew, onPressHighlight }: HighlightBarProps) {
  const highlights = useJournalStore(s => s.highlights);
  const entries = useJournalStore(s => s.entries);
  const { settings } = useJournalStore();
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Nút Tạo Mới (+) */}
        <Pressable style={styles.highlightItem} onPress={onPressNew}>
          <View style={[styles.circle, { borderColor: palette.outline, backgroundColor: palette.primaryContainer }]}>
            <Ionicons name="add" size={28} color={palette.ink} />
          </View>
          <Text style={[styles.label, { color: palette.ink }]} numberOfLines={1}>
            {(t as any).me?.newHighlight || 'Mới'}
          </Text>
        </Pressable>

        {/* Các Highlights hiện có */}
        {highlights.map((highlight) => {
          let displayCover = highlight.coverImageUri;
          if (!displayCover && highlight.entryIds.length > 0) {
            const firstEntryWithImg = highlight.entryIds
              .map(id => entries.find(e => e.id === id))
              .find(e => e?.media?.[0]?.uri || e?.imageUri);
            if (firstEntryWithImg) {
              displayCover = firstEntryWithImg.media?.[0]?.uri || firstEntryWithImg.imageUri;
            }
          }

          return (
            <Pressable 
              key={highlight.id} 
              style={styles.highlightItem} 
              onPress={() => onPressHighlight(highlight.id)}
            >
              <View style={[styles.circle, { borderColor: palette.primary }]}>
                {displayCover ? (
                  <Image source={{ uri: displayCover }} style={styles.image} />
                ) : (
                  <View style={[styles.imagePlaceholder, { backgroundColor: palette.primary + '20' }]}>
                    <Ionicons name="images-outline" size={24} color={palette.primary} />
                  </View>
                )}
              </View>
              <Text style={[styles.label, { color: palette.ink }]} numberOfLines={1}>
                {highlight.title}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
  },
  scrollContent: {
    paddingHorizontal: 24,
    gap: 16,
  },
  highlightItem: {
    alignItems: 'center',
    width: 68,
    gap: 8,
  },
  circle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 3, // Khoảng cách giữa viền và ảnh (giống Instagram)
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 31, // (68 - 6) / 2
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: 31,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
    width: '100%',
  },
});
