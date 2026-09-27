import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../constants/theme';

export default function Splash1Screen() {
  const router = useRouter();

  return (
    <Pressable style={styles.fill} onPress={() => router.push('/splash2')}>
      <Text style={styles.screenLabel}>Splash 1</Text>
      <View style={styles.centerAll}>
        <View style={styles.dot} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: colors.white },
  screenLabel: { position: 'absolute', top: 40, left: 16, fontSize: 12, color: colors.textMuted, opacity: 0.5 },
  centerAll: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  dot: { width: 80, height: 80, borderRadius: 40, backgroundColor: colors.mint },
});