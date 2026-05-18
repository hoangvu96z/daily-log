import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Pressable, Text, View } from 'react-native';
import { useTranslation } from '../i18n/translations';
import { tabItems } from '../data/mockData';
import { styles } from '../styles';
import { palette } from '../theme/palette';

export function BottomTabs({ state, descriptors, navigation, onAddPress }: BottomTabBarProps & { onAddPress?: () => void }) {
  const { t } = useTranslation();
  return (
    <>
      <View style={styles.tabBar}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;
          
          // match route name to tabItems
          const item = tabItems.find(i => i.key === route.name) || tabItems[0];
          const tabLabel = t.tabs[route.name as keyof typeof t.tabs] || item.label;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <AnimatedTabItem
              key={route.key}
              item={item}
              isFocused={isFocused}
              onPress={onPress}
              tabLabel={tabLabel}
              isBeforeFab={index === 1}
              isAfterFab={index === 2}
            />
          );
        })}
      </View>
      
      <Pressable style={styles.fab} onPress={onAddPress}>
        <Ionicons name="add" size={30} color={palette.paper} />
      </Pressable>
    </>
  );
}

function AnimatedTabItem({
  item,
  isFocused,
  onPress,
  tabLabel,
  isBeforeFab,
  isAfterFab,
}: {
  item: any;
  isFocused: boolean;
  onPress: () => void;
  tabLabel: string;
  isBeforeFab: boolean;
  isAfterFab: boolean;
}) {
  const scale = useRef(new Animated.Value(isFocused ? 1 : 0.9)).current;
  const opacity = useRef(new Animated.Value(isFocused ? 1 : 0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: isFocused ? 1 : 0.9,
        useNativeDriver: true,
        friction: 6,
        tension: 40,
      }),
      Animated.timing(opacity, {
        toValue: isFocused ? 1 : 0,
        duration: 250,
        useNativeDriver: true,
        easing: Easing.out(Easing.ease),
      }),
    ]).start();
  }, [isFocused]);

  return (
    <Pressable
      style={[
        styles.tabItem,
        isBeforeFab && styles.tabItemBeforeFab,
        isAfterFab && styles.tabItemAfterFab,
        { position: 'relative' }
      ]}
      onPress={onPress}
    >
      <Animated.View
        style={{
          position: 'absolute',
          top: '4%',
          left: '6%',
          width: '88%',
          height: '92%',
          borderRadius: 20,
          backgroundColor: palette.greenSoft,
          opacity: opacity,
        }}
      />
      <Animated.View style={{ alignItems: 'center', transform: [{ scale }], marginTop: 6 }}>
        <Ionicons name={item.icon} size={21} color={isFocused ? palette.green : '#9fa7a1'} />
      </Animated.View>
      <Text
        style={[
          styles.tabLabel,
          isFocused && styles.tabLabelActive,
          isFocused && { fontWeight: '800' },
          { marginTop: 4 }
        ]}
      >
        {tabLabel}
      </Text>
    </Pressable>
  );
}

