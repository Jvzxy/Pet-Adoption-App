import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import ImageHolder from '../components/ImageHolder';
import { colors, radii, spacing } from '../constants/theme';
import { CAT_DATA } from '../data/cats';

const CATEGORIES = ['All', 'Breed', 'Toys', 'Accessories'];

export default function HomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.fillMint}>
      <Text style={styles.screenLabel}>Home</Text>

      {/* Top Header Bar */}
      <View style={styles.topBar}>
        <Text style={styles.topIcon}>☰</Text>
        <Text style={styles.topBrand}>PAWFECT CATS 🐾</Text>
        <View style={styles.rightIcons}>
          <Text style={styles.topIcon}>♡</Text>
          <Text style={styles.topIcon}>🔔</Text>
        </View>
      </View>
      <Text style={styles.topSub}>CAGAYAN DE ORO CITY</Text>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Search Bar */}
        <View style={styles.searchBar}>
          <Text style={{ marginRight: 8, opacity: 0.5 }}>🔍</Text>
          <Text style={{ color: colors.textMuted, fontSize: 12 }}>Search kitten or accessory...</Text>
        </View>

        {/* Banner Card */}
        <View style={styles.heroCard}>
          <View style={styles.heroTextContainer}>
            <Text style={styles.heroText}>LIVE.{"\n"}LOVE.{"\n"}MEOW.</Text>
            <View style={styles.adoptBtn}>
              <Text style={styles.adoptBtnText}>Adopt now ➔</Text>
            </View>
          </View>
          <ImageHolder
            uri={CAT_DATA[2].imageUri}
            containerStyle={styles.heroImage}
          />
        </View>

        {/* Category Pills */}
        <View style={styles.catRow}>
          {CATEGORIES.map((c, index) => (
            <View key={c} style={[styles.catPill, index === 0 ? styles.catPillActive : styles.catPillInactive]}>
              <Text style={[styles.catPillText, index === 0 ? styles.catPillTextActive : styles.catPillTextInactive]}>{c}</Text>
            </View>
          ))}
        </View>

        {/* Header section */}
        <View style={styles.gridHeader}>
          <Text style={styles.gridTitle}>Adopt pet ({CAT_DATA.length} available)</Text>
          <Text style={styles.gridSeeAll}>See all</Text>
        </View>

        {/* Dynamic Items Grid -> Navigates to /details/[id] */}
        <View style={styles.grid}>
          {CAT_DATA.map((cat) => (
            <Pressable
              key={cat.id}
              style={({ pressed }) => [styles.gridItem, pressed && { opacity: 0.85 }]}
              onPress={() => router.push(`/details/${cat.id}` as any)}
            >
              <ImageHolder
                uri={cat.imageUri}
                containerStyle={styles.gridImage}
                borderRadius={radii.sm - 2}
              />
              <View style={styles.gridMeta}>
                <Text style={styles.gridName}>{cat.name}</Text>
                <Text style={styles.gridBreed}>{cat.breed}</Text>
                <Text style={styles.gridSub}>Age: {cat.age}</Text>
              </View>
            </Pressable>
          ))}
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNavWrapper}>
        <View style={styles.bottomNav}>
          <Pressable onPress={() => router.push('/home')} style={[styles.navItem, styles.navItemActive]}>
            <Text style={styles.navIcon}>🏠</Text>
            <Text style={styles.navLabel}>Home</Text>
          </Pressable>
          <Pressable onPress={() => router.push('/chat')} style={styles.navItem}>
            <Text style={styles.navIcon}>💬</Text>
          </Pressable>
          <Pressable onPress={() => router.push('/cart')} style={styles.navItem}>
            <Text style={styles.navIcon}>🛒</Text>
          </Pressable>
          <Pressable onPress={() => router.push('/profile')} style={styles.navItem}>
            <Text style={styles.navIcon}>👤</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fillMint: { flex: 1, backgroundColor: colors.mint },
  screenLabel: { position: 'absolute', top: 40, left: 16, fontSize: 12, color: colors.textMuted, opacity: 0.5, zIndex: 10 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.md, paddingTop: 50 },
  topIcon: { fontSize: 18, color: colors.ink },
  rightIcons: { flexDirection: 'row', gap: 12 },
  topBrand: { fontSize: 14, fontWeight: '900', color: colors.ink },
  topSub: { fontSize: 9, fontWeight: '700', letterSpacing: 0.5, color: colors.ink, textAlign: 'center', marginTop: 2, marginBottom: spacing.md },
  content: { flex: 1, paddingHorizontal: spacing.md },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, height: 40, borderRadius: radii.pill, paddingHorizontal: 16, marginBottom: spacing.md },
  heroCard: { flexDirection: 'row', backgroundColor: colors.ink, borderRadius: radii.md, height: 120, overflow: 'hidden', marginBottom: spacing.md },
  heroTextContainer: { flex: 1, justifyContent: 'center', paddingLeft: 20 },
  heroText: { fontSize: 18, fontWeight: '900', lineHeight: 22, color: colors.white, marginBottom: 8 },
  adoptBtn: { backgroundColor: colors.white, paddingHorizontal: 12, paddingVertical: 4, borderRadius: radii.pill, alignSelf: 'flex-start' },
  adoptBtnText: { fontSize: 9, fontWeight: '800', color: colors.ink },
  heroImage: { width: 110, height: '100%', backgroundColor: 'transparent' },
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
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', paddingBottom: 100 },
  gridItem: { width: '48%', backgroundColor: colors.white, borderRadius: radii.sm, padding: 6, marginBottom: 12 },
  gridImage: { width: '100%', height: 100, marginBottom: 6 },
  gridMeta: { paddingHorizontal: 4, paddingBottom: 4 },
  gridName: { fontSize: 13, fontWeight: '800', color: colors.ink },
  gridBreed: { fontSize: 10, fontWeight: '600', color: colors.ink },
  gridSub: { fontSize: 10, color: colors.textMuted },
  bottomNavWrapper: { position: 'absolute', bottom: 25, left: 0, right: 0, alignItems: 'center' },
  bottomNav: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', backgroundColor: colors.white, width: '88%', borderRadius: radii.pill, height: 56, paddingHorizontal: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 },
  navItem: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: radii.pill },
  navItemActive: { backgroundColor: colors.mint },
  navIcon: { fontSize: 16, color: colors.ink },
  navLabel: { fontSize: 12, fontWeight: '800', color: colors.ink },
});