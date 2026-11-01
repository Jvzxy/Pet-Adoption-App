import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useAppPreferences, type AppColors } from '../../services/AppPreferencesContext';
import { supabase } from '../../services/supabaseClient';
import OSMMap from '../../components/OSMMap';

import AngleLeftIcon from '../../images/Icons/angle-left-solid-full.svg';
import CircleCheckIcon from '../../images/Icons/circle-check-solid-full.svg';

interface ScreenProps {
  go: (next: string) => void;
  orderId: string;
}

interface TrackedOrder {
  id: string;
  order_number: string;
  status: 'Processing' | 'Shipped' | 'Completed';
  delivery_latitude: number;
  delivery_longitude: number;
}

interface DriverLocation {
  latitude: number;
  longitude: number;
  updated_at: string;
}

export default function TrackOrderScreen({ go, orderId }: ScreenProps) {
  const { colors } = useAppPreferences();
  const styles = createStyles(colors);
  const [order, setOrder] = useState<TrackedOrder | null>(null);
  const [driverLocation, setDriverLocation] = useState<DriverLocation | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 15000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let active = true;

    const loadTracking = async () => {
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select('id, order_number, status, delivery_latitude, delivery_longitude')
        .eq('id', orderId)
        .maybeSingle();

      if (orderError) throw orderError;
      if (!orderData) throw new Error('This order could not be found or you do not have permission to view it.');

      const trackedOrder: TrackedOrder = {
        ...orderData,
        status: orderData.status as TrackedOrder['status'],
      };
      const { data: locationData, error: locationError } = await supabase
        .from('delivery_locations')
        .select('latitude, longitude, updated_at')
        .eq('order_id', orderId)
        .maybeSingle();

      if (locationError) throw locationError;
      if (!active) return;

      const location = locationData ?? null;
      setOrder(trackedOrder);
      setDriverLocation(location);
      setLoading(false);
    };

    void loadTracking().catch((error: unknown) => {
      console.error('Could not load delivery tracking:', error);
      if (active) {
        setErrorMessage(error instanceof Error ? error.message : 'Could not load delivery tracking.');
        setLoading(false);
      }
    });

    const channel = supabase
      .channel(`order-tracking-${orderId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'orders', filter: `id=eq.${orderId}` },
        (payload) => {
          setOrder((current) => current && {
            ...current,
            status: (payload.new.status as TrackedOrder['status']) || current.status,
          });
        },
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'delivery_locations', filter: `order_id=eq.${orderId}` },
        (payload) => {
          if (payload.eventType === 'DELETE') {
            setDriverLocation(null);
            return;
          }
          const location = payload.new as DriverLocation;
          setDriverLocation(location);
        },
      )
      .subscribe();

    return () => {
      active = false;
      void supabase.removeChannel(channel);
    };
  }, [orderId]);

  const outForDelivery = order?.status === 'Shipped' || order?.status === 'Completed';
  const delivered = order?.status === 'Completed';
  const locationIsLive = driverLocation
    ? currentTime - new Date(driverLocation.updated_at).getTime() < 30000
    : false;

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Pressable onPress={() => go('myOrders')} style={styles.backBtn} hitSlop={10}>
          <AngleLeftIcon width={18} height={18} fill={colors.ink} />
        </Pressable>
        <Text style={styles.headerTitle}>Track Order</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <View style={styles.centerMessage}>
          <ActivityIndicator size="large" color={colors.ink} />
          <Text style={styles.messageText}>Loading order tracking...</Text>
        </View>
      ) : errorMessage ? (
        <View style={styles.centerMessage}>
          <Text style={styles.messageTitle}>Tracking unavailable</Text>
          <Text style={styles.messageText}>{errorMessage}</Text>
        </View>
      ) : order ? (
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.mapCard}>
            <OSMMap
              destination={{
                latitude: order.delivery_latitude,
                longitude: order.delivery_longitude,
              }}
              driverLocation={driverLocation}
            />
            <Text style={styles.orderNumber}>{order.order_number}</Text>
          </View>

          <Text style={styles.statusMessage}>
            {delivered
              ? 'Your order has been delivered.'
              : driverLocation
                ? locationIsLive ? 'Live driver location' : 'Last known driver location'
                : outForDelivery
                  ? 'Waiting for the driver to share their location.'
                  : 'Your order is being prepared. Driver tracking starts when it is out for delivery.'}
          </Text>
          {driverLocation && (
            <Text style={styles.locationUpdated}>
              Location updated {new Date(driverLocation.updated_at).toLocaleTimeString()}
            </Text>
          )}

          <View style={styles.timeline}>
            <TimelineStep title="Order Placed" done styles={styles} colors={colors} />
            <TimelineStep title="Processing" done styles={styles} colors={colors} />
            <TimelineStep title="Out for Delivery" done={outForDelivery} active={outForDelivery && !delivered} styles={styles} colors={colors} />
            <TimelineStep title="Delivered" done={delivered} last styles={styles} colors={colors} />
          </View>
        </ScrollView>
      ) : null}
    </View>
  );
}

function TimelineStep({
  title,
  done,
  active = false,
  last = false,
  styles,
  colors,
}: {
  title: string;
  done: boolean;
  active?: boolean;
  last?: boolean;
  styles: ReturnType<typeof createStyles>;
  colors: AppColors;
}) {
  return (
    <View style={styles.step}>
      <View style={styles.stepMarkerColumn}>
        {done ? (
          <CircleCheckIcon width={24} height={24} fill={active ? '#E65100' : '#2E7D32'} />
        ) : (
          <View style={styles.inactiveDot} />
        )}
        {!last && <View style={[styles.stepLine, done && styles.stepLineDone]} />}
      </View>
      <Text style={[styles.stepTitle, active && styles.activeTitle, !done && styles.inactiveTitle]}>
        {title}
      </Text>
    </View>
  );
}

const createStyles = (colors: AppColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 60, paddingBottom: 16, paddingHorizontal: 24 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.5)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '900', color: colors.ink },
  content: { paddingHorizontal: 20, paddingBottom: 32 },
  mapCard: { height: 330, overflow: 'hidden', borderRadius: 24, backgroundColor: colors.surface, elevation: 3 },
  orderNumber: { position: 'absolute', top: 12, left: 12, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 14, overflow: 'hidden', backgroundColor: colors.surface, color: colors.ink, fontWeight: '900' },
  statusMessage: { marginTop: 18, color: colors.ink, textAlign: 'center', fontSize: 15, fontWeight: '800' },
  locationUpdated: { marginTop: 4, color: colors.textMuted, textAlign: 'center', fontSize: 12 },
  timeline: { marginTop: 24, padding: 20, backgroundColor: colors.surface, borderRadius: 20 },
  step: { flexDirection: 'row', minHeight: 58 },
  stepMarkerColumn: { width: 28, alignItems: 'center', marginRight: 14 },
  stepLine: { flex: 1, width: 3, minHeight: 32, backgroundColor: colors.border },
  stepLineDone: { backgroundColor: '#2E7D32' },
  inactiveDot: { width: 16, height: 16, marginTop: 4, borderRadius: 8, backgroundColor: colors.border },
  stepTitle: { paddingTop: 2, color: colors.ink, fontSize: 15, fontWeight: '800' },
  activeTitle: { color: '#E65100' },
  inactiveTitle: { color: colors.textMuted },
  centerMessage: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30 },
  messageTitle: { marginBottom: 8, color: colors.ink, fontSize: 18, fontWeight: '900' },
  messageText: { marginTop: 12, color: colors.ink, fontSize: 14, textAlign: 'center' },
});
