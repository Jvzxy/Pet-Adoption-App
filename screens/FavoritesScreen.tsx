import React, { useState } from "react";
import {
  FlatList,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { colors, radii, spacing } from "../constants/theme";
import { CAT_DATA } from "../data/cats";

// SVG Icon Imports
import ArrowLeftIcon from "../images/Icons/arrow-left-solid-full.svg";
import SearchIcon from "../images/Icons/magnifying-glass-solid-full.svg";
import CartIcon from "../images/Icons/cart-shopping-solid-full.svg";
import CommentIcon from "../images/Icons/comment-solid-full.svg";
import HouseIcon from "../images/Icons/house-solid-full.svg";
import UserIcon from "../images/Icons/user-solid-full.svg";
import ClockIcon from "../images/Icons/clock-regular-full.svg";
import HeartIcon from "../images/Icons/heart-solid-full.svg";
import LocationIcon from "../images/Icons/location-dot-solid-full.svg";

// 1. ADD NEW PROPS
interface ScreenProps {
  go: (next: string) => void;
  favorites: string[];
  toggleFavorite: (id: string) => void;
}

const NAV_ITEMS = [
  { key: "home", Icon: HouseIcon, label: "Home", active: false },
  { key: "chat", Icon: CommentIcon, label: "Chat", active: false },
  { key: "cart", Icon: CartIcon, label: "Cart", active: false },
  { key: "profile", Icon: UserIcon, label: "Profile", active: false },
];

export default function FavoritesScreen({ go, favorites, toggleFavorite }: ScreenProps) {
  const [selectedItemToRemove, setSelectedItemToRemove] = useState<any>(null);

  // 2. GET ACTUAL CAT OBJECTS BASED ON IDs
  const favoriteCats = CAT_DATA.filter(cat => favorites.includes(cat.id));

  const handleRemoveConfirm = () => {
    if (selectedItemToRemove) {
      toggleFavorite(selectedItemToRemove.id); // 3. USE APP-LEVEL FUNCTION
      setSelectedItemToRemove(null);
    }
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.cardContainer}>
      <View style={styles.cardTopRow}>
        <View style={styles.imageWrapper}>
          {item.imageUri ? (
             <Image source={{ uri: item.imageUri }} style={styles.cardImage} resizeMode="cover" />
          ) : (
             <View style={[styles.cardImage, { justifyContent: 'center', alignItems: 'center' }]}>
               <Image source={require('../images/Logo.png')} style={{ width: 40, height: 40, opacity: 0.2 }} resizeMode="contain" />
             </View>
          )}
          <Pressable 
            style={styles.heartButton} 
            onPress={() => setSelectedItemToRemove(item)}
          >
            <HeartIcon width={14} height={14} fill="red" />
          </Pressable>
        </View>

        <View style={styles.cardInfo}>
          <View style={styles.titleRow}>
            <Text style={styles.categoryTag}>Adopt Cat</Text>
          </View>
          
          <View style={styles.nameRow}>
            <Image source={require('../images/Logo.png')} style={styles.nameIcon} resizeMode="contain" />
            <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
          </View>
          
          <View style={styles.locationRow}>
            <LocationIcon width={12} height={12} fill={"rgba(0,0,0,0.5)"} style={{ marginRight: 4 }} />
            <Text style={styles.locationText}>Cagayan de Oro</Text>
          </View>

          <Text style={styles.priceText}>Free Adoption</Text>
        </View>
      </View>

      <View style={styles.cardBottomRow}>
        <View style={styles.detailPill}>
          <ClockIcon width={14} height={14} fill={colors.ink || "#000"} style={{ marginRight: 6 }} />
          <Text style={styles.detailText}>{item.age}</Text>
        </View>
        <View style={styles.detailPill}>
          <Text style={styles.detailText}>{item.breed || "Mixed"}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => go("home")} style={styles.iconButton}>
          <ArrowLeftIcon width={20} height={20} fill={colors.ink} />
        </Pressable>
        <Text style={styles.headerTitle}>Favorites</Text>
        <Pressable style={styles.iconButton}>
          <SearchIcon width={18} height={18} fill={colors.ink} />
        </Pressable>
      </View>

      <FlatList
        data={favoriteCats} // 4. USE FILTERED DATA
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No favorites yet</Text>
          </View>
        }
      />

      <View style={styles.bottomNavWrapper}>
        <View style={styles.bottomNav}>
          {NAV_ITEMS.map(({ key, Icon, label, active }) => (
            <Pressable
              key={key}
              onPress={() => go(key)}
              style={[styles.navItem, active && styles.navItemActive]}
            >
              <Icon width={20} height={20} fill={colors.ink} />
              {active && <Text style={styles.navLabel}>{label}</Text>}
            </Pressable>
          ))}
        </View>
      </View>

      <Modal
        visible={!!selectedItemToRemove}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedItemToRemove(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Remove from Favorites?</Text>
            
            {selectedItemToRemove && (
              <View style={styles.modalItemPreview}>
                {selectedItemToRemove.imageUri ? (
                   <Image source={{ uri: selectedItemToRemove.imageUri }} style={styles.modalImage} />
                ) : (
                   <View style={[styles.modalImage, { backgroundColor: '#E0F2F1', justifyContent: 'center', alignItems: 'center' }]}>
                     <Image source={require('../images/Logo.png')} style={{ width: 30, height: 30, opacity: 0.3 }} resizeMode="contain" />
                   </View>
                )}
                <View style={styles.modalItemInfo}>
                   <Text style={styles.categoryTag}>Adopt Cat</Text>
                   <View style={[styles.nameRow, { marginBottom: 2 }]}>
                     <Image source={require('../images/Logo.png')} style={styles.nameIcon} resizeMode="contain" />
                     <Text style={[styles.itemName, { marginBottom: 0 }]}>{selectedItemToRemove.name}</Text>
                   </View>
                   <View style={styles.locationRow}>
                     <LocationIcon width={12} height={12} fill={"rgba(0,0,0,0.5)"} style={{ marginRight: 4 }} />
                     <Text style={styles.locationText}>Cagayan de Oro</Text>
                   </View>
                </View>
              </View>
            )}

            <View style={styles.modalActions}>
              <Pressable style={styles.cancelBtn} onPress={() => setSelectedItemToRemove(null)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </Pressable>
              <Pressable style={styles.confirmBtn} onPress={handleRemoveConfirm}>
                <Text style={styles.confirmBtnText}>Yes, Remove</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.mint || "#A8DDD6" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingTop: 60, paddingBottom: 20, paddingHorizontal: 24 },
  iconButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.5)", alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 18, fontWeight: "900", color: colors.ink || "#000" },
  listContent: { paddingHorizontal: 20, paddingBottom: 120, flexGrow: 1 },
  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center", marginTop: 80 },
  emptyText: { fontSize: 16, fontWeight: "800", color: colors.ink, opacity: 0.5 },
  cardContainer: { backgroundColor: colors.white || "#FFF", borderRadius: 20, padding: 16, marginBottom: 16, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 3 },
  cardTopRow: { flexDirection: "row", marginBottom: 16 },
  imageWrapper: { width: 90, height: 90, borderRadius: 16, overflow: "hidden", marginRight: 16, backgroundColor: "#F0F0F0", position: "relative" },
  cardImage: { width: "100%", height: "100%" },
  heartButton: { position: "absolute", top: 8, right: 8, backgroundColor: colors.white, width: 24, height: 24, borderRadius: 12, alignItems: "center", justifyContent: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  cardInfo: { flex: 1, justifyContent: "center" },
  titleRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
  categoryTag: { fontSize: 10, fontWeight: "800", color: colors.mint || "#A8DDD6" },
  nameRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  nameIcon: { width: 14, height: 14, marginRight: 6 },
  itemName: { fontSize: 16, fontWeight: "900", color: colors.ink || "#000" },
  locationRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  locationText: { fontSize: 11, fontWeight: "600", color: "rgba(0,0,0,0.5)" },
  priceText: { fontSize: 14, fontWeight: "900", color: colors.ink || "#000" },
  cardBottomRow: { flexDirection: "row", borderTopWidth: 1, borderTopColor: "#F0F0F0", paddingTop: 12, gap: 16 },
  detailPill: { flexDirection: "row", alignItems: "center" },
  detailText: { fontSize: 12, fontWeight: "700", color: colors.ink || "#000" },
  bottomNavWrapper: { position: "absolute", bottom: 35, left: 0, right: 0, alignItems: "center" },
  bottomNav: { flexDirection: "row", justifyContent: "space-around", alignItems: "center", backgroundColor: colors.white || "#FFF", width: "85%", borderRadius: 100, height: 65, paddingHorizontal: 15, shadowColor: "#000", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 20, elevation: 10 },
  navItem: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 16, paddingVertical: 10, borderRadius: radii?.pill || 20 },
  navItemActive: { backgroundColor: colors.mint || "#A8DDD6" },
  navLabel: { fontSize: 14, fontWeight: "900", color: colors.ink || "#000" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "center", alignItems: "center" },
  modalContent: { backgroundColor: colors.white, width: "85%", borderRadius: 24, padding: 24, alignItems: "center" },
  modalTitle: { fontSize: 16, fontWeight: "900", color: colors.ink, marginBottom: 20 },
  modalItemPreview: { flexDirection: "row", width: "100%", backgroundColor: "#F9F9F9", borderRadius: 16, padding: 12, marginBottom: 24 },
  modalImage: { width: 60, height: 60, borderRadius: 12, marginRight: 12 },
  modalItemInfo: { justifyContent: "center" },
  modalActions: { flexDirection: "row", gap: 12, width: "100%" },
  cancelBtn: { flex: 1, paddingVertical: 14, borderRadius: radii?.pill || 20, backgroundColor: "#F0F0F0", alignItems: "center" },
  cancelBtnText: { fontSize: 14, fontWeight: "800", color: colors.ink },
  confirmBtn: { flex: 1, paddingVertical: 14, borderRadius: radii?.pill || 20, backgroundColor: colors.ink, alignItems: "center" },
  confirmBtnText: { fontSize: 14, fontWeight: "800", color: colors.white },
});