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
import { colors, radii, spacing } from "../../constants/theme";
import { CAT_DATA } from "../../data/cats";

// Image Imports
import cat3Img from "../../images/Cats/Cat3.png";
import logoImg from "../../images/Logo.png";

// SVG Icon Imports
import BellIcon from "../../images/Icons/bell-solid-full.svg";
import CartIcon from "../../images/Icons/cart-shopping-solid-full.svg";
import CommentIcon from "../../images/Icons/comment-solid-full.svg";
import HeartIcon from "../../images/Icons/heart-regular-full.svg";
import HouseIcon from "../../images/Icons/house-solid-full.svg";
import SearchIcon from "../../images/Icons/magnifying-glass-solid-full.svg";
import LogoutIcon from "../../images/Icons/right-from-bracket-solid-full.svg";
import UserIcon from "../../images/Icons/user-solid-full.svg";

interface ScreenProps {
  go: (next: string, id?: string) => void;
  favorites: string[];
  toggleFavorite: (id: string) => void;
}

interface DisplayItem {
  id: string;
  name: string;
  category: string;
  priceTag: string;
  subText: string;
  imageUri?: string | null;
  emoji?: string;
  isPet: boolean;
}

const NAV_ITEMS = [
  { key: "home", Icon: HouseIcon, label: "Home", active: true },
  { key: "chat", Icon: CommentIcon, label: "Chat", active: false },
  { key: "cart", Icon: CartIcon, label: "Cart", active: false },
  { key: "profile", Icon: UserIcon, label: "Profile", active: false },
];

const SIDEBAR_MENU = [
  { key: "home", label: "Home", Icon: HouseIcon },
  { key: "chat", label: "Messages", Icon: CommentIcon },
  { key: "cart", label: "My Cart", Icon: CartIcon },
  { key: "favorites", label: "Favorites", Icon: HeartIcon },
  { key: "profile", label: "My Profile", Icon: UserIcon },
];

const ListHeader = React.memo(
  ({
    searchQuery,
    setSearchQuery,
    go,
  }: {
    searchQuery: string;
    setSearchQuery: (text: string) => void;
    go: (next: string, id?: string) => void;
  }) => (
    <View style={styles.headerWrapper}>
      <View style={styles.searchBar}>
        <SearchIcon
          width={16}
          height={16}
          fill={colors.textMuted || "rgba(0,0,0,0.4)"}
          style={{ marginRight: 10 }}
        />
        <TextInput
          placeholder="Search pets, products..."
          placeholderTextColor="rgba(0,0,0,0.4)"
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchInput}
          returnKeyType="search"
        />
      </View>

      <View style={styles.heroCard}>
        <View style={styles.heroTextContainer}>
          <Text style={styles.heroBadge}>PAWFECT STORE</Text>
          <Text style={styles.heroText}>
            LIVE.{"\n"}LOVE.{"\n"}SHOP.
          </Text>
          <Pressable style={styles.adoptBtn} onPress={() => go("explorePets")}>
            <Text style={styles.adoptBtnText}>Explore Now ➔</Text>
          </Pressable>
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

      <View style={styles.gridHeader}>
        <Text style={styles.gridTitle}>Featured Catalog</Text>
        <Text style={styles.gridSeeAll}>See all</Text>
      </View>
    </View>
  )
);

