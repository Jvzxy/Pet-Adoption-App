import React from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { colors, radii, spacing } from "../constants/theme";

// SVG Icon Imports
import CartIcon from "../images/Icons/cart-shopping-solid-full.svg";
import CommentIcon from "../images/Icons/comment-solid-full.svg";
import HouseIcon from "../images/Icons/house-solid-full.svg";
import UserIcon from "../images/Icons/user-solid-full.svg";

export interface CartItem {
  id: string;
  title: string;
  subtitle: string;
  price: number;
  image: string;
  selected: boolean;
  quantity: number;
}

interface ScreenProps {
  go: (next: string) => void;
  cartItems: CartItem[];
  setCartItems: React.Dispatch<React.SetStateAction<CartItem[]>>;
}

const NAV_ITEMS = [
  { key: "main", Icon: HouseIcon, label: "Home", active: false },
  { key: "chat", Icon: CommentIcon, label: "Chat", active: false },
  { key: "cart", Icon: CartIcon, label: "Cart", active: true },
  { key: "profile", Icon: UserIcon, label: "Profile", active: false },
];

export default function CartScreen({ go, cartItems = [], setCartItems }: ScreenProps) {
  const toggleSelect = (id: string) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, selected: !item.selected } : item,
      ),
    );
  };

  const updateQuantity = (id: string, delta: number) => {
    setCartItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newQty = Math.max(1, item.quantity + delta);
          return { ...item, quantity: newQty };
        }
        return item;
      }),
    );
  };

  const isAllSelected =
    cartItems.length > 0 && cartItems.every((item) => item.selected);

  const toggleSelectAll = () => {
    const nextState = !isAllSelected;
    setCartItems((prev) => prev.map((item) => ({ ...item, selected: nextState })));
  };

  const totalPrice = cartItems
    .filter((item) => item.selected)
    .reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <View style={styles.container}>
      <View style={styles.blackBanner}>
        <View style={styles.bannerCenter}>
          <Text style={styles.bannerTitle}>Shopping cart</Text>
          <View style={styles.locationRow}>
            <Text style={styles.locationPin}>📍</Text>
            <Text style={styles.locationText} numberOfLines={1}>
              Bulua, Cagayan De Oro, Misamis O...
            </Text>
          </View>
        </View>
        <Pressable style={styles.editBtn}>
          <Text style={styles.editText}>Edit</Text>
        </Pressable>
      </View>

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {cartItems.length === 0 ? (
          <Text style={styles.emptyCartText}>Your cart is empty.</Text>
        ) : (
          cartItems.map((item) => (
            <View key={item.id} style={styles.cartRow}>
              <Pressable
                onPress={() => toggleSelect(item.id)}
                style={styles.checkboxContainer}
              >
                <View
                  style={[
                    styles.checkboxCircle,
                    item.selected && styles.checkboxSelected,
                  ]}
                >
                  {item.selected && <Text style={styles.checkmarkText}>✓</Text>}
                </View>
              </Pressable>

              <View style={styles.imageCard}>
                <Image
                  source={{ uri: item.image }}
                  style={styles.productImage}
                  resizeMode="contain"
                />
              </View>

              <View style={styles.itemInfo}>
                <Text style={styles.itemTitle}>{item.title}</Text>
                <Text style={styles.itemSubtitle}>{item.subtitle}</Text>
                <Text style={styles.itemPrice}>₱ {item.price.toFixed(2)}</Text>
              </View>

              <View style={styles.quantityControls}>
                <Pressable
                  onPress={() => updateQuantity(item.id, 1)}
                  style={styles.qtyBtn}
                >
                  <Text style={styles.qtyBtnText}>+</Text>
                </Pressable>
                <Text style={styles.qtyText}>{item.quantity}</Text>
                <Pressable
                  onPress={() => updateQuantity(item.id, -1)}
                  style={styles.qtyBtn}
                >
                  <Text style={styles.qtyBtnText}>−</Text>
                </Pressable>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      <View style={styles.bottomSection}>
        <View style={styles.checkoutBar}>
          <Pressable onPress={toggleSelectAll} style={styles.selectAllRow}>
            <View
              style={[
                styles.checkboxCircle,
                isAllSelected && styles.checkboxSelected,
              ]}
            >
              {isAllSelected && <Text style={styles.checkmarkText}>✓</Text>}
            </View>
            <Text style={styles.allText}>All</Text>
          </Pressable>

          <View style={styles.pricingSection}>
            <Text style={styles.totalPrice}>₱ {totalPrice.toFixed(2)}</Text>
            <Text style={styles.shippingText}>Shipping: ₱ 100.00</Text>
          </View>

          <Pressable style={styles.checkoutBtn} onPress={() => go("payment")}>
            <Text style={styles.checkoutBtnText}>Check out</Text>
          </Pressable>
        </View>

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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.mint || "#A8DDD6" },
  blackBanner: { backgroundColor: colors.ink || "#000", paddingTop: 50, paddingBottom: 14, paddingHorizontal: 16, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  bannerCenter: { alignItems: "center", flex: 1 },
  bannerTitle: { color: colors.white || "#FFF", fontSize: 16, fontWeight: "900", marginBottom: 4 },
  locationRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  locationPin: { fontSize: 10, color: colors.white || "#FFF" },
  locationText: { color: colors.white || "#FFF", fontSize: 10, fontWeight: "600" },
  editBtn: { position: "absolute", right: 16, bottom: 14 },
  editText: { color: colors.white || "#FFF", fontSize: 12, fontWeight: "700" },
  scrollArea: { flex: 1 },
  scrollContent: { paddingTop: 8, paddingBottom: 16 },
  emptyCartText: { textAlign: "center", marginTop: 40, fontSize: 16, fontWeight: "600", color: colors.ink || "#000" },
  cartRow: { flexDirection: "row", alignItems: "center", paddingVertical: 12, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: "rgba(0,0,0,0.85)" },
  checkboxContainer: { paddingRight: 10 },
  checkboxCircle: { width: 20, height: 20, borderRadius: 10, borderWidth: 1.5, borderColor: colors.white || "#FFF", backgroundColor: "transparent", alignItems: "center", justifyContent: "center" },
  checkboxSelected: { backgroundColor: colors.white || "#FFF" },
  checkmarkText: { fontSize: 12, fontWeight: "900", color: colors.ink || "#000", marginTop: -2 },
  imageCard: { width: 75, height: 55, backgroundColor: colors.white || "#FFF", borderRadius: 8, alignItems: "center", justifyContent: "center", marginRight: 12, overflow: "hidden" },
  productImage: { width: "90%", height: "90%" },
  itemInfo: { flex: 1 },
  itemTitle: { fontSize: 13, fontWeight: "800", color: colors.ink || "#000" },
  itemSubtitle: { fontSize: 10, fontWeight: "600", color: colors.ink || "#000", marginTop: 2 },
  itemPrice: { fontSize: 12, fontWeight: "800", color: colors.ink || "#000", marginTop: 6 },
  quantityControls: { flexDirection: "row", alignItems: "center", gap: 8 },
  qtyBtn: { width: 22, height: 22, borderRadius: 11, backgroundColor: colors.ink || "#000", alignItems: "center", justifyContent: "center" },
  qtyBtnText: { color: colors.white || "#FFF", fontSize: 14, fontWeight: "800", lineHeight: 16 },
  qtyText: { fontSize: 12, fontWeight: "800", color: colors.ink || "#000" },
  bottomSection: { backgroundColor: colors.mint || "#A8DDD6" },
  checkoutBar: { backgroundColor: colors.ink || "#000", paddingVertical: 12, paddingHorizontal: 16, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  selectAllRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  allText: { color: colors.white || "#FFF", fontSize: 13, fontWeight: "700" },
  pricingSection: { alignItems: "flex-end", marginRight: 10 },
  totalPrice: { color: colors.white || "#FFF", fontSize: 14, fontWeight: "900" },
  shippingText: { color: "rgba(255,255,255,0.8)", fontSize: 9, fontWeight: "500", marginTop: 2 },
  checkoutBtn: { backgroundColor: colors.mint || "#A8DDD6", paddingHorizontal: 18, paddingVertical: 10, borderRadius: 20 },
  checkoutBtnText: { color: colors.ink || "#000", fontSize: 12, fontWeight: "800" },
  bottomNavWrapper: { paddingVertical: 18, alignItems: "center", justifyContent: "center" },
  bottomNav: { flexDirection: "row", justifyContent: "space-around", alignItems: "center", backgroundColor: colors.white || "#FFF", width: "85%", borderRadius: 100, height: 55, paddingHorizontal: 12, shadowColor: "#000", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.15, shadowRadius: 15, elevation: 8 },
  navItem: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: radii?.pill || 20 },
  navItemActive: { backgroundColor: colors.mint || "#A8DDD6" },
  navLabel: { fontSize: 13, fontWeight: "900", color: colors.ink || "#000" },
});