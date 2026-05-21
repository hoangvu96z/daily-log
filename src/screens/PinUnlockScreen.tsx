import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { Text } from '../components/AppText';
import { verifyPin } from '../memory/secureStore';
import { palette } from '../theme/palette';
import { useTranslation } from '../i18n/translations';

export function PinUnlockScreen({
  onUnlock,
  onUseBiometric,
  showBiometric,
}: {
  onUnlock: () => void;
  onUseBiometric?: () => void;
  showBiometric?: boolean;
}) {
  const { t } = useTranslation();
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  const submit = async (nextPin = pin) => {
    if (nextPin.length < 4) return;
    const ok = await verifyPin(nextPin);
    if (ok) {
      setPin('');
      onUnlock();
    } else {
      setError(t.pin.incorrectPin);
      setPin('');
    }
  };

  return (
    <View style={s.root}>
      <View style={s.logo}>
        <Ionicons name="lock-closed-outline" size={32} color={palette.primary} />
      </View>
      <Text style={s.title}>{t.pin.enterPin}</Text>
      <Text style={s.subtitle}>{t.pin.unlockDesc}</Text>
      <TextInput
        value={pin}
        onChangeText={(value) => {
          const next = value.replace(/\D/g, '').slice(0, 6);
          setPin(next);
          setError('');
          if (next.length >= 4) {
            submit(next);
          }
        }}
        keyboardType="number-pad"
        secureTextEntry
        maxLength={6}
        placeholder="••••"
        placeholderTextColor={palette.muted}
        style={s.input}
        autoFocus
      />
      {error ? <Text style={s.error}>{error}</Text> : null}
      <Pressable style={s.primaryButton} onPress={() => submit()}>
        <Text style={s.primaryText}>{t.pin.unlockButton}</Text>
      </Pressable>
      {showBiometric && onUseBiometric && (
        <Pressable style={s.altButton} onPress={onUseBiometric}>
          <Ionicons name="finger-print-outline" size={18} color={palette.primary} />
          <Text style={s.altText}>{t.pin.useBiometrics}</Text>
        </Pressable>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  root: {
    alignItems: 'center',
    backgroundColor: palette.paper,
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  logo: {
    alignItems: 'center',
    backgroundColor: palette.greenSoft,
    borderRadius: 34,
    height: 68,
    justifyContent: 'center',
    marginBottom: 22,
    width: 68,
  },
  title: {
    color: palette.ink,
    fontSize: 30,
    fontWeight: '800',
  },
  subtitle: {
    color: palette.muted,
    fontSize: 15,
    marginTop: 8,
  },
  input: {
    borderBottomColor: palette.primary,
    borderBottomWidth: 2,
    color: palette.ink,
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: 10,
    marginTop: 32,
    padding: 12,
    textAlign: 'center',
    width: 180,
  },
  error: {
    color: palette.red,
    fontSize: 14,
    fontWeight: '700',
    marginTop: 14,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: palette.primary,
    borderRadius: 16,
    marginTop: 28,
    paddingVertical: 16,
    width: '100%',
  },
  primaryText: {
    color: palette.white,
    fontSize: 16,
    fontWeight: '800',
  },
  altButton: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    marginTop: 18,
    padding: 12,
  },
  altText: {
    color: palette.primary,
    fontSize: 15,
    fontWeight: '800',
  },
});
