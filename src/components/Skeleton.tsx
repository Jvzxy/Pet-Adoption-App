import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View, type ViewStyle } from 'react-native';
import { useAppPreferences } from '../services/AppPreferencesContext';

type SkeletonProps = {
  width?: ViewStyle['width'];
  height?: number;
  radius?: number;
  style?: ViewStyle;
};

export function Skeleton({ width = '100%', height = 14, radius = 8, style }: SkeletonProps) {
  const { colors } = useAppPreferences();
  const opacity = useRef(new Animated.Value(0.45)).current;

  useEffect(() => {
    const animation = Animated.loop(Animated.sequence([
      Animated.timing(opacity, { toValue: 0.95, duration: 800, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 0.45, duration: 800, useNativeDriver: true }),
    ]));
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return <Animated.View accessible={false} style={[styles.base, { width, height, borderRadius: radius, backgroundColor: colors.border || '#DDE4E2', opacity }, style]} />;
}

export function SkeletonPetGrid({ count = 4 }: { count?: number }) {
  const { colors } = useAppPreferences();
  return (
    <View style={styles.grid}>
      {Array.from({ length: count }, (_, index) => (
        <View key={index} style={[styles.petCard, { backgroundColor: colors.surface || colors.cardBg || '#FFFFFF' }]}>
          <Skeleton height={116} radius={14} />
          <Skeleton width="72%" height={14} style={styles.line} />
          <Skeleton width="48%" height={11} style={styles.shortLine} />
          <Skeleton width="62%" height={16} style={styles.priceLine} />
        </View>
      ))}
    </View>
  );
}

export function SkeletonRows({ count = 3 }: { count?: number }) {
  const { colors } = useAppPreferences();
  return (
    <View style={styles.rows}>
      {Array.from({ length: count }, (_, index) => (
        <View key={index} style={[styles.rowCard, { backgroundColor: colors.surface || colors.cardBg || '#FFFFFF' }]}>
          <Skeleton width={42} height={42} radius={21} />
          <View style={styles.rowCopy}>
            <Skeleton width="68%" height={14} />
            <Skeleton width="46%" height={11} style={styles.shortLine} />
          </View>
          <Skeleton width={68} height={23} radius={12} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  base: { overflow: 'hidden' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 10 },
  petCard: { width: '48%', borderRadius: 20, padding: 10, marginBottom: 16 },
  line: { marginTop: 12 },
  shortLine: { marginTop: 8 },
  priceLine: { marginTop: 12 },
  rows: { paddingHorizontal: 24, paddingTop: 8 },
  rowCard: { minHeight: 74, borderRadius: 18, padding: 16, marginBottom: 14, flexDirection: 'row', alignItems: 'center' },
  rowCopy: { flex: 1, marginHorizontal: 12 },
});
