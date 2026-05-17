import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { useJournalStore } from '../memory/store';
import { LockScreen } from '../screens/LockScreen';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { TabNavigator } from './TabNavigator';

const Stack = createNativeStackNavigator();

const DarkSanctuaryTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: 'transparent',
  },
};

export function AppNavigator() {
  const { onboardingComplete, setOnboardingComplete, settings, hydrated } =
    useJournalStore();

  // unlocked starts false on every app launch — re-locks when app is closed/restarted
  const [unlocked, setUnlocked] = useState(false);

  // Determine whether the lock gate should be shown.
  // Only show when: store is hydrated + onboarding is done + faceID is enabled + not yet unlocked.
  const showLockGate =
    hydrated && onboardingComplete && settings.faceIDEnabled && !unlocked;

  if (showLockGate) {
    return <LockScreen onUnlock={() => setUnlocked(true)} />;
  }

  return (
    <NavigationContainer theme={DarkSanctuaryTheme}>
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
          <Stack.Screen name="Tabs" component={TabNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
