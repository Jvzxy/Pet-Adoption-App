import React, { useState } from 'react';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { colors } from '../constants/theme';
import AngleLeftIcon from '../images/Icons/angle-left-solid-full.svg';
import AngleRightIcon from '../images/Icons/angle-right-solid-full (1).svg';

interface ScreenProps {
  go: (next: string) => void;
}

export default function SettingsScreen({ go }: ScreenProps) {
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [faceId, setFaceId] = useState(true);

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Pressable onPress={() => go('profile')} style={styles.backBtn} hitSlop={10}>
          <AngleLeftIcon width={18} height={18} fill={colors.ink} />
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
              trackColor={{ false: "#ccc", true: colors.ink }}
            />
          </View>
          <View style={styles.menuItem}>
            <Text style={styles.menuLabel}>Dark Mode</Text>
            <Switch 
              value={darkMode} 
              onValueChange={setDarkMode} 
              trackColor={{ false: "#ccc", true: colors.ink }}
            />
          </View>
          <View style={styles.menuItem}>
            <Text style={styles.menuLabel}>Face ID / Touch ID</Text>
            <Switch 
              value={faceId} 
              onValueChange={setFaceId} 
              trackColor={{ false: "#ccc", true: colors.ink }}
            />
          </View>
          <View style={styles.divider} />
          <Pressable style={styles.menuItemAction} onPress={() => go('privacyPolicy')}>
            <Text style={styles.menuLabel}>Privacy Policy</Text>
            <AngleRightIcon width={12} height={12} fill="rgba(0,0,0,0.3)" />
          </Pressable>
          <Pressable style={styles.menuItemAction} onPress={() => go('termsOfService')}>
            <Text style={styles.menuLabel}>Terms of Service</Text>
            <AngleRightIcon width={12} height={12} fill="rgba(0,0,0,0.3)" />
          </Pressable>
          <Pressable style={[styles.menuItemAction, { borderBottomWidth: 0 }]}>
            <Text style={[styles.menuLabel, { color: '#D32F2F' }]}>Delete Account</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.mint || '#A8DDD6' },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 60, paddingBottom: 20, paddingHorizontal: 24 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.5)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '900', color: colors.ink || '#000' },
  content: { paddingHorizontal: 24 },
  menuContainer: { backgroundColor: colors.white, borderRadius: 24, paddingVertical: 10, paddingHorizontal: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 3 },
  menuItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  menuItemAction: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  menuLabel: { flex: 1, fontSize: 14, fontWeight: '700', color: colors.ink },
  divider: { height: 1, backgroundColor: '#EEEEEE', marginVertical: 4 },
});