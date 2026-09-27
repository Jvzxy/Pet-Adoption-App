import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radii } from '../constants/theme';

interface ScreenProps {
  go: (next: string) => void;
}

export default function ProfileScreen({ go }: ScreenProps) {
  return (
    <View style={styles.fillMint}>
      <Text style={styles.screenLabel}>Profile</Text>
      <View style={styles.topBar}>
        <Text style={styles.title}>PAWFECT CATS 🐾</Text>
      </View>

      {/* Main Content Area */}
      <View style={styles.content}>
        {/* Admin Access Button */}
        <Pressable 
          onPress={() => go('adminAddCat')}
          style={styles.adminButton}
        >
          <Text style={styles.adminButtonText}>
            + Admin: Add New Cat
          </Text>
        </Pressable>
      </View>

      {/* Bottom Nav */}
      <View style={styles.bottomNavWrapper}>
        <View style={styles.bottomNav}>
          <Pressable onPress={() => go('main')} style={styles.navItem}>
            <Text style={styles.navIcon}>🏠</Text>
          </Pressable>
          <Pressable onPress={() => go('chat')} style={styles.navItem}>
            <Text style={styles.navIcon}>💬</Text>
          </Pressable>
          <Pressable onPress={() => go('cart')} style={styles.navItem}>
            <Text style={styles.navIcon}>🛒</Text>
          </Pressable>
          <Pressable onPress={() => go('profile')} style={[styles.navItem, styles.navItemActive]}>
            <Text style={styles.navIcon}>👤</Text>
            <Text style={styles.navLabel}>Profile</Text>
          </Pressable>
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
  
  // Added content container and admin button styles
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 },
  adminButton: { backgroundColor: colors.ink, paddingVertical: 16, paddingHorizontal: 20, borderRadius: radii.md, width: '100%', maxWidth: 300 },
  adminButtonText: { color: colors.white, fontWeight: 'bold', textAlign: 'center', fontSize: 16 },

  bottomNavWrapper: { position: 'absolute', bottom: 25, left: 0, right: 0, alignItems: 'center' },
  bottomNav: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', backgroundColor: colors.white, width: '88%', borderRadius: radii.pill, height: 56, paddingHorizontal: 10 },
  navItem: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: radii.pill },
  navItemActive: { backgroundColor: colors.mint },
  navIcon: { fontSize: 16 },
  navLabel: { fontSize: 12, fontWeight: '800' },
});