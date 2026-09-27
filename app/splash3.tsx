import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../constants/theme';

export default function Splash3Screen() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => router.push('/get-started'), 1200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.fillMint}>
      <Text style={styles.screenLabel}>Splash 3</Text>
      <View style={styles.centerAll}>
        <Text style={{ fontSize: 40 }}>🐾</Text>
        <Text style={styles.word}>PAWFECT CATS</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fillMint: { flex: 1, backgroundColor: colors.mint },
  screenLabel: { position: 'absolute', top: 40, left: 16, fontSize: 12, color: colors.textMuted, opacity: 0.5 },
  centerAll: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  word: { fontSize: 18, fontWeight: '900', letterSpacing: 1, color: colors.ink, marginTop: 8 },
});