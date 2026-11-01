import React, { useState } from 'react';
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
import { radii, spacing } from '../../constants/theme';
import { useAuth } from '../../services/AuthContext';
import { useAppData } from '../../services/AppDataContext';
import { isPayMongoEnabled, type PaymentMethod } from '../../services/paymentMethods';
import { useAppPreferences, type AppColors } from '../../services/AppPreferencesContext';

// SVG Imports
import TruckIcon from '../../images/Icons/truck-fast-solid-full.svg';
import LocationIcon from '../../images/Icons/location-dot-solid-full.svg';
import CheckIcon from '../../images/Icons/check-solid-full.svg'; 
import AngleLeftIcon from '../../images/Icons/angle-left-solid-full.svg'; 

interface ScreenProps {
  go: (next: string) => void;
  selectedPaymentMethod: PaymentMethod;
  setSelectedPaymentMethod: (method: PaymentMethod) => void;
}

export default function PaymentScreen({
  go,
  selectedPaymentMethod,
  setSelectedPaymentMethod,
}: ScreenProps) {
  const { user } = useAuth();
  const { biometricEnabled, colors } = useAppPreferences();
  const styles = createStyles(colors);
  const { cartItems } = useAppData();
  const selectedTotal = cartItems
    .filter((item) => item.selected)
    .reduce((sum, item) => sum + item.price * item.quantity, 0);
  const productTotal = selectedTotal;
  const shippingCost = 100;
  const totalPayment = productTotal + shippingCost;

  const selectMethod = (method: PaymentMethod) => {
    if (method !== 'cod' && !isPayMongoEnabled) {
      go('addCard');
      return;
    }
    setSelectedPaymentMethod(method);
  };

  const handlePlaceOrder = async () => {
    // Intercept checkout if user hasn't provided an address
    if (!user?.address) {
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
    if (selectedTotal <= 0) {
      Alert.alert('Cart is empty', 'Select at least one product before placing an order.');
      return;
    }

    if (selectedPaymentMethod !== 'cod' && biometricEnabled) {
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
    
    // Proceed if address exists
    go('orderConfirmation');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => go('cart')} hitSlop={10}>
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
              <Text style={styles.estimatedText}>Estimated arrival Oct 23 – 27</Text>
            </View>
          </View>
        </View>

        {/* Dynamic Recipient Address Card */}
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

          <Pressable style={styles.methodRow} onPress={() => selectMethod('cod')}>
            <View style={styles.methodLeft}>
              <Image source={require('../../images/img/COD logo.png')} style={styles.methodIcon} resizeMode="contain" />
              <Text style={styles.methodLabel}>Cash on delivery</Text>
            </View>
            <View style={[styles.radio, selectedPaymentMethod === 'cod' && styles.radioActive]}>
               {selectedPaymentMethod === 'cod' && <CheckIcon width={12} height={12} fill={colors.ink} />}
            </View>
          </Pressable>

          <Pressable style={[styles.methodRow, !isPayMongoEnabled && styles.unavailableMethod]} onPress={() => selectMethod('paymongo_card')}>
            <View style={styles.methodLeft}>
              <Text style={styles.methodLabel}>Debit/credit card</Text>
              <View style={styles.cardIconsContainer}>
                <Image source={require('../../images/img/Visa Icon.jpg')} style={styles.miniCardIcon} />
                <Image source={require('../../images/img/Mastercard Icon.webp')} style={styles.miniCardIcon} />
              </View>
            </View>
            <View style={[styles.radio, selectedPaymentMethod === 'paymongo_card' && styles.radioActive]}>
              {selectedPaymentMethod === 'paymongo_card' && <CheckIcon width={12} height={12} fill={colors.ink} />}
            </View>
          </Pressable>

          <Pressable style={[styles.methodRow, !isPayMongoEnabled && styles.unavailableMethod]} onPress={() => selectMethod('paymongo_maya')}>
            <View style={styles.methodLeft}>
              <Image source={require('../../images/img/Maya.png')} style={styles.methodIcon} resizeMode="contain" />
              <Text style={styles.methodLabel}>Maya</Text>
            </View>
            <View style={[styles.radio, selectedPaymentMethod === 'paymongo_maya' && styles.radioActive]}>
              {selectedPaymentMethod === 'paymongo_maya' && <CheckIcon width={12} height={12} fill={colors.ink} />}
            </View>
          </Pressable>

          <Pressable style={[styles.methodRow, !isPayMongoEnabled && styles.unavailableMethod, { borderBottomWidth: 0 }]} onPress={() => selectMethod('paymongo_gcash')}>
            <View style={styles.methodLeft}>
              <Image source={require('../../images/img/Gcash.png')} style={styles.methodIcon} resizeMode="contain" />
              <Text style={styles.methodLabel}>GCash</Text>
            </View>
            <View style={[styles.radio, selectedPaymentMethod === 'paymongo_gcash' && styles.radioActive]}>
              {selectedPaymentMethod === 'paymongo_gcash' && <CheckIcon width={12} height={12} fill={colors.ink} />}
            </View>
          </Pressable>

          <Text style={styles.paymentNote}>
            {isPayMongoEnabled
              ? 'Card and e-wallet details are entered securely on PayMongo’s hosted checkout page.'
              : 'Tap a card or e-wallet option to see the PayMongo setup steps. No payment details are collected in this app.'}
          </Text>
        </View>
      </ScrollView>

      {/* Place Order Bar */}
      <View style={styles.bottomBar}>
        <View>
          <Text style={styles.totalCountText}>Total</Text>
          <Text style={styles.bottomTotalPrice}>₱ {totalPayment.toFixed(2)}</Text>
        </View>
        <Pressable style={[styles.placeOrderBtn, selectedTotal <= 0 && styles.disabledButton]} onPress={() => void handlePlaceOrder()} disabled={selectedTotal <= 0}>
          <Text style={styles.placeOrderText}>
            {selectedPaymentMethod === 'cod' ? 'Place order' : 'Continue to secure payment'}
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
  divider: { height: 1, backgroundColor: '#E0E0E0', marginVertical: 8 },
  totalLabel: { fontSize: 13, fontWeight: '800', color: colors.ink },
  totalValue: { fontSize: 13, fontWeight: '900', color: colors.ink },
  methodRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  methodLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  methodIcon: { width: 32, height: 20 },
  methodLabel: { fontSize: 13, fontWeight: '700', color: colors.ink },
  cardIconsContainer: { flexDirection: 'row', gap: 4, marginLeft: 8, alignItems: 'center' },
  miniCardIcon: { width: 24, height: 16, resizeMode: 'contain' },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 1.5, borderColor: colors.textMuted, justifyContent: 'center', alignItems: 'center' },
  radioActive: { backgroundColor: colors.mint, borderColor: colors.mint },
  unavailableMethod: { opacity: 0.72 },
  paymentNote: { marginTop: 10, color: colors.textMuted, fontSize: 11, lineHeight: 16 },
  disabledButton: { opacity: 0.5 },
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.border, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.lg, paddingVertical: 16 },
  totalCountText: { color: colors.textMuted, fontSize: 11 },
  bottomTotalPrice: { color: colors.ink, fontSize: 18, fontWeight: '900' },
  placeOrderBtn: { backgroundColor: colors.ink, paddingHorizontal: 20, paddingVertical: 12, borderRadius: radii.pill },
  placeOrderText: { fontSize: 13, fontWeight: '900', color: colors.isDark ? '#111A1A' : '#FFFFFF' },
});