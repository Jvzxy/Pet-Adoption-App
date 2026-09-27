import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { colors } from '../constants/theme';

export default function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <Text style={styles.fieldLabel}>
      {children} <Text style={{ color: colors.red }}>*</Text>
    </Text>
  );
}

const styles = StyleSheet.create({
  fieldLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.ink,
    marginBottom: 6,
    marginTop: 12,
  },
});