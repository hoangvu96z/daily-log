import React from 'react';
import { View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../components/AppText';
import { styles } from '../styles';
import { palette } from '../theme/palette';

export function ScreenHeader({ title, subtitle, rightIcon, onRightPress }: { title: string; subtitle?: string; rightIcon?: keyof typeof Ionicons.glyphMap; onRightPress?: () => void }) {
  return (
    <View style={[styles.header, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }]}>
      <View style={{ flex: 1 }}>
        <Text style={styles.screenTitle}>{title}</Text>
        {subtitle ? <Text style={styles.screenSubtitle}>{subtitle}</Text> : null}
      </View>
      {rightIcon && onRightPress && (
        <Pressable aria-label={rightIcon} onPress={onRightPress} style={{ padding: 8, backgroundColor: palette.primaryContainer, borderRadius: 20 }}>
          <Ionicons name={rightIcon} size={24} color={palette.ink} />
        </Pressable>
      )}
    </View>
  );
}
