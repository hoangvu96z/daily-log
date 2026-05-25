import React from 'react';
import { View, Pressable, Image, StyleSheet } from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { Text } from './AppText';
import { MediaItem } from '../types';

interface PhotoGridProps {
  media: MediaItem[];
  onPressImage: (index: number) => void;
}

export function PhotoGrid({ media, onPressImage }: PhotoGridProps) {
  if (!media || media.length === 0) return null;

  const renderItem = (item: MediaItem, index: number, style?: any) => {
    const isLastVisible = index === 3;
    const extraCount = media.length - 4;

    return (
      <Pressable key={index} style={[styles.itemContainer, style]} onPress={() => onPressImage(index)}>
        {item.type === 'video' ? (
          <View style={styles.videoContainer}>
            <Video source={{ uri: item.uri }} style={styles.media} resizeMode={ResizeMode.COVER} />
            <View style={styles.playIcon}>
              <Ionicons name="play-circle" size={32} color="rgba(255,255,255,0.8)" />
            </View>
          </View>
        ) : (
          <Image source={{ uri: item.uri }} style={styles.media} resizeMode="cover" />
        )}
        {media.length > 4 && isLastVisible && (
          <View style={styles.overlay}>
            <Text style={styles.overlayText}>+{extraCount}</Text>
          </View>
        )}
      </Pressable>
    );
  };

  if (media.length === 1) {
    return <View style={styles.container}>{renderItem(media[0], 0, { aspectRatio: 4 / 3 })}</View>;
  }

  if (media.length === 2) {
    return (
      <View style={[styles.container, styles.row]}>
        {renderItem(media[0], 0, { flex: 1, aspectRatio: 3 / 4 })}
        {renderItem(media[1], 1, { flex: 1, aspectRatio: 3 / 4 })}
      </View>
    );
  }

  if (media.length === 3) {
    return (
      <View style={styles.container}>
        {renderItem(media[0], 0, { width: '100%', aspectRatio: 16 / 9 })}
        <View style={styles.row}>
          {renderItem(media[1], 1, { flex: 1, aspectRatio: 1 })}
          {renderItem(media[2], 2, { flex: 1, aspectRatio: 1 })}
        </View>
      </View>
    );
  }

  // 4 or more
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {renderItem(media[0], 0, { flex: 1, aspectRatio: 1 })}
        {renderItem(media[1], 1, { flex: 1, aspectRatio: 1 })}
      </View>
      <View style={styles.row}>
        {renderItem(media[2], 2, { flex: 1, aspectRatio: 1 })}
        {renderItem(media[3], 3, { flex: 1, aspectRatio: 1 })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 4,
    borderRadius: 16,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    gap: 4,
  },
  itemContainer: {
    position: 'relative',
    backgroundColor: '#f5f5f5',
  },
  media: {
    width: '100%',
    height: '100%',
  },
  videoContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playIcon: {
    position: 'absolute',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '700',
  },
});
