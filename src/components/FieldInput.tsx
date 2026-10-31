import React from 'react';
import { StyleSheet, TextInput, TextInputProps } from 'react-native';
import { colors, radii } from '../constants/theme';

export default function FieldInput(props: TextInputProps) {
  return (
    <TextInput
      placeholderTextColor={colors.textMuted}
      style={styles.input}
      autoCapitalize="none"
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    height: 44,
    backgroundColor: colors.cream,
    borderRadius: radii.sm,
    paddingHorizontal: 14,
    fontSize: 13,
    color: colors.ink,
  },
});