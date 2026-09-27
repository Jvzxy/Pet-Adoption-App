import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../constants/theme';

export default function BrandHeader() {
  return (
    <View style={styles.brandHeaderContainer}>
      <Text style={styles.eyebrow}>CAT SHOP</Text>
      <Text style={styles.title}>PAWFECT</Text>
      <Text style={styles.title}>CATS 🐾</Text>
      <Text style={styles.location}>CAGAYAN DE ORO CITY</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  brandHeaderContainer: {
    marginTop: 40,
    marginBottom: 20,
  },
  eyebrow: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    color: colors.ink,
    marginBottom: 4,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: colors.ink,
    lineHeight: 36,
    letterSpacing: 0.5,
  },
  location: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
    color: colors.ink,
    marginTop: 8,
  },
});