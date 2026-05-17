import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { tabItems } from '../data/mockData';
import { styles } from '../styles';
import { palette } from '../theme/palette';
import { TabKey } from '../types';

export function BottomTabs({ activeTab, onChangeTab }: { activeTab: TabKey; onChangeTab: (tab: TabKey) => void }) {
  return (
    <View style={styles.tabBar}>
      {tabItems.map((item, index) => (
        <Pressable
          key={item.key}
          style={[styles.tabItem, index === 1 && styles.tabItemBeforeFab, index === 2 && styles.tabItemAfterFab]}
          onPress={() => onChangeTab(item.key)}
        >
          {activeTab === item.key && <View style={styles.activeDot} />}
          <Ionicons name={item.icon} size={21} color={activeTab === item.key ? palette.green : '#9fa7a1'} />
          <Text style={[styles.tabLabel, activeTab === item.key && styles.tabLabelActive]}>{item.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}
