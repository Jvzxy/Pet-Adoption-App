import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import ScreenLabel from '../components/ScreenLabel';
import { colors } from '../constants/theme';

interface ScreenProps {
  go: (next: string) => void;
}

export default function Splash3Screen({ go }: ScreenProps) {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();

    const timer = setTimeout(() => go('getStarted'), 1500);
    return () => clearTimeout(timer);
  }, [go, opacity]);

  return (
    <View style={styles.fillMint}>
      <ScreenLabel>Splash 3</ScreenLabel>
      <View style={styles.centerAll}>
        <Animated.View style={{ opacity, alignItems: 'center' }}>
          <Text style={{ fontSize: 40 }}>🐾</Text>
          <Text style={styles.word}>PAWFECT CATS</Text>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fillMint: { flex: 1, backgroundColor: colors.mint },
  centerAll: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  word: { fontSize: 18, fontWeight: '900', letterSpacing: 1, color: colors.ink, marginTop: 8 },
});