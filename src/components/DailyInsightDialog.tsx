import React, { useMemo } from 'react';
import { ActivityIndicator, Modal, Pressable, View } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Text } from './AppText';
import { styles } from '../styles';
import { palette } from '../theme/palette';
import { Entry, Mood } from '../types';
import { getLocalDateString } from '../utils/dateUtils';
import { calculateStreak } from '../utils/streak';
import { moodEmoji } from '../data/mockData';

// ─── Types ────────────────────────────────────────────────────────────────────

interface InsightItem {
  icon: string;         // MaterialCommunityIcons name
  label: string;
  value: string;
  accent?: string;      // optional accent colour
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const moodScore: Record<Mood, number> = {
  very_bad: 1, bad: 2, neutral: 3, good: 4, great: 5,
};

const moodColor: Record<Mood, string> = {
  very_bad: '#E53935',
  bad: '#FB8C00',
  neutral: '#43A047',
  good: '#1E88E5',
  great: palette.primary,
};

function dominantMood(entries: Entry[]): Mood | null {
  if (entries.length === 0) return null;
  const freq: Record<string, number> = {};
  for (const e of entries) freq[e.mood] = (freq[e.mood] || 0) + 1;
  return Object.entries(freq).sort((a, b) => b[1] - a[1])[0][0] as Mood;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function DailyInsightDialog({
  visible,
  entries,
  onClose,
  t,
}: {
  visible: boolean;
  entries: Entry[];
  onClose: () => void;
  t: any;
}) {
  const lang: 'vi' | 'en' = t.tabs?.day === 'Ngày' ? 'vi' : 'en';
  const isVi = lang === 'vi';

  // ── Compute insights from last 7 days of saved entries ──────────────────
  const insights = useMemo<InsightItem[]>(() => {
    const last7: string[] = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return getLocalDateString(d);
    });

    const recentSaved = entries.filter(
      e => e.status === 'saved' && last7.includes(e.date)
    );

    if (recentSaved.length === 0) return [];

    const items: InsightItem[] = [];

    // 1. Dominant mood of the week
    const topMood = dominantMood(recentSaved);
    if (topMood) {
      const moodLabel: Record<Mood, string> = {
        very_bad: isVi ? 'Không tốt' : 'Rough',
        bad:      isVi ? 'Bình thường' : 'So-so',
        neutral:  isVi ? 'Ổn định'    : 'Steady',
        good:     isVi ? 'Khá tốt'    : 'Good',
        great:    isVi ? 'Tuyệt vời'  : 'Great',
      };
      items.push({
        icon: moodEmoji[topMood],
        label: isVi ? 'Cảm xúc chủ đạo tuần này' : 'Dominant mood this week',
        value: moodLabel[topMood],
        accent: moodColor[topMood],
      });
    }

    // 2. Days logged
    const loggedDays = new Set(recentSaved.map(e => e.date)).size;
    items.push({
      icon: 'calendar-check',
      label: isVi ? 'Ngày đã ghi chép' : 'Days logged',
      value: isVi ? `${loggedDays} / 7 ngày` : `${loggedDays} / 7 days`,
      accent: loggedDays >= 5 ? palette.green : undefined,
    });

    // 3. Streak
    const { currentStreak } = calculateStreak(entries);
    if (currentStreak >= 2) {
      items.push({
        icon: 'fire',
        label: isVi ? 'Chuỗi ngày liên tiếp' : 'Current streak',
        value: isVi ? `🔥 ${currentStreak} ngày` : `🔥 ${currentStreak} days`,
        accent: '#FB8C00',
      });
    }

    // 4. Best day of the week
    const byDate: Record<string, Entry[]> = {};
    for (const e of recentSaved) {
      byDate[e.date] = byDate[e.date] || [];
      byDate[e.date].push(e);
    }
    let bestDate: string | null = null;
    let bestScore = -1;
    for (const [date, dayEntries] of Object.entries(byDate)) {
      const avg = dayEntries.reduce((s, e) => s + moodScore[e.mood], 0) / dayEntries.length;
      if (avg > bestScore) { bestScore = avg; bestDate = date; }
    }
    if (bestDate && bestScore >= 4) {
      const d = new Date(`${bestDate}T12:00:00`);
      const dayName = new Intl.DateTimeFormat(isVi ? 'vi-VN' : 'en-US', { weekday: 'long' }).format(d);
      items.push({
        icon: 'star-shooting',
        label: isVi ? 'Ngày tốt nhất tuần này' : 'Best day this week',
        value: dayName.charAt(0).toUpperCase() + dayName.slice(1),
        accent: palette.primary,
      });
    }

    // 5. Average mood score
    const avgScore = recentSaved.reduce((s, e) => s + moodScore[e.mood], 0) / recentSaved.length;
    const avgLabel =
      avgScore >= 4.5 ? (isVi ? 'Xuất sắc ✨' : 'Excellent ✨') :
      avgScore >= 3.5 ? (isVi ? 'Tốt 👍'    : 'Good 👍')      :
      avgScore >= 2.5 ? (isVi ? 'Ổn 🙂'     : 'Okay 🙂')      :
                        (isVi ? 'Khó khăn 💪' : 'Tough 💪');
    items.push({
      icon: 'chart-line',
      label: isVi ? 'Điểm tâm trạng trung bình' : 'Average mood score',
      value: `${avgScore.toFixed(1)} / 5 — ${avgLabel}`,
    });

    // 6. Entries with location (shows they got out)
    const withLocation = recentSaved.filter(e => e.locationName).length;
    if (withLocation > 0) {
      items.push({
        icon: 'map-marker-radius',
        label: isVi ? 'Khoảnh khắc có địa điểm' : 'Moments with location',
        value: isVi ? `${withLocation} khoảnh khắc` : `${withLocation} moments`,
      });
    }

    return items;
  }, [entries, isVi]);

