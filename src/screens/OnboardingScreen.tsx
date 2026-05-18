import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewToken,
} from 'react-native';
import { useTranslation } from '../i18n/translations';
import { useJournalStore } from '../memory/store';
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

export function OnboardingScreen({ onComplete }: { onComplete: () => void }) {
  const { t, lang } = useTranslation();
  const { updateSettings } = useJournalStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [containerWidth, setContainerWidth] = useState(SCREEN_WIDTH);
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const slides: Slide[] = useMemo(() => [
    {
      id: '1',
      icon: 'journal-outline',
      iconBg: palette.greenSoft,
      title: t.onboarding.slide1Title,
      text: t.onboarding.slide1Text,
      accent: palette.green,
    },
    {
      id: '2',
      icon: 'lock-closed-outline',
      iconBg: palette.mint,
      title: t.onboarding.slide2Title,
      text: t.onboarding.slide2Text,
      accent: palette.green,
    },
    {
      id: '3',
      icon: 'sparkles-outline',
      iconBg: palette.cream,
      title: t.onboarding.slide3Title,
      text: t.onboarding.slide3Text,
      accent: palette.green,
    },
    {
      id: '4',
      icon: 'shield-checkmark-outline',
      iconBg: palette.greenSoft,
      title: t.onboarding.slide4Title,
      text: t.onboarding.slide4Text,
      accent: palette.green,
    },
  ], [t]);

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
      flatListRef.current?.scrollToOffset({ offset: (currentIndex + 1) * containerWidth, animated: true });
    }
  };

  const goSkip = () => {
    onComplete();
  };

  const onScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    {
      useNativeDriver: false,
      listener: (e: any) => {
        const x = e.nativeEvent.contentOffset.x;
        const index = Math.round(x / containerWidth);
        if (index >= 0 && index < slides.length) {
          setCurrentIndex(index);
        }
      }
    }
  );

  const renderSlide = ({ item }: { item: Slide }) => (
    <View style={[s.slide, { width: containerWidth }]}>
      <View style={s.slideContent}>
        <View style={[s.iconCircle, { backgroundColor: item.iconBg }]}>
          <Ionicons name={item.icon} size={48} color={item.accent} />
        </View>
        <Text style={s.slideTitle}>{item.title}</Text>
        <Text style={s.slideText}>{item.text}</Text>
      </View>
    </View>
  );

  const toggleLang = () => {
    updateSettings('language', lang === 'vi' ? 'en' : 'vi');
  };

  return (
    <View
      style={s.container}
      onLayout={(e) => {
        const { width } = e.nativeEvent.layout;
        if (width > 0) {
          setContainerWidth(width);
        }
      }}
    >
      <View style={s.skipRow}>
        <Pressable onPress={toggleLang} style={s.langButton}>
          <Image
            source={{ uri: lang === 'vi' ? 'https://flagcdn.com/w80/vn.png' : 'https://flagcdn.com/w80/gb.png' }}
            style={s.flagImage}
          />
          <Text style={s.langText}>{lang === 'vi' ? 'VI' : 'EN'}</Text>
        </Pressable>
        {!isLastSlide ? (
          <Pressable onPress={goSkip} style={s.skipButton}>
            <Text style={s.skipText}>{t.onboarding.skip}</Text>
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
      />

      <View style={s.footer}>
        <View style={s.dots}>
          {slides.map((_, index) => {
            const inputRange = [
              (index - 1) * containerWidth,
              index * containerWidth,
              (index + 1) * containerWidth,
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
            <Text style={s.nextButtonText}>{t.onboarding.getStarted}</Text>
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
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },
  skipButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  langButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.82)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: palette.outlineVariant,
  },
  flagImage: {
    width: 20,
    height: 14,
    borderRadius: 2,
    marginRight: 6,
  },
  skipText: {
    fontSize: 15,
    color: palette.muted,
    fontWeight: '500',
  },
  langText: {
    fontSize: 14,
    color: palette.ink,
    fontWeight: '600',
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
