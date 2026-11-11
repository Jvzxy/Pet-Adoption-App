import React, { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, Image, Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { radii, spacing } from '../../constants/theme';
import { useAppData } from '../../services/AppDataContext';
import { useAppPreferences, type AppColors } from '../../services/AppPreferencesContext';
import { supabase } from '../../services/supabaseClient';
import AngleLeftIcon from '../../images/Icons/angle-left-solid-full.svg';
import { SkeletonRows } from '../../components/Skeleton';

interface ProductListing {
  id: string;
  name: string;
  category: string;
  image_url: string;
  available: boolean;
  stock: number;
}

interface ScreenProps {
  go: (next: string) => void;
}

export default function AdminProductsScreen({ go }: ScreenProps) {
  const { colors } = useAppPreferences();
  const styles = createStyles(colors);
  const { refreshCatalog } = useAppData();
  const [products, setProducts] = useState<ProductListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  // Stock Modal State
  const [stockModalVisible, setStockModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductListing | null>(null);
  const [stockToAdd, setStockToAdd] = useState('');

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    const { data, error } = await supabase
      .from('catalog_items')
      .select('id, name, category, image_url, available, stock')
      .eq('type', 'product')
      .order('created_at', { ascending: false });

    if (error) {
      setLoadError(error.message);
      setLoading(false);
      return;
    }

    setProducts(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    void loadProducts();
  }, [loadProducts]);

  const toggleAvailability = async (product: ProductListing) => {
    const available = !product.available;
    setBusyId(product.id);
    const { data, error } = await supabase
      .from('catalog_items')
      .update({ available })
      .eq('id', product.id)
      .eq('type', 'product')
      .select('id, name, category, image_url, available, stock')
      .single();
    setBusyId(null);

    if (error) {
      Alert.alert('Availability not updated', error.message);
      return;
    }

    setProducts((previous) => previous.map((item) => item.id === data.id ? data : item));
    try {
      await refreshCatalog();
    } catch (refreshError) {
      console.error(refreshError);
    }
  };

  const deleteProduct = (id: string, name: string) => {
    Alert.alert('Delete Product', `Are you sure you want to permanently delete ${name}?`, [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Delete', 
        style: 'destructive', 
        onPress: async () => {
          setBusyId(id);
          const { error } = await supabase.from('catalog_items').delete().eq('id', id);
          setBusyId(null);

          if (error) {
            Alert.alert('Error deleting product', error.message);
            return;
          }

          setProducts((prev) => prev.filter(p => p.id !== id));
          refreshCatalog();
        }
      }
    ]);
  };

  const handleAddStock = async () => {
    if (!selectedProduct) return;
    const added = parseInt(stockToAdd, 10);
    if (isNaN(added) || added <= 0) {
      Alert.alert('Invalid amount', 'Please enter a valid number greater than 0.');
      return;
    }

    setBusyId(selectedProduct.id);
    setStockModalVisible(false);
    
    const newStock = (selectedProduct.stock || 0) + added;
    const { error } = await supabase.from('catalog_items').update({ stock: newStock }).eq('id', selectedProduct.id);
    setBusyId(null);

    if (error) {
      Alert.alert('Error updating stock', error.message);
      return;
    }

    setProducts((prev) => prev.map(p => p.id === selectedProduct.id ? { ...p, stock: newStock } : p));
    refreshCatalog();
    setStockToAdd('');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => go('profile')} hitSlop={10}>
          <AngleLeftIcon width={20} height={20} fill={colors.ink} />
        </Pressable>
        <Text style={styles.headerTitle}>Product Inventory</Text>
        <Pressable onPress={() => void loadProducts()}>
          <Text style={styles.refresh}>Refresh</Text>
        </Pressable>
      </View>

      <Text style={styles.helper}>
        Manage product stock and availability. Out-of-stock items will be automatically hidden from users.
      </Text>

      {loading ? (
        <SkeletonRows count={5} />
      ) : loadError ? (
        <View>
          <Text style={styles.error}>{loadError}</Text>
          <Pressable style={styles.retryButton} onPress={() => void loadProducts()}>
            <Text style={styles.retryText}>Try again</Text>
          </Pressable>
        </View>
      ) : products.length === 0 ? (
        <Text style={styles.message}>No products have been listed yet.</Text>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(product) => product.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardMain}>
                {item.image_url ? (
                  <Image source={{ uri: item.image_url }} style={styles.productImage} />
                ) : (
                  <View style={[styles.productImage, styles.imagePlaceholder]}>
                    <Text style={styles.placeholderText}>No photo</Text>
                  </View>
                )}
                <View style={styles.productInfo}>
                  <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
                  <Text style={styles.category} numberOfLines={1}>{item.category || 'Uncategorized'}</Text>
                  <Text style={[styles.status, item.available ? styles.available : styles.unavailable]}>
                    {item.available ? 'Available' : 'Unavailable'} • Stock: {item.stock || 0}
                  </Text>
                </View>
              </View>

              <View style={styles.actionRow}>
                <Pressable
                  style={[styles.actionBtn, item.available ? styles.markUnavailable : styles.markAvailable]}
                  disabled={busyId === item.id}
                  onPress={() => void toggleAvailability(item)}
                >
                  <Text style={styles.actionText}>{item.available ? 'Hide' : 'Show'}</Text>
                </Pressable>

                <Pressable
                  style={[styles.actionBtn, styles.addStockBtn]}
                  onPress={() => {
                    setSelectedProduct(item);
                    setStockModalVisible(true);
                  }}
                >
                  <Text style={[styles.actionText, { color: '#FFFFFF' }]}>+ Stock</Text>
                </Pressable>

                <Pressable
                  style={[styles.actionBtn, styles.deleteBtn]}
                  disabled={busyId === item.id}
                  onPress={() => deleteProduct(item.id, item.name)}
                >
                  <Text style={[styles.actionText, { color: '#FFFFFF' }]}>Delete</Text>
                </Pressable>
              </View>
            </View>
          )}
        />
      )}

      {/* Stock Modal */}
      <Modal visible={stockModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Stock</Text>
            <Text style={styles.modalDesc}>How many units to add to {selectedProduct?.name}?</Text>
            <TextInput
              style={styles.stockInput}
              keyboardType="number-pad"
              placeholder="0"
              value={stockToAdd}
              onChangeText={setStockToAdd}
            />
            <View style={styles.modalActions}>
              <Pressable style={styles.modalCancel} onPress={() => { setStockModalVisible(false); setStockToAdd(''); }}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </Pressable>
              <Pressable style={styles.modalConfirm} onPress={handleAddStock}>
                <Text style={styles.modalConfirmText}>Save</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const createStyles = (colors: AppColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, paddingTop: 52 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.lg, paddingBottom: 14 },
  headerTitle: { color: colors.ink, fontSize: 17, fontWeight: '900' },
  refresh: { color: colors.ink, fontSize: 12, fontWeight: '700' },
  helper: { color: colors.textMuted, fontSize: 13, lineHeight: 19, paddingHorizontal: spacing.lg, marginBottom: 16 },
  list: { paddingHorizontal: spacing.lg, paddingBottom: 32, gap: 12 },
  card: { backgroundColor: colors.surface, borderRadius: radii.md, padding: 12, gap: 12 },
  cardMain: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  productImage: { width: 64, height: 64, borderRadius: radii.sm },
  imagePlaceholder: { alignItems: 'center', justifyContent: 'center', backgroundColor: colors.cardBg },
  placeholderText: { color: colors.textMuted, fontSize: 10 },
  productInfo: { flex: 1 },
  productName: { color: colors.ink, fontSize: 14, fontWeight: '800' },
  category: { color: colors.textMuted, fontSize: 12, marginTop: 3 },
  status: { fontSize: 11, fontWeight: '800', marginTop: 5 },
  available: { color: '#2E7D32' },
  unavailable: { color: colors.red },
  actionRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 8, marginTop: 4 },
  actionBtn: { flex: 1, paddingVertical: 10, borderRadius: radii.pill, alignItems: 'center' },
  markUnavailable: { backgroundColor: colors.isDark ? '#6A3838' : '#F6D6D6' },
  markAvailable: { backgroundColor: colors.mint },
  addStockBtn: { backgroundColor: '#2E7D32' },
  deleteBtn: { backgroundColor: '#D32F2F' },
  actionText: { color: colors.ink, fontSize: 11, fontWeight: '800' },
  message: { color: colors.textMuted, textAlign: 'center', marginTop: 30, paddingHorizontal: 24 },
  error: { color: colors.red, textAlign: 'center', marginTop: 30, paddingHorizontal: 24 },
  retryButton: { alignSelf: 'center', marginTop: 14, paddingHorizontal: 18, paddingVertical: 10, borderRadius: radii.pill, backgroundColor: colors.surface },
  retryText: { color: colors.ink, fontSize: 12, fontWeight: '800' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  modalContent: { width: '100%', backgroundColor: colors.surface, borderRadius: 20, padding: 24 },
  modalTitle: { fontSize: 18, fontWeight: '900', color: colors.ink, marginBottom: 8 },
  modalDesc: { fontSize: 13, color: colors.textMuted, marginBottom: 20 },
  stockInput: { backgroundColor: colors.cardBg, borderRadius: 10, padding: 14, fontSize: 16, fontWeight: '800', color: colors.ink, marginBottom: 20, borderWidth: 1, borderColor: colors.border },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12 },
  modalCancel: { paddingHorizontal: 20, paddingVertical: 12, borderRadius: radii.pill },
  modalCancelText: { color: colors.ink, fontWeight: '800' },
  modalConfirm: { backgroundColor: colors.ink, paddingHorizontal: 24, paddingVertical: 12, borderRadius: radii.pill },
  modalConfirmText: { color: colors.background, fontWeight: '800' },
});
