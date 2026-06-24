import React, { useState } from 'react';
import { View, StyleSheet, FlatList, Pressable, Alert } from 'react-native';
import { Text } from '../components/AppText';
import { palette } from '../theme/palette';
import { useJournalStore } from '../memory/store';
import { Ionicons } from '@expo/vector-icons';
import { Category } from '../types';
import { CategoryEditorSheet } from '../components/CategoryEditorSheet';
import BottomSheet, { BottomSheetBackdrop } from '@gorhom/bottom-sheet';

export function CategoriesSettingsScreen({ navigation }: any) {
  const { categories, addCategoryToStore, updateCategoryInStore, deleteCategoryFromStore } = useJournalStore();
  const [editorVisible, setEditorVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const handleAdd = () => {
    setEditingCategory(null);
    setEditorVisible(true);
  };

  const handleEdit = (cat: Category) => {
    setEditingCategory(cat);
    setEditorVisible(true);
  };

  const handleDelete = (cat: Category) => {
    if (cat.isDefault) {
      Alert.alert('Không thể xóa', 'Đây là danh mục mặc định của hệ thống.');
      return;
    }
    Alert.alert(
      'Xóa danh mục',
      `Bạn có chắc muốn xóa danh mục "${cat.name}"? Các khoảnh khắc đang dùng danh mục này sẽ bị gỡ nhãn.`,
      [
        { text: 'Hủy', style: 'cancel' },
        { 
          text: 'Xóa', 
          style: 'destructive', 
          onPress: () => deleteCategoryFromStore(cat.id)
        }
      ]
    );
  };

  const handleSaveCategory = async (patch: Partial<Category>) => {
    if (editingCategory) {
      await updateCategoryInStore(editingCategory.id, patch);
    } else {
      const newCat: Category = {
        id: `cat-${Date.now()}`,
        name: patch.name || '',
        emoji: patch.emoji || '📁',
        color: patch.color || '#8b5cf6',
        sortOrder: categories.length,
        isDefault: false
      };
      await addCategoryToStore(newCat);
    }
    setEditorVisible(false);
  };

  const renderItem = ({ item }: { item: Category }) => (
    <View style={styles.row}>
      <View style={[styles.chip, { backgroundColor: `${item.color}20` }]}>
        <Text style={styles.emoji}>{item.emoji}</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.name}>{item.name}</Text>
      </View>
      <Pressable style={styles.actionBtn} onPress={() => handleEdit(item)}>
        <Ionicons name="pencil" size={20} color={palette.muted} />
      </Pressable>
      {!item.isDefault && (
        <Pressable style={styles.actionBtn} onPress={() => handleDelete(item)}>
          <Ionicons name="trash-outline" size={20} color={palette.red} />
        </Pressable>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={categories}
        keyExtractor={c => c.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />

      <Pressable style={styles.fab} onPress={handleAdd}>
        <Ionicons name="add" size={28} color="#fff" />
      </Pressable>

      {editorVisible && (
        <BottomSheet
          snapPoints={['90%']}
          enablePanDownToClose
          onClose={() => setEditorVisible(false)}
          backdropComponent={(props) => (
            <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.4} />
          )}
        >
          <CategoryEditorSheet 
            initialCategory={editingCategory}
            onSave={handleSaveCategory}
            onCancel={() => setEditorVisible(false)}
          />
        </BottomSheet>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.background,
  },
  listContent: {
    padding: 20,
    paddingBottom: 100,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  chip: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  emoji: {
    fontSize: 20,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: palette.ink,
  },
  actionBtn: {
    padding: 8,
    marginLeft: 4,
  },
  separator: {
    height: 1,
    backgroundColor: palette.outline,
    marginLeft: 56,
  },
  fab: {
    position: 'absolute',
    bottom: 32,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: palette.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: palette.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
});
