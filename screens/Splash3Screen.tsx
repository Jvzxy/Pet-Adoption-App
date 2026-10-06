import React, { useEffect, useRef } from 'react';
import { Animated, Image, Pressable, StyleSheet, Text } from 'react-native';
import ScreenLabel from '../components/ScreenLabel';
import { colors } from '../constants/theme';
import appLogo from '../images/Logo.png';

interface ScreenProps {
  go: (next: string) => void;
}

export default function Splash3Screen({ go }: ScreenProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    // Parallel spring bounce and fade-in for logo & text
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto-advance to Get Started screen after intro plays
    const timer = setTimeout(() => {
      go('getStarted');
    }, 1800);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Pressable style={styles.fillMint} onPress={() => go('getStarted')}>
      
      <Animated.View
        style={[
          styles.centerAll,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Image source={appLogo} style={styles.logo} resizeMode="contain" />
        <Text style={styles.brandText}>PAWFECT CATS</Text>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fillMint: { flex: 1, backgroundColor: colors.mint },
  centerAll: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  logo: { width: 75, height: 75, marginBottom: 12 },
  brandText: { fontSize: 22, fontWeight: '900', color: colors.ink, letterSpacing: 0.5 },
});