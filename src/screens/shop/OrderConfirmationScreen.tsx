import React, { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radii, spacing } from '../../constants/theme';
import { useAuth } from '../../services/AuthContext';
import { Order } from '../user/MyOrdersScreen';
import { CartItem } from './CartScreen';

// SVG Imports
import CircleCheckIcon from '../../images/Icons/circle-check-solid-full.svg';
import TruckIcon from '../../images/Icons/truck-fast-solid-full.svg';

interface ScreenProps {
  go: (next: string) => void;
  orders: Order[];
  cartItems: CartItem[];
  setCartItems: React.Dispatch<React.SetStateAction<CartItem[]>>;
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
}

export default function OrderConfirmationScreen({ go, orders, cartItems, setCartItems, setOrders }: ScreenProps) {
  const { user } = useAuth();
  
  // Calculate total and create order on mount if there's a cart
  useEffect(() => {
    if (cartItems.length > 0) {
      const itemTotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const newOrder: Order = {
        id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
        // FIXED: Changed .name to .title to match the CartItem type
        title: cartItems.length === 1 ? cartItems[0].title : `${cartItems[0].title} & ${cartItems.length - 1} more items`,
        status: 'Processing',
        date: new Date().toLocaleDateString(),
        price: itemTotal + 50 // 50 is base shipping
      };
      
      setOrders(prev => [newOrder, ...prev]);
      setCartItems([]); // Clear the cart
    }
  }, []); // Only run once on mount

  const latestOrder = orders[0] || { id: 'ORD-XXXX', price: 0 };

  return (
    <View style={styles.fillWhite}>
      <View style={styles.topSection}>
        <CircleCheckIcon width={130} height={130} fill="#B2DFDB" style={{ marginBottom: 24 }} />
        <Text style={styles.headingTitle}>Your order is made!</Text>
        <Text style={styles.headingSub}>
          Congratulations! Your order has been successfully processed, we will pick up your order as soon as possible!
        </Text>
      </View>

      <View style={styles.receiptContainer}>
        <View style={styles.orderIdRow}>
          <TruckIcon width={22} height={22} fill={colors.ink} />
          <View>
            <Text style={styles.orderIdText}>Order ID #{latestOrder.id}</Text>
            <Text style={styles.courierSub}>J&T Express</Text>
          </View>
        </View>

        <View style={styles.receiptBox}>
          <View style={styles.twoColumnRow}>
            <View style={styles.col}>
              <Text style={styles.colLabel}>Shipper Name</Text>
              <Text style={styles.colValue}>Pet Adoption App</Text>
            </View>
            <View style={styles.col}>
              <Text style={styles.colLabel}>Recipient Name</Text>
              <Text style={styles.colValue}>{user?.name || 'Guest User'}</Text>
            </View>
          </View>

          <View style={styles.twoColumnRow}>
            <View style={styles.col}>
              <Text style={styles.colLabel}>Delivery Address</Text>
              <Text style={styles.colValue}>{user?.address || 'No address saved.'}</Text>
            </View>
          </View>

          <View style={styles.col}>
            <Text style={styles.colLabel}>Amount Paid</Text>
            <Text style={styles.amountValue}>₱{latestOrder.price.toFixed(2)}</Text>
          </View>
        </View>
      </View>

      <View style={styles.actionSection}>
        <Pressable style={styles.trackBtn} onPress={() => go('trackOrder')}>
          <Text style={styles.trackBtnText}>Track your order</Text>
        </Pressable>

        <Pressable style={styles.homeBtn} onPress={() => go('main')}>
          <Text style={styles.homeBtnText}>Back to Home</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fillWhite: { flex: 1, backgroundColor: colors.white, paddingHorizontal: spacing.lg, justifyContent: 'space-between', paddingTop: 60, paddingBottom: 40 },
  topSection: { alignItems: 'center', marginTop: 20 },
  headingTitle: { fontSize: 20, fontWeight: '900', color: colors.ink, marginBottom: 8 },
  headingSub: { fontSize: 12, color: colors.textMuted, textAlign: 'center', lineHeight: 18, paddingHorizontal: 10 },
  receiptContainer: { width: '100%' },
  orderIdRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  orderIdText: { fontSize: 13, fontWeight: '800', color: colors.ink },
  courierSub: { fontSize: 10, color: colors.textMuted },
  receiptBox: { borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 16, padding: 16, gap: 14 },
  twoColumnRow: { flexDirection: 'row', justifyContent: 'space-between' },
  col: { flex: 1, paddingRight: 10 },
  colLabel: { fontSize: 10, color: colors.textMuted, marginBottom: 2 },
  colValue: { fontSize: 11, fontWeight: '700', color: colors.ink, lineHeight: 15 },
  amountValue: { fontSize: 14, fontWeight: '900', color: colors.ink },
  actionSection: { width: '100%', gap: 12 },
  trackBtn: { backgroundColor: '#B2DFDB', height: 48, borderRadius: radii.pill, justifyContent: 'center', alignItems: 'center' },
  trackBtnText: { fontSize: 13, fontWeight: '800', color: colors.ink },
  homeBtn: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#B2DFDB', height: 48, borderRadius: radii.pill, justifyContent: 'center', alignItems: 'center' },
  homeBtnText: { fontSize: 13, fontWeight: '800', color: colors.ink },
});