import React from 'react';
import { Image, ImageProps, StyleSheet, View, ViewStyle } from 'react-native';

interface ImageHolderProps extends Omit<ImageProps, 'source'> {
  uri?: string;
  containerStyle?: ViewStyle;
  borderRadius?: number;
}

export default function ImageHolder({ uri, containerStyle, borderRadius = 0, style, ...props }: ImageHolderProps) {
  const defaultUri = 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=800&q=80';

  return (
    <View style={[styles.container, { borderRadius }, containerStyle]}>
      <Image
        source={{ uri: uri || defaultUri }}
        style={[styles.image, style]}
        resizeMode="cover"
        {...props}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    backgroundColor: '#E5E5E5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});