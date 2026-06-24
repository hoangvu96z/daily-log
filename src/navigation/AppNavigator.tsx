import { DefaultTheme, NavigationContainer, useNavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import { hasPinCode } from '../memory/secureStore';
import { useJournalStore } from '../memory/store';
import { LockScreen } from '../screens/LockScreen';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { PinSetupScreen } from '../screens/PinSetupScreen';
import { PinUnlockScreen } from '../screens/PinUnlockScreen';
import { DetailScreen } from '../screens/DetailScreen';
import { RootStackParamList } from '../types';
import { TabNavigator } from './TabNavigator';
import { SearchScreen } from '../screens/SearchScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { CategoriesSettingsScreen } from '../screens/CategoriesSettingsScreen';
import { DevDiagnosticsScreen } from '../screens/DevDiagnosticsScreen';
import { useNotificationDeepLink } from '../hooks/useNotificationDeepLink';

const Stack = createNativeStackNavigator<RootStackParamList>();

const DarkSanctuaryTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: 'transparent',
  },
};

export function AppNavigator() {
  const { onboardingComplete, setOnboardingComplete, settings, hydrated, updateSettings } = useJournalStore();
  const [unlocked, setUnlocked] = useState(false);
  const navigationRef = useNavigationContainerRef();

  // 🔔 Deep-link: navigate to correct screen when user taps a notification
  useNotificationDeepLink(navigationRef);

  useEffect(() => {
    if (!hydrated) return;

    hasPinCode().then((pinSet) => {
      updateSettings('pinSet', pinSet);
      if (!pinSet) {
        updateSettings('pinEnabled', false);
      }
    });
  }, [hydrated, updateSettings]);

  const showLockGate = hydrated && onboardingComplete && !unlocked && (settings.faceIDEnabled || settings.pinEnabled);

  if (showLockGate) {
    if (settings.faceIDEnabled) {
      return (
        <LockScreen
          onUnlock={() => setUnlocked(true)}
          allowPinFallback={Boolean(settings.pinEnabled && settings.pinSet)}
        />
      );
    }

    return <PinUnlockScreen onUnlock={() => setUnlocked(true)} />;
  }

  return (
    <NavigationContainer theme={DarkSanctuaryTheme} ref={navigationRef}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: 'transparent' },
        }}
      >
        {!onboardingComplete ? (
          <Stack.Screen name="Onboarding">
            {(props) => (
              <OnboardingScreen
                {...props}
                onComplete={() => {
                  setOnboardingComplete(true);
                }}
              />
            )}
          </Stack.Screen>
        ) : (
          <>
            <Stack.Screen name="Tabs" component={TabNavigator} />
            <Stack.Screen name="PinSetup" component={PinSetupScreen} />
            <Stack.Screen name="Detail" component={DetailScreen} />
            <Stack.Screen name="Search" component={SearchScreen} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
            <Stack.Screen name="CategoriesSettings" component={CategoriesSettingsScreen} />
            <Stack.Screen name="DevDiagnostics" component={DevDiagnosticsScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
