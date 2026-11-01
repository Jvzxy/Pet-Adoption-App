import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';
import { useAppPreferences, type AppColors } from '../../services/AppPreferencesContext';

interface ScreenProps {
  go: (next: string) => void;
}

export default function Splash1Screen({ go }: ScreenProps) {
  const { colors } = useAppPreferences();
  const styles = createStyles(colors);
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

const createStyles = (colors: AppColors) => StyleSheet.create({
  fillWhite: { flex: 1, backgroundColor: colors.surface },
  centerAll: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  dot: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.mint,
  },
});