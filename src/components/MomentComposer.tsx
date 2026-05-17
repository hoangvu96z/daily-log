import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Modal, Pressable, SafeAreaView, ScrollView, Text, TextInput, View } from 'react-native';
import { moodOptions } from '../data/mockData';
import { createMomentSuggestion } from '../services/aiSuggestion';
import { pickMomentImage } from '../services/imagePicker';
import { styles } from '../styles';
import { palette } from '../theme/palette';
import { ComposerDraft, Entry, Mood } from '../types';
import { ImagePlaceholder } from './ImagePlaceholder';

export function MomentComposer({
  visible,
  draft,
  onClose,
  onSave,
}: {
  visible: boolean;
  draft: ComposerDraft;
  onClose: () => void;
  onSave: (entry: Entry) => void;
}) {
  const [mood, setMood] = useState<Mood>('good');
  const [note, setNote] = useState('');
  const [suggestionVisible, setSuggestionVisible] = useState(true);
  const [pickedImageUri, setPickedImageUri] = useState<string | undefined>();
  const imageUri = pickedImageUri || draft.imageUri;
  const suggestion = createMomentSuggestion({
    mode: draft.mode,
    mood,
    locationName: draft.locationName,
    calendarText: draft.calendarText,
  });

  const addImage = async () => {
    const uri = await pickMomentImage();
    if (uri) {
      setPickedImageUri(uri);
    }
  };

  const save = () => {
    const now = new Date();
    onSave({
      id: Date.now().toString(),
      date: now.toISOString().slice(0, 10),
      time: now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false }),
      mood,
      text: note || suggestion,
      aiSuggestion: suggestion,
      imageLocalId: imageUri ? 'picked-photo' : undefined,
      imageUri,
      locationName: draft.locationName,
      source: 'manual',
      status: 'saved',
      isHighlight: true,
    });
    setNote('');
    setPickedImageUri(undefined);
    setSuggestionVisible(true);
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.composerRoot}>
        <View style={styles.composerHeader}>
          <Pressable style={styles.iconButton} onPress={onClose}>
            <Ionicons name="close" size={22} color={palette.green} />
          </Pressable>
          <Text style={styles.composerTitle}>Khoảnh khắc mới</Text>
          <View style={styles.iconButtonSpacer} />
        </View>
        <ScrollView contentContainerStyle={styles.composerContent}>
          {imageUri ? (
            <Pressable onPress={addImage}>
              <ImagePlaceholder label="ảnh mới" large uri={imageUri} />
            </Pressable>
          ) : (
            <Pressable style={styles.addPhotoBox} onPress={addImage}>
              <Ionicons name="image-outline" size={28} color={palette.green} />
              <Text style={styles.addPhotoText}>Thêm ảnh</Text>
            </Pressable>
          )}
          <Pressable style={styles.metaBox}>
            <Ionicons name="location-outline" size={18} color={palette.green} />
            <Text style={styles.metaText}>
              Bây giờ • {draft.locationName || draft.calendarText || 'Không lưu vị trí'}
            </Text>
          </Pressable>
          <Text style={styles.fieldLabel}>Mood</Text>
          <View style={styles.moodRow}>
            {moodOptions.map((option) => (
              <Pressable
                key={option.value}
                style={[styles.moodOption, mood === option.value && styles.moodOptionSelected]}
                onPress={() => setMood(option.value)}
              >
                <Text style={[styles.moodOptionText, mood === option.value && styles.moodOptionTextSelected]}>
                  {option.label}
                </Text>
              </Pressable>
            ))}
          </View>
          <Text style={styles.fieldLabel}>Ghi chú</Text>
          <TextInput
            style={styles.noteInput}
            multiline
            placeholder="Hôm nay có gì muốn ghi lại? (không bắt buộc)"
            placeholderTextColor="#9aa29c"
            value={note}
            onChangeText={setNote}
          />
          {suggestionVisible && (
            <View style={styles.aiCard}>
              <View style={styles.aiHeader}>
                <Ionicons name="sparkles-outline" size={17} color={palette.green} />
                <Text style={styles.aiTitle}>Gợi ý AI</Text>
              </View>
              <Text style={styles.aiText}>{suggestion}</Text>
              <View style={styles.miniActionRow}>
                <Pressable style={styles.miniPrimary} onPress={() => setNote(suggestion)}>
                  <Text style={styles.miniPrimaryText}>Dùng gợi ý</Text>
                </Pressable>
                <Pressable style={styles.miniSecondary} onPress={() => setSuggestionVisible(false)}>
                  <Text style={styles.miniSecondaryText}>Bỏ qua</Text>
                </Pressable>
              </View>
            </View>
          )}
        </ScrollView>
        <View style={styles.composerFooter}>
          <Pressable style={styles.saveButton} onPress={save}>
            <Text style={styles.saveButtonText}>Lưu lại</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </Modal>
  );
}
