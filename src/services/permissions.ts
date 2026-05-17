import * as ImagePicker from 'expo-image-picker';
import * as LocalAuthentication from 'expo-local-authentication';
import * as Location from 'expo-location';
import { Platform } from 'react-native';
import { PermissionState } from '../types';

export async function requestPhotoAccess(): Promise<PermissionState> {
  const result = await ImagePicker.requestMediaLibraryPermissionsAsync();
  return result.granted ? 'granted' : 'denied';
}

export async function requestLocationAccess(): Promise<{ status: PermissionState; locationName?: string }> {
  if (Platform.OS === 'web') {
    return { status: 'unavailable', locationName: 'Web không hỗ trợ vị trí nền' };
  }

  const result = await Location.requestForegroundPermissionsAsync();
  if (!result.granted) {
    return { status: 'denied' };
  }

  const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
  return {
    status: 'granted',
    locationName: `${position.coords.latitude.toFixed(3)}, ${position.coords.longitude.toFixed(3)}`,
  };
}

export async function checkBiometricAvailability(): Promise<boolean> {
  if (Platform.OS === 'web') {
    return false;
  }

  return LocalAuthentication.hasHardwareAsync();
}
