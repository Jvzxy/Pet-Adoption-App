import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radii, spacing } from '../constants/theme';

export default function ChatScreen() {
  const router = useRouter();

  return (
    <View style={styles.fillMint}>
      <Text style={styles.screenLabel}>Chat</Text>
      <View style={styles.topBar}>
        <Text style={styles.title}>Jussy Jay</Text>
        <Text style={styles.icon}>🔍</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.chatCard}><Text style={styles.chatName}>Jussy Jay Davele</Text></View>
        <View style={styles.chatCard}><Text style={styles.chatName}>Anjelica Balaneus</Text></View>
      </View>

      {/* Bottom Nav */}
      <View style={styles.bottomNavWrapper}>
        <View style={styles.bottomNav}>
          <Pressable onPress={() => router.push('/home')} style={styles.navItem}><Text style={styles.navIcon}>🏠</Text></Pressable>
          <Pressable onPress={() => router.push('/chat')} style={[styles.navItem, styles.navItemActive]}><Text style={styles.navIcon}>💬</Text><Text style={styles.navLabel}>Chat</Text></Pressable>
          <Pressable onPress={() => router.push('/cart')} style={styles.navItem}><Text style={styles.navIcon}>🛒</Text></Pressable>
          <Pressable onPress={() => router.push('/profile')} style={styles.navItem}><Text style={styles.navIcon}>👤</Text></Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fillMint: { flex: 1, backgroundColor: colors.mint },
  screenLabel: { position: 'absolute', top: 40, left: 16, fontSize: 12, color: colors.textMuted, opacity: 0.5 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingTop: 50 },
  title: { fontSize: 16, fontWeight: '800', color: colors.ink },
  icon: { fontSize: 16 },
  content: { padding: spacing.lg },
  chatCard: { backgroundColor: '#FAD285', padding: 12, borderRadius: radii.sm, marginBottom: 10 },
  chatName: { fontSize: 12, fontWeight: '800', color: colors.ink },
  bottomNavWrapper: { position: 'absolute', bottom: 25, left: 0, right: 0, alignItems: 'center' },
  bottomNav: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', backgroundColor: colors.white, width: '88%', borderRadius: radii.pill, height: 56, paddingHorizontal: 10 },
  navItem: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: radii.pill },
  navItemActive: { backgroundColor: colors.mint },
  navIcon: { fontSize: 16 },
  navLabel: { fontSize: 12, fontWeight: '800' },
});