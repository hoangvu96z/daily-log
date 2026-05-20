import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import { Pressable, SafeAreaView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useJournalStore } from '../memory/store';
import { removePinHash, savePin } from '../memory/secureStore';
import { palette } from '../theme/palette';
import { useTranslation } from '../i18n/translations';

type PinStep = 'enter' | 'confirm';

export function PinSetupScreen({ navigation }: { navigation: any }) {
  const { t } = useTranslation();
  const { settings, updateSettings } = useJournalStore();
  const [step, setStep] = useState<PinStep>('enter');
  const [firstPin, setFirstPin] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  const title = settings.pinSet ? t.pin.changeTitle : t.pin.createTitle;
  const helper = useMemo(() => {
    if (step === 'confirm') return t.pin.confirmHelper;
    return t.pin.createHelper;
  }, [step, t]);

  const submit = async () => {
    if (!/^\d{4,6}$/.test(pin)) {
      setError(t.pin.validationError);
      return;
    }

    if (step === 'enter') {
      setFirstPin(pin);
      setPin('');
      setError('');
      setStep('confirm');
      return;
    }

    if (pin !== firstPin) {
      setError(t.pin.mismatchError);
      setFirstPin('');
      setPin('');
      setStep('enter');
      return;
    }

    await savePin(pin);
    await updateSettings('pinSet', true);
    await updateSettings('pinEnabled', true);
    navigation.goBack();
  };

  const disablePin = async () => {
    await removePinHash();
    await updateSettings('pinSet', false);
    await updateSettings('pinEnabled', false);
    navigation.goBack();
  };

  return (
    <SafeAreaView style={s.root}>
      <View style={s.header}>
        <Pressable style={s.iconButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={22} color={palette.primary} />
        </Pressable>
        <Text style={s.title}>{title}</Text>
        <View style={s.iconButton} />
      </View>

      <View style={s.content}>
        <View style={s.pinIcon}>
          <Ionicons name="keypad-outline" size={36} color={palette.primary} />
        </View>
        <Text style={s.heading}>{step === 'confirm' ? t.pin.confirmHeading : t.pin.createHeading}</Text>
        <Text style={s.helper}>{helper}</Text>

        <TextInput
          value={pin}
          onChangeText={(value) => {
            setPin(value.replace(/\D/g, '').slice(0, 6));
            setError('');
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

        <Pressable style={s.primaryButton} onPress={submit}>
          <Text style={s.primaryText}>{step === 'confirm' ? t.pin.saveButton : t.pin.continueButton}</Text>
        </Pressable>

        {settings.pinSet && (
          <Pressable style={s.dangerButton} onPress={disablePin}>
            <Text style={s.dangerText}>{t.pin.turnOff}</Text>
          </Pressable>
        )}
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: palette.paper,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  iconButton: {
    alignItems: 'center',
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  title: {
    color: palette.ink,
    fontSize: 18,
    fontWeight: '800',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  pinIcon: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: palette.greenSoft,
    borderRadius: 32,
    height: 64,
    justifyContent: 'center',
    marginBottom: 24,
    width: 64,
  },
  heading: {
    color: palette.ink,
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
  },
  helper: {
    color: palette.muted,
    fontSize: 15,
    lineHeight: 22,
    marginTop: 10,
    textAlign: 'center',
  },
  input: {
    alignSelf: 'center',
    borderBottomColor: palette.primary,
    borderBottomWidth: 2,
    color: palette.ink,
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: 10,
    marginTop: 34,
    padding: 12,
    textAlign: 'center',
    width: 180,
  },
  error: {
    color: palette.red,
    fontSize: 14,
    fontWeight: '700',
    marginTop: 14,
    textAlign: 'center',
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: palette.primary,
    borderRadius: 16,
    marginTop: 28,
    paddingVertical: 16,
  },
  primaryText: {
    color: palette.white,
    fontSize: 16,
    fontWeight: '800',
  },
  dangerButton: {
    alignItems: 'center',
    marginTop: 16,
    paddingVertical: 14,
  },
  dangerText: {
    color: palette.red,
    fontSize: 15,
    fontWeight: '800',
  },
});
