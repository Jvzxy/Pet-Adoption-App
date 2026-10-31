import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radii } from '../../constants/theme';
import AngleLeftIcon from '../../images/Icons/angle-left-solid-full.svg';
import ClipboardListIcon from '../../images/Icons/clipboard-list-solid-full.svg';

export interface Order {
  id: string;
  title: string;
  status: 'Processing' | 'Shipped' | 'Completed';
  date: string;
  price: number;
}

interface ScreenProps {
  go: (next: string) => void;
  orders?: Order[];
}

export default function MyOrdersScreen({ go, orders = [] }: ScreenProps) {
  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Pressable onPress={() => go('profile')} style={styles.backBtn} hitSlop={10}>
          <AngleLeftIcon width={18} height={18} fill={colors.ink} />
        </Pressable>
        <Text style={styles.headerTitle}>My Orders</Text>
        <View style={{ width: 40 }} />
      </View>

      {orders.length === 0 ? (
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
          data={orders}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={styles.orderCard}>
              <View style={styles.orderHeader}>
                <View style={styles.orderIconWrapper}>
                  <ClipboardListIcon width={16} height={16} fill={colors.white} />
                </View>
                <View style={styles.orderMeta}>
                  <Text style={styles.orderId}>{item.id}</Text>
                  <Text style={styles.orderDate}>{item.date}</Text>
                </View>
                <Text style={[styles.orderStatus, item.status === 'Completed' ? styles.statusGreen : styles.statusOrange]}>
                  {item.status}
                </Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.orderBody}>
                <Text style={styles.orderTitle} numberOfLines={1}>{item.title}</Text>
                <Text style={styles.orderPrice}>₱{item.price.toFixed(2)}</Text>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.mint || '#A8DDD6' },
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
  orderCard: { backgroundColor: colors.white, borderRadius: 20, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 3 },
  orderHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  orderIconWrapper: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.ink, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  orderMeta: { flex: 1 },
  orderId: { fontSize: 14, fontWeight: '900', color: colors.ink },
  orderDate: { fontSize: 11, fontWeight: '600', color: 'rgba(0,0,0,0.5)' },
  orderStatus: { fontSize: 12, fontWeight: '800', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, overflow: 'hidden' },
  statusGreen: { backgroundColor: '#E8F5E9', color: '#2E7D32' },
  statusOrange: { backgroundColor: '#FFF3E0', color: '#E65100' },
  divider: { height: 1, backgroundColor: '#F0F0F0', marginBottom: 12 },
  orderBody: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  orderTitle: { fontSize: 14, fontWeight: '700', color: colors.ink, flex: 1, marginRight: 12 },
  orderPrice: { fontSize: 16, fontWeight: '900', color: colors.ink },
});