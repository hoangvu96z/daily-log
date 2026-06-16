import React from 'react';
import { View, Pressable, Image, Alert } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { SlideOutRight, SlideOutLeft, LinearTransition } from 'react-native-reanimated';
import { Text } from './AppText';
import { AnimatedCard } from './AnimatedCard';
import { PhotoGrid } from './PhotoGrid';
import { MediaCarousel } from './MediaCarousel';
import { ImagePlaceholder } from './ImagePlaceholder';
import { VoiceMemoPlayer } from './VoiceMemoPlayer';
import { styles } from '../styles';
import { palette } from '../theme/palette';
import { moodEmoji } from '../data/mockData';

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
import { Entry } from '../types';

export function TimelineCard({
  entry,
  index,
  onPress,
  onSave,
  onDiscard,
  onEdit,
  onDelete,
  onAddToHighlight,
  t,
}: {
  entry: Entry;
  index: number;
  onPress: () => void;
  onSave: () => void;
  onDiscard: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onAddToHighlight?: (entryId: string) => void;
  t: any;
}) {
  const suggested = entry.status === 'suggested';
  const [exitingAnim, setExitingAnim] = React.useState<any>(() => SlideOutRight);

  const handleSave = () => {
    setExitingAnim(() => SlideOutRight);
    requestAnimationFrame(() => {
      onSave();
    });
  };

  const handleDiscard = () => {
    setExitingAnim(() => SlideOutLeft);
    requestAnimationFrame(() => {
      onDiscard();
    });
  };

  return (
    <AnimatedCard 
      variant="fadeInDown" 
      delay={index * 80} 
      style={styles.timelineRow}
      exiting={exitingAnim}
      layout={LinearTransition.springify()}
    >
      <View style={styles.timelineRail}>
        <Text style={styles.timeText}>{entry.time}</Text>
        <View style={styles.railDot} />
        <View style={styles.railLine} />
      </View>
      <Pressable onPress={onPress} style={[styles.entryCard, suggested && styles.suggestedCard, (entry.media && entry.media.length > 0) || entry.imageUri ? { padding: 0, overflow: 'hidden' } : null]}>
        {(entry.media && entry.media.length > 0) ? (
          <View pointerEvents="none">
            <PhotoGrid media={entry.media} onPressImage={() => {}} />
          </View>
        ) : entry.imageUri ? (
          <Image
            source={{ uri: entry.imageUri }}
            style={{ width: '100%', aspectRatio: 16 / 9 }}
            resizeMode="cover"
          />
        ) : null}
        <View style={{ padding: 16 }}>
          <View style={styles.entryTopRow}>
            <Text style={styles.entryTime}>{entry.time}</Text>
            <View style={[styles.moodChip, { backgroundColor: moodBgColors[entry.mood] || 'rgba(158,158,158,0.15)' }]}>
               <MaterialCommunityIcons name={moodEmoji[entry.mood as keyof typeof moodEmoji] || 'help'} size={16} color={moodTextColors[entry.mood] || '#9E9E9E'} style={{ marginRight: 4 }} />
               <Text style={[{ fontSize: 12, fontWeight: '600' }, { color: moodTextColors[entry.mood] || '#9E9E9E' }]}>
                 {t.mood[entry.mood]}
               </Text>
             </View>
            {suggested ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginLeft: 'auto' }}>
                <Ionicons name="sparkles" size={14} color={palette.primary} />
                <Text style={styles.suggestedLabel}>{t.day.suggested}</Text>
              </View>
            ) : (
              <Pressable style={{ marginLeft: 'auto', padding: 4 }} onPress={() => {
                Alert.alert(
                  t.common.optionsTitle,
                  '',
                  [
                    { text: t.common.cancel, style: 'cancel' },
                    { text: t.me?.addToHighlight || 'Thêm vào Nổi bật', onPress: () => onAddToHighlight?.(entry.id) },
                    { text: t.common.edit, onPress: onEdit },
                    { text: t.common.delete, style: 'destructive', onPress: () => {
                      Alert.alert(t.common.deleteConfirmTitle, t.common.deleteConfirmDesc, [
                        { text: t.common.cancel, style: 'cancel' },
                        { text: t.common.delete, style: 'destructive', onPress: onDelete },
                      ]);
                    }},
                  ]
                );
              }}>
                <Ionicons name="ellipsis-horizontal" size={20} color={palette.muted} />
              </Pressable>
            )}
          </View>
          <Text style={styles.entryText}>{entry.text}</Text>
          {!(entry.media && entry.media.length > 0) && !entry.imageUri && entry.imageLocalId && (
            <ImagePlaceholder label={entry.imageLocalId} uri={entry.imageUri} />
          )}
          {entry.voiceMemoUri && (
            <View style={{ marginTop: 12 }}>
              <VoiceMemoPlayer uri={entry.voiceMemoUri} durationMs={entry.voiceMemoDurationMs || 0} compact={true} />
            </View>
          )}
          {suggested && (
            <View style={styles.miniActionRow}>
              <Pressable style={styles.miniPrimary} onPress={handleSave}>
                <Text style={styles.miniPrimaryText}>{t.common.save}</Text>
              </Pressable>
              <Pressable style={styles.miniSecondary} onPress={handleDiscard}>
                <Text style={styles.miniSecondaryText}>{t.common.discard}</Text>
              </Pressable>
            </View>
          )}
        </View>
      </Pressable>
    </AnimatedCard>
  );
}
