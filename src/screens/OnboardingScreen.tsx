import { Ionicons } from '@expo/vector-icons';
import React, { useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewToken,
} from 'react-native';
import { palette } from '../theme/palette';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type Slide = {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconBg: string;
  title: string;
  text: string;
  accent: string;
};

const slides: Slide[] = [
  {
    id: '1',
    icon: 'journal-outline',
    iconBg: palette.greenSoft,
    title: 'Nhật ký tự động\ncho riêng bạn',
    text: 'App lặng lẽ ghi lại những khoảnh khắc mỗi ngày,\nkhông cần bạn phải ngồi viết.',
    accent: palette.green,
  },
  {
    id: '2',
    icon: 'lock-closed-outline',
    iconBg: palette.mint,
    title: 'Riêng tư\ntuyệt đối',
    text: 'Không mạng xã hội, không người lạ.\nNhật ký chỉ nằm trên máy bạn.',
    accent: palette.green,
  },
  {
    id: '3',
    icon: 'sparkles-outline',
    iconBg: palette.cream,
    title: 'AI gợi ý,\nbạn quyết định',
    text: 'App dùng AI để tạo gợi ý nhật ký từ ảnh và vị trí.\nBạn chỉ cần chạm xác nhận hoặc bỏ qua.',
    accent: palette.green,
  },
  {
    id: '4',
    icon: 'shield-checkmark-outline',
    iconBg: palette.greenSoft,
    title: 'Quyền truy cập',
    text: 'Cho phép app đọc ảnh, vị trí để tự tạo nhật ký.\nBạn có thể bật từng quyền sau trong Cài đặt.',
    accent: palette.green,
  },
];

export function OnboardingScreen({ onComplete }: { onComplete: () => void }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const isLastSlide = currentIndex === slides.length - 1;

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index != null) {
        setCurrentIndex(viewableItems[0].index);
      }
    },
  ).current;

  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const goNext = () => {
    if (isLastSlide) {
      onComplete();
    } else {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
    }
  };

  const goSkip = () => {
    onComplete();
  };

  const onScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    { useNativeDriver: false },
  );

  const renderSlide = ({ item }: { item: Slide }) => (
    <View style={[s.slide, { width: SCREEN_WIDTH }]}>
      <View style={s.slideContent}>
        <View style={[s.iconCircle, { backgroundColor: item.iconBg }]}>
          <Ionicons name={item.icon} size={48} color={item.accent} />
        </View>
        <Text style={s.slideTitle}>{item.title}</Text>
        <Text style={s.slideText}>{item.text}</Text>
      </View>
    </View>
  );

  return (
    <View style={s.container}>
      <View style={s.skipRow}>
        {!isLastSlide ? (
          <Pressable onPress={goSkip} style={s.skipButton}>
            <Text style={s.skipText}>Bỏ qua</Text>
          </Pressable>
        ) : (
          <View />
        )}
      </View>

      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderSlide}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
      />

      <View style={s.footer}>
        <View style={s.dots}>
          {slides.map((_, index) => {
            const inputRange = [
              (index - 1) * SCREEN_WIDTH,
              index * SCREEN_WIDTH,
              (index + 1) * SCREEN_WIDTH,
            ];
            const dotWidth = scrollX.interpolate({
              inputRange,
              outputRange: [8, 24, 8],
              extrapolate: 'clamp',
            });
            const dotOpacity = scrollX.interpolate({
              inputRange,
              outputRange: [0.3, 1, 0.3],
              extrapolate: 'clamp',
            });
            return (
              <Animated.View
                key={index}
                style={[s.dot, { width: dotWidth, opacity: dotOpacity }]}
              />
            );
          })}
        </View>

        <Pressable style={s.nextButton} onPress={goNext}>
          {isLastSlide ? (
            <Text style={s.nextButtonText}>Bắt đầu</Text>
          ) : (
            <Ionicons name="arrow-forward" size={24} color={palette.white} />
          )}
        </Pressable>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.paper,
  },
  skipRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },
  skipButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  skipText: {
    fontSize: 15,
    color: palette.muted,
    fontWeight: '500',
  },
  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  slideContent: {
    alignItems: 'center',
    maxWidth: 400,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 36,
  },
  slideTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: palette.ink,
    textAlign: 'center',
    lineHeight: 36,
    marginBottom: 18,
    letterSpacing: -0.5,
  },
  slideText: {
    fontSize: 16,
    color: palette.muted,
    textAlign: 'center',
    lineHeight: 24,
    letterSpacing: 0.1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingBottom: 40,
    paddingTop: 20,
  },
  dots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    backgroundColor: palette.green,
  },
  nextButton: {
    backgroundColor: palette.green,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: palette.green,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  nextButtonText: {
    color: palette.white,
    fontSize: 15,
    fontWeight: '700',
  },
});
