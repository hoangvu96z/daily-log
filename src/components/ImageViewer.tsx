import React, { useRef, useState, useEffect } from 'react';
import { Modal, View, FlatList, Image, Dimensions, StyleSheet, Pressable, SafeAreaView, ViewToken } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Video, ResizeMode } from 'expo-av';
import { MediaItem } from '../types';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ImageViewerProps {
  images: MediaItem[];
  visible: boolean;
  imageIndex?: number;
  initialIndex?: number; // fallback support
  onRequestClose: () => void;
}

export default function ImageViewer({ images, visible, imageIndex, initialIndex, onRequestClose }: ImageViewerProps) {
  const [activeIndex, setActiveIndex] = useState(imageIndex ?? initialIndex ?? 0);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (visible) {
      setActiveIndex(imageIndex ?? initialIndex ?? 0);
    }
  }, [visible, imageIndex, initialIndex]);

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems.length > 0 && viewableItems[0].index !== null) {
      setActiveIndex(viewableItems[0].index);
    }
  }).current;

  const viewConfigRef = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onRequestClose}>
      <View style={styles.container}>
        <SafeAreaView style={styles.header}>
          <Pressable style={styles.closeButton} onPress={onRequestClose}>
            <Ionicons name="close" size={28} color="#fff" />
          </Pressable>
        </SafeAreaView>

        <FlatList
          ref={flatListRef}
          data={images}
          keyExtractor={(_, index) => `viewer-${index}`}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          initialScrollIndex={activeIndex}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewConfigRef}
          getItemLayout={(_, index) => ({
            length: SCREEN_WIDTH,
            offset: SCREEN_WIDTH * index,
            index,
          })}
          renderItem={({ item, index }) => (
            <View style={styles.slide}>
              {item.type === 'video' ? (
                <Video
                  source={{ uri: item.uri }}
                  style={styles.media}
                  resizeMode={ResizeMode.CONTAIN}
                  shouldPlay={activeIndex === index}
                  isLooping
                  useNativeControls
                />
              ) : (
                <Image
                  source={{ uri: item.uri }}
                  style={styles.media}
                  resizeMode="contain"
                />
              )}
            </View>
          )}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 16,
  },
  closeButton: {
    padding: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
  },
  slide: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  media: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
});
