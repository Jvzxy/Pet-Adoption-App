import React from 'react';
import { Pressable, StyleProp, StyleSheet, Text, ViewStyle } from 'react-native';
import { radii } from '../constants/theme';
import { useAppPreferences, type AppColors } from '../services/AppPreferencesContext';

interface PillButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'dark' | 'light';
  style?: StyleProp<ViewStyle>;
}

export default function PillButton({ title, onPress, variant = 'dark', style }: PillButtonProps) {
  const { colors } = useAppPreferences();
  const styles = createStyles(colors);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.pillButtonBase,
        variant === 'dark' ? styles.pillButtonDark : styles.pillButtonLight,
        pressed && { opacity: 0.85 },
        style,
      ]}
    >
      <Text
        style={[
          styles.pillButtonText,
          variant === 'dark' ? styles.pillButtonTextDark : styles.pillButtonTextLight,
        ]}
      >
        {title}
      </Text>
    </Pressable>
  );
}

const createStyles = (colors: AppColors) => StyleSheet.create({
  pillButtonBase: {
    height: 48,
    borderRadius: radii.pill,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    width: '100%',
  },
  pillButtonDark: {
    backgroundColor: colors.isDark ? colors.mint : colors.ink,
  },
  pillButtonLight: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.ink,
  },
  pillButtonText: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1,
    textAlign: 'center',
    includeFontPadding: false,
  },
  pillButtonTextDark: {
    color: colors.isDark ? colors.ink : colors.white,
  },
  pillButtonTextLight: {
    color: colors.ink,
  },
});