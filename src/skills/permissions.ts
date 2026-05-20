import * as ImagePicker from 'expo-image-picker';
import * as LocalAuthentication from 'expo-local-authentication';
import * as Location from 'expo-location';
import { Platform } from 'react-native';
import { t } from '../i18n/translations';
import { PermissionState } from '../types';

// === Photo Permission ===

export async function requestPhotoAccess(): Promise<PermissionState> {
  try {
    const result = await ImagePicker.requestMediaLibraryPermissionsAsync();
    return result.granted ? 'granted' : 'denied';
  } catch {
    return 'unavailable';
  }
}

// === Location Permission ===

export async function requestLocationAccess(): Promise<{
  status: PermissionState;
  locationName?: string;
  locationLat?: number;
  locationLon?: number;
}> {
  if (Platform.OS === 'web') {
    return { status: 'unavailable', locationName: t().permissions.webUnsupported };
  }

  try {
    const result = await Location.requestForegroundPermissionsAsync();
    if (!result.granted) {
      return { status: 'denied' };
    }

    const position = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    let locationName: string | undefined;
    try {
      const [place] = await Location.reverseGeocodeAsync(position.coords);
      if (place) {
        locationName = place.name || place.street || place.city || undefined;
        if (place.city && locationName && locationName !== place.city) {
          locationName = `${locationName}, ${place.city}`;
        }
      }
    } catch {
      locationName = `${position.coords.latitude.toFixed(3)}, ${position.coords.longitude.toFixed(3)}`;
    }

    return {
      status: 'granted',
      locationName,
      locationLat: position.coords.latitude,
      locationLon: position.coords.longitude,
    };
  } catch {
    return { status: 'unavailable' };
  }
}

// === Biometric Check ===

export async function checkBiometricAvailability(): Promise<boolean> {
  if (Platform.OS === 'web') {
    return false;
  }

  try {
    return await LocalAuthentication.hasHardwareAsync();
  } catch {
    return false;
  }
}

// === Biometric Authentication ===

export async function authenticateWithBiometrics(): Promise<boolean> {
  if (Platform.OS === 'web') {
    return false;
  }

  try {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: t().permissions.biometricPrompt,
      cancelLabel: t().common.cancel,
      disableDeviceFallback: false,
    });
    return result.success;
  } catch {
    return false;
  }
}
