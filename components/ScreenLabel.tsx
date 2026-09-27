import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { colors } from '../constants/theme';

interface ScreenLabelProps {
  children: React.ReactNode;
}

export default function ScreenLabel({ children }: ScreenLabelProps) {
  return <Text style={styles.label}>{children}</Text>;
}

const styles = StyleSheet.create({
  label: {
    position: 'absolute',
    top: 40,
    left: 16,
    fontSize: 12,
    color: colors.textMuted,
    opacity: 0.5,
    zIndex: 10,
  },
});