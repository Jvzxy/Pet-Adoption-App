import React, { useRef, useState } from 'react';
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import * as Location from 'expo-location';
import * as WebBrowser from 'expo-web-browser';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { radii, spacing } from '../../constants/theme';
import { useAuth } from '../../services/AuthContext';
import { useAppData } from '../../services/AppDataContext';
import { isXenditEnabled, type PaymentMethod } from '../../services/paymentMethods';
import { useAppPreferences, type AppColors } from '../../services/AppPreferencesContext';
import { supabase } from '../../services/supabaseClient';
import type { Order } from '../user/MyOrdersScreen';

// SVG Imports
import TruckIcon from '../../images/Icons/truck-fast-solid-full.svg';
import LocationIcon from '../../images/Icons/location-dot-solid-full.svg';
import CheckIcon from '../../images/Icons/check-solid-full.svg'; 
import AngleLeftIcon from '../../images/Icons/angle-left-solid-full.svg'; 

interface ScreenProps {
  go: (next: string) => void;
  onPaymentComplete: (order: Order) => void;
  selectedPaymentMethod: PaymentMethod;
  setSelectedPaymentMethod: (method: PaymentMethod) => void;
}

export default function PaymentScreen({
  go,
  onPaymentComplete,
  selectedPaymentMethod,
  setSelectedPaymentMethod,
}: ScreenProps) {
  const { user } = useAuth();
  const { biometricEnabled, colors } = useAppPreferences();
  const styles = createStyles(colors);
  const { cartItems, setCartItems } = useAppData();
  const insets = useSafeAreaInsets();
  const [pendingOrder, setPendingOrder] = useState<Order | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMessage, setPaymentMessage] = useState<string | null>(null);
  const processingRef = useRef(false);

  const selectedTotal = cartItems
    .filter((item) => item.selected)
    .reduce((sum, item) => sum + item.price * item.quantity, 0);
  const productTotal = selectedTotal;
  const shippingCost = 100;
  const totalPayment = productTotal + shippingCost;

  const selectMethod = (method: PaymentMethod) => {
    if (pendingOrder || processingRef.current) return;
    setSelectedPaymentMethod(method);
  };

  const handlePlaceOrder = async () => {
    if (processingRef.current) return;
    
    // 1. Intercept checkout if user hasn't provided an address
    if (!pendingOrder && !user?.address) {
      Alert.alert(
        'Address Required',
        'Please add a delivery address to your profile before placing an order.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Add Address', onPress: () => go('address') }
        ]
      );
      return;
    }

    if (!pendingOrder && selectedTotal <= 0) {
      Alert.alert('Cart is empty', 'Select at least one product before placing an order.');
      return;
    }

    // 2. Perform Biometric Check for non-COD payments if enabled
    if (!pendingOrder && selectedPaymentMethod !== 'cod' && biometricEnabled) {
      try {
        const hasHardware = await LocalAuthentication.hasHardwareAsync();
        const isEnrolled = hasHardware && await LocalAuthentication.isEnrolledAsync();
        if (!isEnrolled) {
          Alert.alert(
            'Biometrics unavailable',
            'Set up Face ID, Touch ID, or fingerprint unlock in device settings, or disable biometric payment confirmation in Settings.',
          );
          return;
        }

        const result = await LocalAuthentication.authenticateAsync({
          promptMessage: 'Authenticate to confirm payment',
          cancelLabel: 'Cancel',
          disableDeviceFallback: false,
        });
        if (!result.success) return;
      } catch (error) {
        console.error('Payment biometric authentication failed:', error);
        Alert.alert('Authentication unavailable', 'Could not authenticate this payment. Please try again.');
        return;
      }
    }

    // 3. Handle Cash On Delivery
    if (selectedPaymentMethod === 'cod') {
      go('orderConfirmation');
      return;
    }

    if (!isXenditEnabled) {
      setPaymentMessage('Xendit checkout is not enabled. Configure and deploy the Xendit payment functions before continuing.');
      return;
    }

    processingRef.current = true;
    setIsProcessing(true);
    setPaymentMessage('Opening Xendit checkout...');

    try {
      let order = pendingOrder;
      
      // 4. Create Order record via Supabase RPC if not already created
      if (!order) {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          throw new Error('Location permission is needed to save the delivery destination.');
        }

        const position = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        const selectedItems = cartItems.filter((item) => item.selected);
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
          p_delivery_address: user?.address ?? '',
          p_payment_method: selectedPaymentMethod,
        });

        if (error) throw error;
        const savedOrder = Array.isArray(data) ? data[0] : data;
        if (!savedOrder) throw new Error('Supabase did not return the saved order.');

        order = {
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
        setPendingOrder(order);
      }

      // 5. Invoke Supabase Edge Function to get Xendit Invoice URL
      const { data, error } = await supabase.functions.invoke('create-xendit-checkout', {
        body: { order_id: order.id, payment_method: selectedPaymentMethod },
      });
      if (error) throw error;
      if (typeof data?.invoice_url !== 'string') {
        throw new Error(data?.error || 'Xendit did not return a secure checkout link.');
      }

      setPaymentMessage('Complete your payment in Xendit. We will continue when the payment is confirmed.');
      const returnUrl = `pawfectcats://payment-return?order_id=${encodeURIComponent(order.id)}`;
      await WebBrowser.openAuthSessionAsync(data.invoice_url, returnUrl);

      // 6. Poll Supabase to verify payment confirmation status
      setPaymentMessage('Waiting for Xendit to confirm your payment...');
      let paid = false;
      for (let attempt = 0; attempt < 60; attempt += 1) {
        const { data: payment, error: paymentError } = await supabase
          .from('orders')
          .select('payment_status')
          .eq('id', order.id)
          .maybeSingle();
        if (paymentError) throw paymentError;
        if (payment?.payment_status === 'paid') {
          paid = true;
          break;
        }
        if (payment?.payment_status === 'refunded') {
          throw new Error('This payment was refunded. Contact support if you believe this is a mistake.');
        }
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }

      if (!paid) {
        setPaymentMessage('Payment is not confirmed yet. Complete the Xendit checkout, then continue again to check its status.');
        return;
      }

      const completedOrder = { ...order, payment_status: 'paid' as const };
      setPendingOrder(null);
      setCartItems((previous) => previous.filter((item) => !item.selected));
      onPaymentComplete(completedOrder);
      go('orderConfirmation');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not complete secure checkout.';
      console.error('Xendit checkout failed:', error);
      setPaymentMessage(message);
    } finally {
      processingRef.current = false;
      setIsProcessing(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => go('cart')} hitSlop={10} disabled={!!pendingOrder || isProcessing}>
          <AngleLeftIcon width={24} height={24} fill={colors.ink} />
        </Pressable>
        <Text style={styles.headerTitle}>Payment</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollPad} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionHeading}>Order Summary</Text>
        
        {/* Courier Selection */}
        <View style={styles.shippingCard}>
          <View style={styles.shippingLeft}>
            <TruckIcon width={20} height={20} fill={colors.ink} />
            <View>
              <Text style={styles.courierName}>J&T Express</Text>
              <Text style={styles.estimatedText}>Estimated arrival 2-4 business days</Text>
            </View>
          </View>
        </View>

        {/* Recipient Address Card */}
        <View style={styles.card}>
          <View style={styles.addressHeaderRow}>
            <Text style={styles.cardHeading}>Delivery Address</Text>
            <Pressable onPress={() => go('address')}>
              <Text style={styles.editText}>Change</Text>
            </Pressable>
          </View>
          
          <View style={styles.addressRow}>
            <LocationIcon width={16} height={16} fill={colors.ink} style={{ marginTop: 2 }} />
            <View style={styles.addressInfo}>
              <Text style={styles.recipientName}>
                {user?.name || user?.username || 'Guest User'} {user?.phone ? ` | ${user.phone}` : ''}
              </Text>
              <Text style={styles.addressBody}>
                {user?.address || 'No address provided. Please tap "Change" to set up your delivery address.'}
              </Text>
            </View>
          </View>
        </View>

        {/* Payment Summary */}
        <View style={styles.card}>
          <Text style={styles.cardHeading}>Payment Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Product cost</Text>
            <Text style={styles.summaryValue}>₱ {productTotal.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Shipping cost</Text>
            <Text style={styles.summaryValue}>₱ {shippingCost.toFixed(2)}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Total Payment</Text>
            <Text style={styles.totalValue}>₱ {totalPayment.toFixed(2)}</Text>
          </View>
        </View>

        {/* Payment Method Selector */}
        <View style={styles.card}>
          <Text style={styles.cardHeading}>Payment Method</Text>

          <Pressable style={styles.methodRow} onPress={() => selectMethod('cod')} disabled={!!pendingOrder || isProcessing}>
            <View style={styles.methodLeft}>
              <Image source={require('../../images/img/COD logo.png')} style={styles.methodIcon} resizeMode="contain" />
              <Text style={styles.methodLabel}>Cash on delivery</Text>
            </View>
            <View style={[styles.radio, selectedPaymentMethod === 'cod' && styles.radioActive]}>
               {selectedPaymentMethod === 'cod' && <CheckIcon width={12} height={12} fill={colors.ink} />}
            </View>
          </Pressable>

          <Pressable style={styles.methodRow} onPress={() => selectMethod('xendit_card')} disabled={!!pendingOrder || isProcessing}>
            <View style={styles.methodLeft}>
              <Text style={styles.methodLabel}>Debit/credit card</Text>
              <View style={styles.cardIconsContainer}>
                <Image source={require('../../images/img/Visa Icon.jpg')} style={styles.miniCardIcon} />
                <Image source={require('../../images/img/Mastercard Icon.webp')} style={styles.miniCardIcon} />
              </View>
            </View>
            <View style={[styles.radio, selectedPaymentMethod === 'xendit_card' && styles.radioActive]}>
              {selectedPaymentMethod === 'xendit_card' && <CheckIcon width={12} height={12} fill={colors.ink} />}
            </View>
          </Pressable>

          <Pressable style={styles.methodRow} onPress={() => selectMethod('xendit_maya')} disabled={!!pendingOrder || isProcessing}>
            <View style={styles.methodLeft}>
              <Image source={require('../../images/img/Maya.png')} style={styles.methodIcon} resizeMode="contain" />
              <Text style={styles.methodLabel}>Maya</Text>
            </View>
            <View style={[styles.radio, selectedPaymentMethod === 'xendit_maya' && styles.radioActive]}>
              {selectedPaymentMethod === 'xendit_maya' && <CheckIcon width={12} height={12} fill={colors.ink} />}
            </View>
          </Pressable>

          <Pressable style={[styles.methodRow, { borderBottomWidth: 0 }]} onPress={() => selectMethod('xendit_gcash')} disabled={!!pendingOrder || isProcessing}>
            <View style={styles.methodLeft}>
              <Image source={require('../../images/img/Gcash.png')} style={styles.methodIcon} resizeMode="contain" />
              <Text style={styles.methodLabel}>GCash</Text>
            </View>
            <View style={[styles.radio, selectedPaymentMethod === 'xendit_gcash' && styles.radioActive]}>
              {selectedPaymentMethod === 'xendit_gcash' && <CheckIcon width={12} height={12} fill={colors.ink} />}
            </View>
          </Pressable>

          <Text style={styles.paymentNote}>
            Online payments (GCash, Maya, and Cards) are processed securely through Xendit's Philippine payment portal.
          </Text>
          {paymentMessage && <Text style={styles.paymentNote}>{paymentMessage}</Text>}
        </View>
      </ScrollView>

      {/* Place Order Bar */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <View>
          <Text style={styles.totalCountText}>Total</Text>
          <Text style={styles.bottomTotalPrice}>₱ {totalPayment.toFixed(2)}</Text>
        </View>
        <Pressable
          style={[styles.placeOrderBtn, (selectedTotal <= 0 && !pendingOrder || isProcessing) && styles.disabledButton]}
          onPress={() => void handlePlaceOrder()}
          disabled={(selectedTotal <= 0 && !pendingOrder) || isProcessing}
        >
          <Text style={styles.placeOrderText}>
            {isProcessing
              ? 'Waiting for payment...'
              : pendingOrder
                ? 'Continue secure payment'
                : selectedPaymentMethod === 'cod'
              ? 'Place order'
              : 'Continue to secure payment'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const createStyles = (colors: AppColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingTop: 50, paddingBottom: 16 },
  headerTitle: { fontSize: 18, fontWeight: '900', color: colors.ink },
  scrollPad: { paddingHorizontal: spacing.lg, paddingBottom: 110 },
  sectionHeading: { fontSize: 14, fontWeight: '800', color: colors.ink, marginBottom: 10 },
  shippingCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.surface, padding: 12, borderRadius: radii.md, marginBottom: 14 },
  shippingLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  courierName: { fontSize: 12, fontWeight: '800', color: colors.ink },
  estimatedText: { fontSize: 10, color: colors.textMuted },
  card: { backgroundColor: colors.surface, borderRadius: 16, padding: 16, marginBottom: 14 },
  addressHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  editText: { fontSize: 12, fontWeight: '800', color: '#007AFF' },
  addressRow: { flexDirection: 'row', gap: 10 },
  addressInfo: { flex: 1 },
  recipientName: { fontSize: 13, fontWeight: '800', color: colors.ink, marginBottom: 4 },
  addressBody: { fontSize: 12, color: colors.textMuted, lineHeight: 18 },
  cardHeading: { fontSize: 14, fontWeight: '800', color: colors.ink },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  summaryLabel: { fontSize: 12, color: colors.textMuted },
  summaryValue: { fontSize: 12, fontWeight: '700', color: colors.ink },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: 8 },
  totalLabel: { fontSize: 13, fontWeight: '800', color: colors.ink },
  totalValue: { fontSize: 13, fontWeight: '900', color: colors.ink },
  methodRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
  methodLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  methodIcon: { width: 32, height: 20 },
  methodLabel: { fontSize: 13, fontWeight: '700', color: colors.ink },
  cardIconsContainer: { flexDirection: 'row', gap: 4, marginLeft: 8, alignItems: 'center' },
  miniCardIcon: { width: 24, height: 16, resizeMode: 'contain' },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 1.5, borderColor: colors.textMuted, justifyContent: 'center', alignItems: 'center' },
  radioActive: { backgroundColor: colors.mint, borderColor: colors.mint },
  paymentNote: { marginTop: 10, color: colors.textMuted, fontSize: 11, lineHeight: 16 },
  disabledButton: { opacity: 0.5 },
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.border, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.lg, paddingTop: 16 },
  totalCountText: { color: colors.textMuted, fontSize: 11 },
  bottomTotalPrice: { color: colors.ink, fontSize: 18, fontWeight: '900' },
  placeOrderBtn: { backgroundColor: colors.isDark ? colors.mint : colors.ink, paddingHorizontal: 20, paddingVertical: 12, borderRadius: radii.pill },
  placeOrderText: { fontSize: 13, fontWeight: '900', color: colors.isDark ? colors.ink : '#FFFFFF' },
});