export default function MainScreen({
  go,
  favorites,
  toggleFavorite,
}: ScreenProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const STORE_ITEMS: DisplayItem[] = CAT_DATA.map((item) => {
    const isProduct = item.type === "product";
    return {
      id: item.id,
      name: item.name,
      category: item.category || (isProduct ? "Product" : "Pet"),
      // Replaced hardcoded "Free Adoption" with dynamic check
      priceTag: isProduct 
        ? item.price 
        : (!item.price || item.price.toLowerCase() === "free" ? "Free Adoption" : item.price),
      subText: isProduct ? item.description : `Age: ${item.age}`,
      imageUri: item.imageUri,
      isPet: !isProduct,
    };
  });

  const filteredItems = STORE_ITEMS.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.fillMint}>
      <View style={styles.topBar}>
        <Pressable onPress={() => setIsSidebarOpen(true)} hitSlop={10}>
          <Text style={styles.topIconMenu}>☰</Text>
        </Pressable>

        <View style={styles.titleContainer}>
          <Image source={logoImg} style={styles.logo} resizeMode="contain" />
          <View style={styles.textColumn}>
            <Text style={styles.titleText}>PAWFECT CATS</Text>
            <Text style={styles.subtitleText}>CAGAYAN DE ORO CITY</Text>
          </View>
        </View>

        <View style={styles.rightIcons}>
          <Pressable onPress={() => go("favorites")} hitSlop={10}>
            <HeartIcon width={22} height={22} fill={colors.ink || "#000"} />
          </Pressable>
          <Pressable onPress={() => go("notifications")} hitSlop={10}>
            <BellIcon width={22} height={22} fill={colors.ink || "#000"} />
          </Pressable>
        </View>
      </View>

      <Modal
        visible={isSidebarOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsSidebarOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            style={styles.backdrop}
            onPress={() => setIsSidebarOpen(false)}
          />

          <View style={styles.sidebar}>
            <View>
              <View style={styles.sidebarHeader}>
                <View>
                  <Text style={styles.sidebarTitle}>🐾 PAWFECT</Text>
                  <Text style={styles.sidebarSub}>CAT ADOPTION & STORE</Text>
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
                    <Icon width={20} height={20} fill={colors.ink || "#000"} />
                    <Text style={styles.sidebarItemText}>{label}</Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <Pressable
              style={styles.logoutButton}
              onPress={() => {
                setIsSidebarOpen(false);
                go("login");
              }}
            >
              <LogoutIcon width={20} height={20} fill="#D32F2F" />
              <Text style={styles.logoutText}>Logout</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <FlatList
        data={filteredItems}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.rowWrapper}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <ListHeader
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            go={go}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>🐾</Text>
            <Text style={styles.emptyText}>No items found</Text>
          </View>
        }
        renderItem={({ item }) => {
          const isFavorite = favorites.includes(item.id);

          return (
            <Pressable
              style={styles.gridItem}
              onPress={() =>
                item.isPet
                  ? go("details", item.id)
                  : go("productDetails", item.id)
              }
            >
              <View style={styles.gridImageContainer}>
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryBadgeText}>
                    {item.category.toUpperCase()}
                  </Text>
                </View>

                {item.imageUri ? (
                  <Image
                    source={{ uri: item.imageUri }}
                    style={styles.catImage}
                    resizeMode="cover"
                  />
                ) : (
                  <Text style={{ fontSize: 38 }}>{item.emoji || "🐾"}</Text>
                )}

                {item.isPet && (
                  <Pressable
                    style={styles.cardFavoriteIcon}
                    onPress={() => toggleFavorite(item.id)}
                    hitSlop={10}
                  >
                    <HeartIcon
                      width={14}
                      height={14}
                      fill={isFavorite ? "#FF2D55" : colors.ink || "#000"}
                    />
                  </Pressable>
                )}
              </View>

              <View style={styles.gridMetaContainer}>
                <Text style={styles.gridName} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text style={styles.gridSub} numberOfLines={1}>
                  {item.subText}
                </Text>

                <View style={styles.priceRow}>
                  {/* Added flex layout to accommodate longer prices */}
                  <Text style={[styles.priceText, { flex: 1, paddingRight: 4 }]} numberOfLines={1}>
                    {item.priceTag}
                  </Text>
                  <View style={styles.actionBtn}>
                    <Text style={styles.actionBtnText}>
                      {item.isPet ? "↗" : "+"}
                    </Text>
                  </View>
                </View>
              </View>
            </Pressable>
          );
        }}
      />

      <View style={styles.bottomNavWrapper}>
        <View style={styles.bottomNav}>
          {NAV_ITEMS.map(({ key, Icon, label, active }) => (
            <Pressable
              key={key}
              onPress={() => key !== "home" && go(key)}
              style={[styles.navItem, active && styles.navItemActive]}
            >
              <Icon width={20} height={20} fill={colors.ink || "#000"} />
              {active && <Text style={styles.navLabel}>{label}</Text>}
            </Pressable>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fillMint: { flex: 1, backgroundColor: colors.mint || "#A8DDD6" },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg || 24,
    paddingTop: 60,
    paddingBottom: 20,
  },
  topIconMenu: { fontSize: 24, color: colors.ink || "#000", fontWeight: "bold" },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  textColumn: { alignItems: "flex-start", justifyContent: "center" },
  logo: { width: 26, height: 26, marginRight: 6, tintColor: colors.ink || "#000" },
  titleText: {
    fontSize: 18,
    fontWeight: "900",
    color: colors.ink || "#000",
    letterSpacing: 0.5,
  },
  subtitleText: {
    fontSize: 9,
    fontWeight: "800",
    color: colors.ink || "#000",
    letterSpacing: 0.5,
    marginTop: 1,
  },
  rightIcons: { flexDirection: "row", alignItems: "center", gap: 16 },
  listContent: { paddingHorizontal: spacing.lg || 20, paddingBottom: 110 },
  headerWrapper: { marginBottom: 8 },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    height: 48,
    borderRadius: radii.pill || 24,
    paddingHorizontal: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    color: colors.ink || "#000",
    fontSize: 13,
    fontWeight: "600",
  },
  heroCard: {
    flexDirection: "row",
    backgroundColor: colors.ink || "#000",
    borderRadius: 24,
    height: 165,
    overflow: "hidden",
    marginBottom: 20,
    paddingLeft: 24,
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  heroTextContainer: { flex: 1, justifyContent: "center" },
  heroBadge: {
    fontSize: 9,
    fontWeight: "900",
    color: colors.mint || "#A8DDD6",
    letterSpacing: 1,
    marginBottom: 4,
  },
  heroText: {
    fontSize: 22,
    fontWeight: "900",
    lineHeight: 26,
    color: colors.white || "#FFF",
    marginBottom: 12,
  },
  adoptBtn: {
    backgroundColor: colors.white || "#FFF",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: radii.pill || 20,
    alignSelf: "flex-start",
  },
  adoptBtnText: { fontSize: 11, fontWeight: "900", color: colors.ink || "#000" },
  heroImageWrapper: {
    width: 140,
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  heroCircle: {
    width: 115,
    height: 115,
    borderRadius: 57.5,
    backgroundColor: colors.mint || "#A8DDD6",
    position: "absolute",
    right: 12,
  },
  heroCatImage: {
    width: 130,
    height: 150,
    position: "absolute",
    bottom: 0,
    right: 5,
  },
  gridHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  gridTitle: { fontSize: 17, fontWeight: "900", color: colors.ink || "#000" },
  gridSeeAll: { fontSize: 12, fontWeight: "800", color: colors.ink || "#000", opacity: 0.6 },
  rowWrapper: { justifyContent: "space-between" },
  gridItem: {
    width: "48%",
    backgroundColor: colors.white || "#FFF",
    borderRadius: 20,
    padding: 10,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  gridImageContainer: {
    width: "100%",
    height: 115,
    borderRadius: 14,
    marginBottom: 10,
    backgroundColor: "#F4FAF8",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    position: "relative",
  },
  categoryBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    zIndex: 2,
  },
  categoryBadgeText: {
    color: "#FFFFFF",
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  cardFavoriteIcon: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(255,255,255,0.9)",
    padding: 6,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    zIndex: 2,
  },
  catImage: { width: "100%", height: "100%" },
  gridMetaContainer: { paddingHorizontal: 2 },
  gridName: { fontSize: 13, fontWeight: "900", color: colors.ink || "#000" },
  gridSub: {
    fontSize: 10,
    fontWeight: "600",
    color: "rgba(0,0,0,0.5)",
    marginTop: 2,
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 2,
  },
  priceText: {
    fontSize: 13,
    fontWeight: "900",
    color: colors.ink || "#000",
  },
  actionBtn: {
    backgroundColor: colors.mint || "#A8DDD6",
    width: 24,
    height: 24,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  actionBtnText: {
    color: colors.ink || "#000",
    fontSize: 12,
    fontWeight: "900",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyEmoji: { fontSize: 36, marginBottom: 8 },
  emptyText: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.ink || "#000",
    opacity: 0.5,
  },
  modalOverlay: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  backdrop: { flex: 1 },
  sidebar: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    width: "75%",
    backgroundColor: colors.white || "#FFF",
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 40,
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 10,
  },
  sidebarHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 36,
  },
  sidebarTitle: { fontSize: 20, fontWeight: "900", color: colors.ink || "#000" },
  sidebarSub: {
    fontSize: 10,
    fontWeight: "800",
    color: colors.textMuted || "rgba(0,0,0,0.4)",
    letterSpacing: 0.5,
  },
  closeBtn: { fontSize: 22, fontWeight: "bold", color: colors.ink || "#000" },
  menuList: { gap: 12 },
  sidebarItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  sidebarItemText: { fontSize: 15, fontWeight: "700", color: colors.ink || "#000" },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderTopWidth: 1,
    borderColor: "#EEEEEE",
    marginTop: "auto",
  },
  logoutText: { fontSize: 15, fontWeight: "800", color: "#D32F2F" },
  bottomNavWrapper: {
    position: "absolute",
    bottom: 35,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: colors.white || "#FFF",
    width: "85%",
    borderRadius: 100,
    height: 65,
    paddingHorizontal: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  navItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: radii.pill || 20,
  },
  navItemActive: { backgroundColor: colors.mint || "#A8DDD6" },
  navLabel: { fontSize: 14, fontWeight: "900", color: colors.ink || "#000" },
});