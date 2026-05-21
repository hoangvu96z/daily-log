import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, View } from 'react-native';
import { Text } from '../components/AppText';
import { palette } from '../theme/palette';
import { styles } from '../styles';

export function ImagePlaceholder({ label, large, uri }: { label: string; large?: boolean; uri?: string }) {
  if (uri) {
    return <Image source={{ uri }} style={[styles.imagePlaceholder, large && styles.imagePlaceholderLarge]} resizeMode="cover" />;
  }

  return (
    <View style={[styles.imagePlaceholder, large && styles.imagePlaceholderLarge]}>
      <Ionicons name="image-outline" size={large ? 34 : 22} color={palette.white} />
      <Text style={styles.imagePlaceholderText}>{label}</Text>
    </View>
  );
}
