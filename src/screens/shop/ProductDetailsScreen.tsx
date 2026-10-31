import React, { useState } from 'react';
import { Image, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, radii, spacing } from '../../constants/theme';
import { CAT_DATA } from '../../data/cats';

// SVG Icon Import
import CheckIcon from '../../images/Icons/check-solid-full.svg';

interface ScreenProps {
  go: (next: string) => void;
  productId?: string;
  cartItems: any[];
  setCartItems: React.Dispatch<React.SetStateAction<any[]>>;
}

export default function ProductDetailsScreen({ go, productId, cartItems, setCartItems }: ScreenProps) {
  const [selectedVariation, setSelectedVariation] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(1);
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);

  // Dynamically fetch product from data store
  const product = CAT_DATA.find((c) => c.id === productId);

  if (!product) {
    return (
      <View style={[styles.fillWhite, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ fontSize: 16, fontWeight: '700', color: colors.ink, marginBottom: 20 }}>
          Product not found (ID: {productId})
        </Text>
        <Pressable style={styles.addToCartBtn} onPress={() => go('main')}>
          <Text style={[styles.addToCartText, { paddingHorizontal: 24 }]}>Back to Home</Text>
        </Pressable>
      </View>
    );
  }

  // Map variations if they exist, otherwise fallback to standard parsed price
  const variations = product.variations && product.variations.length > 0
    ? product.variations.map((v) => ({ label: v.size, price: v.price }))
    : [{ 
        label: 'Standard', 
        price: parseFloat((product.price || '0').replace(/[^0-9.-]+/g, '')) || 0 
      }];

  const handleAddToCart = () => {
    const selectedItem = variations[selectedVariation];
    const newCartItem = {
      id: `${product.id}-${selectedVariation}`,
      title: product.name,
      subtitle: `Size: ${selectedItem.label}`,
      price: selectedItem.price,
      image: product.imageUri,
      selected: true,
      quantity: quantity,
    };

    setCartItems(prev => {
      const existing = prev.find(item => item.id === newCartItem.id);
      if (existing) {
        return prev.map(item => 
          item.id === newCartItem.id ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [...prev, newCartItem];
    });

    // Show success modal instead of direct routing
    setShowSuccessModal(true);
  };

  return (
    <View style={styles.fillWhite}>
      <View style={styles.topHeader}>
        <Pressable onPress={() => go('main')} style={styles.closeBtn} hitSlop={10}>
          <Text style={styles.closeText}>✕</Text>
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollPad}>
        <View style={styles.imageCard}>
          {product.imageUri ? (
            <Image
              source={{ uri: product.imageUri }}
              style={styles.productImg}
              resizeMode="contain"
            />
          ) : (
            <Text style={{ fontSize: 40, color: '#CCC' }}>🐾</Text>
          )}
        </View>

        <Text style={styles.productTitle}>{product.name}</Text>

        <Text style={styles.descTitle}>Description</Text>
        <Text style={styles.descBody}>{product.description || 'No description available for this item.'}</Text>

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
                    {isSelected && <CheckIcon width={12} height={12} fill="#FFFFFF" />}
                  </View>
                  <Text style={styles.variationLabel}>{v.label}</Text>
                </View>
                <Text style={styles.priceText}>
                  ₱ {v.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      <View style={styles.footerRow}>
        <View style={styles.quantityBox}>
          <Pressable onPress={() => setQuantity(Math.max(1, quantity - 1))} hitSlop={10}>
            <Text style={styles.qtyBtn}>—</Text>
          </Pressable>
          <Text style={styles.qtyText}>{quantity}</Text>
          <Pressable onPress={() => setQuantity(quantity + 1)} hitSlop={10}>
            <Text style={styles.qtyBtn}>+</Text>
          </Pressable>
        </View>

        <Pressable style={styles.addToCartBtn} onPress={handleAddToCart}>
          <Text style={styles.addToCartText}>Add to cart</Text>
        </Pressable>
      </View>

      {/* Success Modal */}
      <Modal visible={showSuccessModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.iconCircle}>
              <CheckIcon width={32} height={32} fill="#FFFFFF" />
            </View>
            <Text style={styles.modalTitle}>Success!</Text>
            <Text style={styles.modalText}>
              {product.name} has been successfully added to your cart.
            </Text>
            
            <View style={styles.modalActionRow}>
              <Pressable 
                style={[styles.modalBtn, styles.modalBtnSecondary]} 
                onPress={() => {
                  setShowSuccessModal(false);
                  go('main'); 
                }}
              >
                <Text style={styles.modalBtnTextSecondary}>Keep Browsing</Text>
              </Pressable>
              
              <Pressable 
                style={[styles.modalBtn, styles.modalBtnPrimary]} 
                onPress={() => {
                  setShowSuccessModal(false);
                  go('cart'); 
                }}
              >
                <Text style={styles.modalBtnTextPrimary}>View Cart</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  fillWhite: { flex: 1, backgroundColor: '#FAFAFA' },
  topHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.lg, paddingTop: 50, paddingBottom: 10 },
  closeBtn: { padding: 4 },
  closeText: { fontSize: 24, fontWeight: 'bold', color: colors.ink },
  scrollPad: { paddingHorizontal: spacing.lg, paddingBottom: 120 },
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
  variationLabel: { fontSize: 14, fontWeight: '700', color: colors.ink },
  priceText: { fontSize: 14, fontWeight: '800', color: colors.ink },
  
  footerRow: { position: 'absolute', bottom: 30, left: spacing.lg, right: spacing.lg, flexDirection: 'row', alignItems: 'center', gap: 12 },
  quantityBox: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#E0E0E0', borderRadius: radii.pill, width: 120, height: 48, paddingHorizontal: 16 },
  qtyBtn: { fontSize: 16, fontWeight: 'bold', color: colors.ink },
  qtyText: { fontSize: 15, fontWeight: '800', color: colors.ink },
  addToCartBtn: { flex: 1, backgroundColor: '#B2DFDB', height: 48, borderRadius: radii.pill, justifyContent: 'center', alignItems: 'center' },
  addToCartText: { fontSize: 14, fontWeight: '900', color: colors.ink },

  /* Modal Styles */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    width: '100%',
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#2E7D32',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: colors.ink,
    marginBottom: 8,
  },
  modalText: {
    fontSize: 14,
    color: '#616161',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  modalActionRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBtnSecondary: {
    backgroundColor: '#F5F5F5',
  },
  modalBtnPrimary: {
    backgroundColor: colors.ink,
  },
  modalBtnTextSecondary: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.ink,
  },
  modalBtnTextPrimary: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFF',
  },
});