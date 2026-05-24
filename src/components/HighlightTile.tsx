import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import { Text } from '../components/AppText';
import { moodEmoji } from '../data/mockData';
import { palette } from '../theme/palette';
import { Entry } from '../types';

interface HighlightTileProps {
  entry: Entry;
  onPress: () => void;
}

export function HighlightTile({ entry, onPress }: HighlightTileProps) {
  const hasImage = !!entry.imageUri;

  const fallbackBgColors: Record<string, string> = {
    very_bad: '#E53935',
    bad: '#FB8C00',
    neutral: '#43A047',
    good: '#1E88E5',
    great: '#8E24AA',
  };

  return (
    <Pressable style={styles.tile} onPress={onPress}>
      {hasImage ? (
        <Image source={{ uri: entry.imageUri }} style={styles.bgImage} resizeMode="cover" />
      ) : (
        <View style={[styles.fallbackBg, { backgroundColor: fallbackBgColors[entry.mood] || '#1E88E5' }]} />
      )}
      
      {/* Overlay Scrim for Text Legibility */}
      <View style={[styles.scrim, !hasImage && { backgroundColor: 'rgba(0, 0, 0, 0.2)' }]} />

      {/* Content Container */}
      <View style={styles.content}>
        <View style={styles.timeTag}>
          <Text style={styles.timeText}>{entry.time}</Text>
        </View>

        <Text style={styles.text} numberOfLines={2}>
          {entry.text}
        </Text>

        <View style={styles.footerRow}>
          <MaterialCommunityIcons name={moodEmoji[entry.mood]} size={18} color="rgba(255,255,255,0.85)" />
          {entry.locationName && (
            <Text style={styles.locationText} numberOfLines={1}>
              • {entry.locationName}
            </Text>
          )}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    height: 140,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#031f41',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  bgImage: {
    ...StyleSheet.absoluteFillObject,
  },
  fallbackBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#eaf5ff',
  },
  scrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  fallbackScrim: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  content: {
    ...StyleSheet.absoluteFillObject,
    padding: 12,
    justifyContent: 'space-between',
  },
  timeTag: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  timeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '800',
  },
  text: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
    marginTop: 'auto',
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  moodBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  moodEmoji: {
    fontSize: 14,
  },
  locationText: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 10,
    fontWeight: '600',
    flex: 1,
  },
});
