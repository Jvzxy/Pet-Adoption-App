import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { colors } from '../constants/theme';

export default function Splash2Screen() {
  const router = useRouter();

  return (
    <Pressable style={styles.fillMint} onPress={() => router.push('/splash3')}>
      <Text style={styles.screenLabel}>Splash 2</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fillMint: { flex: 1, backgroundColor: colors.mint },
  screenLabel: { position: 'absolute', top: 40, left: 16, fontSize: 12, color: colors.textMuted, opacity: 0.5 },
});