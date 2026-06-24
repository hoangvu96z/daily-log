import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TextInput, Pressable, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Text } from './AppText';
import { palette } from '../theme/palette';
import { Category } from '../types';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from '../i18n/translations';

interface CategoryEditorSheetProps {
  initialCategory?: Category | null;
  onSave: (category: Partial<Category>) => void;
  onCancel: () => void;
}

const PRESET_COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#84cc16', 
  '#22c55e', '#10b981', '#14b8a6', '#06b6d4',
  '#0ea5e9', '#3b82f6', '#6366f1', '#8b5cf6',
  '#a855f7', '#d946ef', '#ec4899', '#f43f5e'
];

const PRESET_EMOJIS = [
  '💼', '🏠', '🤝', '💕', '🌱', '✈️', '📚', '💪',
  '🎮', '🎨', '🎵', '🍽️', '☕', '🚗', '💰', '🛒',
  '🐶', '🐱', '🌞', '🌙', '⭐', '🔥', '💧', '🌲'
];

export const CategoryEditorSheet: React.FC<CategoryEditorSheetProps> = ({ initialCategory, onSave, onCancel }) => {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('📁');
  const [color, setColor] = useState('#8b5cf6');

  useEffect(() => {
    if (initialCategory) {
      setName(initialCategory.name);
      setEmoji(initialCategory.emoji);
      setColor(initialCategory.color);
    } else {
      setName('');
      setEmoji('📁');
      setColor('#8b5cf6');
    }
  }, [initialCategory]);

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên danh mục');
      return;
    }
    onSave({ name: name.trim(), emoji, color });
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <View style={styles.header}>
        <Text style={styles.title}>{initialCategory ? 'Sửa danh mục' : 'Thêm danh mục mới'}</Text>
        <Pressable onPress={onCancel} style={{ padding: 4 }}>
          <Ionicons name="close" size={24} color={palette.muted} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Preview */}
        <View style={styles.previewContainer}>
          <View style={[styles.previewChip, { backgroundColor: `${color}20`, borderColor: color }]}>
            <Text style={styles.previewEmoji}>{emoji}</Text>
            <Text style={[styles.previewText, { color }]}>{name || 'Tên danh mục'}</Text>
          </View>
        </View>

        {/* Name Input */}
        <Text style={styles.label}>Tên danh mục</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Ví dụ: Công việc, Gia đình..."
          placeholderTextColor={palette.muted}
          maxLength={20}
        />

        {/* Emoji Picker */}
        <Text style={styles.label}>Biểu tượng (Emoji)</Text>
        <View style={styles.grid}>
          {PRESET_EMOJIS.map(e => (
            <Pressable
              key={e}
              style={[styles.gridItem, emoji === e && styles.gridItemSelected]}
              onPress={() => setEmoji(e)}
            >
              <Text style={{ fontSize: 24 }}>{e}</Text>
            </Pressable>
          ))}
        </View>

        {/* Color Picker */}
        <Text style={styles.label}>Màu sắc</Text>
        <View style={styles.grid}>
          {PRESET_COLORS.map(c => (
            <Pressable
              key={c}
              style={[
                styles.colorItem, 
                { backgroundColor: c },
                color === c && styles.colorItemSelected
              ]}
              onPress={() => setColor(c)}
            >
              {color === c && <Ionicons name="checkmark" size={16} color="#fff" />}
            </Pressable>
          ))}
        </View>

        <Pressable style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveBtnText}>{t.common.save}</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.slate,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: palette.outline,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: palette.ink,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  previewContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  previewChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    gap: 8,
  },
  previewEmoji: {
    fontSize: 18,
  },
  previewText: {
    fontSize: 16,
    fontWeight: '600',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: palette.muted,
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: palette.background,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: palette.ink,
    borderWidth: 1,
    borderColor: palette.outline,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 8,
  },
  gridItem: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: palette.background,
    borderWidth: 1,
    borderColor: palette.outline,
  },
  gridItemSelected: {
    backgroundColor: palette.primaryContainer,
    borderColor: palette.primary,
  },
  colorItem: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorItemSelected: {
    borderWidth: 3,
    borderColor: palette.slate,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  saveBtn: {
    backgroundColor: palette.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 32,
  },
  saveBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
