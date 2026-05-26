import React, { useState, useMemo } from 'react';
import { View, TextInput, FlatList, Pressable, SafeAreaView, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Text } from '../components/AppText';
import { TimelineCard } from '../components/TimelineCard';
import { useJournalStore } from '../memory/store';
import { useTranslation } from '../i18n/translations';
import { styles } from '../styles';
import { palette } from '../theme/palette';
import { RootStackParamList, Mood } from '../types';
import { moodEmoji } from '../data/mockData';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Search'>;

const ALL_MOODS: Mood[] = ['great', 'good', 'neutral', 'bad', 'very_bad'];

export function SearchScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { t } = useTranslation();
  const { entries, deleteEntry } = useJournalStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);

  const filteredEntries = useMemo(() => {
    return entries.filter(entry => {
      if (entry.status !== 'saved') return false;
      
      let matchesText = true;
      if (searchQuery.trim().length > 0) {
        const query = searchQuery.toLowerCase();
        const textContent = entry.text ? entry.text.toLowerCase() : '';
        const locationContent = entry.locationName ? entry.locationName.toLowerCase() : '';
        matchesText = textContent.includes(query) || locationContent.includes(query);
      }
      
      let matchesMood = true;
      if (selectedMood) {
        matchesMood = entry.mood === selectedMood;
      }
      
      return matchesText && matchesMood;
    });
  }, [entries, searchQuery, selectedMood]);

  return (
    <SafeAreaView style={styles.root}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={localStyles.header}>
          <Pressable style={localStyles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={palette.ink} />
          </Pressable>
          <View style={localStyles.searchContainer}>
            <Ionicons name="search" size={20} color={palette.muted} style={{ marginLeft: 12 }} />
            <TextInput
              style={localStyles.searchInput}
              placeholder="Tìm kiếm nhật ký, địa điểm..."
              placeholderTextColor={palette.muted}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
            />
            {searchQuery.length > 0 && (
              <Pressable onPress={() => setSearchQuery('')} style={{ padding: 8 }}>
                <Ionicons name="close-circle" size={18} color={palette.muted} />
              </Pressable>
            )}
          </View>
        </View>

        <View style={localStyles.filterContainer}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={ALL_MOODS}
            keyExtractor={item => item}
            contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}
            renderItem={({ item }) => {
              const isSelected = selectedMood === item;
              return (
                <Pressable
                  style={[localStyles.filterChip, isSelected && localStyles.filterChipSelected]}
                  onPress={() => setSelectedMood(isSelected ? null : item)}
                >
                  <Text style={{ fontSize: 16 }}>{moodEmoji[item]}</Text>
                  <Text style={[localStyles.filterText, isSelected && localStyles.filterTextSelected]}>
                    {t.mood[item]}
                  </Text>
                </Pressable>
              );
            }}
          />
        </View>

        <FlatList
          data={filteredEntries}
          keyExtractor={item => item.id}
          contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
          renderItem={({ item, index }) => (
            <TimelineCard
              entry={item}
              index={index}
              t={t}
              onPress={() => navigation.navigate('Detail', { entryId: item.id })}
              onEdit={() => navigation.navigate('Detail', { entryId: item.id })}
              onDelete={() => deleteEntry(item.id)}
              onSave={() => {}}
              onDiscard={() => {}}
            />
          )}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', marginTop: 100 }}>
              <Ionicons name="search-outline" size={48} color={palette.outline} />
              <Text style={{ color: palette.muted, marginTop: 16, fontWeight: '600' }}>
                Không tìm thấy nhật ký nào
              </Text>
            </View>
          }
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const localStyles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
    marginLeft: -8,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.03)',
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 16,
    height: 44,
  },
  searchInput: {
    flex: 1,
    paddingHorizontal: 10,
    fontSize: 15,
    fontFamily: 'PlusJakartaSans_500Medium',
    color: palette.ink,
  },
  filterContainer: {
    paddingBottom: 12,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.04)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  filterChipSelected: {
    backgroundColor: palette.primaryContainer,
    borderColor: palette.primary,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '600',
    color: palette.muted,
  },
  filterTextSelected: {
    color: palette.primary,
    fontWeight: '800',
  },
});
