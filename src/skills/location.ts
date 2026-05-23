import * as Location from 'expo-location';
import { Platform } from 'react-native';

export interface LocationSignal {
  type: 'location';
  time: Date;
  locationName: string;
  latitude?: number;
  longitude?: number;
}

export async function getLocationSignals(): Promise<LocationSignal[]> {
  if (Platform.OS === 'web') return [];

  try {
    const { status: fgStatus } = await Location.getForegroundPermissionsAsync();
    if (fgStatus !== 'granted') return [];

    const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
    const geocode = await Location.reverseGeocodeAsync({
      latitude: loc.coords.latitude,
      longitude: loc.coords.longitude,
    });

    let locationName = 'Unknown Location';
    if (geocode && geocode.length > 0) {
      const place = geocode[0];
      const parts = [];
      if (place.name) parts.push(place.name);
      else if (place.street) parts.push(place.street);
      
      if (place.city || place.subregion) parts.push(place.city || place.subregion);
      
      locationName = parts.length > 0 ? parts.join(', ') : 'Unknown Location';
    }

    return [{
      type: 'location',
      time: new Date(loc.timestamp),
      locationName,
      latitude: loc.coords.latitude,
      longitude: loc.coords.longitude,
    }];
  } catch (e) {
    console.warn('[Location] Failed to get location signals', e);
    return [];
  }
}
