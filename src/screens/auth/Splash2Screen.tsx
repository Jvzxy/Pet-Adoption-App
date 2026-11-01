import React, { useEffect } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { useAppPreferences, type AppColors } from '../../services/AppPreferencesContext';

interface ScreenProps {
  go: (next: string) => void;
}

export default function Splash2Screen({ go }: ScreenProps) {
  const { colors } = useAppPreferences();
  const styles = createStyles(colors);

  useEffect(() => {
    const timer = setTimeout(() => {
      go('splash3');
    }, 250); // Seamless pause on solid mint background before logo pops
    return () => clearTimeout(timer);
  }, []);

  return (
    <Pressable style={styles.fillMint} onPress={() => go('splash3')}>
    </Pressable>
  );
}

const createStyles = (colors: AppColors) => StyleSheet.create({
  fillMint: { flex: 1, backgroundColor: colors.background },
});