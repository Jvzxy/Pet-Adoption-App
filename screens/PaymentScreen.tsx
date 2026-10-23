import React, { useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { colors, radii, spacing } from '../constants/theme';

// SVG Import for American Express (prevents deepFreezeAndThrowOnMutationInDev error)
import AmexIcon from '../images/img/American Express.svg';

interface ScreenProps {
  go: (next: string) => void;
  totalAmount?: number;
}

export default function PaymentScreen({ go, totalAmount = 650 }: ScreenProps) {
  const [selectedMethod, setSelectedMethod] = useState<'cod' | 'maya' | 'gcash' | 'card'>('cod');

  const shippingCost = 100;
  const totalPayment = totalAmount + shippingCost;

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <Pressable onPress={() => go('cart')} hitSlop={10}>
          <Text style={styles.backArrow}>‹</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Payment</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollPad} showsVerticalScrollIndicator={false}>
        {/* Order Summary */}
        <Text style={styles.sectionHeading}>Order Summary</Text>
        <View style={styles.shippingCard}>
          <View style={styles.shippingLeft}>
            <Text style={styles.truckIcon}>🚚</Text>
            <View>
              <Text style={styles.courierName}>J&T Express</Text>
              <Text style={styles.estimatedText}>Estimated arrival Oct 23 – 27</Text>
            </View>
          </View>
          <Pressable style={styles.changePill}>
            <Text style={styles.changeText}>Change</Text>
          </Pressable>
        </View>

        {/* Recipient Address Card */}
        <View style={styles.card}>
          <View style={styles.addressRow}>
            <Text style={styles.pinIcon}>📍</Text>
            <View style={styles.addressInfo}>
              <Text style={styles.recipientName}>Jussy Jay Durain   (+63)09*******79</Text>
              <Text style={styles.addressBody}>
                Bulua, Villa Candida Subdivision, Cagayan De Oro City, Philippines, B-12 L-15, Sun Flower St.
              </Text>
            </View>
          </View>
        </View>

        {/* Payment Summary */}
        <View style={styles.card}>
          <Text style={styles.cardHeading}>Payment Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Product cost</Text>
            <Text style={styles.summaryValue}>₱ {totalAmount.toFixed(2)}</Text>
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

          {/* COD */}
          <Pressable style={styles.methodRow} onPress={() => setSelectedMethod('cod')}>
            <View style={styles.methodLeft}>
              <Image 
                source={require('../images/img/COD logo.png')} 
                style={styles.methodIcon} 
                resizeMode="contain" 
              />
              <Text style={styles.methodLabel}>Cash on delivery</Text>
            </View>
            <View style={[styles.radio, selectedMethod === 'cod' && styles.radioActive]} />
          </Pressable>

          {/* Add Debit / Credit Card */}
          <Pressable style={styles.methodRow} onPress={() => go('addCard')}>
            <View style={styles.methodLeft}>
              <Text style={styles.methodLabel}>Add debit/credit card</Text>
              <View style={styles.cardIconsContainer}>
                <Image source={require('../images/img/Visa Icon.jpg')} style={styles.miniCardIcon} />
                <Image source={require('../images/img/Mastercard Icon.webp')} style={styles.miniCardIcon} />
                <Image source={require('../images/img/JCB.png')} style={styles.miniCardIcon} />
                <AmexIcon width={24} height={16} />
                <Image source={require('../images/img/unionpay.jpg')} style={styles.miniCardIcon} />
              </View>
            </View>
            <Text style={styles.chevron}>›</Text>
          </Pressable>

          {/* Maya */}
          <Pressable style={styles.methodRow} onPress={() => setSelectedMethod('maya')}>
            <View style={styles.methodLeft}>
              <Image 
                source={require('../images/img/Maya.png')} 
                style={styles.methodIcon} 
                resizeMode="contain" 
              />
              <Text style={styles.methodLabel}>Maya</Text>
            </View>
            <View style={[styles.radio, selectedMethod === 'maya' && styles.radioActive]} />
          </Pressable>

          {/* GCash */}
          <Pressable style={styles.methodRow} onPress={() => setSelectedMethod('gcash')}>
            <View style={styles.methodLeft}>
              <Image 
                source={require('../images/img/Gcash.png')} 
                style={styles.methodIcon} 
                resizeMode="contain" 
              />
              <Text style={styles.methodLabel}>GCash</Text>
            </View>
            <View style={[styles.radio, selectedMethod === 'gcash' && styles.radioActive]} />
          </Pressable>
        </View>
      </ScrollView>

      {/* Place Order Bar */}
      <View style={styles.bottomBar}>
        <View>
          <Text style={styles.totalCountText}>Total (1 item)</Text>
          <Text style={styles.bottomTotalPrice}>₱ {totalPayment.toFixed(2)}</Text>
        </View>
        <Pressable style={styles.placeOrderBtn} onPress={() => go('orderConfirmation')}>
          <Text style={styles.placeOrderText}>Place order</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.mint },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: 50,
    paddingBottom: 16,
  },
  backArrow: { fontSize: 28, fontWeight: '800', color: colors.ink },
  headerTitle: { fontSize: 18, fontWeight: '900', color: colors.ink },
  scrollPad: { paddingHorizontal: spacing.lg, paddingBottom: 110 },
  sectionHeading: { fontSize: 14, fontWeight: '800', color: colors.ink, marginBottom: 10 },
  shippingCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.4)',
    padding: 12,
    borderRadius: radii.md,
    marginBottom: 14,
  },
  shippingLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  truckIcon: { fontSize: 20 },
  courierName: { fontSize: 12, fontWeight: '800', color: colors.ink },
  estimatedText: { fontSize: 10, color: colors.textMuted },
  changePill: { backgroundColor: colors.white, paddingHorizontal: 14, paddingVertical: 6, borderRadius: radii.pill },
  changeText: { fontSize: 11, fontWeight: '800', color: colors.ink },
  card: { backgroundColor: colors.white, borderRadius: 16, padding: 16, marginBottom: 14 },
  addressRow: { flexDirection: 'row', gap: 10 },
  pinIcon: { fontSize: 16 },
  addressInfo: { flex: 1 },
  recipientName: { fontSize: 12, fontWeight: '800', color: colors.ink, marginBottom: 4 },
  addressBody: { fontSize: 11, color: colors.textMuted, lineHeight: 16 },
  cardHeading: { fontSize: 14, fontWeight: '800', color: colors.ink, marginBottom: 12 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  summaryLabel: { fontSize: 12, color: colors.textMuted },
  summaryValue: { fontSize: 12, fontWeight: '700', color: colors.ink },
  divider: { height: 1, backgroundColor: '#E0E0E0', marginVertical: 8 },
  totalLabel: { fontSize: 13, fontWeight: '800', color: colors.ink },
  totalValue: { fontSize: 13, fontWeight: '900', color: colors.ink },
  methodRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  methodLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  methodIcon: { width: 32, height: 20 },
  methodLabel: { fontSize: 12, fontWeight: '700', color: colors.ink },
  cardIconsContainer: { flexDirection: 'row', gap: 4, marginLeft: 8, alignItems: 'center' },
  miniCardIcon: { width: 24, height: 16, resizeMode: 'contain' },
  chevron: { fontSize: 18, color: colors.textMuted, fontWeight: '700' },
  radio: { width: 18, height: 18, borderRadius: 9, borderWidth: 1.5, borderColor: colors.textMuted },
  radioActive: { backgroundColor: colors.mint, borderColor: colors.ink },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.ink,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: 16,
  },
  totalCountText: { color: colors.white, fontSize: 11 },
  bottomTotalPrice: { color: colors.white, fontSize: 18, fontWeight: '900' },
  placeOrderBtn: { backgroundColor: '#B2DFDB', paddingHorizontal: 20, paddingVertical: 10, borderRadius: radii.pill },
  placeOrderText: { fontSize: 12, fontWeight: '900', color: colors.ink },
});