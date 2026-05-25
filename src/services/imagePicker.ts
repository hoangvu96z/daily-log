import * as ImagePicker from 'expo-image-picker';
import { MediaItem } from '../types';

export async function pickMomentMedia(): Promise<MediaItem[] | undefined> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    return undefined;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.All,
    allowsMultipleSelection: true,
    selectionLimit: 10,
    quality: 0.82,
  });

  if (result.canceled || !result.assets || result.assets.length === 0) {
    return undefined;
  }

  return result.assets.map(asset => ({
    uri: asset.uri,
    type: asset.type === 'video' ? 'video' : 'image',
    width: asset.width,
    height: asset.height,
    duration: asset.duration ?? undefined
  }));
}
