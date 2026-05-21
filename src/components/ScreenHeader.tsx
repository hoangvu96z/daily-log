import React from 'react';
import { View } from 'react-native';
import { Text } from '../components/AppText';
import { styles } from '../styles';

export function ScreenHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <View style={styles.header}>
      <Text style={styles.screenTitle}>{title}</Text>
      <Text style={styles.screenSubtitle}>{subtitle}</Text>
    </View>
  );
}
