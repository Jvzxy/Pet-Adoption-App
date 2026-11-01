import React from 'react';
import { StyleSheet, TextInput, TextInputProps } from 'react-native';
import { radii } from '../constants/theme';
import { useAppPreferences, type AppColors } from '../services/AppPreferencesContext';

export default function FieldInput(props: TextInputProps) {
  const { colors } = useAppPreferences();
  const styles = createStyles(colors);

  return (
    <TextInput
      placeholderTextColor={colors.textMuted}
      style={styles.input}
      autoCapitalize="none"
      {...props}
    />
  );
}

const createStyles = (colors: AppColors) => StyleSheet.create({
  input: {
    height: 44,
    backgroundColor: colors.cream,
    borderRadius: radii.sm,
    paddingHorizontal: 14,
    fontSize: 13,
    color: colors.ink,
  },
});