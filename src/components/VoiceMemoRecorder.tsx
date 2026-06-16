import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { startRecording, stopAndSaveRecording, formatDuration } from '../skills/voiceMemo';
import { palette } from '../theme/palette';
import { VoiceMemoPlayer } from './VoiceMemoPlayer';

interface VoiceMemoRecorderProps {
  entryId: string; // Used as the filename
  onRecorded: (uri: string, durationMs: number) => void;
  onDeleted: () => void;
  existingUri?: string;
  existingDuration?: number;
  autoStart?: boolean;
}

const MAX_DURATION_MS = 120000; // 2 minutes

export const VoiceMemoRecorder: React.FC<VoiceMemoRecorderProps> = ({ 
  entryId, 
  onRecorded, 
  onDeleted,
  existingUri,
  existingDuration,
  autoStart
}) => {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [durationMs, setDurationMs] = useState(0);
  const [recordedUri, setRecordedUri] = useState<string | null>(existingUri || null);
  const [recordedDuration, setRecordedDuration] = useState<number>(existingDuration || 0);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const waveformAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (recording) {
        recording.stopAndUnloadAsync().catch(() => {});
      }
    };
  }, [recording]);

  useEffect(() => {
    if (autoStart && !existingUri && !isRecording && !recording) {
      handleStartRecording();
    }
  }, [autoStart]);

  useEffect(() => {
    if (isRecording) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(waveformAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
          Animated.timing(waveformAnim, { toValue: 0, duration: 500, useNativeDriver: true })
        ])
      ).start();
    } else {
      waveformAnim.stopAnimation();
      waveformAnim.setValue(0);
    }
  }, [isRecording, waveformAnim]);

  const handleStartRecording = async () => {
    const rec = await startRecording();
    if (rec) {
      setRecording(rec);
      setIsRecording(true);
      setDurationMs(0);
      
      timerRef.current = setInterval(() => {
        setDurationMs(prev => {
          const next = prev + 1000;
          if (next >= MAX_DURATION_MS) {
            handleStopRecording(rec);
          }
          return next;
        });
      }, 1000);
    }
  };

  const handleStopRecording = async (rec: Audio.Recording | null = recording) => {
    if (!rec) return;
    if (timerRef.current) clearInterval(timerRef.current);
    
    setIsRecording(false);
    setRecording(null);
    
    const result = await stopAndSaveRecording(rec, entryId);
    if (result) {
      const finalDuration = result.durationMs || durationMs;
      setRecordedUri(result.uri);
      setRecordedDuration(finalDuration);
      onRecorded(result.uri, finalDuration);
    }
  };

  const handleDelete = () => {
    setRecordedUri(null);
    setRecordedDuration(0);
    setDurationMs(0);
    onDeleted();
  };

  if (recordedUri) {
    return (
      <View style={styles.previewContainer}>
        <View style={styles.playerWrapper}>
          <VoiceMemoPlayer uri={recordedUri} durationMs={recordedDuration} compact={false} />
        </View>
        <TouchableOpacity onPress={handleDelete} style={[styles.deleteBtn, { backgroundColor: palette.outlineVariant }]}>
          <Ionicons name="trash-outline" size={20} color={palette.red} />
        </TouchableOpacity>
      </View>
    );
  }

  const isWarning = durationMs >= MAX_DURATION_MS - 15000; // Last 15 seconds

  return (
    <View style={[styles.container, { backgroundColor: palette.mint, borderColor: palette.outline, borderWidth: 1 }]}>
      <TouchableOpacity 
        onPress={isRecording ? () => handleStopRecording() : handleStartRecording}
        style={[
          styles.recordBtn, 
          { backgroundColor: isRecording ? palette.red : palette.primary }
        ]}
      >
        <Ionicons name={isRecording ? "stop" : "mic"} size={24} color="#fff" />
      </TouchableOpacity>
      
      <View style={styles.statusContainer}>
        <Text style={[styles.timeText, { color: isWarning ? palette.red : palette.ink }]}>
          {formatDuration(durationMs)} / {formatDuration(MAX_DURATION_MS)}
        </Text>
        
        {isRecording && (
          <Animated.View style={[
            styles.recordingIndicator, 
            { 
              backgroundColor: palette.red,
              opacity: waveformAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.2, 1]
              }),
              transform: [{
                scale: waveformAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.8, 1.2]
                })
              }]
            }
          ]} />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginTop: 8,
  },
  recordBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  timeText: {
    fontSize: 16,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
    letterSpacing: 0.5,
  },
  recordingIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginLeft: 16,
  },
  previewContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  playerWrapper: {
    flex: 1,
  },
  deleteBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  }
});
