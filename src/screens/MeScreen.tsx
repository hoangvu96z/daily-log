import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, Switch, TextInput, View } from 'react-native';
import { Text } from '../components/AppText';
import { useJournalStore } from '../memory/store';
import { useTranslation } from '../i18n/translations';
import { ScreenHeader } from '../components/ScreenHeader';
import { styles } from '../styles';
import { palette } from '../theme/palette';
import { MoodCalendar } from '../components/MoodCalendar';
import { Settings, Entry } from '../types';
import { PaywallModal } from '../components/PaywallModal';
import { HighlightBar } from '../components/HighlightBar';
import { HighlightPickerSheet } from '../components/HighlightPickerSheet';
import { SlideshowScreen } from './SlideshowScreen';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function MeScreen({
  navigation,
  settings,
  onChangeSettings,
  entriesCount,
  entries = [],
  onResetJournal,
}: {
  navigation?: any;
  settings: Settings;
  onChangeSettings: React.Dispatch<React.SetStateAction<Settings>>;
  entriesCount: number;
  entries?: Entry[];
  onResetJournal: () => Promise<void>;
}) {
  const { t, lang, locale } = useTranslation();
  const [paywallVisible, setPaywallVisible] = useState(false);
  const [calendarVisible, setCalendarVisible] = useState(false);
  const [sheetVisible, setSheetVisible] = useState(false);
  const [slideshowVisible, setSlideshowVisible] = useState(false);
  const [slideshowEntries, setSlideshowEntries] = useState<Entry[]>([]);

  const { highlights } = useJournalStore();

  const handlePressHighlight = (id: string) => {
    const highlight = highlights.find(h => h.id === id);
    if (!highlight) return;
    const highlightEntries = highlight.entryIds.map(entryId => entries.find(e => e.id === entryId)).filter(Boolean) as Entry[];
    if (highlightEntries.length === 0) {
      // You could show an alert or just do nothing if the highlight is empty
      return;
    }
    setSlideshowEntries(highlightEntries);
    setSlideshowVisible(true);
  };

  const insets = useSafeAreaInsets();

  return (
    <ScrollView contentContainerStyle={[styles.screenContent, { paddingTop: 28 + insets.top, paddingBottom: 120 + insets.bottom }]}>
      <ScreenHeader 
        title={t.tabs.me} 
        rightIcon="settings-outline" 
        onRightPress={() => navigation?.navigate('Settings')} 
      />
      
      <HighlightBar 
        onPressNew={() => setSheetVisible(true)} 
        onPressHighlight={handlePressHighlight} 
      />

      {!settings.isPremium ? (
        <Pressable
          style={{
            marginHorizontal: 16,
            marginBottom: 16,
            borderRadius: 16,
            padding: 16,
            backgroundColor: palette.primary,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            shadowColor: palette.primary,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.15,
            shadowRadius: 10,
            elevation: 4,
          }}
          onPress={() => setPaywallVisible(true)}
        >
          <View style={{ gap: 4, flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Ionicons name="sparkles" size={16} color={palette.white} />
              <Text style={{ color: palette.white, fontSize: 14, fontWeight: '800' }}>
                Daily Log Premium
              </Text>
            </View>
            <Text style={{ color: palette.white, opacity: 0.85, fontSize: 11.5 }}>
              {t.settings.premiumUpgradeDesc}
            </Text>
          </View>
          <View style={{
            backgroundColor: palette.white,
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderRadius: 12,
          }}>
            <Text style={{ color: palette.primary, fontSize: 12, fontWeight: '800' }}>
              {t.settings.premiumUpgradeBtn}
            </Text>
          </View>
        </Pressable>
      ) : (
        <View
          style={{
            marginHorizontal: 16,
            marginBottom: 16,
            borderRadius: 16,
            padding: 14,
            backgroundColor: palette.primaryContainer,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            borderWidth: 1,
            borderColor: palette.primary,
          }}
        >
          <View style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: palette.white,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
            <Ionicons name="gift" size={20} color={palette.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: palette.ink, fontSize: 13, fontWeight: '800' }}>
              {t.settings.premiumActiveTitle}
            </Text>
            <Text style={{ color: palette.muted, fontSize: 11 }}>
              {t.settings.premiumActiveDesc}
            </Text>
          </View>
        </View>
      )}
      {/* Mood Stats Button */}
      <Pressable
        style={{
          marginHorizontal: 16,
          marginBottom: 16,
          borderRadius: 16,
          padding: 16,
          backgroundColor: palette.primaryContainer,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
        onPress={() => setCalendarVisible(true)}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: palette.primaryContainer, justifyContent: 'center', alignItems: 'center' }}>
            <Ionicons name="calendar-outline" size={20} color={palette.primary} />
          </View>
          <View>
            <Text style={{ fontSize: 15, fontWeight: '700', color: palette.ink }}>{(t.settings as any).moodStats}</Text>
            <Text style={{ fontSize: 13, color: palette.muted, marginTop: 2 }}>{(t.settings as any).moodStatsSubtitle}</Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={20} color={palette.muted} />
      </Pressable>

      <PaywallModal
        visible={paywallVisible}
        onClose={() => setPaywallVisible(false)}
        onSuccess={() => onChangeSettings((current) => ({ ...current, isPremium: true }))}
      />

      <MoodCalendar
        visible={calendarVisible}
        entries={entries}
        onClose={() => setCalendarVisible(false)}
        t={t}
        locale={locale}
        isPremium={settings.isPremium}
        onUpgrade={() => { setCalendarVisible(false); setPaywallVisible(true); }}
      />

      <HighlightPickerSheet 
        visible={sheetVisible}
        entryId={null}
        onClose={() => setSheetVisible(false)}
      />

      <SlideshowScreen
        visible={slideshowVisible}
        entries={slideshowEntries}
        onClose={() => setSlideshowVisible(false)}
      />
    </ScrollView>
  );
}


