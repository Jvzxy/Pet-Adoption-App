import React, { useState } from 'react';
import { FlatList, Image, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radii, spacing } from '../constants/theme';
import { CAT_DATA } from '../data/cats';

// Image Imports
import cat3Img from '../images/Cats/Cat3.png';

// SVG Icon Imports
import BellIcon from '../images/Icons/bell-solid-full.svg';
import CartIcon from '../images/Icons/cart-shopping-solid-full.svg';
import CommentIcon from '../images/Icons/comment-solid-full.svg';
import HeartIcon from '../images/Icons/heart-regular-full.svg';
import HouseIcon from '../images/Icons/house-solid-full.svg';
import SearchIcon from '../images/Icons/magnifying-glass-solid-full.svg';
import LogoutIcon from '../images/Icons/right-from-bracket-solid-full.svg';
import UserIcon from '../images/Icons/user-solid-full.svg';

interface ScreenProps {
  go: (next: string, id?: string) => void;
}

const CATEGORIES = ['All', 'Breed', 'Toys', 'Accessories'];
const NAV_ITEMS = [
  { key: 'home', Icon: HouseIcon, label: 'Home', active: true },
  { key: 'chat', Icon: CommentIcon, label: 'Chat', active: false },
  { key: 'cart', Icon: CartIcon, label: 'Cart', active: false },
  { key: 'profile', Icon: UserIcon, label: 'Profile', active: false },
];

const SIDEBAR_MENU = [
  { key: 'home', label: 'Home', Icon: HouseIcon },
  { key: 'chat', label: 'Messages', Icon: CommentIcon },
  { key: 'cart', label: 'My Cart', Icon: CartIcon },
  { key: 'favorites', label: 'Favorites', Icon: HeartIcon },
  { key: 'profile', label: 'My Profile', Icon: UserIcon },
];

