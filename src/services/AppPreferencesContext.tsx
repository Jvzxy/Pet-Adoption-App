import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appearance } from 'react-native';
import { colors } from '../constants/theme';
import { useAuth } from './AuthContext';

const STORAGE_KEY_PREFIX = '@pawfect/app-preferences:';

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
  const { user, loading: authLoading } = useAuth();
  const accountId = user?.id ?? null;
  const activeAccountIdRef = useRef(accountId);
  activeAccountIdRef.current = accountId;
  const [darkMode, setDarkModeState] = useState(false);
  const [biometricEnabled, setBiometricEnabledState] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadedAccountId, setLoadedAccountId] = useState<string | null | undefined>();

  useEffect(() => {
    let active = true;
    if (loadedAccountId === accountId) {
      setLoading(false);
      return () => {
        active = false;
      };
    }

    if (authLoading) {
      setLoading(true);
      return () => {
        active = false;
      };
    }

    setLoading(true);
    setDarkModeState(false);
    setBiometricEnabledState(false);
    Appearance.setColorScheme('light');

    const loadPreferences = async () => {
      if (accountId) {
        const stored = await AsyncStorage.getItem(`${STORAGE_KEY_PREFIX}${accountId}`);
        if (stored) {
          const preferences = JSON.parse(stored) as Partial<Pick<AppPreferences, 'darkMode' | 'biometricEnabled'>>;
          if (!active) return;
          setDarkModeState(preferences.darkMode === true);
          setBiometricEnabledState(preferences.biometricEnabled === true);
          Appearance.setColorScheme(preferences.darkMode === true ? 'dark' : 'light');
        }
      }

      if (active) setLoadedAccountId(accountId);
    };

    void loadPreferences()
      .catch((error: unknown) => {
        console.error('Could not load account preferences:', error);
        if (active) setLoadedAccountId(accountId);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [accountId, authLoading, loadedAccountId]);

  const persist = useCallback(async (ownerId: string | null, nextDarkMode: boolean, nextBiometric: boolean) => {
    if (!ownerId) throw new Error('You must be signed in to save account preferences.');
    await AsyncStorage.setItem(`${STORAGE_KEY_PREFIX}${ownerId}`, JSON.stringify({
      darkMode: nextDarkMode,
      biometricEnabled: nextBiometric,
    }));
  }, []);

  const setDarkMode = useCallback(async (enabled: boolean) => {
    await persist(accountId, enabled, biometricEnabled);
    if (activeAccountIdRef.current !== accountId) return;
    setDarkModeState(enabled);
    Appearance.setColorScheme(enabled ? 'dark' : 'light');
  }, [accountId, biometricEnabled, persist]);

  const setBiometricEnabled = useCallback(async (enabled: boolean) => {
    await persist(accountId, darkMode, enabled);
    if (activeAccountIdRef.current !== accountId) return;
    setBiometricEnabledState(enabled);
  }, [accountId, darkMode, persist]);

  const preferencesReady = !loading && loadedAccountId === accountId;
  const activeDarkMode = preferencesReady && darkMode;
  const activeBiometricEnabled = preferencesReady && biometricEnabled;

  const value = useMemo<AppPreferences>(() => ({
    darkMode: activeDarkMode,
    biometricEnabled: activeBiometricEnabled,
    colors: activeDarkMode ? darkColors : lightColors,
    loading: !preferencesReady,
    setDarkMode,
    setBiometricEnabled,
  }), [activeDarkMode, activeBiometricEnabled, preferencesReady, setDarkMode, setBiometricEnabled]);

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
