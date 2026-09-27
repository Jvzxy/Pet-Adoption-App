import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import ScreenLabel from '../components/ScreenLabel';
import { colors } from '../constants/theme';

interface ScreenProps {
  go: (next: string) => void;
}

export default function Splash2Screen({ go }: ScreenProps) {
  return (
    <Pressable style={styles.fillMint} onPress={() => go('splash3')}>
      <ScreenLabel>Splash 2</ScreenLabel>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fillMint: { flex: 1, backgroundColor: colors.mint },
});