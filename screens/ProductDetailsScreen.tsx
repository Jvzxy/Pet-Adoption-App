import React, { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, radii, spacing } from '../constants/theme';

import BellIcon from '../images/Icons/bell-solid-full.svg';
import HeartIcon from '../images/Icons/heart-regular-full.svg';

interface ScreenProps {
  go: (next: string) => void;
  productId?: string;
}

export default function ProductDetailsScreen({ go }: ScreenProps) {
  const [selectedVariation, setSelectedVariation] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(2);

  const variations = [
    { label: 'Small', price: 300.00 },
    { label: 'Medium', price: 800.00 },
    { label: 'Large', price: 1300.00 },
  ];

  return (
    <View style={styles.fillWhite}>
      {/* Top Header Controls */}
      <View style={styles.topHeader}>
        <Pressable onPress={() => go('main')} style={styles.closeBtn}>
          <Text style={styles.closeText}>✕</Text>
        </Pressable>
        <View style={styles.rightIcons}>
          <HeartIcon width={22} height={22} fill={colors.ink} />
          <View style={styles.bellContainer}>
            <BellIcon width={22} height={22} fill={colors.ink} />
            <View style={styles.redDot} />
          </View>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollPad}>
        {/* Product Image Box */}
        <View style={styles.imageCard}>
          <Image
            source={{ uri: 'https://m.media-amazon.com/images/I/81M1v8uLgCL.jpg' }}
            style={styles.productImg}
            resizeMode="contain"
          />
        </View>

        {/* Product Title */}
        <Text style={styles.productTitle}>Friskies</Text>

        {/* Description */}
        <Text style={styles.descTitle}>Description</Text>
        <Text style={styles.descBody}>
          Purina Friskies Gravy Swirlers is a dry cat food formula featuring the savory
          flavors of chicken and salmon, with savory chicken-flavored gravy baked directly
          into every crunchy kibble piece. Formulated to deliver 100% complete and balanced
          nutrition for cats of all life stages (from kittens to adults), it combines the crunch
          of dry kibble with the rich taste of wet gravy.
        </Text>

        {/* Variation Card */}
        <View style={styles.variationCard}>
          <Text style={styles.variationTitle}>Variation</Text>
          {variations.map((v, index) => {
            const isSelected = selectedVariation === index;
            return (
              <Pressable
                key={v.label}
                style={styles.variationRow}
                onPress={() => setSelectedVariation(index)}
              >
                <View style={styles.radioContainer}>
                  <View style={[styles.radioCircle, isSelected && styles.radioCircleSelected]}>
                    {isSelected && <Text style={styles.checkMark}>✓</Text>}
                  </View>
                  <Text style={styles.variationLabel}>{v.label}</Text>
                </View>
                <Text style={styles.priceText}>₱ {v.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}</Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      {/* Bottom Action Footer */}
      <View style={styles.footerRow}>
        <View style={styles.quantityBox}>
          <Pressable onPress={() => setQuantity(Math.max(1, quantity - 1))}>
            <Text style={styles.qtyBtn}>—</Text>
          </Pressable>
          <Text style={styles.qtyText}>{quantity}</Text>
          <Pressable onPress={() => setQuantity(quantity + 1)}>
            <Text style={styles.qtyBtn}>+</Text>
          </Pressable>
        </View>

        <Pressable style={styles.addToCartBtn} onPress={() => go('cart')}>
          <Text style={styles.addToCartText}>Add to cart</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fillWhite: { flex: 1, backgroundColor: '#FAFAFA' },
  topHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.lg, paddingTop: 50, paddingBottom: 10 },
  closeBtn: { padding: 4 },
  closeText: { fontSize: 24, fontWeight: 'bold', color: colors.ink },
  rightIcons: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  bellContainer: { position: 'relative' },
  redDot: { position: 'absolute', top: -2, right: -2, width: 7, height: 7, borderRadius: 4, backgroundColor: '#FF3B30' },
  scrollPad: { paddingHorizontal: spacing.lg, paddingBottom: 100 },
  imageCard: { backgroundColor: colors.white, borderRadius: 20, height: 260, justifyContent: 'center', alignItems: 'center', marginBottom: 20, padding: 16 },
  productImg: { width: '100%', height: '100%' },
  productTitle: { fontSize: 26, fontWeight: '900', color: colors.ink, marginBottom: 16 },
  descTitle: { fontSize: 14, fontWeight: '900', color: colors.ink, marginBottom: 6 },
  descBody: { fontSize: 12, lineHeight: 18, color: '#555555', fontWeight: '500', marginBottom: 20 },
  variationCard: { backgroundColor: '#EFECE6', borderRadius: 16, padding: 16, marginBottom: 20 },
  variationTitle: { fontSize: 16, fontWeight: '900', color: colors.ink, marginBottom: 14 },
  variationRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  radioContainer: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  radioCircle: { width: 22, height: 22, borderRadius: 11, borderWidth: 1.5, borderColor: '#888888', justifyContent: 'center', alignItems: 'center' },
  radioCircleSelected: { backgroundColor: '#80CBC4', borderColor: '#80CBC4' },
  checkMark: { color: colors.white, fontSize: 12, fontWeight: 'bold' },
  variationLabel: { fontSize: 14, fontWeight: '700', color: colors.ink },
  priceText: { fontSize: 14, fontWeight: '800', color: colors.ink },
  footerRow: { position: 'absolute', bottom: 30, left: spacing.lg, right: spacing.lg, flexDirection: 'row', alignItems: 'center', gap: 12 },
  quantityBox: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#E0E0E0', borderRadius: radii.pill, width: 120, height: 48, paddingHorizontal: 16 },
  qtyBtn: { fontSize: 16, fontWeight: 'bold', color: colors.ink },
  qtyText: { fontSize: 15, fontWeight: '800', color: colors.ink },
  addToCartBtn: { flex: 1, backgroundColor: '#B2DFDB', height: 48, borderRadius: radii.pill, justifyContent: 'center', alignItems: 'center' },
  addToCartText: { fontSize: 14, fontWeight: '900', color: colors.ink },
});