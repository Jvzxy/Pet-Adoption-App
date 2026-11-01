import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { useAppPreferences, type AppColors } from '../services/AppPreferencesContext';

export default function FieldLabel({ children }: { children: React.ReactNode }) {
  const { colors } = useAppPreferences();
  const styles = createStyles(colors);

  return (
    <Text style={styles.fieldLabel}>
      {children} <Text style={{ color: colors.red }}>*</Text>
    </Text>
  );
}

const createStyles = (colors: AppColors) => StyleSheet.create({
  fieldLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.ink,
    marginBottom: 6,
    marginTop: 12,
  },
});