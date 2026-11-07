import React, { useState } from 'react';
import {
  Image,
  type ImageSourcePropType,
  Pressable,
  StyleSheet,
  View,
  ScrollView,
  type ViewStyle,
} from 'react-native';

export type ImageCarouselSource = string | ImageSourcePropType;

interface ImageCarouselProps {
  images: ImageCarouselSource[];
  height?: number;
  style?: ViewStyle;
}

export default function ImageCarousel({
  images,
  height = 300, 
  style,
}: ImageCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (!images || images.length === 0) return null;

  const mainImageSource = typeof images[activeIndex] === 'string' 
    ? { uri: images[activeIndex] as string } 
    : images[activeIndex];

  return (
    <View style={[styles.container, style]}>
      <View style={[styles.mainImageWrapper, { height }]}>
        <Image
          source={mainImageSource}
          style={styles.mainImage}
          resizeMode="cover"
        />
      </View>

      {images.length > 1 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.thumbnailContainer}
        >
          {images.map((item, index) => {
            const thumbSource = typeof item === 'string' ? { uri: item } : item;
            const isActive = activeIndex === index;
            
            return (
              <Pressable
                key={index.toString()}
                onPress={() => setActiveIndex(index)}
                style={[
                  styles.thumbnailWrapper,
                  isActive && styles.thumbnailWrapperActive
                ]}
              >
                <Image
                  source={thumbSource}
                  style={styles.thumbnailImage}
                  resizeMode="cover"
                />
              </Pressable>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
  },
  mainImageWrapper: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#F1F3F4',
    marginBottom: 12,
  },
  mainImage: {
    width: '100%',
    height: '100%',
  },
  thumbnailContainer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 2, 
    paddingBottom: 4, 
  },
  thumbnailWrapper: {
    width: 64,
    height: 64,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
    backgroundColor: '#F1F3F4',
  },
  thumbnailWrapperActive: {
    borderColor: '#14181C', 
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
});