  const homeT = t.home as any;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.dialogScrim}>
        <View style={[styles.dialogCard, { maxHeight: '85%' }]}>
          {/* Header */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <Ionicons name="sparkles" size={22} color={palette.primary} />
            <Text style={styles.dialogTitle}>{homeT.luminousInsights}</Text>
          </View>
          <Text style={[styles.dialogText, { marginBottom: 16 }]}>
            {isVi ? '7 ngày gần nhất của bạn:' : 'Your last 7 days:'}
          </Text>

          {/* Insight tiles */}
          {insights.length === 0 ? (
            <View style={{ alignItems: 'center', paddingVertical: 24 }}>
              <MaterialCommunityIcons name="notebook-outline" size={36} color={palette.muted} />
              <Text style={{ color: palette.muted, marginTop: 12, textAlign: 'center', lineHeight: 20 }}>
                {isVi
                  ? 'Chưa có đủ dữ liệu.\nHãy ghi thêm nhật ký để xem phân tích nhé!'
                  : 'Not enough data yet.\nKeep journaling to unlock your insights!'}
              </Text>
            </View>
          ) : (
            <View style={{ gap: 8 }}>
              {insights.map((item, idx) => (
                <View
                  key={idx}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 12,
                    backgroundColor: palette.slate,
                    borderRadius: 14,
                    padding: 12,
                    borderLeftWidth: 3,
                    borderLeftColor: item.accent || palette.outline,
                  }}
                >
                  <MaterialCommunityIcons
                    name={item.icon as any}
                    size={22}
                    color={item.accent || palette.muted}
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 11, color: palette.muted, fontWeight: '500', marginBottom: 2 }}>
                      {item.label}
                    </Text>
                    <Text style={{ fontSize: 14, color: item.accent || palette.ink, fontWeight: '700' }}>
                      {item.value}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Close button */}
          <Pressable style={[styles.saveButton, { marginTop: 20 }]} onPress={onClose}>
            <Text style={styles.saveButtonText}>{t.common.close}</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
