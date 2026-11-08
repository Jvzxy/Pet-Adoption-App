import React, { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { radii, spacing } from '../../constants/theme';
import { useAppData } from '../../services/AppDataContext';
import { useAppPreferences, type AppColors } from '../../services/AppPreferencesContext';
import { supabase } from '../../services/supabaseClient';
import AngleLeftIcon from '../../images/Icons/angle-left-solid-full.svg';

interface ProductListing {
  id: string;
  name: string;
  category: string;
  image_url: string;
  available: boolean;
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

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    const { data, error } = await supabase
      .from('catalog_items')
      .select('id, name, category, image_url, available')
      .eq('type', 'product')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Could not load product availability:', error.message);
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
      .select('id, name, category, image_url, available')
      .single();
    setBusyId(null);

    if (error) {
      console.error('Could not update product availability:', error.message);
      Alert.alert('Availability not updated', error.message);
      return;
    }

    setProducts((previous) => previous.map((item) => item.id === data.id ? data : item));
    try {
      await refreshCatalog();
    } catch (refreshError) {
      console.error('Product status was saved, but the catalog could not be refreshed:', refreshError);
      Alert.alert(
        'Status saved',
        'The product availability was updated, but the app catalog could not refresh. Reopen this screen or retry the catalog refresh.',
      );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => go('profile')} hitSlop={10} accessibilityRole="button" accessibilityLabel="Back to profile">
          <AngleLeftIcon width={20} height={20} fill={colors.ink} />
        </Pressable>
        <Text style={styles.headerTitle}>Product Availability</Text>
        <Pressable onPress={() => void loadProducts()} accessibilityRole="button">
          <Text style={styles.refresh}>Refresh</Text>
        </Pressable>
      </View>

      <Text style={styles.helper}>
        Unavailable products are hidden from customers and cannot be added to the cart or purchased.
      </Text>

      {loading ? (
        <Text style={styles.message}>Loading products...</Text>
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
                  {item.available ? 'Available' : 'Out of Stock'}
                </Text>
              </View>
              <Pressable
                style={[styles.actionButton, item.available ? styles.markUnavailable : styles.markAvailable]}
                accessibilityRole="button"
                accessibilityLabel={`${item.available ? 'Mark' : 'Make'} ${item.name} ${item.available ? 'unavailable' : 'available'}`}
                disabled={busyId === item.id}
                onPress={() => void toggleAvailability(item)}
              >
                <Text style={styles.actionText}>
                  {busyId === item.id
                    ? 'Saving...'
                    : item.available ? 'Mark unavailable' : 'Mark available'}
                </Text>
              </Pressable>
            </View>
          )}
        />
      )}
    </View>
  );
}

const createStyles = (colors: AppColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, paddingTop: 52 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: 14,
  },
  headerTitle: { color: colors.ink, fontSize: 17, fontWeight: '900' },
  refresh: { color: colors.ink, fontSize: 12, fontWeight: '700' },
  helper: { color: colors.textMuted, fontSize: 13, lineHeight: 19, paddingHorizontal: spacing.lg, marginBottom: 16 },
  list: { paddingHorizontal: spacing.lg, paddingBottom: 32, gap: 12 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: 12,
    gap: 12,
  },
  productImage: { width: 64, height: 64, borderRadius: radii.sm },
  imagePlaceholder: { alignItems: 'center', justifyContent: 'center', backgroundColor: colors.cardBg },
  placeholderText: { color: colors.textMuted, fontSize: 10 },
  productInfo: { flex: 1 },
  productName: { color: colors.ink, fontSize: 14, fontWeight: '800' },
  category: { color: colors.textMuted, fontSize: 12, marginTop: 3 },
  status: { fontSize: 11, fontWeight: '800', marginTop: 5 },
  available: { color: '#2E7D32' },
  unavailable: { color: colors.red },
  actionButton: { paddingHorizontal: 12, paddingVertical: 10, borderRadius: radii.pill },
  markUnavailable: { backgroundColor: colors.isDark ? '#6A3838' : '#F6D6D6' },
  markAvailable: { backgroundColor: colors.mint },
  actionText: { color: colors.ink, fontSize: 11, fontWeight: '800' },
  message: { color: colors.textMuted, textAlign: 'center', marginTop: 30, paddingHorizontal: 24 },
  error: { color: colors.red, textAlign: 'center', marginTop: 30, paddingHorizontal: 24 },
  retryButton: { alignSelf: 'center', marginTop: 14, paddingHorizontal: 18, paddingVertical: 10, borderRadius: radii.pill, backgroundColor: colors.surface },
  retryText: { color: colors.ink, fontSize: 12, fontWeight: '800' },
});