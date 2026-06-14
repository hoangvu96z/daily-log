import React, { useState, useEffect } from 'react';
import { View, ScrollView, Pressable, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Text } from '../components/AppText';
import { RootStackParamList } from '../types';
import { palette } from '../theme/palette';
import { useJournalStore } from '../memory/store';
import { runAutoTrackerOnce } from '../skills/autoTracker';

type Props = NativeStackScreenProps<RootStackParamList, 'DevDiagnostics'>;

export function DevDiagnosticsScreen({ navigation }: Props) {
  const settings = useJournalStore(state => state.settings);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    try {
      if (settings.last_auto_scan_stats) {
        setStats(JSON.parse(settings.last_auto_scan_stats));
      }
    } catch (e) {
      console.warn('Failed to parse scan stats', e);
    }
  }, [settings.last_auto_scan_stats]);

  const handleRunTracker = async () => {
    setIsRefreshing(true);
    try {
      const result = await runAutoTrackerOnce();
      if (result) {
        Alert.alert('Tracker Run Complete', `Created ${result.newEntries} new suggestions from ${result.photosScanned} scanned photos.`);
      } else {
        Alert.alert('Tracker Run Skipped', 'Tracker might be disabled or no permissions.');
      }
    } catch (e: any) {
      Alert.alert('Tracker Error', e.message);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: palette.background }} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: palette.outline }}>
        <Pressable onPress={() => navigation.goBack()} style={{ padding: 4, marginRight: 16 }} hitSlop={10}>
          <Ionicons name="arrow-back" size={24} color={palette.ink} />
        </Pressable>
        <Text style={{ fontSize: 18, fontWeight: '700', color: palette.ink }}>
          Dev Diagnostics
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {/* Tracker Status */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: 14, fontWeight: '600', color: palette.muted, marginBottom: 8, textTransform: 'uppercase' }}>
            Auto-Tracker Status
          </Text>
          <View style={{ backgroundColor: palette.card, borderRadius: 12, padding: 16, borderCurve: 'continuous', borderWidth: 1, borderColor: palette.outline }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
              <Text style={{ color: palette.ink }}>Auto Tracking Enabled</Text>
              <Text style={{ fontWeight: '600', color: settings.autoTrackingEnabled ? palette.green : palette.danger }}>
                {settings.autoTrackingEnabled ? 'YES' : 'NO'}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
              <Text style={{ color: palette.ink }}>Last Run (Background)</Text>
              <Text style={{ color: palette.muted, fontSize: 13 }}>
                {settings.bgFetch_lastRun ? new Date(settings.bgFetch_lastRun as string).toLocaleString() : 'Never'}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
              <Text style={{ color: palette.ink }}>Last Scan (Any)</Text>
              <Text style={{ color: palette.muted, fontSize: 13 }}>
                {settings.last_auto_scan_time ? new Date(Number(settings.last_auto_scan_time)).toLocaleString() : 'Never'}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
              <Text style={{ color: palette.ink }}>BG Fetch Success / Fail</Text>
              <Text style={{ color: palette.muted, fontSize: 13 }}>
                {settings.bgFetch_successCount || 0} / {settings.bgFetch_failCount || 0}
              </Text>
            </View>
            {stats && (
              <View style={{ marginTop: 8, paddingTop: 12, borderTopWidth: 1, borderTopColor: palette.outline }}>
                <Text style={{ color: palette.ink, fontWeight: '600', marginBottom: 4 }}>Last Scan Stats:</Text>
                <Text style={{ color: palette.muted, fontSize: 13 }}>
                  Photos Scanned: {stats.photos_scanned}
                </Text>
                <Text style={{ color: palette.muted, fontSize: 13 }}>
                  New Suggestions Created: {stats.new_suggestions}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Actions */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: 14, fontWeight: '600', color: palette.muted, marginBottom: 8, textTransform: 'uppercase' }}>
            Actions
          </Text>
          <Pressable 
            style={{ backgroundColor: palette.primary, borderRadius: 12, padding: 16, alignItems: 'center', opacity: isRefreshing ? 0.7 : 1 }}
            onPress={handleRunTracker}
            disabled={isRefreshing}
          >
            <Text style={{ color: '#fff', fontWeight: '600', fontSize: 16 }}>
              {isRefreshing ? 'Running...' : 'Run Auto-Tracker Now'}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
