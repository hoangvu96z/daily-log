import React, { useState } from 'react';
import { View, Modal, StyleSheet, Pressable, TextInput, KeyboardAvoidingView, Platform, ScrollView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from './AppText';
import { useJournalStore } from '../memory/store';
import { palette } from '../theme/palette';
import { HighlightCollection } from '../types';

interface HighlightPickerSheetProps {
  visible: boolean;
  entryId: string | null;
  onClose: () => void;
}

export function HighlightPickerSheet({ visible, entryId, onClose }: HighlightPickerSheetProps) {
  const { highlights, entries, addHighlight, updateHighlight } = useJournalStore();
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');

  // Reset state when opened/closed
  React.useEffect(() => {
    if (visible) {
      setIsCreating(false);
      setNewTitle('');
    }
  }, [visible]);

  const handleSelectHighlight = async (highlight: HighlightCollection) => {
    if (!entryId) {
      onClose();
      return;
    }
    const newEntries = [...new Set([...highlight.entryIds, entryId])];
    await updateHighlight(highlight.id, { entryIds: newEntries });
    onClose();
  };

  const handleCreateNew = async () => {
    if (!newTitle.trim()) return;

    const newHighlight: HighlightCollection = {
      id: Date.now().toString(),
      title: newTitle.trim(),
      entryIds: entryId ? [entryId] : [],
      coverImageUri: undefined,
      createdAt: new Date().toISOString(),
    };

    await addHighlight(newHighlight);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <KeyboardAvoidingView 
        style={styles.overlay} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Pressable style={styles.backdrop} onPress={onClose} />
        
        <View style={styles.sheet}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>
              {isCreating ? 'Tạo Thư mục Mới' : (entryId ? 'Thêm vào Nổi bật' : 'Thư mục Nổi bật')}
            </Text>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={palette.ink} />
            </Pressable>
          </View>

          {isCreating ? (
            <View style={styles.createContainer}>
              <TextInput
                style={styles.input}
                value={newTitle}
                onChangeText={setNewTitle}
                placeholder="Nhập tên thư mục (vd: Đi Đà Lạt...)"
                placeholderTextColor={palette.muted}
                autoFocus
              />
              <Pressable 
                style={[styles.saveButton, !newTitle.trim() && { opacity: 0.5 }]} 
                onPress={handleCreateNew}
                disabled={!newTitle.trim()}
              >
                <Text style={styles.saveButtonText}>Tạo & Lưu</Text>
              </Pressable>
            </View>
          ) : (
            <ScrollView style={styles.listContainer}>
              <Pressable style={styles.createRow} onPress={() => setIsCreating(true)}>
                <View style={[styles.circle, { backgroundColor: palette.primaryContainer }]}>
                  <Ionicons name="add" size={24} color={palette.primary} />
                </View>
                <Text style={styles.createText}>Tạo thư mục mới...</Text>
              </Pressable>

              {highlights.map(h => {
                const isSelected = entryId && h.entryIds.includes(entryId);
                let displayCover = h.coverImageUri;
                if (!displayCover && h.entryIds.length > 0) {
                  const firstEntryWithImg = h.entryIds
                    .map(id => entries.find(e => e.id === id))
                    .find(e => e?.media?.[0]?.uri || e?.imageUri);
                  if (firstEntryWithImg) {
                    displayCover = firstEntryWithImg.media?.[0]?.uri || firstEntryWithImg.imageUri;
                  }
                }

                return (
                  <Pressable 
                    key={h.id} 
                    style={styles.row} 
                    onPress={() => handleSelectHighlight(h)}
                  >
                    <View style={styles.circle}>
                      {displayCover ? (
                        <Image source={{ uri: displayCover }} style={styles.image} />
                      ) : (
                        <Ionicons name="images-outline" size={20} color={palette.ink} />
                      )}
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.rowTitle}>{h.title}</Text>
                      <Text style={styles.rowSubtitle}>{h.entryIds.length} bài viết</Text>
                    </View>
                    {isSelected && (
                      <Ionicons name="checkmark-circle" size={24} color={palette.primary} />
                    )}
                  </Pressable>
                );
              })}
            </ScrollView>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  sheet: {
    backgroundColor: palette.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    minHeight: 300,
    maxHeight: '80%',
    paddingBottom: 40,
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
  closeButton: {
    padding: 4,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: palette.outline,
  },
  createRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: palette.outline,
  },
  circle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: palette.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 22,
  },
  createText: {
    fontSize: 16,
    fontWeight: '600',
    color: palette.primary,
  },
  rowTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: palette.ink,
  },
  rowSubtitle: {
    fontSize: 13,
    color: palette.muted,
    marginTop: 2,
  },
  createContainer: {
    padding: 20,
  },
  input: {
    backgroundColor: palette.background,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: palette.ink,
    borderWidth: 1,
    borderColor: palette.outline,
    marginBottom: 20,
  },
  saveButton: {
    backgroundColor: palette.primary,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    color: palette.white,
    fontSize: 16,
    fontWeight: '700',
  },
});
