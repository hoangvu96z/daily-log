import * as ImagePicker from 'expo-image-picker';
import * as VideoThumbnails from 'expo-video-thumbnails';
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

  const resultAssets: MediaItem[] = [];
  
  for (const asset of result.assets) {
    let thumbnailUri: string | undefined;
    
    if (asset.type === 'video') {
      try {
        const { uri } = await VideoThumbnails.getThumbnailAsync(asset.uri, {
          time: 500, // get frame at 0.5s
          quality: 0.8,
        });
        thumbnailUri = uri;
      } catch (e) {
        console.warn('Failed to generate video thumbnail:', e);
      }
    }

    resultAssets.push({
      uri: asset.uri,
      type: asset.type === 'video' ? 'video' : 'image',
      width: asset.width,
      height: asset.height,
      duration: asset.duration ?? undefined,
      thumbnailUri,
    });
  }

  return resultAssets;
}
