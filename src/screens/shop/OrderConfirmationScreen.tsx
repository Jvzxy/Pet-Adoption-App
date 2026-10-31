import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radii, spacing } from '../../constants/theme';

// SVG Imports
import CircleCheckIcon from '../../images/Icons/circle-check-solid-full.svg';
import TruckIcon from '../../images/Icons/truck-fast-solid-full.svg';

interface ScreenProps {
  go: (next: string) => void;
}

export default function OrderConfirmationScreen({ go }: ScreenProps) {
  return (
    <View style={styles.fillWhite}>
      {/* Order Checkmark Badge */}
      <View style={styles.topSection}>
        <CircleCheckIcon width={130} height={130} fill="#B2DFDB" style={{ marginBottom: 24 }} />

        <Text style={styles.headingTitle}>Your order is made!</Text>
        <Text style={styles.headingSub}>
          Congratulations! Your order has been successfully proceed, we will pick up your order as soon as possible!
        </Text>
      </View>

      {/* Receipt Card */}
      <View style={styles.receiptContainer}>
        <View style={styles.orderIdRow}>
          <TruckIcon width={22} height={22} fill={colors.ink} />
          <View>
            <Text style={styles.orderIdText}>Order ID #00000001</Text>
            <Text style={styles.courierSub}>J&T Express</Text>
          </View>
        </View>

        <View style={styles.receiptBox}>
          <View style={styles.twoColumnRow}>
            <View style={styles.col}>
              <Text style={styles.colLabel}>Shipper Name</Text>
              <Text style={styles.colValue}>Andree</Text>
            </View>
            <View style={styles.col}>
              <Text style={styles.colLabel}>Recipient Name</Text>
              <Text style={styles.colValue}>Jussy Jay Durain</Text>
            </View>
          </View>

          <View style={styles.twoColumnRow}>
            <View style={styles.col}>
              <Text style={styles.colLabel}>From</Text>
              <Text style={styles.colValue}>38 Kalayaan Ave, Diliman, Quezon City, Metro Man...</Text>
            </View>
            <View style={styles.col}>
              <Text style={styles.colLabel}>To</Text>
              <Text style={styles.colValue}>Bulua, Villa Candida Subdivision, Cagayan...</Text>
            </View>
          </View>

          <View style={styles.col}>
            <Text style={styles.colLabel}>Amount</Text>
            <Text style={styles.amountValue}>₱ 300</Text>
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionSection}>
        <Pressable style={styles.trackBtn}>
          <Text style={styles.trackBtnText}>Track your order</Text>
        </Pressable>

        <Pressable style={styles.homeBtn} onPress={() => go('main')}>
          <Text style={styles.homeBtnText}>Back to Home</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fillWhite: { flex: 1, backgroundColor: colors.white, paddingHorizontal: spacing.lg, justifyContent: 'space-between', paddingTop: 60, paddingBottom: 40 },
  topSection: { alignItems: 'center', marginTop: 20 },
  headingTitle: { fontSize: 20, fontWeight: '900', color: colors.ink, marginBottom: 8 },
  headingSub: { fontSize: 12, color: colors.textMuted, textAlign: 'center', lineHeight: 18, paddingHorizontal: 10 },
  receiptContainer: { width: '100%' },
  orderIdRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  orderIdText: { fontSize: 13, fontWeight: '800', color: colors.ink },
  courierSub: { fontSize: 10, color: colors.textMuted },
  receiptBox: { borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 16, padding: 16, gap: 14 },
  twoColumnRow: { flexDirection: 'row', justifyContent: 'space-between' },
  col: { flex: 1 },
  colLabel: { fontSize: 10, color: colors.textMuted, marginBottom: 2 },
  colValue: { fontSize: 11, fontWeight: '700', color: colors.ink, lineHeight: 15 },
  amountValue: { fontSize: 12, fontWeight: '900', color: colors.ink },
  actionSection: { width: '100%', gap: 12 },
  trackBtn: { backgroundColor: '#B2DFDB', height: 48, borderRadius: radii.pill, justifyContent: 'center', alignItems: 'center' },
  trackBtnText: { fontSize: 13, fontWeight: '800', color: colors.ink },
  homeBtn: { backgroundColor: '#B2DFDB', height: 48, borderRadius: radii.pill, justifyContent: 'center', alignItems: 'center', opacity: 0.8 },
  homeBtnText: { fontSize: 13, fontWeight: '800', color: colors.ink },
});