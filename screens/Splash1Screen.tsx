import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';
import ScreenLabel from '../components/ScreenLabel';
import { colors } from '../constants/theme';

interface ScreenProps {
  go: (next: string) => void;
}

export default function Splash1Screen({ go }: ScreenProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Expands the mint dot until it covers the entire white screen
    Animated.timing(scaleAnim, {
      toValue: 25,
      duration: 800,
      useNativeDriver: true,
    }).start(() => {
      go('splash2');
    });
  }, []);

  return (
    <Pressable style={styles.fillWhite} onPress={() => go('splash2')}>
      <View style={styles.centerAll}>
        <Animated.View
          style={[
            styles.dot,
            {
              transform: [{ scale: scaleAnim }],
            },
          ]}
        />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fillWhite: { flex: 1, backgroundColor: colors.white },
  centerAll: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  dot: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.mint,
  },
});