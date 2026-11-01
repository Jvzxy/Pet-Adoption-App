import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import * as Location from 'expo-location';
import { useAppPreferences, type AppColors } from '../../services/AppPreferencesContext';
import AngleLeftIcon from '../../images/Icons/angle-left-solid-full.svg';
import { supabase } from '../../services/supabaseClient';
import OSMMap from '../../components/OSMMap';

interface ScreenProps {
  go: (next: string) => void;
  orderId: string;
}

interface ActiveOrder {
  order_number: string;
  status: string;
  delivery_latitude: number;
  delivery_longitude: number;
}

interface Coordinates {
  latitude: number;
  longitude: number;
}

export default function DriverMapScreen({ go, orderId }: ScreenProps) {
  const { colors } = useAppPreferences();
  const styles = createStyles(colors);
  const watcher = useRef<Location.LocationSubscription | null>(null);
  const [order, setOrder] = useState<ActiveOrder | null>(null);
  const [driverPosition, setDriverPosition] = useState<Coordinates | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [isCompleting, setIsCompleting] = useState(false);

  useEffect(() => {
    let active = true;

    const startTracking = async () => {
      try {
        const { data: orderData, error: orderError } = await supabase
          .from('orders')
          .select('order_number, status, delivery_latitude, delivery_longitude')
          .eq('id', orderId)
          .maybeSingle();

        if (orderError) throw orderError;
        if (!orderData) throw new Error('This order is not assigned to this driver account.');
        if (orderData.status !== 'Shipped') {
          throw new Error('Start this delivery from My Deliveries before sharing GPS.');
        }

        const permission = await Location.requestForegroundPermissionsAsync();
        if (permission.status !== 'granted') {
          throw new Error('Allow location access while using the app to share delivery GPS.');
        }

        const destination: Coordinates = {
          latitude: orderData.delivery_latitude,
          longitude: orderData.delivery_longitude,
        };
        if (!active) return;

        setOrder(orderData);

        const subscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            distanceInterval: 10,
            timeInterval: 5000,
          },
          async (position) => {
            if (!active) return;

            const coordinates = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            };
            setDriverPosition(coordinates);

            const { error } = await supabase.rpc('update_delivery_location', {
              p_order_id: orderId,
              p_latitude: coordinates.latitude,
              p_longitude: coordinates.longitude,
              p_heading: position.coords.heading,
            });
            if (error) {
              console.error('Could not publish driver location:', error.message);
              if (active) setMessage(`Location could not be shared: ${error.message}`);
            } else if (active) {
              setMessage('Live GPS sharing is active while this screen stays open.');
            }
          },
        );

        if (active) {
          watcher.current = subscription;
          setLoading(false);
        } else {
          subscription.remove();
        }
      } catch (error) {
        console.error('Could not start driver tracking:', error);
        if (active) {
          const errorText = error instanceof Error ? error.message : 'Could not start GPS sharing.';
          setMessage(errorText);
          setLoading(false);
          Alert.alert('GPS sharing unavailable', errorText);
        }
      }
    };

    void startTracking();
    return () => {
      active = false;
      watcher.current?.remove();
      watcher.current = null;
    };
  }, [orderId]);

  const completeDelivery = async () => {
    setIsCompleting(true);
    const { error } = await supabase.rpc('update_delivery_status', {
      p_order_id: orderId,
      p_status: 'Completed',
    });

    if (error) {
      console.error('Could not complete delivery:', error.message);
      Alert.alert('Could not complete delivery', error.message);
      setIsCompleting(false);
      return;
    }

    watcher.current?.remove();
    go('driverDeliveries');
  };

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Pressable onPress={() => go('driverDeliveries')} style={styles.backBtn} hitSlop={10}>
          <AngleLeftIcon width={18} height={18} fill={colors.ink} />
        </Pressable>
        <Text style={styles.headerTitle}>Delivery GPS</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.ink} />
          <Text style={styles.message}>Starting GPS sharing...</Text>
        </View>
      ) : order ? (
        <View style={styles.content}>
          <View style={styles.mapCard}>
            <OSMMap
              destination={{
                latitude: order.delivery_latitude,
                longitude: order.delivery_longitude,
              }}
              driverLocation={driverPosition}
            />
          </View>
          <Text style={styles.orderNumber}>{order.order_number}</Text>
          <Text style={styles.message}>
            {message || 'Live GPS sharing starts when your current location is received.'}
          </Text>
          <Pressable
            style={[styles.completeButton, isCompleting && styles.disabledButton]}
            onPress={() => void completeDelivery()}
            disabled={isCompleting}
          >
            <Text style={styles.completeButtonText}>
              {isCompleting ? 'Updating order...' : 'Mark as delivered'}
            </Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.center}>
          <Text style={styles.message}>{message || 'Unable to start tracking.'}</Text>
          <Pressable style={styles.backAction} onPress={() => go('driverDeliveries')}>
            <Text style={styles.backActionText}>Back to deliveries</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const createStyles = (colors: AppColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 60, paddingBottom: 16, paddingHorizontal: 24 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.5)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '900', color: colors.ink },
  content: { flex: 1, paddingHorizontal: 18, paddingBottom: 30 },
  mapCard: { flex: 1, overflow: 'hidden', borderRadius: 22, backgroundColor: colors.surface },
  orderNumber: { marginTop: 16, color: colors.ink, fontSize: 17, fontWeight: '900', textAlign: 'center' },
  message: { marginTop: 8, color: colors.ink, fontSize: 13, lineHeight: 19, textAlign: 'center' },
  completeButton: { marginTop: 16, height: 50, borderRadius: 25, backgroundColor: colors.isDark ? colors.mint : colors.ink, alignItems: 'center', justifyContent: 'center' },
  disabledButton: { opacity: 0.5 },
  completeButtonText: { color: colors.isDark ? colors.ink : colors.white, fontSize: 14, fontWeight: '900' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 28 },
  backAction: { marginTop: 18, paddingHorizontal: 22, paddingVertical: 12, borderRadius: 20, backgroundColor: colors.isDark ? colors.mint : colors.ink },
  backActionText: { color: colors.isDark ? colors.ink : colors.white, fontWeight: '800' },
});
