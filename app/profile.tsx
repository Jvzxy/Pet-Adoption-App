import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radii } from '../constants/theme';

export default function ProfileScreen() {
  const router = useRouter();

  return (
    <View style={styles.fillMint}>
      <Text style={styles.screenLabel}>Profile</Text>
      <View style={styles.topBar}>
        <Text style={styles.title}>PAWFECT CATS 🐾</Text>
      </View>

      <View style={styles.bottomNavWrapper}>
        <View style={styles.bottomNav}>
          <Pressable onPress={() => router.push('/home')} style={styles.navItem}><Text style={styles.navIcon}>🏠</Text></Pressable>
          <Pressable onPress={() => router.push('/chat')} style={styles.navItem}><Text style={styles.navIcon}>💬</Text></Pressable>
          <Pressable onPress={() => router.push('/cart')} style={styles.navItem}><Text style={styles.navIcon}>🛒</Text></Pressable>
          <Pressable onPress={() => router.push('/profile')} style={[styles.navItem, styles.navItemActive]}><Text style={styles.navIcon}>👤</Text><Text style={styles.navLabel}>Profile</Text></Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fillMint: { flex: 1, backgroundColor: colors.mint },
  screenLabel: { position: 'absolute', top: 40, left: 16, fontSize: 12, color: colors.textMuted, opacity: 0.5 },
  topBar: { alignItems: 'center', paddingTop: 50 },
  title: { fontSize: 14, fontWeight: '900', color: colors.ink },
  bottomNavWrapper: { position: 'absolute', bottom: 25, left: 0, right: 0, alignItems: 'center' },
  bottomNav: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', backgroundColor: colors.white, width: '88%', borderRadius: radii.pill, height: 56, paddingHorizontal: 10 },
  navItem: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: radii.pill },
  navItemActive: { backgroundColor: colors.mint },
  navIcon: { fontSize: 16 },
  navLabel: { fontSize: 12, fontWeight: '800' },
});