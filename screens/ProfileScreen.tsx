import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radii } from '../constants/theme';

import CartIcon from '../images/Icons/cart-shopping-solid-full.svg';
import CommentIcon from '../images/Icons/comment-solid-full.svg';
import HouseIcon from '../images/Icons/house-solid-full.svg';
import UserIcon from '../images/Icons/user-solid-full.svg';

interface ScreenProps {
  go: (next: string) => void;
}

const NAV_ITEMS = [
  { key: 'main', Icon: HouseIcon, label: 'Home', active: false },
  { key: 'chat', Icon: CommentIcon, label: 'Chat', active: false },
  { key: 'cart', Icon: CartIcon, label: 'Cart', active: false },
  { key: 'profile', Icon: UserIcon, label: 'Profile', active: true },
];

export default function ProfileScreen({ go }: ScreenProps) {
  return (
    <View style={styles.fillMint}>
      <View style={styles.topBar}>
        <Text style={styles.title}>PAWFECT CATS 🐾</Text>
      </View>

      <View style={styles.content}>
        <Pressable 
          onPress={() => go('adminAddCat')}
          style={styles.adminButton}
        >
          <Text style={styles.adminButtonText}>
            + Admin: Add New Cat
          </Text>
        </Pressable>
      </View>

      {/* Floating Bottom Nav */}
      <View style={styles.bottomNavWrapper}>
        <View style={styles.bottomNav}>
          {NAV_ITEMS.map(({ key, Icon, label, active }) => (
            <Pressable
              key={key}
              onPress={() => !active && go(key)}
              style={[styles.navItem, active && styles.navItemActive]}
            >
              <Icon width={20} height={20} fill={colors.ink} />
              {active && <Text style={styles.navLabel}>{label}</Text>}
            </Pressable>
          ))}
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
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 },
  adminButton: { backgroundColor: colors.ink, paddingVertical: 16, paddingHorizontal: 20, borderRadius: radii.md, width: '100%', maxWidth: 300 },
  adminButtonText: { color: colors.white, fontWeight: 'bold', textAlign: 'center', fontSize: 16 },
  
  // Consistent Nav Styles
  bottomNavWrapper: { position: 'absolute', bottom: 35, left: 0, right: 0, alignItems: 'center' },
  bottomNav: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', backgroundColor: colors.white, width: '85%', borderRadius: 100, height: 65, paddingHorizontal: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 20, elevation: 10 },
  navItem: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingVertical: 10, borderRadius: radii.pill },
  navItemActive: { backgroundColor: colors.mint },
  navLabel: { fontSize: 14, fontWeight: '900', color: colors.ink },
});