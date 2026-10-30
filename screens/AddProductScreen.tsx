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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, radii, spacing } from '../constants/theme';
import { CAT_DATA, CatItem } from '../data/cats';

// SVG Icon Imports
import AngleLeftIcon from '../images/Icons/angle-left-solid-full.svg';
import CameraIcon from '../images/Icons/camera-regular-full.svg';

interface ScreenProps {
  go: (next: string) => void;
}

export default function AddProductScreen({ go }: ScreenProps) {
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
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setProductForm({ ...productForm, imageUri: result.assets[0].uri });
    }
  };

  const handleAddProduct = async () => {
    if (!productForm.name) {
      Alert.alert("Missing Fields", "Please enter a product name.");
      return;
    }

    let finalPrice = '';
    let variations: { size: string; price: number }[] = [];

    // Validation & Price Handling Based on Type
    if (productForm.pricingType === 'standard') {
      if (!productForm.price) {
        Alert.alert("Missing Fields", "Please enter a price.");
        return;
      }
      finalPrice = `₱${parseFloat(productForm.price).toFixed(2)}`;
    } else {
      const pS = parseFloat(productForm.priceSmall);
      const pM = parseFloat(productForm.priceMedium);
      const pL = parseFloat(productForm.priceLarge);

      if (isNaN(pS) && isNaN(pM) && isNaN(pL)) {
        Alert.alert("Missing Fields", "Please enter at least one size price (S/M/L).");
        return;
      }

      if (!isNaN(pS)) variations.push({ size: 'Small', price: pS });
      if (!isNaN(pM)) variations.push({ size: 'Medium', price: pM });
      if (!isNaN(pL)) variations.push({ size: 'Large', price: pL });

      const minPrice = Math.min(...variations.map((v) => v.price));
      finalPrice = `From ₱${minPrice.toFixed(2)}`;
    }
    
    // Construct the new product object
    const newItem: CatItem = {
      id: Date.now().toString(),
      name: productForm.name,
      category: productForm.category,
      type: 'product',
      price: finalPrice,
      description: productForm.description,
      imageUri: productForm.imageUri || '',
      variations: variations.length > 0 ? variations : undefined,
    };

    // Push to local session array
    CAT_DATA.push(newItem);

    // Persist to storage
    try {
      await AsyncStorage.setItem('saved_cats', JSON.stringify(CAT_DATA));
      Alert.alert("Success", `${productForm.name} has been added successfully!`, [
        { text: "OK", onPress: () => go('profile') }
      ]);
    } catch (e) {
      console.log('Error saving product:', e);
      Alert.alert("Error", "Could not save the product.");
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

        <Pressable style={styles.saveBtn} onPress={handleAddProduct}>
          <Text style={styles.saveBtnText}>Add Product</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.mint || '#A8DDD6' },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 60, paddingBottom: 20, paddingHorizontal: 24 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.5)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '900', color: colors.ink || '#000' },
  scrollContent: { paddingHorizontal: 24, paddingBottom: 40 },
  
  imagePickerCard: {
    width: '100%',
    height: 160,
    backgroundColor: colors.white,
    borderRadius: radii.md || 16,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    borderStyle: 'dashed',
    marginBottom: 16,
  },
  imagePickerPlaceholder: { alignItems: 'center', justifyContent: 'center', padding: 16 },
  imagePickerText: { marginTop: 8, fontSize: 12, fontWeight: '700', color: 'rgba(0,0,0,0.5)' },
  previewImage: { width: '100%', height: '100%', resizeMode: 'cover' },

  formGroup: { backgroundColor: colors.white, borderRadius: 16, paddingHorizontal: 16, paddingVertical: 10, marginBottom: 12 },
  inputLabel: { fontSize: 10, fontWeight: '700', color: 'rgba(0,0,0,0.4)', marginBottom: 2 },
  input: { fontSize: 14, fontWeight: '800', color: colors.ink, padding: 0 },
  
  categoryRow: { flexDirection: 'row', gap: 10, marginTop: 6, marginBottom: 4 },
  catPill: { paddingVertical: 6, paddingHorizontal: 14, borderRadius: 20, backgroundColor: '#F4FAF8', borderWidth: 1, borderColor: '#EEEEEE' },
  catPillActive: { backgroundColor: colors.ink, borderColor: colors.ink },
  catPillText: { fontSize: 12, fontWeight: '700', color: 'rgba(0,0,0,0.5)' },
  catPillTextActive: { color: colors.white },

  variantContainer: { flexDirection: 'row', gap: 8, marginTop: 6 },
  variantCol: { flex: 1 },
  variantLabel: { fontSize: 10, color: 'rgba(0,0,0,0.5)', marginBottom: 4, fontWeight: '700' },
  variantInput: {
    backgroundColor: '#F4FAF8',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 13,
    fontWeight: '800',
    color: colors.ink,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },

  saveBtn: { backgroundColor: colors.ink, borderRadius: radii?.pill || 20, paddingVertical: 16, alignItems: 'center', marginTop: 16 },
  saveBtnText: { color: colors.white, fontSize: 14, fontWeight: '900' },
});