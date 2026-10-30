import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../constants/theme';
import AngleLeftIcon from '../images/Icons/angle-left-solid-full.svg';
import ClipboardListIcon from '../images/Icons/clipboard-list-solid-full.svg';

interface ScreenProps {
  go: (next: string) => void;
}

const MOCK_ORDERS = [
  { id: 'ORD-001', title: 'Persian Cat Adoption Fee', status: 'Completed', date: 'Oct 12, 2026', price: '₱2,900.00' },
  { id: 'ORD-002', title: 'Premium Cat Food 5kg', status: 'Processing', date: 'Oct 29, 2026', price: '₱1,450.00' },
  { id: 'ORD-003', title: 'Interactive Laser Toy', status: 'Shipped', date: 'Oct 30, 2026', price: '₱725.00' },
];

export default function MyOrdersScreen({ go }: ScreenProps) {
  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Pressable onPress={() => go('profile')} style={styles.backBtn} hitSlop={10}>
          <AngleLeftIcon width={18} height={18} fill={colors.ink} />
        </Pressable>
        <Text style={styles.headerTitle}>My Orders</Text>
        <View style={{ width: 40 }} />
      </View>

      <FlatList
        data={MOCK_ORDERS}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
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
              <Text style={styles.orderTitle}>{item.title}</Text>
              <Text style={styles.orderPrice}>{item.price}</Text>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.mint || '#A8DDD6' },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 60, paddingBottom: 20, paddingHorizontal: 24 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.5)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '900', color: colors.ink || '#000' },
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
  orderTitle: { fontSize: 14, fontWeight: '700', color: colors.ink, flex: 1 },
  orderPrice: { fontSize: 16, fontWeight: '900', color: colors.ink },
});