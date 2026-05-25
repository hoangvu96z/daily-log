import React from 'react';
import { View, Pressable, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../AppText';
import { styles } from '../../styles';
import { palette } from '../../theme/palette';

export function SettingsCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.settingsCard}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

export function SettingsRow({
  icon,
  title,
  subtitle,
  danger,
  comingSoon,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  danger?: boolean;
  comingSoon?: boolean;
  onPress?: () => void;
}) {
  return (
    <Pressable style={styles.settingsRow} onPress={onPress}>
      <View style={[styles.settingsIcon, danger && styles.settingsIconDanger]}>
        <Ionicons name={icon} size={20} color={danger ? palette.coral : palette.primary} />
      </View>
      <View style={styles.settingsTextBox}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Text style={[styles.settingsTitle, danger && styles.dangerText]}>{title}</Text>
          {comingSoon && (
            <View style={styles.comingSoonBadge}>
              <Text style={styles.comingSoonText}>Soon</Text>
            </View>
          )}
        </View>
        <Text style={styles.settingsSubtitle}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color="#a7aea9" />
    </Pressable>
  );
}

export function ToggleRow({
  title,
  subtitle,
  value,
  onValueChange,
}: {
  title: string;
  subtitle?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}) {
  return (
    <View style={styles.toggleRow}>
      <View style={{ flex: 1, paddingRight: 10 }}>
        <Text style={styles.settingsTitle}>{title}</Text>
        {subtitle ? <Text style={styles.settingsSubtitle}>{subtitle}</Text> : null}
      </View>
      <Switch value={value} onValueChange={onValueChange} trackColor={{ true: palette.greenSoft, false: '#d7dbd6' }} />
    </View>
  );
}
