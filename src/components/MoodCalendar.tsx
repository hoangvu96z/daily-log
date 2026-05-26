import React, { useState, useEffect } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View, Appearance } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useJournalStore } from '../memory/store';
import Animated, { useAnimatedStyle, withRepeat, withTiming, withSequence, Easing, useSharedValue } from 'react-native-reanimated';
import { Text } from './AppText';
import { styles } from '../styles';
import { palette } from '../theme/palette';
import { moodEmoji } from '../data/mockData';
import { getLocalDateString } from '../utils/dateUtils';
import { mostFrequent } from '../utils/arrayUtils';
import { Entry } from '../types';

export function MoodCalendar({
  visible,
  entries,
  onClose,
  onSelectDate,
  t,
  locale,
  isPremium,
  onUpgrade,
}: {
  visible: boolean;
  entries: Entry[];
  onClose: () => void;
  onSelectDate?: (date: string) => void;
  t: any;
  locale: string;
  isPremium?: boolean;
  onUpgrade?: () => void;
}) {
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(getLocalDateString());
  const [mode, setMode] = useState<'7day' | 'month'>('7day');
  const [viewDate, setViewDate] = useState<Date>(new Date());

  useEffect(() => {
    if (visible) {
      setSelectedDateKey(getLocalDateString());
      setViewDate(new Date());
      setMode(isPremium ? 'month' : '7day');
    }
  }, [visible, isPremium]);

  const { settings } = useJournalStore();
  const systemTheme = Appearance.getColorScheme();
  const isDark = (settings?.theme === 'system' ? systemTheme : settings?.theme) === 'dark';
  const glassBg = isDark ? 'rgba(30,30,30,0.75)' : 'rgba(255,255,255,0.75)';
  const dimBg = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';

  const moodColors: Record<string, string> = {
    very_bad: '#E53935',
    bad:      '#FB8C00',
    neutral:  '#43A047',
    good:     '#1E88E5',
    great:    '#8E24AA',
  };

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const startDay = firstDay === 0 ? 6 : firstDay - 1;

  const blankDays = Array.from({ length: startDay }, (_, i) => null);

  const monthDays = Array.from({ length: daysInMonth }, (_, i) => {
    const date = new Date(year, month, i + 1);
    const dateKey = getLocalDateString(date);
    const dayEntries = entries.filter(e => e.date === dateKey && e.status === 'saved');
    const dominantMood = dayEntries.length > 0 ? mostFrequent(dayEntries.map(e => e.mood)) : null;
    return {
      dateKey,
      dayNum: i + 1,
      count: dayEntries.length,
      mood: dominantMood,
      isToday: dateKey === getLocalDateString(),
      isCurrentMonth: true,
    };
  });

  const allGridItems = [...blankDays, ...monthDays];
  const weekRows = [];
  for (let i = 0; i < allGridItems.length; i += 7) {
    weekRows.push(allGridItems.slice(i, i + 7));
  }

  const days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (7 - 1 - i));
    const dateKey = getLocalDateString(date);
    const dayEntries = entries.filter(e => e.date === dateKey && e.status === 'saved');
    const dominantMood = dayEntries.length > 0 ? mostFrequent(dayEntries.map(e => e.mood)) : null;
    return {
      dateKey,
      dayLabel: new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(date),
      dayNum: date.getDate(),
      count: dayEntries.length,
      mood: dominantMood,
      isToday: dateKey === getLocalDateString(),
      isCurrentMonth: date.getMonth() === new Date().getMonth(),
    };
  });

  const recent7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dayEntries = entries.filter(e => e.date === getLocalDateString(d) && e.status === 'saved');
    return {
      mood: dayEntries.length > 0 ? mostFrequent(dayEntries.map(e => e.mood)) : null,
      count: dayEntries.length,
    };
  });

  let streak = 0;
  for (let i = recent7.length - 1; i >= 0; i--) {
    if (recent7[i].count > 0) streak++;
    else break;
  }

  const goodDays    = recent7.filter(d => d.mood === 'good' || d.mood === 'great').length;
  const badDays     = recent7.filter(d => d.mood === 'bad' || d.mood === 'very_bad').length;
  const neutralDays = recent7.filter(d => d.mood === 'neutral').length;
  const emptyDays   = recent7.filter(d => !d.mood).length;
  const homeT = t.home as any;

  const now = new Date();
  const isCurrentMonthView = viewDate.getMonth() === now.getMonth() && viewDate.getFullYear() === now.getFullYear();

  const handlePrevMonth = () => {
    if (!isPremium) {
      onUpgrade?.();
      return;
    }
    setViewDate(new Date(year, month - 1, 1));
  };
  const handleNextMonth = () => {
    setViewDate(new Date(year, month + 1, 1));
  };
  const monthName = new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(viewDate);

  const isVi = locale.startsWith('vi');

  // Pulse animation for today
  const scale = useSharedValue(1);
  useEffect(() => {
    if (visible) {
      scale.value = withRepeat(
        withSequence(
          withTiming(1.1, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
    } else {
      scale.value = 1;
    }
  }, [visible]);

  const animatedPulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        
        <View style={{ borderTopLeftRadius: 36, borderTopRightRadius: 36, overflow: 'hidden', maxHeight: '90%' }}>
          <BlurView intensity={100} tint={isDark ? "dark" : "light"} style={StyleSheet.absoluteFill} />
          
          <View style={{ backgroundColor: glassBg, padding: 24, paddingBottom: 50 }}>
            
            {/* Header */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text style={{ fontSize: 24, fontWeight: '800', color: palette.ink }}>{t.home.moodCalendarTitle}</Text>
              </View>
              <Pressable onPress={onClose} style={{ padding: 6, backgroundColor: dimBg, borderRadius: 20 }}>
                <Ionicons name="close" size={20} color={palette.ink} />
              </Pressable>
            </View>

            {/* Stats Bar (Recent 7 Days) */}
            <View style={{ marginBottom: 24 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', marginBottom: 8, gap: 8 }}>
                {streak >= 3 && (
                  <View style={{ backgroundColor: 'rgba(255, 140, 0, 0.1)', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <Text style={{ fontSize: 14 }}>🔥</Text>
                    <Text style={{ color: '#E65100', fontSize: 12, fontWeight: '800' }}>{homeT.streakMessage ? homeT.streakMessage(streak) : `${streak} Ngày`}</Text>
                  </View>
                )}
                <Text style={{ fontSize: 13, color: palette.muted, fontWeight: '600' }}>
                  {goodDays > 0 ? `${goodDays} Tuyệt vời • ` : ''}{badDays > 0 ? `${badDays} Tệ • ` : ''}{neutralDays > 0 ? `${neutralDays} Bình thường` : ''}
                </Text>
              </View>
              
              <View style={{ height: 8, borderRadius: 4, flexDirection: 'row', overflow: 'hidden', backgroundColor: dimBg }}>
                {recent7.length > 0 && (
                  <>
                    <View style={{ flex: goodDays, backgroundColor: moodColors.great }} />
                    <View style={{ flex: neutralDays, backgroundColor: moodColors.neutral }} />
                    <View style={{ flex: badDays, backgroundColor: moodColors.bad }} />
                    <View style={{ flex: emptyDays, backgroundColor: 'transparent' }} />
                  </>
                )}
              </View>
            </View>

            {/* Mode Toggle */}
            <View style={{ flexDirection: 'row', backgroundColor: dimBg, borderRadius: 16, padding: 4, marginBottom: 24, alignSelf: 'center' }}>
              {(['7day', 'month'] as const).map((m) => {
                const label  = m === '7day' ? (homeT.daysLabel ? homeT.daysLabel(7) : '7 ngày') : (isVi ? 'Toàn tháng' : 'Full Month');
                const isActive = mode === m;
                const locked   = m === 'month' && !isPremium;
                return (
                  <Pressable
                    key={m}
                    style={{
                      paddingHorizontal: 24, paddingVertical: 10,
                      borderRadius: 14,
                      backgroundColor: isActive ? palette.primary : 'transparent',
                      flexDirection: 'row', alignItems: 'center', gap: 6,
                      shadowColor: isActive ? '#000' : 'transparent',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: isActive ? 0.2 : 0,
                      shadowRadius: 4,
                    }}
                    onPress={() => {
                      if (locked) { onUpgrade?.(); return; }
                      setMode(m);
                    }}
                  >
                    {locked && <Ionicons name="lock-closed" size={12} color={isActive ? '#ffffff' : palette.ink} />}
                    <Text style={{ color: isActive ? '#ffffff' : palette.ink, fontSize: 13, fontWeight: '700' }}>{label}</Text>
                  </Pressable>
                );
              })}
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 400 }}>
              {mode === '7day' ? (
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16, justifyContent: 'center' }}>
                  {days.map((day) => {
                    const isSelected = selectedDateKey === day.dateKey;
                    const color = day.mood ? moodColors[day.mood] : palette.muted;
                    
                    return (
                      <Pressable
                        key={day.dateKey}
                        style={[{ alignItems: 'center', width: '20%' }, !day.isCurrentMonth && { opacity: 0.35 }]}
                        onPress={() => setSelectedDateKey(day.dateKey)}
                      >
                        <Text style={{ fontSize: 12, color: day.isToday ? palette.primary : palette.muted, marginBottom: 12, fontWeight: day.isToday ? '800' : '600' }}>
                          {day.dayLabel}
                        </Text>
                        
                        <View style={{ position: 'relative', width: 56, height: 56, justifyContent: 'center', alignItems: 'center' }}>
                          {day.isToday && (
                            <Animated.View style={[{ position: 'absolute', width: 72, height: 72, borderRadius: 36, backgroundColor: color, opacity: 0.15 }, animatedPulseStyle]} />
                          )}
                          <View style={[{
                            width: 56, height: 56, borderRadius: 28,
                            backgroundColor: day.mood ? `${color}1A` : dimBg,
                            borderWidth: day.mood ? 2 : 1,
                            borderColor: day.mood ? color : dimBg,
                            alignItems: 'center', justifyContent: 'center',
                          }, isSelected && { borderWidth: 3, borderColor: palette.primary }]}>
                            {day.mood ? (
                              <MaterialCommunityIcons name={moodEmoji[day.mood as keyof typeof moodEmoji].replace('-outline', '')} size={28} color={color} />
                            ) : (
                              <Text style={{ fontSize: 14, color: palette.muted, fontWeight: '500' }}>{day.dayNum}</Text>
                            )}
                          </View>
                        </View>
                      </Pressable>
                    );
                  })}
                </View>
              ) : (
                <View style={{ gap: 8 }}>
                  {/* Month Navigation Header */}
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <Pressable onPress={handlePrevMonth} style={{ padding: 8 }}>
                      <Ionicons name="chevron-back" size={20} color={(!isPremium && isCurrentMonthView) ? palette.muted : palette.ink} />
                    </Pressable>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Text style={{ fontSize: 16, fontWeight: '700', color: palette.ink, textTransform: 'uppercase' }}>
                        {monthName}
                      </Text>
                      {!isPremium && <View style={{ backgroundColor: palette.primary, borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2 }}><Text style={{ color: palette.white, fontSize: 9, fontWeight: '800' }}>PRO</Text></View>}
                    </View>
                    <Pressable onPress={handleNextMonth} style={{ padding: 8 }}>
                      <Ionicons name="chevron-forward" size={20} color={palette.ink} />
                    </Pressable>
                  </View>

                  {/* Grid Header */}
                  <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
                    {(isVi ? ['T2','T3','T4','T5','T6','T7','CN'] : ['M','T','W','T','F','S','S']).map((d, i) => (
                      <View key={i} style={{ flex: 1, alignItems: 'center' }}>
                        <Text style={{ fontSize: 11, color: palette.muted, fontWeight: '700' }}>{d}</Text>
                      </View>
                    ))}
                  </View>

                  {/* Calendar Grid */}
                  <View style={{ gap: 8 }}>
                    {weekRows.map((week, wIdx) => (
                      <View key={wIdx} style={{ flexDirection: 'row', gap: 8 }}>
                    {week.map((day, dIdx) => {
                      if (!day) {
                        return <View key={`blank-${dIdx}`} style={{ flex: 1, aspectRatio: 1 }} />;
                      }

                      const isSelected = selectedDateKey === day.dateKey;
                      const count = day.count;
                      const baseHex = day.mood ? moodColors[day.mood] : null;
                      
                      const intensity = count === 0 ? 0 : count === 1 ? 0.4 : count === 2 ? 0.7 : 1;
                      const alpha = Math.round(intensity * 255).toString(16).padStart(2, '0');
                      const bgColor = baseHex ? `${baseHex}${alpha}` : dimBg;
                      
                      return (
                        <Pressable
                          key={day.dateKey}
                          style={[{
                            flex: 1, aspectRatio: 1, borderRadius: 12,
                            backgroundColor: bgColor,
                            alignItems: 'center', justifyContent: 'center',
                            borderWidth: isSelected ? 2.5 : day.isToday ? 2 : 0,
                            borderColor: isSelected ? palette.ink : day.isToday ? palette.primary : 'transparent',
                          }]}
                          onPress={() => setSelectedDateKey(day.dateKey)}
                        >
                          <Text style={{ fontSize: 12, fontWeight: isSelected || day.isToday ? '800' : '600', color: count > 0 ? (day.mood ? palette.white : palette.ink) : palette.muted }}>
                            {day.dayNum}
                          </Text>
                          {count > 1 && (
                            <View style={{ position: 'absolute', top: 4, right: 4, width: 6, height: 6, borderRadius: 3, backgroundColor: palette.white }} />
                          )}
                        </Pressable>
                      );
                    })}
                    {week.length < 7 && Array.from({ length: 7 - week.length }).map((_, i) => (
                      <View key={`pad-${i}`} style={{ flex: 1, aspectRatio: 1 }} />
                    ))}
                  </View>
                ))}
              </View>
            </View>
          )}
        </ScrollView>
            
            <View style={{ marginTop: 24, flexDirection: 'row' }}>
              <Pressable
                style={styles.primaryButton}
                onPress={() => {
                  onClose();
                  if (selectedDateKey) {
                    onSelectDate?.(selectedDateKey);
                  }
                }}
              >
                <Text style={[styles.primaryButtonText, { color: '#ffffff' }]}>{t.home.viewFullDay}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}
