import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appearance } from 'react-native';
import { colors } from '../constants/theme';

const STORAGE_KEY = '@pawfect/app-preferences';

export interface AppColors {
  mint: string;
  white: string;
  ink: string;
  cream: string;
  textMuted: string;
  red: string;
  cardBg: string;
  border: string;
  background: string;
  surface: string;
  isDark: boolean;
}

interface AppPreferences {
  darkMode: boolean;
  biometricEnabled: boolean;
  colors: AppColors;
  loading: boolean;
  setDarkMode: (enabled: boolean) => Promise<void>;
  setBiometricEnabled: (enabled: boolean) => Promise<void>;
}

const lightColors: AppColors = {
  ...colors,
  background: colors.mint,
  surface: colors.white,
  isDark: false,
};

const darkColors: AppColors = {
  mint: '#111A1A',
  white: '#202B2A',
  ink: '#F4F7F6',
  cream: '#2A3332',
  textMuted: '#B1BEBC',
  red: '#FF6B63',
  cardBg: '#202B2A',
  border: '#3B4947',
  background: '#111A1A',
  surface: '#202B2A',
  isDark: true,
};

const AppPreferencesContext = createContext<AppPreferences | null>(null);

export function AppPreferencesProvider({ children }: { children: React.ReactNode }) {
  const [darkMode, setDarkModeState] = useState(false);
  const [biometricEnabled, setBiometricEnabledState] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    void AsyncStorage.getItem(STORAGE_KEY)
      .then((stored) => {
        if (!stored || !active) return;
        const preferences = JSON.parse(stored) as Partial<Pick<AppPreferences, 'darkMode' | 'biometricEnabled'>>;
        setDarkModeState(preferences.darkMode === true);
        setBiometricEnabledState(preferences.biometricEnabled === true);
        Appearance.setColorScheme(preferences.darkMode === true ? 'dark' : 'light');
      })
      .catch((error: unknown) => {
        console.error('Could not load app preferences:', error);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const persist = useCallback(async (nextDarkMode: boolean, nextBiometric: boolean) => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({
      darkMode: nextDarkMode,
      biometricEnabled: nextBiometric,
    }));
  }, []);

  const setDarkMode = useCallback(async (enabled: boolean) => {
    await persist(enabled, biometricEnabled);
    setDarkModeState(enabled);
    Appearance.setColorScheme(enabled ? 'dark' : 'light');
  }, [biometricEnabled, persist]);

  const setBiometricEnabled = useCallback(async (enabled: boolean) => {
    await persist(darkMode, enabled);
    setBiometricEnabledState(enabled);
  }, [darkMode, persist]);

  const value = useMemo<AppPreferences>(() => ({
    darkMode,
    biometricEnabled,
    colors: darkMode ? darkColors : lightColors,
    loading,
    setDarkMode,
    setBiometricEnabled,
  }), [darkMode, biometricEnabled, loading, setDarkMode, setBiometricEnabled]);

  return (
    <AppPreferencesContext.Provider value={value}>
      {children}
    </AppPreferencesContext.Provider>
  );
}

export function useAppPreferences(): AppPreferences {
  const value = useContext(AppPreferencesContext);
  if (!value) throw new Error('useAppPreferences must be used within an AppPreferencesProvider');
  return value;
}
