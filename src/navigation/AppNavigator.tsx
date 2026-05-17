import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { useJournalStore } from '../memory/store';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { TabNavigator } from './TabNavigator';

const Stack = createNativeStackNavigator();

export function AppNavigator() {
  const { onboardingComplete, setOnboardingComplete } = useJournalStore();

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
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
