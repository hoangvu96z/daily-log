import React from 'react';
import { Text as RNText, TextProps as RNTextProps, StyleSheet, TextStyle } from 'react-native';

export function Text(props: RNTextProps) {
  const { style, ...rest } = props;
  const flatStyle = (StyleSheet.flatten(style || {}) || {}) as TextStyle;
  
  let fontFamily = 'PlusJakartaSans_400Regular';
  let fontWeight = flatStyle.fontWeight;

  if (fontWeight === '800' || fontWeight === 'bold' || fontWeight === '900') {
    fontFamily = 'PlusJakartaSans_800ExtraBold';
    fontWeight = '800'; // Chuẩn font weights: title=800
  } else if (fontWeight === '700' || fontWeight === '600') {
    fontFamily = 'PlusJakartaSans_600SemiBold';
    fontWeight = '600'; // Chuẩn font weights: subtitle=600
  } else if (fontWeight === '500') {
    fontFamily = 'PlusJakartaSans_500Medium';
    fontWeight = '500'; 
  } else {
    fontWeight = '400'; // Chuẩn font weights: body=400
  }

  return <RNText {...rest} style={[style, { fontFamily, fontWeight }]} />;
}
