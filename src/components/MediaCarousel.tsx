import React, { useRef, useState } from 'react';
import { View, FlatList, Image, Dimensions, StyleSheet, Pressable, ViewToken } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MediaItem } from '../types';
import { palette } from '../theme/palette';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
// Padding of TimelineCard is 16 on each side, minus any margins
const CAROUSEL_WIDTH = SCREEN_WIDTH - 32;

interface MediaCarouselProps {
  media: MediaItem[];
  onPressImage?: (index: number) => void;
}

export function MediaCarousel({ media, onPressImage }: MediaCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems.length > 0 && viewableItems[0].index !== null) {
      setActiveIndex(viewableItems[0].index);
    }
  }).current;

  const viewConfigRef = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  if (!media || media.length === 0) return null;

  return (
    <View style={styles.container}>
      <FlatList
        data={media}
        keyExtractor={(_, index) => `media-${index}`}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewConfigRef}
        renderItem={({ item, index }) => (
          <Pressable 
            style={styles.slide}
            onPress={() => onPressImage?.(index)}
          >
            <Image 
              source={{ uri: item.thumbnailUri || item.uri }} 
              style={styles.media} 
              resizeMode="cover" 
            />
            {item.type === 'video' && (
              <View style={styles.playOverlay}>
                <Ionicons name="play-circle" size={48} color="rgba(255,255,255,0.8)" />
              </View>
            )}
          </Pressable>
        )}
      />
      
      {media.length > 1 && (
        <View style={styles.paginationContainer}>
          {media.map((_, i) => (
            <View 
              key={`dot-${i}`} 
              style={[
                styles.dot, 
                i === activeIndex && styles.activeDot
              ]} 
            />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    aspectRatio: 4 / 3, // Default cinematic ratio for inline cards
    position: 'relative',
  },
  slide: {
    width: CAROUSEL_WIDTH,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  media: {
    width: '100%',
    height: '100%',
  },
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  paginationContainer: {
    position: 'absolute',
    bottom: 12,
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: palette.white,
  }
});
