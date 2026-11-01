import React, { useState } from 'react';
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { radii, spacing } from '../../constants/theme';
import { useAuth } from '../../services/AuthContext';
import { supabase } from '../../services/supabaseClient';
import { uploadCatalogImage } from '../../services/catalogService';
import { useAppData } from '../../services/AppDataContext';
import { useAppPreferences, type AppColors } from '../../services/AppPreferencesContext';

// SVG Icon Imports
import AngleLeftIcon from '../../images/Icons/angle-left-solid-full.svg';
import CameraIcon from '../../images/Icons/camera-regular-full.svg';

interface ScreenProps {
  go: (next: string) => void;
}

export default function AddProductScreen({ go }: ScreenProps) {
  const { colors } = useAppPreferences();
  const styles = createStyles(colors);
  const { user } = useAuth();
  const { refreshCatalog } = useAppData();
  const [isSaving, setIsSaving] = useState(false);
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    category: 'Toys' as 'Toys' | 'Accessories',
    pricingType: 'standard' as 'standard' | 'variants',
    price: '',
    priceSmall: '',
    priceMedium: '',
    priceLarge: '',
    imageUri: '',
    imageBase64: '',
  });

  // Pick Image from Phone Gallery
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Denied',
        'Sorry, we need camera roll permissions to upload an image.'
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setProductForm({
        ...productForm,
        imageUri: result.assets[0].uri,
        imageBase64: result.assets[0].base64 ?? '',
      });
    }
  };

  const handleAddProduct = async () => {
    if (!productForm.name.trim()) {
      Alert.alert("Missing Fields", "Please enter a product name.");
      return;
    }

    let price = 0;
    let variations: { size: string; price: number }[] = [];

    // Validation & Price Handling Based on Type
    if (productForm.pricingType === 'standard') {
      if (!productForm.price.trim()) {
        Alert.alert("Missing Fields", "Please enter a price.");
        return;
      }
      price = Number(productForm.price);
      if (!Number.isFinite(price) || price <= 0) {
        Alert.alert("Invalid Price", "Enter a valid product price greater than zero.");
        return;
      }
    } else {
      const pS = productForm.priceSmall.trim() ? Number(productForm.priceSmall) : Number.NaN;
      const pM = productForm.priceMedium.trim() ? Number(productForm.priceMedium) : Number.NaN;
      const pL = productForm.priceLarge.trim() ? Number(productForm.priceLarge) : Number.NaN;

      if (isNaN(pS) && isNaN(pM) && isNaN(pL)) {
        Alert.alert("Missing Fields", "Please enter at least one size price (S/M/L).");
        return;
      }

      if (!isNaN(pS)) variations.push({ size: 'Small', price: pS });
      if (!isNaN(pM)) variations.push({ size: 'Medium', price: pM });
      if (!isNaN(pL)) variations.push({ size: 'Large', price: pL });

      if (variations.some((variation) => !Number.isFinite(variation.price) || variation.price <= 0)) {
        Alert.alert("Invalid Price", "Every size price must be greater than zero.");
        return;
      }
      price = Math.min(...variations.map((variation) => variation.price));
    }
    
    if (!user) {
      Alert.alert('Sign in required', 'Sign in with an admin account before adding products.');
      return;
    }

    try {
      setIsSaving(true);
      if (productForm.imageUri && !productForm.imageBase64) {
        throw new Error('The photo picker did not provide image data. Choose the photo again and retry.');
      }
      const imageUrl = productForm.imageBase64
        ? await uploadCatalogImage(productForm.imageBase64, user.id)
        : '';
      const { error } = await supabase.from('catalog_items').insert({
        type: 'product',
        category: productForm.category,
        name: productForm.name.trim(),
        price,
        description: productForm.description.trim(),
        image_url: imageUrl,
        variations,
        created_by: user.id,
      });

      if (error) throw error;
      await refreshCatalog();
      Alert.alert("Success", `${productForm.name.trim()} has been added successfully!`, [
        { text: "OK", onPress: () => go('profile') }
      ]);
    } catch (error) {
      console.error('Could not save product:', error);
      Alert.alert("Could not save product", error instanceof Error ? error.message : 'Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Pressable onPress={() => go('profile')} style={styles.backBtn} hitSlop={10}>
          <AngleLeftIcon width={18} height={18} fill={colors.ink} />
        </Pressable>
        <Text style={styles.headerTitle}>Add Product</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Image Picker Area */}
        <Text style={styles.inputLabel}>Product Photo</Text>
        <Pressable style={styles.imagePickerCard} onPress={pickImage}>
          {productForm.imageUri ? (
            <Image source={{ uri: productForm.imageUri }} style={styles.previewImage} />
          ) : (
            <View style={styles.imagePickerPlaceholder}>
              <CameraIcon width={32} height={32} fill={colors.ink} />
              <Text style={styles.imagePickerText}>Tap to select photo from gallery</Text>
            </View>
          )}
        </Pressable>

        <View style={styles.formGroup}>
          <Text style={styles.inputLabel}>Product Name</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Friskies Gravy Swirlers"
            placeholderTextColor="rgba(0,0,0,0.3)"
            value={productForm.name}
            onChangeText={(text) => setProductForm({ ...productForm, name: text })}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.inputLabel}>Category</Text>
          <View style={styles.categoryRow}>
            {['Toys', 'Accessories'].map((cat) => (
              <Pressable
                key={cat}
                onPress={() => setProductForm({ ...productForm, category: cat as 'Toys' | 'Accessories' })}
                style={[styles.catPill, productForm.category === cat && styles.catPillActive]}
              >
                <Text style={[styles.catPillText, productForm.category === cat && styles.catPillTextActive]}>
                  {cat}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.inputLabel}>Pricing Option</Text>
          <View style={styles.categoryRow}>
            <Pressable
              onPress={() => setProductForm({ ...productForm, pricingType: 'standard' })}
              style={[styles.catPill, productForm.pricingType === 'standard' && styles.catPillActive]}
            >
              <Text style={[styles.catPillText, productForm.pricingType === 'standard' && styles.catPillTextActive]}>
                Single Price
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setProductForm({ ...productForm, pricingType: 'variants' })}
              style={[styles.catPill, productForm.pricingType === 'variants' && styles.catPillActive]}
            >
              <Text style={[styles.catPillText, productForm.pricingType === 'variants' && styles.catPillTextActive]}>
                By Size (S/M/L)
              </Text>
            </Pressable>
          </View>
        </View>

        {productForm.pricingType === 'standard' ? (
          <View style={styles.formGroup}>
            <Text style={styles.inputLabel}>Price (₱)</Text>
            <TextInput
              style={styles.input}
              placeholder="0.00"
              placeholderTextColor="rgba(0,0,0,0.3)"
              keyboardType="decimal-pad"
              value={productForm.price}
              onChangeText={(text) => setProductForm({ ...productForm, price: text })}
            />
          </View>
        ) : (
          <View style={styles.formGroup}>
            <Text style={styles.inputLabel}>Prices by Size (₱)</Text>
            <View style={styles.variantContainer}>
              <View style={styles.variantCol}>
                <Text style={styles.variantLabel}>Small</Text>
                <TextInput
                  style={styles.variantInput}
                  placeholder="0.00"
                  placeholderTextColor="rgba(0,0,0,0.3)"
                  keyboardType="decimal-pad"
                  value={productForm.priceSmall}
                  onChangeText={(text) => setProductForm({ ...productForm, priceSmall: text })}
                />
              </View>
              <View style={styles.variantCol}>
                <Text style={styles.variantLabel}>Medium</Text>
                <TextInput
                  style={styles.variantInput}
                  placeholder="0.00"
                  placeholderTextColor="rgba(0,0,0,0.3)"
                  keyboardType="decimal-pad"
                  value={productForm.priceMedium}
                  onChangeText={(text) => setProductForm({ ...productForm, priceMedium: text })}
                />
              </View>
              <View style={styles.variantCol}>
                <Text style={styles.variantLabel}>Large</Text>
                <TextInput
                  style={styles.variantInput}
                  placeholder="0.00"
                  placeholderTextColor="rgba(0,0,0,0.3)"
                  keyboardType="decimal-pad"
                  value={productForm.priceLarge}
                  onChangeText={(text) => setProductForm({ ...productForm, priceLarge: text })}
                />
              </View>
            </View>
          </View>
        )}

        <View style={styles.formGroup}>
          <Text style={styles.inputLabel}>Description</Text>
          <TextInput
            style={[styles.input, { minHeight: 80, textAlignVertical: 'top' }]}
            placeholder="Enter product description..."
            placeholderTextColor="rgba(0,0,0,0.3)"
            multiline={true}
            value={productForm.description}
            onChangeText={(text) => setProductForm({ ...productForm, description: text })}
          />
        </View>

        <Pressable style={styles.saveBtn} onPress={handleAddProduct} disabled={isSaving}>
          <Text style={styles.saveBtnText}>{isSaving ? 'Saving...' : 'Add Product'}</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const createStyles = (colors: AppColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 60, paddingBottom: 20, paddingHorizontal: 24 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.5)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '900', color: colors.ink || '#000' },
  scrollContent: { paddingHorizontal: 24, paddingBottom: 40 },
  
  imagePickerCard: {
    width: '100%',
    height: 160,
    backgroundColor: colors.surface,
    borderRadius: radii.md || 16,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    marginBottom: 16,
  },
  imagePickerPlaceholder: { alignItems: 'center', justifyContent: 'center', padding: 16 },
  imagePickerText: { marginTop: 8, fontSize: 12, fontWeight: '700', color: colors.textMuted },
  previewImage: { width: '100%', height: '100%', resizeMode: 'cover' },

  formGroup: { backgroundColor: colors.surface, borderRadius: 16, paddingHorizontal: 16, paddingVertical: 10, marginBottom: 12 },
  inputLabel: { fontSize: 10, fontWeight: '700', color: colors.textMuted, marginBottom: 2 },
  input: { fontSize: 14, fontWeight: '800', color: colors.ink, padding: 0 },
  
  categoryRow: { flexDirection: 'row', gap: 10, marginTop: 6, marginBottom: 4 },
  catPill: { paddingVertical: 6, paddingHorizontal: 14, borderRadius: 20, backgroundColor: colors.cardBg, borderWidth: 1, borderColor: colors.border },
  catPillActive: { backgroundColor: colors.isDark ? colors.mint : colors.ink, borderColor: colors.ink },
  catPillText: { fontSize: 12, fontWeight: '700', color: colors.textMuted },
  catPillTextActive: { color: colors.isDark ? colors.ink : colors.white },

  variantContainer: { flexDirection: 'row', gap: 8, marginTop: 6 },
  variantCol: { flex: 1 },
  variantLabel: { fontSize: 10, color: 'rgba(0,0,0,0.5)', marginBottom: 4, fontWeight: '700' },
  variantInput: {
    backgroundColor: colors.cardBg,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 13,
    fontWeight: '800',
    color: colors.ink,
    borderWidth: 1,
    borderColor: colors.border,
  },

  saveBtn: { backgroundColor: colors.ink, borderRadius: radii?.pill || 20, paddingVertical: 16, alignItems: 'center', marginTop: 16 },
  saveBtnText: { color: colors.white, fontSize: 14, fontWeight: '900' },
});