export default function MainScreen({ go }: ScreenProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const renderHeader = () => (
    <>
      <View style={styles.searchBar}>
        <SearchIcon width={16} height={16} fill={colors.textMuted} style={{ marginRight: 10 }} />
        <Text style={{ color: colors.textMuted, fontSize: 13, fontWeight: '500' }}>Search</Text>
      </View>

      {/* Hero Banner */}
      <View style={styles.heroCard}>
        <View style={styles.heroTextContainer}>
          <Text style={styles.heroText}>LIVE.{"\n"}LOVE.{"\n"}MEOW.</Text>
          <View style={styles.adoptBtn}>
            <Text style={styles.adoptBtnText}>Adopt now ➔</Text>
          </View>
        </View>

        <View style={styles.heroImageWrapper}>
          <View style={styles.heroCircle} />
          <Image 
            source={cat3Img} 
            style={styles.heroCatImage} 
            resizeMode="contain" 
          />
        </View>
      </View>

      <View style={styles.catRow}>
        {CATEGORIES.map((c, index) => (
          <View key={c} style={[styles.catPill, index === 0 ? styles.catPillActive : styles.catPillInactive]}>
            <Text style={[styles.catPillText, index === 0 ? styles.catPillTextActive : styles.catPillTextInactive]}>{c}</Text>
          </View>
        ))}
      </View>

      <View style={styles.gridHeader}>
        <Text style={styles.gridTitle}>Adopt pet</Text>
        <Text style={styles.gridSeeAll}>See all</Text>
      </View>
    </>
  );

  return (
    <View style={styles.fillMint}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <Pressable onPress={() => setIsSidebarOpen(true)} hitSlop={10}>
          <Text style={styles.topIconMenu}>☰</Text>
        </Pressable>
        <View style={styles.titleContainer}>
          <Text style={styles.topBrand}>🐾 PAWFECT CATS</Text>
          <Text style={styles.topSub}>CAGAYAN DE ORO CITY</Text>
        </View>
        <View style={styles.rightIcons}>
          <HeartIcon width={22} height={22} fill={colors.ink} />
          <BellIcon width={22} height={22} fill={colors.ink} />
        </View>
      </View>

      {/* Side Drawer Modal */}
      <Modal
        visible={isSidebarOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsSidebarOpen(false)}
      >
        <View style={styles.modalOverlay}>
          {/* Backdrop Click area */}
          <Pressable style={styles.backdrop} onPress={() => setIsSidebarOpen(false)} />

          {/* Sidebar Menu Drawer */}
          <View style={styles.sidebar}>
            <View>
              <View style={styles.sidebarHeader}>
                <View>
                  <Text style={styles.sidebarTitle}>🐾 PAWFECT</Text>
                  <Text style={styles.sidebarSub}>CAT ADOPTION</Text>
                </View>
                <Pressable onPress={() => setIsSidebarOpen(false)} hitSlop={10}>
                  <Text style={styles.closeBtn}>✕</Text>
                </Pressable>
              </View>

              <View style={styles.menuList}>
                {SIDEBAR_MENU.map(({ key, label, Icon }) => (
                  <Pressable
                    key={key}
                    style={styles.sidebarItem}
                    onPress={() => {
                      setIsSidebarOpen(false);
                      go(key);
                    }}
                  >
                    <Icon width={20} height={20} fill={colors.ink} />
                    <Text style={styles.sidebarItemText}>{label}</Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Logout Button at Bottom */}
            <Pressable
              style={styles.logoutButton}
              onPress={() => {
                setIsSidebarOpen(false);
                go('login');
              }}
            >
              <LogoutIcon width={20} height={20} fill="#D32F2F" />
              <Text style={styles.logoutText}>Logout</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <FlatList
        data={[...CAT_DATA]}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.rowWrapper}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={renderHeader}
        renderItem={({ item }) => (
          <Pressable 
            style={styles.gridItem}
            onPress={() => go('details', item.id)}
          >
            <View style={styles.gridImageContainer}>
              {item.imageUri ? (
                <Image 
                  source={{ uri: item.imageUri }} 
                  style={styles.catImage} 
                  resizeMode="cover" 
                />
              ) : (
                <Text style={{ fontSize: 32 }}>🐾</Text>
              )}
            </View>
            <View style={styles.gridMetaContainer}>
              <View style={styles.gridMeta}>
                <Text style={styles.gridName} numberOfLines={1}>Name: {item.name}</Text>
                <Text style={styles.gridSub}>Age: {item.age}</Text>
              </View>
              <View style={styles.arrowIcon}>
                <Text style={{ color: colors.white, fontSize: 10, fontWeight: 'bold' }}>↗</Text>
              </View>
            </View>
          </Pressable>
        )}
      />

      {/* Floating Bottom Nav */}
      <View style={styles.bottomNavWrapper}>
        <View style={styles.bottomNav}>
          {NAV_ITEMS.map(({ key, Icon, label, active }) => (
            <Pressable
              key={key}
              onPress={() => key !== 'home' && go(key)}
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
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingTop: 60, paddingBottom: 20 },
  topIconMenu: { fontSize: 24, color: colors.ink, fontWeight: 'bold' },
  titleContainer: { alignItems: 'center' },
  topBrand: { fontSize: 18, fontWeight: '900', color: colors.ink },
  topSub: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5, color: colors.ink, textAlign: 'center', marginTop: 2 },
  rightIcons: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  listContent: { paddingHorizontal: spacing.lg, paddingBottom: 110 },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#E8F5E9', height: 46, borderRadius: radii.pill, paddingHorizontal: 20, marginBottom: 24 },
  
  // Sidebar Styles
  modalOverlay: { flex: 1, flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.4)' },
  backdrop: { flex: 1 },
  sidebar: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: '75%',
    backgroundColor: colors.white,
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 40,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 10,
  },
  sidebarHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 36 },
  sidebarTitle: { fontSize: 20, fontWeight: '900', color: colors.ink },
  sidebarSub: { fontSize: 10, fontWeight: '800', color: colors.textMuted, letterSpacing: 0.5 },
  closeBtn: { fontSize: 22, fontWeight: 'bold', color: colors.ink },
  menuList: { gap: 12 },
  sidebarItem: { flexDirection: 'row', alignItems: 'center', gap: 16, paddingVertical: 12, paddingHorizontal: 12, borderRadius: 12 },
  sidebarItemText: { fontSize: 15, fontWeight: '700', color: colors.ink },
  logoutButton: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 14, paddingHorizontal: 12, borderTopWidth: 1, borderColor: '#EEEEEE', marginTop: 'auto' },
  logoutText: { fontSize: 15, fontWeight: '800', color: '#D32F2F' },

  // Hero Section Layout
  heroCard: { 
    flexDirection: 'row', 
    backgroundColor: colors.ink, 
    borderRadius: 24, 
    height: 160, 
    overflow: 'hidden', 
    marginBottom: 24,
    paddingLeft: 24,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroTextContainer: { flex: 1, justifyContent: 'center' },
  heroText: { fontSize: 22, fontWeight: '900', lineHeight: 28, color: colors.white, marginBottom: 12 },
  adoptBtn: { backgroundColor: colors.white, paddingHorizontal: 16, paddingVertical: 8, borderRadius: radii.pill, alignSelf: 'flex-start' },
  adoptBtnText: { fontSize: 11, fontWeight: '900', color: colors.ink },
  
  // Hero Image & Circle Layout
  heroImageWrapper: { 
    width: 140, 
    height: '100%', 
    justifyContent: 'center', 
    alignItems: 'center',
    position: 'relative',
  },
  heroCircle: { 
    width: 115, 
    height: 115, 
    borderRadius: 57.5, 
    backgroundColor: colors.mint,
    position: 'absolute',
    right: 12,
  },
  heroCatImage: { 
    width: 130, 
    height: 150, 
    position: 'absolute',
    bottom: 0,
    right: 5,
  },

  catRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  catPill: { paddingHorizontal: 18, paddingVertical: 10, borderRadius: radii.pill },
  catPillActive: { backgroundColor: colors.white },
  catPillInactive: { backgroundColor: colors.ink },
  catPillText: { fontSize: 12, fontWeight: '800' },
  catPillTextActive: { color: colors.ink },
  catPillTextInactive: { color: colors.white },
  gridHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  gridTitle: { fontSize: 16, fontWeight: '900', color: colors.ink },
  gridSeeAll: { fontSize: 12, fontWeight: '800', color: colors.ink },
  rowWrapper: { justifyContent: 'space-between' },
  gridItem: { width: '47%', backgroundColor: colors.white, borderRadius: 16, padding: 8, marginBottom: 16 },
  gridImageContainer: { width: '100%', height: 110, borderRadius: 12, marginBottom: 8, backgroundColor: '#E0F2F1', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  catImage: { width: '100%', height: '100%' },
  gridMetaContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', paddingHorizontal: 4, paddingBottom: 4 },
  gridMeta: { flex: 1 },
  gridName: { fontSize: 11, fontWeight: '900', color: colors.ink },
  gridSub: { fontSize: 10, fontWeight: '600', color: colors.textMuted, marginTop: 2 },
  arrowIcon: { backgroundColor: '#B2DFDB', width: 24, height: 24, borderRadius: 6, justifyContent: 'center', alignItems: 'center' },
  bottomNavWrapper: { position: 'absolute', bottom: 35, left: 0, right: 0, alignItems: 'center' },
  bottomNav: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', backgroundColor: colors.white, width: '85%', borderRadius: 100, height: 65, paddingHorizontal: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 20, elevation: 10 },
  navItem: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingVertical: 10, borderRadius: radii.pill },
  navItemActive: { backgroundColor: colors.mint },
  navLabel: { fontSize: 14, fontWeight: '900', color: colors.ink },
});