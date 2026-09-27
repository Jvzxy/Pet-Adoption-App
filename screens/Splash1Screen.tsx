import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import ScreenLabel from '../components/ScreenLabel';
import { colors } from '../constants/theme';

interface ScreenProps {
  go: (next: string) => void;
}

export default function Splash1Screen({ go }: ScreenProps) {
  return (
    <Pressable style={styles.fill} onPress={() => go('splash2')}>
      <ScreenLabel>Splash 1</ScreenLabel>
      <View style={styles.centerAll}>
        <View style={styles.dot} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: colors.white },
  centerAll: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  dot: { width: 80, height: 80, borderRadius: 40, backgroundColor: colors.mint },
});