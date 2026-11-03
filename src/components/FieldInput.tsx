
import React from 'react';
import {
  StyleSheet,
  TextInput,
  TextInputProps,
} from 'react-native';
import { radii } from '../constants/theme';
import {
  useAppPreferences,
  type AppColors,
} from '../services/AppPreferencesContext';

export default function FieldInput(props: TextInputProps) {
  const { colors } = useAppPreferences();
  const styles = createStyles(colors);

  return (
    <TextInput
      placeholderTextColor={colors.textMuted}
      style={[styles.input, props.multiline && styles.multiline]}
      autoCapitalize="none"
      selectionColor={colors.ink}
      underlineColorAndroid="transparent"
      {...props}
    />
  );
}

const createStyles = (colors: AppColors) =>
  StyleSheet.create({
    input: {
      minHeight: 50,
      backgroundColor: colors.cream,
      borderRadius: radii.sm,
      borderWidth: 1,
      borderColor: colors.textMuted + '35',
      paddingHorizontal: 16,
      paddingVertical: 12,
      fontSize: 14,
      fontWeight: '500',
      color: colors.ink,
    },
    multiline: {
      minHeight: 100,
      textAlignVertical: 'top',
      paddingTop: 14,
    },
  });
