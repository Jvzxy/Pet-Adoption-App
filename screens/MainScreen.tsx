import React from 'react';
import { FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import ScreenLabel from '../components/ScreenLabel';
import { colors, radii, spacing } from '../constants/theme';
import { CAT_DATA } from '../data/cats';

interface ScreenProps {
  go: (next: string, id?: string) => void;
}

const CATEGORIES = ['All', 'Breed', 'Toys', 'Accessories'];
const NAV_ITEMS = [
  { key: 'home', icon: '🏠', label: 'Home', active: true },
  { key: 'chat', icon: '💬', label: 'Chat', active: false },
  { key: 'cart', icon: '🛒', label: 'Cart', active: false },
  { key: 'profile', icon: '👤', label: 'Profile', active: false },
];

export default function MainScreen({ go }: ScreenProps) {
  const renderHeader = () => (
    <>
      <View style={styles.searchBar}>
        <Text style={{ marginRight: 8, opacity: 0.5 }}>🔍</Text>
        <Text style={{ color: colors.textMuted, fontSize: 12 }}>Search...</Text>
      </View>

      <View style={styles.heroCard}>
        <View style={styles.heroTextContainer}>
          <Text style={styles.heroText}>LIVE.{"\n"}LOVE.{"\n"}MEOW.</Text>
          <View style={styles.adoptBtn}>
            <Text style={styles.adoptBtnText}>Adopt now ➔</Text>
          </View>
        </View>
        <View style={styles.heroEmojiContainer}>
          <Text style={{ fontSize: 44 }}>🐱</Text>
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
      <ScreenLabel>Home</ScreenLabel>

      <View style={styles.topBar}>
        <Text style={styles.topIcon}>☰</Text>
        <Text style={styles.topBrand}>PAWFECT CATS 🐾</Text>
        <View style={styles.rightIcons}>
          <Text style={styles.topIcon}>♡</Text>
          <Text style={styles.topIcon}>🔔</Text>
        </View>
      </View>
      <Text style={styles.topSub}>CAGAYAN DE ORO CITY</Text>

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
            <View style={styles.gridMeta}>
              <Text style={styles.gridName} numberOfLines={1}>{item.name}</Text>
              <Text style={styles.gridSub}>Age: {item.age}</Text>
            </View>
          </Pressable>
        )}
      />

      <View style={styles.bottomNavWrapper}>
        <View style={styles.bottomNav}>
          {NAV_ITEMS.map((item) => (
            <Pressable
              key={item.key}
              onPress={() => item.key !== 'home' && go(item.key)}
              style={[styles.navItem, item.active && styles.navItemActive]}
            >
              <Text style={[styles.navIcon, item.active && { opacity: 1 }]}>{item.icon}</Text>
              {item.active && <Text style={styles.navLabel}>{item.label}</Text>}
            </Pressable>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fillMint: { flex: 1, backgroundColor: colors.mint },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.md, paddingTop: 50 },
  topIcon: { fontSize: 18, color: colors.ink },
  rightIcons: { flexDirection: 'row', gap: 12 },
  topBrand: { fontSize: 14, fontWeight: '900', color: colors.ink },
  topSub: { fontSize: 9, fontWeight: '700', letterSpacing: 0.5, color: colors.ink, textAlign: 'center', marginTop: 2, marginBottom: spacing.md },
  listContent: { paddingHorizontal: spacing.md, paddingBottom: 100 },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, height: 40, borderRadius: radii.pill, paddingHorizontal: 16, marginBottom: spacing.md },
  heroCard: { flexDirection: 'row', backgroundColor: colors.ink, borderRadius: radii.md, height: 120, overflow: 'hidden', marginBottom: spacing.md },
  heroTextContainer: { flex: 1, justifyContent: 'center', paddingLeft: 20 },
  heroText: { fontSize: 18, fontWeight: '900', lineHeight: 22, color: colors.white, marginBottom: 8 },
  heroEmojiContainer: { width: 90, justifyContent: 'center', alignItems: 'center', paddingRight: 10 },
  adoptBtn: { backgroundColor: colors.white, paddingHorizontal: 12, paddingVertical: 4, borderRadius: radii.pill, alignSelf: 'flex-start' },
  adoptBtnText: { fontSize: 9, fontWeight: '800', color: colors.ink },
  catRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.md },
  catPill: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: radii.pill },
  catPillActive: { backgroundColor: colors.white },
  catPillInactive: { backgroundColor: colors.ink },
  catPillText: { fontSize: 11, fontWeight: '700' },
  catPillTextActive: { color: colors.ink },
  catPillTextInactive: { color: colors.white },
  gridHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  gridTitle: { fontSize: 13, fontWeight: '800', color: colors.ink },
  gridSeeAll: { fontSize: 11, fontWeight: '700', color: colors.ink, textDecorationLine: 'underline' },
  rowWrapper: { justifyContent: 'space-between' },
  gridItem: { width: '48%', backgroundColor: colors.white, borderRadius: radii.sm, padding: 6, marginBottom: 12 },
  gridImageContainer: { width: '100%', height: 90, borderRadius: radii.sm - 2, marginBottom: 6, backgroundColor: '#E0F2F1', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  catImage: { width: '100%', height: '100%' },
  gridMeta: { paddingHorizontal: 4, paddingBottom: 4 },
  gridName: { fontSize: 12, fontWeight: '800', color: colors.ink },
  gridSub: { fontSize: 10, color: colors.textMuted },
  bottomNavWrapper: { position: 'absolute', bottom: 30, left: 0, right: 0, alignItems: 'center' },
  bottomNav: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', backgroundColor: colors.white, width: '85%', borderRadius: radii.pill, height: 56, paddingHorizontal: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 },
  navItem: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: radii.pill },
  navItemActive: { backgroundColor: colors.mint },
  navIcon: { fontSize: 16, color: colors.ink },
  navLabel: { fontSize: 12, fontWeight: '800', color: colors.ink },
});