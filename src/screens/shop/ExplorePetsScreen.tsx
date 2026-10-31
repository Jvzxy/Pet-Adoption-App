import React from "react";
import { FlatList, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { colors, radii, spacing } from "../../constants/theme";
import { CAT_DATA } from "../../data/cats";

import AngleLeftIcon from "../../images/Icons/angle-left-solid-full.svg";
import HeartIcon from "../../images/Icons/heart-regular-full.svg";

interface ScreenProps {
  go: (next: string, id?: string) => void;
  favorites: string[];
  toggleFavorite: (id: string) => void;
}

export default function ExplorePetsScreen({ go, favorites, toggleFavorite }: ScreenProps) {
  // 1. Filter the global data so only items marked as 'pet' are shown
  const petItems = CAT_DATA.filter(item => item.type === 'pet');

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => go("main")} hitSlop={10} style={styles.backButton}>
          <AngleLeftIcon width={18} height={18} fill={colors.ink || "#000"} />
        </Pressable>
        <Text style={styles.headerTitle}>Explore Pets</Text>
        <View style={{ width: 40 }} />
      </View>

      <FlatList
        data={petItems} // 2. Use the filtered pet list
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.rowWrapper}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>🐾</Text>
            <Text style={styles.emptyText}>No pets available right now.</Text>
          </View>
        }
        renderItem={({ item }) => {
          const isFavorite = favorites.includes(item.id);
          return (
            <Pressable style={styles.gridItem} onPress={() => go("details", item.id)}>
              <View style={styles.gridImageContainer}>
                <Image source={{ uri: item.imageUri }} style={styles.petImage} resizeMode="cover" />
                <Pressable
                  style={styles.cardFavoriteIcon}
                  onPress={() => toggleFavorite(item.id)}
                  hitSlop={10}
                >
                  <HeartIcon width={14} height={14} fill={isFavorite ? "#FF2D55" : colors.ink || "#000"} />
                </Pressable>
              </View>
              <View style={styles.gridMetaContainer}>
                <Text style={styles.gridName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.gridSub}>Age: {item.age}</Text>
                <View style={styles.priceRow}>
                  {/* 3. Dynamically show the assigned price or default to Free Adoption */}
                  <Text style={styles.priceText} numberOfLines={1}>
                    {!item.price || item.price.toLowerCase() === "free" ? "Free Adoption" : item.price}
                  </Text>
                  <View style={styles.actionBtn}><Text style={styles.actionBtnText}>↗</Text></View>
                </View>
              </View>
            </Pressable>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.mint || "#A8DDD6" },
  header: { 
    flexDirection: "row", 
    alignItems: "center", 
    justifyContent: "space-between", 
    paddingHorizontal: 24, 
    paddingTop: 60, 
    paddingBottom: 20 
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { fontSize: 18, fontWeight: "900", color: colors.ink || "#000" },
  listContent: { paddingHorizontal: 20, paddingBottom: 110, paddingTop: 10 },
  rowWrapper: { justifyContent: "space-between" },
  gridItem: { width: "48%", backgroundColor: colors.white || "#FFF", borderRadius: 20, padding: 10, marginBottom: 16, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 10, elevation: 3 },
  gridImageContainer: { width: "100%", height: 115, borderRadius: 14, marginBottom: 10, backgroundColor: "#F4FAF8", overflow: "hidden", position: "relative" },
  cardFavoriteIcon: { position: "absolute", top: 8, right: 8, backgroundColor: "rgba(255,255,255,0.9)", padding: 6, borderRadius: 12, elevation: 2, zIndex: 2 },
  petImage: { width: "100%", height: "100%" },
  gridMetaContainer: { paddingHorizontal: 2 },
  gridName: { fontSize: 13, fontWeight: "900", color: colors.ink || "#000" },
  gridSub: { fontSize: 10, fontWeight: "600", color: "rgba(0,0,0,0.5)", marginTop: 2, marginBottom: 8 },
  priceRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 2 },
  priceText: { fontSize: 13, fontWeight: "900", color: colors.ink || "#000", flex: 1, paddingRight: 8 },
  actionBtn: { backgroundColor: colors.mint || "#A8DDD6", width: 24, height: 24, borderRadius: 8, justifyContent: "center", alignItems: "center" },
  actionBtnText: { color: colors.ink || "#000", fontSize: 12, fontWeight: "900" },
  emptyContainer: { alignItems: "center", paddingTop: 40 },
  emptyEmoji: { fontSize: 36, marginBottom: 8 },
  emptyText: { fontSize: 14, fontWeight: "800", opacity: 0.5 },
});