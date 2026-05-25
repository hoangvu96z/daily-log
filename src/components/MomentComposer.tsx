import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState, useEffect } from 'react';
import { Modal, Pressable, SafeAreaView, ScrollView, TextInput, View, ActivityIndicator, Platform } from 'react-native';
import { Text } from '../components/AppText';
import { moodOptions } from '../data/mockData';
import { useTranslation } from '../i18n/translations';
import { pickMomentImage } from '../services/imagePicker';
import { styles } from '../styles';
import { palette } from '../theme/palette';
import { ComposerDraft, Entry, Mood } from '../types';
import { ImagePlaceholder } from './ImagePlaceholder';
import { aiService, AISuggestionInput } from '../skills/aiService';
import { getLocalDateString } from '../utils/dateUtils';

const moodIconColors: Record<Mood, string> = {
  very_bad: '#E53935', // Red
  bad: '#FB8C00',      // Orange
  neutral: '#43A047',  // Green
  good: '#1E88E5',     // Blue
  great: '#8E24AA',    // Purple
};

export function MomentComposer({
  visible,
  draft,
  mode = 'create',
  initialEntry,
  onClose,
  onSave,
}: {
  visible: boolean;
  draft?: ComposerDraft;
  mode?: 'create' | 'edit';
  initialEntry?: Entry;
  onClose: () => void;
  onSave: (entry: Entry) => void;
}) {
  const { t, lang } = useTranslation();
  const [mood, setMood] = useState<Mood>(initialEntry?.mood || 'good');
  const [note, setNote] = useState(initialEntry?.text || '');
  const [suggestionVisible, setSuggestionVisible] = useState(mode === 'create');
  const [pickedImageUri, setPickedImageUri] = useState<string | undefined>(initialEntry?.imageUri);
  const imageUri = pickedImageUri || draft?.imageUri || initialEntry?.imageUri;

  const [suggestion, setSuggestion] = useState('');
  const [suggestionStatus, setSuggestionStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    if (visible) {
      setMood(initialEntry?.mood || 'good');
      setNote(initialEntry?.text || '');
      setPickedImageUri(initialEntry?.imageUri);
      setSuggestionVisible(mode === 'create');
    }
  }, [visible, initialEntry, mode]);

  useEffect(() => {
    if (!visible || mode === 'edit' || !draft) return;

    let active = true;

    async function fetchSuggestion() {
      setSuggestionStatus('loading');

      // Determine period
      let period: string | undefined = undefined;
      const hourStr = draft!.prefillTime || new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false });
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
        mode: draft!.mode,
        mood,
        time: draft!.prefillTime || new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false }),
        dayOfWeek,
        period,
        locationName: draft!.locationName,
        calendarText: draft!.calendarText,
        photoLabels: imageUri ? ['photo'] : undefined,
        lang,
      };

      try {
        const result = await aiService.generateSuggestionWithStatus(input);
        if (active) {
          setSuggestion(result.text);
          setSuggestionStatus(result.isError ? 'error' : 'success');
        }
      } catch (err) {
        if (active) {
          setSuggestion(t.ai.fallbackText);
          setSuggestionStatus('error');
        }
      }
    }

    fetchSuggestion();

    return () => {
      active = false;
    };
  }, [visible, draft, mood, imageUri, mode]);

  const addImage = async () => {
    const uri = await pickMomentImage();
    if (uri) {
      setPickedImageUri(uri);
    }
  };

  const save = () => {
    const now = new Date();
    if (mode === 'edit' && initialEntry) {
      onSave({
        ...initialEntry,
        mood,
        text: note,
        imageUri,
        imageLocalId: pickedImageUri ? 'picked-photo' : initialEntry.imageLocalId,
      });
    } else {
      onSave({
        id: Date.now().toString(),
        date: draft?.prefillDate || getLocalDateString(now),
        time: draft?.prefillTime || now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false }),
        mood,
        text: note || suggestion,
        aiSuggestion: suggestion,
        imageLocalId: imageUri ? 'picked-photo' : undefined,
        imageUri,
        locationName: draft?.locationName,
        locationLat: draft?.locationLat,
        locationLon: draft?.locationLon,
        source: 'manual',
        status: 'saved',
        isHighlight: true,
      });
    }
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
          <Text style={styles.composerTitle}>
            {mode === 'edit' ? (t.common.edit || 'Chỉnh sửa') : t.composer.title}
          </Text>
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
          {mode === 'create' && draft && (
            <Pressable style={styles.metaBox}>
              <Ionicons name="location-outline" size={18} color={palette.green} />
              <Text style={styles.metaText}>
                {t.composer.now} • {draft.locationName || draft.calendarText || t.composer.noLocation}
              </Text>
            </Pressable>
          )}
          <Text style={styles.fieldLabel}>{t.composer.moodLabel}</Text>
          <View style={styles.moodRow}>
            {moodOptions.map((option) => (
              <Pressable
                key={option.value}
                style={[
                  styles.moodOption,
                  mood === option.value && [
                    styles.moodOptionSelected,
                    { borderColor: moodIconColors[option.value], backgroundColor: moodIconColors[option.value] + '15' } // 15 = ~8% opacity
                  ]
                ]}
                onPress={() => setMood(option.value)}
              >
                <MaterialCommunityIcons 
                  name={option.emoji} 
                  size={28} 
                  color={moodIconColors[option.value]} 
                  style={{ opacity: mood === option.value ? 1 : 0.4 }}
                />
                <Text style={[
                  styles.moodOptionText, 
                  mood === option.value && [styles.moodOptionTextSelected, { color: moodIconColors[option.value] }]
                ]}>
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
            <View style={[styles.aiCard, suggestionStatus === 'error' && { backgroundColor: '#ffecec' }]}>
              <View style={styles.aiHeader}>
                <Ionicons 
                  name={suggestionStatus === 'error' ? 'alert-circle-outline' : 'sparkles-outline'} 
                  size={17} 
                  color={suggestionStatus === 'error' ? '#cc0000' : palette.green} 
                />
                <Text style={[styles.aiTitle, suggestionStatus === 'error' && { color: '#cc0000' }]}>
                  {suggestionStatus === 'error' ? t.composer.aiSuggestionErrorTitle : t.composer.aiSuggestionTitle}
                </Text>
              </View>
              {suggestionStatus === 'loading' ? (
                <View style={{ paddingVertical: 12, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 }}>
                  <ActivityIndicator size="small" color={palette.green} />
                  <Text style={{ color: palette.muted, fontSize: 13 }}>
                    {t.composer.generatingSuggestion}
                  </Text>
                </View>
              ) : (
                <>
                  <Text style={styles.aiText}>{suggestion}</Text>
                  <View style={styles.miniActionRow}>
                    <Pressable style={[styles.miniPrimary, suggestionStatus === 'error' && { backgroundColor: '#ffcccc' }]} onPress={() => setNote(suggestion)}>
                      <Text style={[styles.miniPrimaryText, suggestionStatus === 'error' && { color: '#cc0000' }]}>
                        {suggestionStatus === 'error' ? t.composer.useFallback : t.composer.useSuggestion}
                      </Text>
                    </Pressable>
                    <Pressable style={[styles.miniSecondary, suggestionStatus === 'error' && { backgroundColor: '#ffffff', borderColor: '#ffcccc' }]} onPress={() => setSuggestionVisible(false)}>
                      <Text style={[styles.miniSecondaryText, suggestionStatus === 'error' && { color: '#cc0000' }]}>
                        {t.composer.ignoreSuggestion}
                      </Text>
                    </Pressable>
                  </View>
                </>
              )}
            </View>
          )}
        </ScrollView>
        <View style={styles.composerFooter}>
          <Pressable style={styles.saveButton} onPress={save}>
            <Text style={styles.saveButtonText}>
              {mode === 'edit' ? t.common.save : t.composer.saveButton}
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </Modal>
  );
}
