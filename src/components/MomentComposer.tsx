import { Ionicons } from '@expo/vector-icons';
import React, { useState, useEffect } from 'react';
import { Modal, Pressable, SafeAreaView, ScrollView, TextInput, View, ActivityIndicator } from 'react-native';
import { Text } from '../components/AppText';
import { moodOptions } from '../data/mockData';
import { useTranslation } from '../i18n/translations';
import { pickMomentImage } from '../services/imagePicker';
import { styles } from '../styles';
import { palette } from '../theme/palette';
import { ComposerDraft, Entry, Mood } from '../types';
import { ImagePlaceholder } from './ImagePlaceholder';
import { aiService, AISuggestionInput } from '../skills/aiService';

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
  const { t, lang } = useTranslation();
  const [mood, setMood] = useState<Mood>('good');
  const [note, setNote] = useState('');
  const [suggestionVisible, setSuggestionVisible] = useState(true);
  const [pickedImageUri, setPickedImageUri] = useState<string | undefined>();
  const imageUri = pickedImageUri || draft.imageUri;

  const [suggestion, setSuggestion] = useState('');
  const [loadingSuggestion, setLoadingSuggestion] = useState(false);

  useEffect(() => {
    if (!visible) return;

    let active = true;

    async function fetchSuggestion() {
      setLoadingSuggestion(true);

      // Determine period
      let period: string | undefined = undefined;
      const hourStr = draft.prefillTime || new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false });
      const hour = parseInt(hourStr.split(':')[0], 10);
      if (!isNaN(hour)) {
        if (hour >= 5 && hour < 12) period = 'sáng';
        else if (hour >= 12 && hour < 18) period = 'chiều';
        else period = 'tối';
      }

      // Day of week
      const dayLabels = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
      const dayOfWeek = dayLabels[new Date().getDay()];

      const input: AISuggestionInput = {
        mode: draft.mode,
        mood,
        time: draft.prefillTime || new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false }),
        dayOfWeek,
        period,
        locationName: draft.locationName,
        calendarText: draft.calendarText,
        photoLabels: imageUri ? ['photo'] : undefined,
      };

      try {
        const text = await aiService.generateSuggestion(input);
        if (active) {
          setSuggestion(text);
          setLoadingSuggestion(false);
        }
      } catch (err) {
        if (active) {
          setLoadingSuggestion(false);
        }
      }
    }

    fetchSuggestion();

    return () => {
      active = false;
    };
  }, [visible, draft, mood, imageUri]);

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
      date: draft.prefillDate || now.toISOString().slice(0, 10),
      time: draft.prefillTime || now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false }),
      mood,
      text: note || suggestion,
      aiSuggestion: suggestion,
      imageLocalId: imageUri ? 'picked-photo' : undefined,
      imageUri,
      locationName: draft.locationName,
      locationLat: draft.locationLat,
      locationLon: draft.locationLon,
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
          <Text style={styles.composerTitle}>{t.composer.title}</Text>
          <View style={styles.iconButtonSpacer} />
        </View>
        <ScrollView contentContainerStyle={styles.composerContent}>
          {imageUri ? (
            <Pressable onPress={addImage}>
              <ImagePlaceholder label={t.composer.addPhoto} large uri={imageUri} />
            </Pressable>
          ) : (
            <Pressable style={styles.addPhotoBox} onPress={addImage}>
              <Ionicons name="image-outline" size={28} color={palette.green} />
              <Text style={styles.addPhotoText}>{t.composer.addPhoto}</Text>
            </Pressable>
          )}
          <Pressable style={styles.metaBox}>
            <Ionicons name="location-outline" size={18} color={palette.green} />
            <Text style={styles.metaText}>
              {t.composer.now} • {draft.locationName || draft.calendarText || t.composer.noLocation}
            </Text>
          </Pressable>
          <Text style={styles.fieldLabel}>{t.composer.moodLabel}</Text>
          <View style={styles.moodRow}>
            {moodOptions.map((option) => (
              <Pressable
                key={option.value}
                style={[styles.moodOption, mood === option.value && styles.moodOptionSelected]}
                onPress={() => setMood(option.value)}
              >
                <Text style={styles.moodEmoji}>{option.emoji}</Text>
                <Text style={[styles.moodOptionText, mood === option.value && styles.moodOptionTextSelected]}>
                  {t.mood[option.value]}
                </Text>
              </Pressable>
            ))}
          </View>
          <Text style={styles.fieldLabel}>{t.composer.noteLabel}</Text>
          <TextInput
            style={styles.noteInput}
            multiline
            placeholder={t.composer.notePlaceholder}
            placeholderTextColor="#9aa29c"
            value={note}
            onChangeText={setNote}
          />
          {suggestionVisible && (
            <View style={styles.aiCard}>
              <View style={styles.aiHeader}>
                <Ionicons name="sparkles-outline" size={17} color={palette.green} />
                <Text style={styles.aiTitle}>{t.composer.aiSuggestionTitle}</Text>
              </View>
              {loadingSuggestion ? (
                <View style={{ paddingVertical: 12, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 }}>
                  <ActivityIndicator size="small" color={palette.green} />
                  <Text style={{ color: palette.muted, fontSize: 13 }}>
                    {lang === 'en' ? 'Generating suggestion...' : 'Đang tạo gợi ý...'}
                  </Text>
                </View>
              ) : (
                <>
                  <Text style={styles.aiText}>{suggestion}</Text>
                  <View style={styles.miniActionRow}>
                    <Pressable style={styles.miniPrimary} onPress={() => setNote(suggestion)}>
                      <Text style={styles.miniPrimaryText}>{t.composer.useSuggestion}</Text>
                    </Pressable>
                    <Pressable style={styles.miniSecondary} onPress={() => setSuggestionVisible(false)}>
                      <Text style={styles.miniSecondaryText}>{t.composer.ignoreSuggestion}</Text>
                    </Pressable>
                  </View>
                </>
              )}
            </View>
          )}
        </ScrollView>
        <View style={styles.composerFooter}>
          <Pressable style={styles.saveButton} onPress={save}>
            <Text style={styles.saveButtonText}>{t.composer.saveButton}</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </Modal>
  );
}
