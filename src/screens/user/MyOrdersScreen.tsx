import React, { useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { radii } from '../../constants/theme';
import { supabase } from '../../services/supabaseClient';
import AngleLeftIcon from '../../images/Icons/angle-left-solid-full.svg';
import ClipboardListIcon from '../../images/Icons/clipboard-list-solid-full.svg';
import { useAuth } from '../../services/AuthContext';
import { useAppPreferences, type AppColors } from '../../services/AppPreferencesContext';

export interface Order {
  id: string;
  order_number?: string;
  title: string;
  status: 'Processing' | 'Shipped' | 'Completed';
  date: string;
  price: number;
  payment_method?: string;
  payment_status?: 'pending' | 'paid' | 'refunded';
  delivery_latitude?: number;
  delivery_longitude?: number;
}

interface ScreenProps {
  go: (next: string, id?: string) => void;
}

export default function MyOrdersScreen({ go }: ScreenProps) {
  const { user } = useAuth();
  const { colors } = useAppPreferences();
  const styles = createStyles(colors);
  const [savedOrders, setSavedOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const loadOrders = async () => {
      if (!user || user.role !== 'user') {
        if (active) setLoadingOrders(false);
        return;
      }

      const { data, error } = await supabase
        .from('orders')
        .select('id, order_number, title, status, price, created_at, delivery_latitude, delivery_longitude, payment_method, payment_status')
        .eq('customer_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Could not load orders:', error.message);
        if (active) setLoadError(error.message);
        if (active) setLoadingOrders(false);
        return;
      }

      if (active && data) {
        setLoadError(null);
        setSavedOrders(data.map((order) => ({
          id: order.id,
          order_number: order.order_number,
          title: order.title,
          status: order.status as Order['status'],
          date: new Date(order.created_at).toLocaleDateString(),
          price: Number(order.price),
          payment_method: order.payment_method,
          payment_status: order.payment_status as Order['payment_status'],
          delivery_latitude: order.delivery_latitude,
          delivery_longitude: order.delivery_longitude,
        })));
      }
      if (active) setLoadingOrders(false);
    };

    void loadOrders();
    return () => {
      active = false;
    };
  }, [user]);

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Pressable onPress={() => go('profile')} style={styles.backBtn} hitSlop={10}>
          <AngleLeftIcon width={18} height={18} fill={colors.ink} />
        </Pressable>
        <Text style={styles.headerTitle}>My Orders</Text>
        <View style={{ width: 40 }} />
      </View>

      {loadingOrders ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Loading your orders...</Text>
        </View>
      ) : loadError ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>Orders unavailable</Text>
          <Text style={styles.emptyText}>{loadError}</Text>
          <Text style={styles.emptyText}>Confirm the Supabase delivery schema has been applied.</Text>
        </View>
      ) : savedOrders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <ClipboardListIcon width={48} height={48} fill="rgba(0,0,0,0.2)" style={{ marginBottom: 16 }} />
          <Text style={styles.emptyTitle}>No Orders Yet</Text>
          <Text style={styles.emptyText}>You haven't placed any orders yet.</Text>
          <Pressable style={styles.shopBtn} onPress={() => go('home')}>
            <Text style={styles.shopBtnText}>Start Shopping</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={savedOrders}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <Pressable style={styles.orderCard} onPress={() => go('trackOrder', item.id)}>
              <View style={styles.orderHeader}>
                <View style={styles.orderIconWrapper}>
                  <ClipboardListIcon width={16} height={16} fill={colors.white} />
                </View>
                <View style={styles.orderMeta}>
                  <Text style={styles.orderId}>{item.order_number || item.id}</Text>
                  <Text style={styles.orderDate}>{item.date}</Text>
                </View>
                <Text style={[styles.orderStatus, item.status === 'Completed' ? styles.statusGreen : styles.statusOrange]}>
                  {item.status === 'Shipped' ? 'Out for Delivery' : item.status}
                </Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.orderBody}>
                <View style={styles.orderDetails}>
                  <Text style={styles.orderTitle} numberOfLines={1}>{item.title}</Text>
                  {item.payment_method && item.payment_method !== 'cod' && (
                    <Text style={styles.paymentStatus}>
                      {item.payment_status === 'paid' ? 'Online payment received' : 'Online payment pending'}
                    </Text>
                  )}
                </View>
                <Text style={styles.orderPrice}>₱{item.price.toFixed(2)}</Text>
              </View>
            </Pressable>
          )}
        />
      )}
    </View>
  );
}

const createStyles = (colors: AppColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 60, paddingBottom: 20, paddingHorizontal: 24 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.5)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '900', color: colors.ink || '#000' },
  
  // Empty State Styles
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32, paddingBottom: 80 },
  emptyTitle: { fontSize: 18, fontWeight: '900', color: colors.ink, marginBottom: 8 },
  emptyText: { fontSize: 13, color: 'rgba(0,0,0,0.6)', textAlign: 'center', marginBottom: 24 },
  shopBtn: { backgroundColor: colors.ink, paddingHorizontal: 24, paddingVertical: 14, borderRadius: radii?.pill || 20 },
  shopBtnText: { color: colors.white, fontSize: 13, fontWeight: '900' },

  // List Styles
  listContent: { paddingHorizontal: 24, paddingBottom: 40 },
  orderCard: { backgroundColor: colors.surface, borderRadius: 20, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 3 },
  orderHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  orderIconWrapper: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.ink, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  orderMeta: { flex: 1 },
  orderId: { fontSize: 14, fontWeight: '900', color: colors.ink },
  orderDate: { fontSize: 11, fontWeight: '600', color: colors.textMuted },
  orderStatus: { fontSize: 12, fontWeight: '800', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, overflow: 'hidden' },
  statusGreen: { backgroundColor: colors.isDark ? '#253B30' : '#E8F5E9', color: colors.isDark ? '#9CE2B1' : '#2E7D32' },
  statusOrange: { backgroundColor: colors.isDark ? '#493820' : '#FFF3E0', color: colors.isDark ? '#FFD38A' : '#E65100' },
  divider: { height: 1, backgroundColor: colors.border, marginBottom: 12 },
  orderBody: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  orderDetails: { flex: 1, marginRight: 12 },
  orderTitle: { fontSize: 14, fontWeight: '700', color: colors.ink },
  orderPrice: { fontSize: 16, fontWeight: '900', color: colors.ink },
  paymentStatus: { marginTop: 4, color: colors.isDark ? '#9CE2B1' : '#2E7D32', fontSize: 10, fontWeight: '800' },
});