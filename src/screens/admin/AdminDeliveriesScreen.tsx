import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useAppPreferences, type AppColors } from '../../services/AppPreferencesContext';
import AngleLeftIcon from '../../images/Icons/angle-left-solid-full.svg';
import { supabase } from '../../services/supabaseClient';

interface ScreenProps {
  go: (next: string) => void;
}

interface DeliveryOrder {
  id: string;
  order_number: string;
  title: string;
  status: string;
  payment_method: string;
  payment_status: string;
  assigned_driver_id: string | null;
}

interface Driver {
  id: string;
  name: string;
  username: string;
  is_available: boolean;
}

export default function AdminDeliveriesScreen({ go }: ScreenProps) {
  const { colors } = useAppPreferences();
  const styles = createStyles(colors);
  const [orders, setOrders] = useState<DeliveryOrder[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    const [orderResult, driverResult] = await Promise.all([
      supabase
        .from('orders')
        .select('id, order_number, title, status, payment_method, payment_status, assigned_driver_id')
        .neq('status', 'Completed')
        .order('created_at', { ascending: false }),
      supabase
        .from('users')
        .select('id, name, username, is_available')
        .eq('role', 'driver')
        .order('name'),
    ]);

    if (orderResult.error || driverResult.error) {
      const error = orderResult.error || driverResult.error;
      console.error('Could not load delivery assignments:', error?.message);
      Alert.alert('Could not load deliveries', error?.message || 'Please try again.');
      setLoading(false);
      return;
    }

    setOrders(orderResult.data || []);
    setDrivers(driverResult.data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  useEffect(() => {
    const channel = supabase
      .channel('admin-driver-availability')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'users', filter: 'role=eq.driver' },
        () => {
          void loadData();
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [loadData]);

  const assignDriver = async (orderId: string, driverId: string) => {
    const { error } = await supabase.rpc('assign_delivery_driver', {
      p_order_id: orderId,
      p_driver_id: driverId,
    });

    if (error) {
      console.error('Could not assign delivery driver:', error.message);
      Alert.alert('Assignment failed', error.message);
      return;
    }

    await loadData();
  };

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Pressable onPress={() => go('profile')} style={styles.backBtn} hitSlop={10}>
          <AngleLeftIcon width={18} height={18} fill={colors.ink} />
        </Pressable>
        <Text style={styles.headerTitle}>Delivery assignments</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {loading ? (
          <Text style={styles.infoText}>Loading orders...</Text>
        ) : orders.length === 0 ? (
          <Text style={styles.infoText}>There are no active orders to assign.</Text>
        ) : drivers.length === 0 ? (
          <Text style={styles.infoText}>
            No driver accounts yet. Create an account, then promote it to the driver role in Supabase.
          </Text>
        ) : orders.map((order) => (
          <View key={order.id} style={styles.orderCard}>
            <Text style={styles.orderNumber}>{order.order_number}</Text>
            <Text style={styles.orderTitle}>{order.title}</Text>
            <Text style={styles.orderStatus}>Status: {order.status}</Text>
            {order.payment_method !== 'cod' && (
              <Text style={styles.orderStatus}>
                Payment: {order.payment_status === 'paid' ? 'Paid' : 'Pending'}
              </Text>
            )}
            {order.payment_method !== 'cod' && order.payment_status !== 'paid' && (
              <Text style={styles.waitingForPayment}>Driver assignment is disabled until payment is confirmed.</Text>
            )}
            <Text style={styles.chooseDriver}>Assign driver</Text>
            {drivers.map((driver) => (
              <Pressable
                key={driver.id}
                style={[
                  styles.driverOption,
                  order.assigned_driver_id === driver.id && styles.selectedDriver,
                  order.payment_method !== 'cod' && order.payment_status !== 'paid' && styles.disabledDriverOption,
                ]}
                onPress={() => void assignDriver(order.id, driver.id)}
                disabled={order.payment_method !== 'cod' && order.payment_status !== 'paid'}
              >
                <Text style={styles.driverName}>{driver.name || driver.username}</Text>
                <Text style={styles.driverEmail}>{driver.username}</Text>
                <Text style={[styles.availabilityLabel, driver.is_available && styles.availableLabel]}>
                  {driver.is_available ? 'ACTIVE - AVAILABLE' : 'OFF DUTY'}
                </Text>
                {order.assigned_driver_id === driver.id && (
                  <Text style={styles.assignedLabel}>Assigned</Text>
                )}
              </Pressable>
            ))}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const createStyles = (colors: AppColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 60, paddingBottom: 20, paddingHorizontal: 24 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.5)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '900', color: colors.ink },
  content: { paddingHorizontal: 20, paddingBottom: 40 },
  infoText: { marginTop: 30, color: colors.ink, fontSize: 14, lineHeight: 21, textAlign: 'center' },
  orderCard: { marginBottom: 16, padding: 18, borderRadius: 20, backgroundColor: colors.surface },
  orderNumber: { color: colors.ink, fontSize: 15, fontWeight: '900' },
  orderTitle: { marginTop: 5, color: colors.ink, fontSize: 14, fontWeight: '700' },
  orderStatus: { marginTop: 5, color: colors.textMuted, fontSize: 12 },
  waitingForPayment: { marginTop: 6, color: '#8E3B3B', fontSize: 11, lineHeight: 16 },
  chooseDriver: { marginTop: 16, marginBottom: 8, color: colors.ink, fontSize: 12, fontWeight: '900' },
  driverOption: { marginTop: 6, padding: 12, borderWidth: 1, borderColor: colors.border, borderRadius: 12 },
  selectedDriver: { borderColor: '#2E7D32', backgroundColor: colors.mint },
  disabledDriverOption: { opacity: 0.45 },
  driverName: { color: colors.ink, fontSize: 13, fontWeight: '800' },
  driverEmail: { marginTop: 2, color: colors.textMuted, fontSize: 11 },
  availabilityLabel: { marginTop: 6, color: '#8E3B3B', fontSize: 10, fontWeight: '900' },
  availableLabel: { color: '#2E7D32' },
  assignedLabel: { position: 'absolute', right: 12, top: 14, color: '#2E7D32', fontSize: 10, fontWeight: '900' },
});
