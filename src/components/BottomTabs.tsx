import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
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
            <Pressable
              key={route.key}
              style={[styles.tabItem, index === 1 && styles.tabItemBeforeFab, index === 2 && styles.tabItemAfterFab]}
              onPress={onPress}
            >
              {isFocused && <View style={styles.activeDot} />}
              <Ionicons name={item.icon} size={21} color={isFocused ? palette.green : '#9fa7a1'} />
              <Text style={[styles.tabLabel, isFocused && styles.tabLabelActive]}>{tabLabel}</Text>
            </Pressable>
          );
        })}
      </View>
      
      <Pressable style={styles.fab} onPress={onAddPress}>
        <Ionicons name="add" size={30} color={palette.paper} />
      </Pressable>
    </>
  );
}
