import React, { useMemo } from 'react';
import { View, Dimensions, StyleSheet } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { Text } from './AppText';
import { Entry, Mood } from '../types';
import { palette } from '../theme/palette';
import { getLocalDateString } from '../utils/dateUtils';
import { useTranslation } from '../i18n/translations';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface MoodTrendChartProps {
  entries: Entry[];
}

const moodValues: Record<Mood, number> = {
  very_bad: 1,
  bad: 2,
  neutral: 3,
  good: 4,
  great: 5,
};

export function MoodTrendChart({ entries }: MoodTrendChartProps) {
  const { t, locale } = useTranslation();

  const chartData = useMemo(() => {
    // Generate last 7 days date strings
    const last7Days: string[] = [];
    const labels: string[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      last7Days.push(getLocalDateString(d));
      // Short day name for x-axis
      labels.push(new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(d));
    }

    const dataPoints = last7Days.map((dateKey) => {
      const dayEntries = entries.filter(e => e.date === dateKey && e.status === 'saved' && e.mood);
      if (dayEntries.length === 0) return 0; // 0 means no data, we might want to filter this out or show a gap
      
      const sum = dayEntries.reduce((acc, curr) => acc + moodValues[curr.mood], 0);
      return sum / dayEntries.length;
    });

    return { labels, dataPoints };
  }, [entries, locale]);

  // If no data points > 0, don't render chart
  if (!chartData.dataPoints.some(dp => dp > 0)) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Chưa có đủ dữ liệu biểu đồ</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Xu hướng cảm xúc</Text>
      <LineChart
        data={{
          labels: chartData.labels,
          datasets: [
            {
              data: chartData.dataPoints.map(dp => dp === 0 ? 3 : dp), // Fallback to 3 if no data to keep line continuous
              color: (opacity = 1) => palette.primary, 
              strokeWidth: 3 
            }
          ]
        }}
        width={SCREEN_WIDTH - 80} // Dialog padding
        height={220}
        chartConfig={{
          backgroundColor: 'transparent',
          backgroundGradientFrom: 'transparent',
          backgroundGradientTo: 'transparent',
          backgroundGradientFromOpacity: 0,
          backgroundGradientToOpacity: 0,
          decimalPlaces: 1,
          color: (opacity = 1) => palette.primary,
          labelColor: (opacity = 1) => palette.muted,
          style: { borderRadius: 16 },
          propsForDots: {
            r: '5',
            strokeWidth: '2',
            stroke: palette.white,
          },
          propsForBackgroundLines: {
            strokeDasharray: '', // solid background lines
            stroke: 'rgba(0,0,0,0.05)'
          }
        }}
        bezier
        style={{
          marginVertical: 8,
          borderRadius: 16,
          marginLeft: -10,
        }}
        yLabelsOffset={10}
        withHorizontalLabels={false}
        withVerticalLines={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
    padding: 16,
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderRadius: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: palette.ink,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  emptyContainer: {
    marginVertical: 16,
    padding: 24,
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: palette.muted,
    fontSize: 14,
    fontWeight: '600',
  }
});
