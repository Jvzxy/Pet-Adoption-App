import React, { useState } from "react";
import {
  FlatList,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { radii } from "../../constants/theme";
import BottomNavigation from "../../components/BottomNavigation";
import { useAppData } from "../../services/AppDataContext";
import { useAppPreferences, type AppColors } from "../../services/AppPreferencesContext";

// SVG Icon Imports
import ArrowLeftIcon from "../../images/Icons/arrow-left-solid-full.svg";
import SearchIcon from "../../images/Icons/magnifying-glass-solid-full.svg";
import ClockIcon from "../../images/Icons/clock-regular-full.svg";
import HeartIcon from "../../images/Icons/heart-solid-full.svg";
import LocationIcon from "../../images/Icons/location-dot-solid-full.svg";

// 1. ADD NEW PROPS
interface ScreenProps {
  go: (next: string) => void;
  favorites: string[];
  toggleFavorite: (id: string) => void;
}

export default function FavoritesScreen({ go, favorites, toggleFavorite }: ScreenProps) {
  const { colors } = useAppPreferences();
  const styles = createStyles(colors);
  const [selectedItemToRemove, setSelectedItemToRemove] = useState<any>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { catalogItems } = useAppData();

  const favoriteCats = catalogItems.filter(cat => cat.type === 'pet' && favorites.includes(cat.id));
  const filteredCats = favoriteCats.filter((cat) => {
    const query = searchQuery.trim().toLowerCase();
    return !query || [cat.name, cat.breed, cat.location, cat.age, cat.gender]
      .some((value) => value?.toLowerCase().includes(query));
  });

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
               <Image source={require('../../images/Logo.png')} style={{ width: 40, height: 40, opacity: 0.2 }} resizeMode="contain" />
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
            <Image source={require('../../images/Logo.png')} style={styles.nameIcon} resizeMode="contain" />
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
        {searchOpen ? (
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search favorites"
            placeholderTextColor="rgba(0,0,0,0.45)"
            autoFocus
            returnKeyType="search"
          />
        ) : (
          <Text style={styles.headerTitle}>Favorites</Text>
        )}
        <Pressable
          style={styles.iconButton}
          accessibilityRole="button"
          accessibilityLabel={searchOpen ? 'Close favorites search' : 'Search favorites'}
          onPress={() => {
            if (searchOpen) setSearchQuery('');
            setSearchOpen(!searchOpen);
          }}
        >
          <SearchIcon width={18} height={18} fill={colors.ink} />
        </Pressable>
      </View>

      <FlatList
        data={filteredCats}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {favoriteCats.length === 0
                ? 'No favorites yet'
                : 'No favorites match your search'}
            </Text>
          </View>
        }
      />

      <BottomNavigation activeTab="home" go={go} />

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
                     <Image source={require('../../images/Logo.png')} style={{ width: 30, height: 30, opacity: 0.3 }} resizeMode="contain" />
                   </View>
                )}
                <View style={styles.modalItemInfo}>
                   <Text style={styles.categoryTag}>Adopt Cat</Text>
                   <View style={[styles.nameRow, { marginBottom: 2 }]}>
                     <Image source={require('../../images/Logo.png')} style={styles.nameIcon} resizeMode="contain" />
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

const createStyles = (colors: AppColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingTop: 60, paddingBottom: 20, paddingHorizontal: 24 },
  iconButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.5)", alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 18, fontWeight: "900", color: colors.ink || "#000" },
  searchInput: { flex: 1, marginHorizontal: 12, height: 42, borderRadius: 21, paddingHorizontal: 14, backgroundColor: colors.surface, color: colors.ink, fontSize: 14 },
  listContent: { paddingHorizontal: 20, paddingBottom: 120, flexGrow: 1 },
  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center", marginTop: 80 },
  emptyText: { fontSize: 16, fontWeight: "800", color: colors.ink, opacity: 0.5 },
  cardContainer: { backgroundColor: colors.surface, borderRadius: 20, padding: 16, marginBottom: 16, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 3 },
  cardTopRow: { flexDirection: "row", marginBottom: 16 },
  imageWrapper: { width: 90, height: 90, borderRadius: 16, overflow: "hidden", marginRight: 16, backgroundColor: "#F0F0F0", position: "relative" },
  cardImage: { width: "100%", height: "100%" },
  heartButton: { position: "absolute", top: 8, right: 8, backgroundColor: colors.surface, width: 24, height: 24, borderRadius: 12, alignItems: "center", justifyContent: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
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
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "center", alignItems: "center" },
  modalContent: { backgroundColor: colors.surface, width: "85%", borderRadius: 24, padding: 24, alignItems: "center" },
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