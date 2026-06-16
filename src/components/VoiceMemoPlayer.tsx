import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { formatDuration } from '../skills/voiceMemo';
import { palette } from '../theme/palette';

interface VoiceMemoPlayerProps {
  uri: string;
  durationMs: number;
  compact?: boolean;
}

export const VoiceMemoPlayer: React.FC<VoiceMemoPlayerProps> = ({ uri, durationMs, compact = false }) => {
  const soundRef = React.useRef<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [positionMs, setPositionMs] = useState(0);
  const [realDuration, setRealDuration] = useState(durationMs);
  const [error, setError] = useState(false);

  useEffect(() => {
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync().catch(() => {});
        soundRef.current = null;
      }
    };
  }, []);

  const loadSound = async () => {
    try {
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: true },
        onPlaybackStatusUpdate
      );
      soundRef.current = newSound;
      setIsPlaying(true);
    } catch (err) {
      console.error('Failed to load sound', err);
      setError(true);
    }
  };

  const onPlaybackStatusUpdate = (status: any) => {
    if (status.isLoaded) {
      setPositionMs(status.positionMillis);
      setIsPlaying(status.isPlaying);
      if (status.durationMillis && status.durationMillis > 0) {
        setRealDuration(status.durationMillis);
      }
      if (status.didJustFinish) {
        setIsPlaying(false);
        setPositionMs(0);
        soundRef.current?.setPositionAsync(0).catch(() => {});
      }
    } else if (status.error) {
      setError(true);
    }
  };

  const handlePlayPause = async () => {
    if (error) return;
    
    if (!soundRef.current) {
      await loadSound();
      return;
    }
    
    try {
      if (isPlaying) {
        await soundRef.current.pauseAsync();
      } else {
        const status = await soundRef.current.getStatusAsync();
        if (status.isLoaded && status.positionMillis >= realDuration - 500) {
          await soundRef.current.setPositionAsync(0);
        }
        await soundRef.current.playAsync();
      }
    } catch (err: any) {
      if (err.message?.includes('not loaded')) {
        soundRef.current = null;
        await loadSound();
      } else {
        console.error('Playback error:', err);
      }
    }
  };

  const progress = realDuration > 0 ? (positionMs / realDuration) * 100 : 0;

  if (error) {
    return (
      <View style={[styles.container, compact && styles.compactContainer, { backgroundColor: palette.outlineVariant }]}>
        <Ionicons name="warning-outline" size={20} color={palette.red} />
        {!compact && <Text style={[styles.errorText, { color: palette.red }]}>Audio unavailable</Text>}
      </View>
    );
  }

  return (
    <View style={[styles.container, compact && styles.compactContainer, { backgroundColor: palette.primaryContainer }]}>
      <TouchableOpacity onPress={handlePlayPause} style={styles.playBtn}>
        <Ionicons name={isPlaying ? "pause-circle" : "play-circle"} size={compact ? 28 : 36} color={palette.primary} />
      </TouchableOpacity>
      
      <View style={styles.progressContainer}>
        <View style={[styles.progressBarBg, { backgroundColor: palette.outlineVariant }]}>
          <View style={[styles.progressBarFill, { backgroundColor: palette.primary, width: `${progress}%` }]} />
        </View>
      </View>
      
      <Text style={[styles.timeText, { color: palette.primary }, compact && { fontSize: 11 }]}>
        {formatDuration(positionMs)} / {formatDuration(realDuration)}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 24,
    marginTop: 8,
  },
  compactContainer: {
    padding: 8,
    borderRadius: 20,
    marginTop: 4,
  },
  playBtn: {
    marginRight: 10,
  },
  progressContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  progressBarBg: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
  },
  timeText: {
    fontSize: 13,
    marginLeft: 12,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  errorText: {
    fontSize: 14,
    marginLeft: 8,
  }
});
