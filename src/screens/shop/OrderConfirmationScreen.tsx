import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, AppState, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import * as Location from 'expo-location';
import { radii, spacing } from '../../constants/theme';
import { useAuth } from '../../services/AuthContext';
import { supabase } from '../../services/supabaseClient';
import { Order } from '../user/MyOrdersScreen';
import { CartItem } from './CartScreen';
import { getPaymentMethodLabel, isPayMongoEnabled, type PaymentMethod } from '../../services/paymentMethods';
import { useAppPreferences, type AppColors } from '../../services/AppPreferencesContext';

// SVG Imports
import CircleCheckIcon from '../../images/Icons/circle-check-solid-full.svg';
import TruckIcon from '../../images/Icons/truck-fast-solid-full.svg';

interface ScreenProps {
  go: (next: string, id?: string) => void;
  orders: Order[];
  cartItems: CartItem[];
  setCartItems: React.Dispatch<React.SetStateAction<CartItem[]>>;
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  paymentMethod: PaymentMethod;
}

export default function OrderConfirmationScreen({
  go,
  orders,
  cartItems,
  setCartItems,
  setOrders,
  paymentMethod,
}: ScreenProps) {
  const { user } = useAuth();
  const { colors } = useAppPreferences();
  const styles = createStyles(colors);
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [isOpeningCheckout, setIsOpeningCheckout] = useState(false);
  const hasStartedRef = useRef(false);

  const openHostedCheckout = useCallback(async (orderId: string) => {
    if (!isPayMongoEnabled) {
      throw new Error('PayMongo is not enabled. Complete the secure gateway setup before choosing online payment.');
    }

    setCheckoutError(null);
    setIsOpeningCheckout(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-paymongo-checkout', {
        body: { order_id: orderId, payment_method: paymentMethod },
      });
      if (error) throw error;
      if (typeof data?.checkout_url !== 'string') {
        throw new Error(data?.error || 'The payment provider did not return a checkout link.');
      }
      await Linking.openURL(data.checkout_url);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not open secure checkout.';
      console.error('Could not open PayMongo checkout:', message);
      setCheckoutError(message);
      throw error;
    } finally {
      setIsOpeningCheckout(false);
    }
  }, [paymentMethod]);

  const createOrder = async () => {
    const selectedItems = cartItems.filter((item) => item.selected);
    if (hasStartedRef.current || selectedItems.length === 0) return;
    hasStartedRef.current = true;
    setIsSaving(true);

    try {
      if (!user) throw new Error('Sign in before placing an order.');
      if (paymentMethod !== 'cod' && !isPayMongoEnabled) {
        throw new Error('PayMongo is not enabled. Complete the secure gateway setup before choosing online payment.');
      }

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Location permission is needed to save the delivery destination.');
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const { data, error } = await supabase.rpc('create_store_order', {
        p_items: selectedItems.map((item) => {
          const separator = item.id.lastIndexOf('-');
          return {
            catalog_item_id: separator > 0 ? item.id.slice(0, separator) : item.id,
            variant: item.subtitle.replace(/^Size:\s*/, '') || 'Standard',
            quantity: item.quantity,
          };
        }),
        p_delivery_latitude: position.coords.latitude,
        p_delivery_longitude: position.coords.longitude,
        p_delivery_address: user.address ?? '',
        p_payment_method: paymentMethod,
      });

      if (error) throw error;
      const savedOrder = Array.isArray(data) ? data[0] : data;
      if (!savedOrder) throw new Error('Supabase did not return the saved order.');

      const order: Order = {
        id: savedOrder.id,
        order_number: savedOrder.order_number,
        title: savedOrder.title,
        status: savedOrder.status as Order['status'],
        date: new Date(savedOrder.created_at).toLocaleDateString(),
        price: Number(savedOrder.price),
        delivery_latitude: savedOrder.delivery_latitude,
        delivery_longitude: savedOrder.delivery_longitude,
        payment_method: savedOrder.payment_method,
        payment_status: savedOrder.payment_status,
      };
      setCreatedOrder(order);
      setOrders((previous) => [order, ...previous]);
      setCartItems((previous) => previous.filter((item) => !item.selected));
      if (paymentMethod !== 'cod') {
        try {
          await openHostedCheckout(order.id);
        } catch {
          // The order is already saved; the screen offers a secure checkout retry.
        }
      }
    } catch (error) {
      hasStartedRef.current = false;
      const message = error instanceof Error ? error.message : 'Order creation failed. Please try again.';
      console.error('Order Creation Error:', error);
      Alert.alert('Order could not be saved', message);
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    void createOrder();
  }, []);

  useEffect(() => {
    if (!createdOrder || paymentMethod === 'cod') return;

    const refreshPaymentStatus = async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('payment_status')
        .eq('id', createdOrder.id)
        .maybeSingle();
      if (error) {
        console.error('Could not refresh payment status:', error.message);
        return;
      }
      if (data) {
        setCreatedOrder((previous) => previous
          ? { ...previous, payment_status: data.payment_status as Order['payment_status'] }
          : previous);
      }
    };

    const channel = supabase
      .channel(`order-payment-${createdOrder.id}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'orders', filter: `id=eq.${createdOrder.id}` },
        (payload) => {
          const paymentStatus = payload.new.payment_status;
          if (paymentStatus === 'paid' || paymentStatus === 'pending' || paymentStatus === 'refunded') {
            setCreatedOrder((previous) => previous ? { ...previous, payment_status: paymentStatus } : previous);
          }
        },
      )
      .subscribe();
    const appStateSubscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') void refreshPaymentStatus();
    });

    return () => {
      appStateSubscription.remove();
      void supabase.removeChannel(channel);
    };
  }, [createdOrder?.id, paymentMethod]);

  const latestOrder = createdOrder || (cartItems.length === 0 ? orders[0] : undefined);
  const onlinePayment = paymentMethod !== 'cod';
  const paymentConfirmed = !onlinePayment || latestOrder?.payment_status === 'paid';

  return (
    <View style={styles.fillWhite}>
      <View style={styles.topSection}>
        <CircleCheckIcon width={130} height={130} fill={colors.mint} style={{ marginBottom: 24 }} />
        <Text style={styles.headingTitle}>
          {latestOrder && paymentConfirmed
            ? 'Your order is saved!'
            : latestOrder
              ? 'Payment pending'
              : isSaving
                ? 'Saving your order...'
                : 'Order not saved yet'}
        </Text>
        <Text style={styles.headingSub}>
          {latestOrder && onlinePayment && !paymentConfirmed
            ? checkoutError || 'Complete payment in the secure PayMongo checkout. The order will be confirmed after PayMongo verifies it.'
            : latestOrder && onlinePayment
              ? 'PayMongo confirmed your payment. Tracking becomes available after a driver is assigned.'
              : latestOrder
                ? 'Your order is in the system. Cash is due on delivery; tracking becomes available after a driver is assigned.'
                : 'We need your location and a connection to Supabase before this order can be created.'}
        </Text>
      </View>

      <View style={styles.receiptContainer}>
        <View style={styles.orderIdRow}>
          <TruckIcon width={22} height={22} fill={colors.ink} />
          <View>
            <Text style={styles.orderIdText}>
              {latestOrder ? `Order ID ${latestOrder.order_number || latestOrder.id}` : 'Preparing your order'}
            </Text>
            <Text style={styles.courierSub}>Pawfect delivery</Text>
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
              <Text style={styles.colValue}>{user?.name || user?.username || 'Guest User'}</Text>
            </View>
          </View>

          <View style={styles.twoColumnRow}>
            <View style={styles.col}>
              <Text style={styles.colLabel}>Delivery Location</Text>
              <Text style={styles.colValue}>
                {latestOrder?.delivery_latitude !== undefined
                  ? 'Current GPS location captured'
                  : 'Location will be captured when the order is saved.'}
              </Text>
            </View>
          </View>

          <View style={styles.col}>
            <Text style={styles.colLabel}>Order Total · {getPaymentMethodLabel(paymentMethod)}</Text>
            <Text style={styles.amountValue}>₱{(latestOrder?.price ?? 0).toFixed(2)}</Text>
          </View>
        </View>
      </View>

      <View style={styles.actionSection}>
        {onlinePayment && !paymentConfirmed && latestOrder && (
          <Pressable
            style={[styles.trackBtn, isOpeningCheckout && styles.disabledBtn]}
            onPress={() => void openHostedCheckout(latestOrder.id).catch(() => undefined)}
            disabled={isOpeningCheckout}
          >
            <Text style={styles.trackBtnText}>
              {isOpeningCheckout ? 'Opening secure checkout...' : 'Continue to secure payment'}
            </Text>
          </Pressable>
        )}
        <Pressable
        style={[styles.trackBtn, (!latestOrder || isSaving || !paymentConfirmed) && styles.disabledBtn]}
        onPress={() => latestOrder ? go('trackOrder', latestOrder.id) : void createOrder()}
        disabled={isSaving || !paymentConfirmed || (cartItems.length === 0 && !latestOrder)}
        >
        <Text style={styles.trackBtnText}>
          {isSaving ? 'Saving order...' : latestOrder && paymentConfirmed ? 'Track your order' : 'Retry saving order'}
        </Text>
        </Pressable>

        <Pressable style={styles.homeBtn} onPress={() => go('main')}>
          <Text style={styles.homeBtnText}>Back to Home</Text>
        </Pressable>
      </View>
    </View>
  );
}

const createStyles = (colors: AppColors) => StyleSheet.create({
  fillWhite: { flex: 1, backgroundColor: colors.background, paddingHorizontal: spacing.lg, justifyContent: 'space-between', paddingTop: 60, paddingBottom: 40 },
  topSection: { alignItems: 'center', marginTop: 20 },
  headingTitle: { fontSize: 20, fontWeight: '900', color: colors.ink, marginBottom: 8 },
  headingSub: { fontSize: 12, color: colors.textMuted, textAlign: 'center', lineHeight: 18, paddingHorizontal: 10 },
  receiptContainer: { width: '100%' },
  orderIdRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  orderIdText: { fontSize: 13, fontWeight: '800', color: colors.ink },
  courierSub: { fontSize: 10, color: colors.textMuted },
  receiptBox: { borderWidth: 1, borderColor: colors.border, borderRadius: 16, padding: 16, gap: 14, backgroundColor: colors.surface },
  twoColumnRow: { flexDirection: 'row', justifyContent: 'space-between' },
  col: { flex: 1, paddingRight: 10 },
  colLabel: { fontSize: 10, color: colors.textMuted, marginBottom: 2 },
  colValue: { fontSize: 11, fontWeight: '700', color: colors.ink, lineHeight: 15 },
  amountValue: { fontSize: 14, fontWeight: '900', color: colors.ink },
  actionSection: { width: '100%', gap: 12 },
  trackBtn: { backgroundColor: colors.mint, height: 48, borderRadius: radii.pill, justifyContent: 'center', alignItems: 'center' },
  disabledBtn: { opacity: 0.5 },
  trackBtnText: { fontSize: 13, fontWeight: '800', color: colors.isDark ? '#111A1A' : colors.ink },
  homeBtn: { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.mint, height: 48, borderRadius: radii.pill, justifyContent: 'center', alignItems: 'center' },
  homeBtnText: { fontSize: 13, fontWeight: '800', color: colors.ink },
});