import * as ImagePicker from 'expo-image-picker';

export async function pickMomentImage(): Promise<string | undefined> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    return undefined;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    allowsEditing: true,
    aspect: [4, 3],
    quality: 0.82,
  });

  if (result.canceled || !result.assets[0]) {
    return undefined;
  }

  return result.assets[0].uri;
}
