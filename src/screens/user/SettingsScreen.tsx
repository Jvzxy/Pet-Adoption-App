import React, { useState } from 'react';
import { Alert, Platform, Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import { useAppPreferences, type AppColors } from '../../services/AppPreferencesContext';
import AngleLeftIcon from '../../images/Icons/angle-left-solid-full.svg';
import AngleRightIcon from '../../images/Icons/angle-right-solid-full (1).svg';

interface ScreenProps {
  go: (next: string) => void;
}

export default function SettingsScreen({ go }: ScreenProps) {
  const preferences = useAppPreferences();
  const styles = createStyles(preferences.colors);
  const [notifications, setNotifications] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  const toggleBiometrics = async (enabled: boolean) => {
    if (enabled) {
      try {
        const hasHardware = await LocalAuthentication.hasHardwareAsync();
        if (!hasHardware) {
          Alert.alert('Biometrics unavailable', 'This device does not have a supported biometric sensor.');
          return;
        }

        const isEnrolled = await LocalAuthentication.isEnrolledAsync();
        if (!isEnrolled) {
          Alert.alert('No biometrics enrolled', 'Set up Face ID, Touch ID, or fingerprint unlock in your device settings first.');
          return;
        }

        const result = await LocalAuthentication.authenticateAsync({
          promptMessage: 'Enable biometric payment confirmation',
          cancelLabel: 'Cancel',
          disableDeviceFallback: false,
        });
        if (!result.success) return;
      } catch (error) {
        console.error('Could not enable biometric authentication:', error);
        Alert.alert('Biometrics unavailable', 'Could not verify biometric authentication on this device.');
        return;
      }
    }

    setIsUpdating(true);
    try {
      await preferences.setBiometricEnabled(enabled);
    } catch (error) {
      console.error('Could not save biometric preference:', error);
      Alert.alert('Settings not saved', 'Could not save your biometric preference.');
    } finally {
      setIsUpdating(false);
    }
  };

  const toggleDarkMode = async (enabled: boolean) => {
    setIsUpdating(true);
    try {
      await preferences.setDarkMode(enabled);
    } catch (error) {
      console.error('Could not save dark mode preference:', error);
      Alert.alert('Settings not saved', 'Could not save your appearance preference.');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Pressable onPress={() => go('profile')} style={styles.backBtn} hitSlop={10}>
          <AngleLeftIcon width={18} height={18} fill={preferences.colors.ink} />
        </Pressable>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.menuContainer}>
          <View style={styles.menuItem}>
            <Text style={styles.menuLabel}>Push Notifications</Text>
            <Switch
              value={notifications} 
              onValueChange={setNotifications} 
              trackColor={{ false: '#777', true: preferences.colors.isDark ? '#35635E' : preferences.colors.ink }}
              disabled={isUpdating}
            />
          </View>
          <View style={styles.menuItem}>
            <Text style={styles.menuLabel}>Dark Mode</Text>
            <Switch
              value={preferences.darkMode}
              onValueChange={(enabled) => void toggleDarkMode(enabled)}
              trackColor={{ false: '#777', true: preferences.colors.isDark ? '#35635E' : preferences.colors.ink }}
              disabled={isUpdating || preferences.loading}
            />
          </View>
          <View style={styles.menuItem}>
            <Text style={styles.menuLabel}>
              {Platform.OS === 'ios' ? 'Face ID / Touch ID' : 'Fingerprint / Face unlock'}
            </Text>
            <Switch
              value={preferences.biometricEnabled}
              onValueChange={(enabled) => void toggleBiometrics(enabled)}
              trackColor={{ false: '#777', true: preferences.colors.isDark ? '#35635E' : preferences.colors.ink }}
              disabled={isUpdating || preferences.loading}
            />
          </View>
          <View style={styles.divider} />
          <Pressable style={styles.menuItemAction} onPress={() => go('privacyPolicy')}>
            <Text style={styles.menuLabel}>Privacy Policy</Text>
            <AngleRightIcon width={12} height={12} fill={preferences.colors.textMuted} />
          </Pressable>
          <Pressable style={styles.menuItemAction} onPress={() => go('termsOfService')}>
            <Text style={styles.menuLabel}>Terms of Service</Text>
            <AngleRightIcon width={12} height={12} fill={preferences.colors.textMuted} />
          </Pressable>
          <Pressable style={[styles.menuItemAction, { borderBottomWidth: 0 }]}>
            <Text style={[styles.menuLabel, { color: preferences.colors.red }]}>Delete Account</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const createStyles = (colors: AppColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 60, paddingBottom: 20, paddingHorizontal: 24 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.5)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '900', color: colors.ink || '#000' },
  content: { paddingHorizontal: 24 },
  menuContainer: { backgroundColor: colors.surface, borderRadius: 24, paddingVertical: 10, paddingHorizontal: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 3 },
  menuItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.border },
  menuItemAction: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: colors.border },
  menuLabel: { flex: 1, fontSize: 14, fontWeight: '700', color: colors.ink },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: 4 },
});