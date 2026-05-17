import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useTranslation } from '../i18n/translations';
import { palette } from '../theme/palette';
import { authenticateWithBiometrics } from '../skills/permissions';

// ─── Types ──────────────────────────────────────────────────────────────────

type AuthState = 'idle' | 'authenticating' | 'failed';

interface LockScreenProps {
  /** Called once biometric auth succeeds */
  onUnlock: () => void;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function LockScreen({ onUnlock }: LockScreenProps) {
  const { t } = useTranslation();

  const [authState, setAuthState] = useState<AuthState>('idle');

  // Pulse animation for the lock icon ring
  const pulseAnim = useRef(new Animated.Value(1)).current;
  // Shake animation for failed attempt
  const shakeAnim = useRef(new Animated.Value(0)).current;
  // Fade-in for the whole screen on mount
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // ── Mount fade-in ──────────────────────────────────────────────────────────
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  // ── Idle pulse loop ────────────────────────────────────────────────────────
  useEffect(() => {
    if (authState !== 'authenticating') return;

    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: 700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [authState, pulseAnim]);

  // ── Shake animation for failed state ─────────────────────────────────────
  const triggerShake = useCallback(() => {
    shakeAnim.setValue(0);
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10,  duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 8,   duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8,  duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0,   duration: 60, useNativeDriver: true }),
    ]).start();
  }, [shakeAnim]);

  // ── Core authenticate flow ────────────────────────────────────────────────
  const handleAuthenticate = useCallback(async () => {
    if (authState === 'authenticating') return;

    setAuthState('authenticating');
    pulseAnim.setValue(1);

    const success = await authenticateWithBiometrics();

    if (success) {
      // Brief success flash before unlocking
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => onUnlock());
    } else {
      setAuthState('failed');
      triggerShake();
      // Reset to idle after 2 s so user can retry
      setTimeout(() => setAuthState('idle'), 2000);
    }
  }, [authState, pulseAnim, fadeAnim, onUnlock, triggerShake]);

  // Auto-trigger biometric prompt on first mount
  useEffect(() => {
    const timer = setTimeout(() => handleAuthenticate(), 400);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Derived state strings ─────────────────────────────────────────────────
  const statusLabel = (() => {
    if (authState === 'authenticating') return t.permissions.biometricPrompt;
    if (authState === 'failed')        return t.auth.unlockPrompt;
    return t.auth.unlockPrompt;
  })();

  const iconName: keyof typeof Ionicons.glyphMap =
    authState === 'failed' ? 'close-circle-outline' : 'finger-print-outline';

  const iconColor =
    authState === 'failed' ? palette.red : palette.primary;

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <Animated.View style={[s.root, { opacity: fadeAnim }]}>
      {/* Background decorative gradient rings */}
      <View style={s.bgRing1} />
      <View style={s.bgRing2} />

      {/* App logo / wordmark */}
      <View style={s.logoRow}>
        <Ionicons name="journal-outline" size={28} color={palette.primary} />
        <Text style={s.logoText}>Hyda</Text>
      </View>

      {/* Central biometric button */}
      <View style={s.centerArea}>
        <Animated.View
          style={[
            s.iconRingOuter,
            {
              transform: [
                { scale: authState === 'authenticating' ? pulseAnim : 1 },
                { translateX: shakeAnim },
              ],
            },
          ]}
        >
          <View style={s.iconRingInner}>
            <Pressable
              onPress={handleAuthenticate}
              disabled={authState === 'authenticating'}
              style={({ pressed }) => [
                s.iconButton,
                pressed && s.iconButtonPressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel={statusLabel}
            >
              <Ionicons name={iconName} size={52} color={iconColor} />
            </Pressable>
          </View>
        </Animated.View>

        <Text style={s.promptText}>{statusLabel}</Text>

        {authState === 'failed' && (
          <Text style={s.errorText}>{t.auth.unlockPrompt}</Text>
        )}
      </View>

      {/* Retry hint */}
      {authState === 'idle' && (
        <Pressable onPress={handleAuthenticate} style={s.retryButton}>
          <Ionicons name="refresh-outline" size={16} color={palette.muted} />
          <Text style={s.retryText}>{t.permissions.biometricPrompt}</Text>
        </Pressable>
      )}

      {/* Privacy note */}
      <View style={s.footer}>
        <Ionicons name="shield-checkmark-outline" size={14} color={palette.muted} />
        <Text style={s.footerText}>{t.home.privacyNote}</Text>
      </View>
    </Animated.View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: palette.paper,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Decorative ambient rings
  bgRing1: {
    position: 'absolute',
    width: 420,
    height: 420,
    borderRadius: 210,
    borderWidth: 1,
    borderColor: palette.outline,
    opacity: 0.4,
  },
  bgRing2: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    borderWidth: 1,
    borderColor: palette.outline,
    opacity: 0.6,
  },

  // Logo
  logoRow: {
    position: 'absolute',
    top: 64,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoText: {
    fontSize: 22,
    fontWeight: '800',
    color: palette.ink,
    letterSpacing: -0.5,
  },

  // Center content
  centerArea: {
    alignItems: 'center',
    gap: 20,
  },

  // Biometric button rings
  iconRingOuter: {
    width: 148,
    height: 148,
    borderRadius: 74,
    backgroundColor: palette.greenSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconRingInner: {
    width: 112,
    height: 112,
    borderRadius: 56,
    backgroundColor: palette.mint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconButton: {
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: palette.cream,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: palette.glow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 4,
  },
  iconButtonPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.95 }],
  },

  promptText: {
    fontSize: 20,
    fontWeight: '700',
    color: palette.ink,
    letterSpacing: -0.3,
  },
  errorText: {
    fontSize: 14,
    color: palette.red,
    fontWeight: '600',
    marginTop: -8,
  },

  // Retry
  retryButton: {
    position: 'absolute',
    bottom: 120,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  retryText: {
    fontSize: 14,
    color: palette.muted,
    fontWeight: '600',
  },

  // Footer
  footer: {
    position: 'absolute',
    bottom: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 32,
  },
  footerText: {
    fontSize: 12,
    color: palette.muted,
    lineHeight: 16,
    flex: 1,
    textAlign: 'center',
  },
});
