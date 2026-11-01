import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useAppPreferences, type AppColors } from '../../services/AppPreferencesContext';
import AngleLeftIcon from '../../images/Icons/angle-left-solid-full.svg';
import { supabase } from '../../services/supabaseClient';
import { useAuth } from '../../services/AuthContext';

interface ScreenProps {
  go: (next: string, id?: string) => void;
}

interface AssignedOrder {
  id: string;
  order_number: string;
  title: string;
  status: string;
}

export default function DriverDeliveriesScreen({ go }: ScreenProps) {
  const { colors } = useAppPreferences();
  const styles = createStyles(colors);
  const { user, setDriverAvailability } = useAuth();
  const [orders, setOrders] = useState<AssignedOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingAvailability, setUpdatingAvailability] = useState(false);

  const loadOrders = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('orders')
      .select('id, order_number, title, status')
      .eq('assigned_driver_id', user.id)
      .neq('status', 'Completed')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Could not load assigned deliveries:', error.message);
      Alert.alert('Could not load deliveries', error.message);
    } else {
      setOrders(data || []);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    void loadOrders();
  }, [loadOrders]);

  const startDelivery = async (order: AssignedOrder) => {
    if (order.status === 'Processing') {
      const { error } = await supabase.rpc('update_delivery_status', {
        p_order_id: order.id,
        p_status: 'Shipped',
      });
      if (error) {
        console.error('Could not start delivery:', error.message);
        Alert.alert('Could not start delivery', error.message);
        return;
      }
    }
    go('driverMap', order.id);
  };

  const toggleAvailability = async () => {
    if (!user) return;
    setUpdatingAvailability(true);
    try {
      await setDriverAvailability(!user.isAvailable);
    } catch (error) {
      Alert.alert(
        'Availability update failed',
        error instanceof Error ? error.message : 'Please try again.',
      );
    } finally {
      setUpdatingAvailability(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Pressable onPress={() => go('profile')} style={styles.backBtn} hitSlop={10}>
          <AngleLeftIcon width={18} height={18} fill={colors.ink} />
        </Pressable>
        <Text style={styles.headerTitle}>My deliveries</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.availabilityCard}>
          <View style={styles.availabilityDetails}>
            <Text style={styles.availabilityTitle}>
              {user?.isAvailable ? 'You are active' : 'You are off duty'}
            </Text>
            <Text style={styles.availabilityDescription}>
              {user?.isAvailable
                ? 'Admins can see that you are available for deliveries.'
                : 'Go active to let admins know you are ready for deliveries.'}
            </Text>
          </View>
          <Pressable
            style={[styles.availabilityButton, user?.isAvailable && styles.offDutyButton]}
            onPress={() => void toggleAvailability()}
            disabled={updatingAvailability}
          >
            <Text style={styles.availabilityButtonText}>
              {updatingAvailability ? 'Updating...' : user?.isAvailable ? 'Go off duty' : 'Go active'}
            </Text>
          </Pressable>
        </View>
        {loading ? (
          <Text style={styles.infoText}>Loading your deliveries...</Text>
        ) : orders.length === 0 ? (
          <Text style={styles.infoText}>You have no active deliveries assigned to you.</Text>
        ) : orders.map((order) => (
          <View key={order.id} style={styles.orderCard}>
            <Text style={styles.orderNumber}>{order.order_number}</Text>
            <Text style={styles.orderTitle}>{order.title}</Text>
            <Text style={styles.orderStatus}>Status: {order.status}</Text>
            <Pressable style={styles.startButton} onPress={() => void startDelivery(order)}>
              <Text style={styles.startButtonText}>
                {order.status === 'Processing' ? 'Start delivery and share GPS' : 'Resume live GPS sharing'}
              </Text>
            </Pressable>
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
  headerTitle: { fontSize: 18, fontWeight: '900', color: colors.ink },
  content: { paddingHorizontal: 20, paddingBottom: 40 },
  infoText: { marginTop: 30, color: colors.ink, fontSize: 14, lineHeight: 21, textAlign: 'center' },
  availabilityCard: { marginBottom: 18, padding: 16, borderRadius: 18, backgroundColor: colors.surface },
  availabilityDetails: { marginBottom: 14 },
  availabilityTitle: { color: colors.ink, fontSize: 15, fontWeight: '900' },
  availabilityDescription: { marginTop: 5, color: colors.textMuted, fontSize: 12, lineHeight: 18 },
  availabilityButton: { paddingVertical: 12, borderRadius: 14, backgroundColor: colors.isDark ? colors.mint : colors.ink, alignItems: 'center' },
  offDutyButton: { backgroundColor: '#8E3B3B' },
  availabilityButtonText: { color: colors.isDark ? colors.ink : colors.white, fontSize: 13, fontWeight: '800' },
  orderCard: { marginBottom: 16, padding: 18, borderRadius: 20, backgroundColor: colors.surface },
  orderNumber: { color: colors.ink, fontSize: 15, fontWeight: '900' },
  orderTitle: { marginTop: 5, color: colors.ink, fontSize: 14, fontWeight: '700' },
  orderStatus: { marginTop: 5, color: colors.textMuted, fontSize: 12 },
  startButton: { marginTop: 16, padding: 13, borderRadius: 14, backgroundColor: colors.isDark ? colors.mint : colors.ink, alignItems: 'center' },
  startButtonText: { color: colors.isDark ? colors.ink : colors.white, fontSize: 12, fontWeight: '800', textAlign: 'center' },
});
