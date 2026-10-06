import React, { useEffect } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import ScreenLabel from '../components/ScreenLabel';
import { colors } from '../constants/theme';

interface ScreenProps {
  go: (next: string) => void;
}

export default function Splash2Screen({ go }: ScreenProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      go('splash3');
    }, 250); // Seamless pause on solid mint background before logo pops
    return () => clearTimeout(timer);
  }, []);

  return (
    <Pressable style={styles.fillMint} onPress={() => go('splash3')}>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fillMint: { flex: 1, backgroundColor: colors.mint },
});