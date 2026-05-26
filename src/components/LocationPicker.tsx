import React, { useState, useEffect } from 'react';
import { Modal, View, TextInput, FlatList, Pressable, SafeAreaView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from './AppText';
import { palette } from '../theme/palette';
import { useTranslation } from '../i18n/translations';

export interface LocationResult {
  name: string;
  lat: number;
  lon: number;
}

export function LocationPicker({
  visible,
  onClose,
  onSelect,
  onClear,
  onUseCurrent,
}: {
  visible: boolean;
  onClose: () => void;
  onSelect: (location: LocationResult) => void;
  onClear?: () => void;
  onUseCurrent?: () => void;
}) {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!visible) {
      setQuery('');
      setResults([]);
    }
  }, [visible]);

  useEffect(() => {
    if (query.trim().length < 3) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=5`, {
          headers: {
            'User-Agent': 'DailyLogApp/1.0'
          }
        });
        const data = await response.json();
        setResults(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={{ flex: 1, backgroundColor: palette.paper }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderColor: palette.outline }}>
          <Pressable onPress={onClose} style={{ padding: 8, marginRight: 8 }}>
            <Ionicons name="arrow-back" size={24} color={palette.ink} />
          </Pressable>
          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: 12, paddingHorizontal: 12, height: 44 }}>
            <Ionicons name="search" size={20} color={palette.muted} />
            <TextInput
              style={{ flex: 1, marginLeft: 8, fontSize: 16, color: palette.ink }}
              placeholder={t.composer.searchLocation}
              placeholderTextColor={palette.muted}
              value={query}
              onChangeText={setQuery}
              autoFocus
            />
            {query.length > 0 && (
              <Pressable onPress={() => setQuery('')}>
                <Ionicons name="close-circle" size={20} color={palette.muted} />
              </Pressable>
            )}
          </View>
        </View>

        <View style={{ flex: 1 }}>
          {!query && (
            <View style={{ padding: 16, gap: 16 }}>
              {onUseCurrent && (
                <Pressable style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }} onPress={onUseCurrent}>
                  <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: palette.primaryContainer, alignItems: 'center', justifyContent: 'center' }}>
                    <Ionicons name="locate" size={20} color={palette.primary} />
                  </View>
                  <Text style={{ fontSize: 16, color: palette.primary, fontWeight: '600' }}>{t.composer.useCurrentLocation}</Text>
                </Pressable>
              )}
              {onClear && (
                <Pressable style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }} onPress={onClear}>
                  <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.05)', alignItems: 'center', justifyContent: 'center' }}>
                    <Ionicons name="trash-outline" size={20} color={palette.ink} />
                  </View>
                  <Text style={{ fontSize: 16, color: palette.ink, fontWeight: '600' }}>{t.composer.clearLocation}</Text>
                </Pressable>
              )}
            </View>
          )}

          {loading && (
            <View style={{ padding: 24, alignItems: 'center' }}>
              <ActivityIndicator size="small" color={palette.primary} />
              <Text style={{ marginTop: 8, color: palette.muted }}>{t.composer.searching}</Text>
            </View>
          )}

          {!loading && query.length >= 3 && results.length === 0 && (
            <View style={{ padding: 24, alignItems: 'center' }}>
              <Text style={{ color: palette.muted }}>{t.composer.noResults}</Text>
            </View>
          )}

          {!loading && results.length > 0 && (
            <FlatList
              data={results}
              keyboardShouldPersistTaps="handled"
              keyExtractor={(item) => item.place_id.toString()}
              renderItem={({ item }) => {
                const nameParts = item.display_name.split(', ');
                const mainName = item.name || nameParts[0];
                const subName = nameParts.slice(1).join(', ');
                return (
                  <Pressable
                    style={{ flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderColor: palette.outline }}
                    onPress={() => onSelect({
                      name: mainName,
                      lat: parseFloat(item.lat),
                      lon: parseFloat(item.lon)
                    })}
                  >
                    <Ionicons name="location-outline" size={24} color={palette.muted} style={{ marginRight: 16 }} />
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 16, color: palette.ink, fontWeight: '600', marginBottom: 4 }}>{mainName}</Text>
                      <Text style={{ fontSize: 13, color: palette.muted }} numberOfLines={1}>{subName}</Text>
                    </View>
                  </Pressable>
                );
              }}
            />
          )}
        </View>
      </SafeAreaView>
    </Modal>
  );
}
