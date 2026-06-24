import React from 'react';
import { ScrollView, Pressable, View, StyleSheet } from 'react-native';
import { Text } from './AppText';
import { palette } from '../theme/palette';
import { useJournalStore } from '../memory/store';

interface CategoryPickerProps {
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}

export const CategoryPicker: React.FC<CategoryPickerProps> = ({ selectedId, onSelect }) => {
  const categories = useJournalStore((state) => state.categories);

  if (categories.length === 0) return null;

  return (
    <View style={styles.container}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Pressable
          style={[
            styles.chip,
            !selectedId ? styles.chipSelected : styles.chipUnselected,
            !selectedId && { backgroundColor: palette.outlineVariant }
          ]}
          onPress={() => onSelect(null)}
        >
          <Text style={[styles.chipText, !selectedId ? { color: palette.ink } : { color: palette.muted }]}>
            Không có
          </Text>
        </Pressable>

        {categories.map((cat) => {
          const isSelected = selectedId === cat.id;
          return (
            <Pressable
              key={cat.id}
              style={[
                styles.chip,
                isSelected ? styles.chipSelected : styles.chipUnselected,
                isSelected && { backgroundColor: `${cat.color}20`, borderColor: cat.color, borderWidth: 1 }
              ]}
              onPress={() => onSelect(cat.id)}
            >
              <Text style={styles.emoji}>{cat.emoji}</Text>
              <Text style={[
                styles.chipText, 
                isSelected ? { color: cat.color, fontWeight: '600' } : { color: palette.muted }
              ]}>
                {cat.name}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  scrollContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  chipUnselected: {
    backgroundColor: palette.slate,
    borderWidth: 1,
    borderColor: palette.outline,
  },
  chipSelected: {
    // Dynamic based on category color
  },
  emoji: {
    fontSize: 14,
  },
  chipText: {
    fontSize: 13,
  },
});
