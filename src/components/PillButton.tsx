import React from 'react';
import { Pressable, StyleProp, StyleSheet, Text, ViewStyle } from 'react-native';
import { colors, radii } from '../constants/theme';

interface PillButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'dark' | 'light';
  style?: StyleProp<ViewStyle>;
}

export default function PillButton({ title, onPress, variant = 'dark', style }: PillButtonProps) {
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

const styles = StyleSheet.create({
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
    backgroundColor: colors.ink,
  },
  pillButtonLight: {
    backgroundColor: colors.white,
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
    color: colors.white,
  },
  pillButtonTextLight: {
    color: colors.ink,
  },
});