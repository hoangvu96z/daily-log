import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState, useEffect } from 'react';
import { Modal, Pressable, SafeAreaView, ScrollView, TextInput, View, ActivityIndicator, Platform } from 'react-native';
import { Text } from '../components/AppText';
import { moodOptions } from '../data/mockData';
import { useTranslation } from '../i18n/translations';
import { pickMomentMedia } from '../services/imagePicker';
import { styles } from '../styles';
import { palette } from '../theme/palette';
import { ComposerDraft, Entry, Mood, MediaItem } from '../types';
import { ImagePlaceholder } from './ImagePlaceholder';
import { Image } from 'react-native';
import { aiService, AISuggestionInput } from '../skills/aiService';
import { getLocalDateString } from '../utils/dateUtils';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { LocationPicker, LocationResult } from './LocationPicker';
import { requestLocationAccess } from '../skills/permissions';
import { VoiceMemoRecorder } from './VoiceMemoRecorder';
import { deleteVoiceMemo } from '../skills/voiceMemo';
import { CategoryPicker } from './CategoryPicker';

const moodIconColors: Record<Mood, string> = {
  very_bad: '#E53935', // Red
  bad: '#FB8C00',      // Orange
  neutral: '#43A047',  // Green
  good: '#1E88E5',     // Blue
  great: palette.primary,    // Accent Color
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
  const [pickedMedia, setPickedMedia] = useState<MediaItem[]>(initialEntry?.media || (initialEntry?.imageUri ? [{ uri: initialEntry.imageUri, type: 'image' }] : []));
  const activeMedia = pickedMedia.length > 0 ? pickedMedia : (draft?.media || (draft?.imageUri ? [{ uri: draft.imageUri, type: 'image' }] : []));
  
  const [customDate, setCustomDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [customLocation, setCustomLocation] = useState<LocationResult | null>(null);

  const [suggestion, setSuggestion] = useState('');
  const [suggestionStatus, setSuggestionStatus] = useState<'loading' | 'success' | 'error'>('loading');

  const [voiceMemoUri, setVoiceMemoUri] = useState<string | null>(initialEntry?.voiceMemoUri || draft?.voiceMemoUri || null);
  const [voiceMemoDuration, setVoiceMemoDuration] = useState<number>(0); // Duration is not saved in DB currently, but passed down
  const [categoryId, setCategoryId] = useState<string | null>(initialEntry?.categoryId || draft?.categoryId || null);

  useEffect(() => {
    if (visible) {
      setMood(initialEntry?.mood || 'good');
      setNote(initialEntry?.text || '');
      setPickedMedia(initialEntry?.media || (initialEntry?.imageUri ? [{ uri: initialEntry.imageUri, type: 'image' }] : []));
      setVoiceMemoUri(initialEntry?.voiceMemoUri || draft?.voiceMemoUri || null);
      setSuggestionVisible(mode === 'create');
      setCategoryId(initialEntry?.categoryId || draft?.categoryId || null);
      
      if (initialEntry) {
        const [yyyy, mm, dd] = initialEntry.date.split('-');
        const [hh, min] = initialEntry.time.split(':');
        const entryDate = new Date(Number(yyyy), Number(mm) - 1, Number(dd), Number(hh), Number(min));
        setCustomDate(entryDate);
      } else {
        setCustomDate(new Date());
      }
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
        photoLabels: activeMedia.length > 0 ? ['photo'] : undefined,
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
  }, [visible, draft, mood, activeMedia.length, mode]);

  const addMedia = async () => {
    // Only allow max 10
    if (activeMedia.length >= 10) return;
    const newItems = await pickMomentMedia();
    if (newItems && newItems.length > 0) {
      setPickedMedia([...activeMedia, ...newItems.map(asset => ({
        uri: asset.uri,
        type: asset.type,
        width: asset.width,
        height: asset.height,
        duration: asset.duration ?? undefined
      }))].slice(0, 10));
    }
  };

  const removeMedia = (index: number) => {
    const nextMedia = [...activeMedia];
    nextMedia.splice(index, 1);
    setPickedMedia(nextMedia);
  };

  const save = () => {
    const now = new Date();
    if (mode === 'edit' && initialEntry) {
      onSave({
        ...initialEntry,
        mood,
        text: note,
        media: activeMedia.length > 0 ? activeMedia : undefined,
        voiceMemoUri: voiceMemoUri || undefined,
        voiceMemoDurationMs: voiceMemoDuration || undefined,
        categoryId: categoryId || undefined,
        imageUri: undefined,
        imageLocalId: undefined,
      });
    } else {
      onSave({
        id: Date.now().toString(),
        date: getLocalDateString(customDate),
        time: customDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false }),
        mood,
        text: note || suggestion,
        aiSuggestion: suggestion,
        media: activeMedia.length > 0 ? activeMedia : undefined,
        voiceMemoUri: voiceMemoUri || undefined,
        voiceMemoDurationMs: voiceMemoDuration || undefined,
        categoryId: categoryId || undefined,
        locationName: customLocation !== null ? (customLocation.name || undefined) : draft?.locationName,
        locationLat: customLocation !== null ? (customLocation.lat || undefined) : draft?.locationLat,
        locationLon: customLocation !== null ? (customLocation.lon || undefined) : draft?.locationLon,
        source: 'manual',
        status: 'saved',
        isHighlight: true,
      });
    }
    setNote('');
    setPickedMedia([]);
    setVoiceMemoUri(null);
    setCategoryId(null);
    setSuggestionVisible(true);
  };

  const handleClose = () => {
    // If a voice memo was recorded but not saved, delete it to prevent orphaned files
    if (voiceMemoUri && voiceMemoUri !== initialEntry?.voiceMemoUri && voiceMemoUri !== draft?.voiceMemoUri) {
      deleteVoiceMemo(voiceMemoUri);
    }
    onClose();
  };

  const displayLocation = customLocation !== null 
    ? (customLocation.name || t.composer.noLocation)
    : (draft?.locationName || draft?.calendarText || t.composer.noLocation);

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={handleClose}>
      <SafeAreaView style={styles.composerRoot}>
        <View style={styles.composerHeader}>
          <Pressable style={styles.iconButton} onPress={handleClose}>
            <Ionicons name="close" size={22} color={palette.green} />
          </Pressable>
          <Text style={styles.composerTitle}>
            {mode === 'edit' ? (t.common.edit || 'Chỉnh sửa') : t.composer.title}
          </Text>
          <View style={styles.iconButtonSpacer} />
        </View>
        <ScrollView contentContainerStyle={styles.composerContent}>
          <View style={{ marginBottom: 24 }}>
            <Text style={[styles.fieldLabel, { marginTop: 0 }]}>{t.composer.voiceMemoLabel || 'Ghi âm cảm xúc'}</Text>
            <VoiceMemoRecorder 
              entryId={initialEntry?.id || Date.now().toString()} 
              existingUri={voiceMemoUri || undefined}
              autoStart={mode === 'create' && draft?.mode === 'voice'}
              onRecorded={(uri, durationMs) => {
                setVoiceMemoUri(uri);
                setVoiceMemoDuration(durationMs);
              }}
              onDeleted={() => {
                if (voiceMemoUri) deleteVoiceMemo(voiceMemoUri);
                setVoiceMemoUri(null);
                setVoiceMemoDuration(0);
              }}
            />
          </View>
          {activeMedia.length > 0 ? (
            <View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingVertical: 10 }}>
                {activeMedia.map((item, index) => (
                  <View key={index} style={{ width: 200, height: 150, borderRadius: 12, overflow: 'hidden', position: 'relative' }}>
                    <Image source={{ uri: item.uri }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                    {item.type === 'video' && (
                      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.2)' }}>
                        <Ionicons name="play-circle" size={36} color={palette.white} />
                      </View>
                    )}
                    <Pressable style={{ position: 'absolute', top: 8, right: 8, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 12, width: 24, height: 24, justifyContent: 'center', alignItems: 'center' }} onPress={() => removeMedia(index)}>
                      <Ionicons name="close" size={16} color={palette.white} />
                    </Pressable>
                  </View>
                ))}
                {activeMedia.length < 10 && (
                  <Pressable style={[styles.addPhotoBox, { width: 150, height: 150, margin: 0 }]} onPress={addMedia}>
                    <Ionicons name="add" size={28} color={palette.green} />
                    <Text style={[styles.addPhotoText, { marginTop: 4 }]}>Thêm ({activeMedia.length}/10)</Text>
                  </Pressable>
                )}
              </ScrollView>
            </View>
          ) : (
            <Pressable style={styles.addPhotoBox} onPress={addMedia}>
              <Ionicons name="images-outline" size={28} color={palette.green} />
              <Text style={styles.addPhotoText}>{t.composer.addPhoto}</Text>
            </Pressable>
          )}
          {mode === 'create' && draft && (
            <View style={{ gap: 8, marginBottom: 12 }}>
              {/* Date/Time Button */}
              <Pressable 
                style={[styles.metaBox, { marginBottom: 0, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]} 
                onPress={() => setShowDatePicker(true)}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Ionicons name="calendar-outline" size={18} color={palette.green} />
                  <Text style={styles.metaText}>
                    {customDate.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })} {customDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false })}
                  </Text>
                </View>
                <Text style={{ fontSize: 13, color: palette.primary, fontWeight: '700' }}>{t.composer.changeDateTime}</Text>
              </Pressable>

              {/* Location Display */}
              <Pressable 
                style={[styles.metaBox, { marginBottom: 0, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}
                onPress={() => setShowLocationPicker(true)}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1, paddingRight: 8 }}>
                  <Ionicons name="location-outline" size={18} color={palette.green} />
                  <Text style={[styles.metaText, { flex: 1 }]} numberOfLines={1}>
                    {displayLocation}
                  </Text>
                </View>
                <Text style={{ fontSize: 13, color: palette.primary, fontWeight: '700' }}>{t.composer.changeLocation}</Text>
              </Pressable>
            </View>
          )}
          <CategoryPicker selectedId={categoryId} onSelect={setCategoryId} />
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
                onPress={() => setMood(option.value as Mood)}
              >
                <MaterialCommunityIcons 
                  name={option.emoji} 
                  size={28} 
                  color={moodIconColors[option.value as Mood]} 
                  style={{ opacity: mood === option.value ? 1 : 0.4 }}
                />
                <Text style={[
                  styles.moodOptionText, 
                  mood === option.value && [styles.moodOptionTextSelected, { color: moodIconColors[option.value as Mood] }]
                ]}>
                  {t.mood[option.value as Mood]}
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

        <DateTimePickerModal
          isVisible={showDatePicker}
          mode="datetime"
          date={customDate}
          onConfirm={(date) => {
            setShowDatePicker(false);
            setCustomDate(date);
          }}
          onCancel={() => setShowDatePicker(false)}
          confirmTextIOS={t.common.confirm}
          cancelTextIOS={t.common.cancel}
        />

        <LocationPicker
          visible={showLocationPicker}
          onClose={() => setShowLocationPicker(false)}
          onSelect={(loc) => {
            setCustomLocation(loc);
            setShowLocationPicker(false);
          }}
          onClear={() => {
            setCustomLocation({ name: '', lat: 0, lon: 0 });
            setShowLocationPicker(false);
          }}
          onUseCurrent={async () => {
            setShowLocationPicker(false);
            const result = await requestLocationAccess();
            if (result.status === 'granted') {
              setCustomLocation({
                name: result.locationName || '',
                lat: result.locationLat || 0,
                lon: result.locationLon || 0
              });
            }
          }}
        />
      </SafeAreaView>
    </Modal>
  );
}
