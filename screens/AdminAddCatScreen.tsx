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

export default function AdminAddCatScreen({ go }: ScreenProps) {
  const [name, setName] = useState('');
  const [breed, setBreed] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [location, setLocation] = useState('');
  const [price, setPrice] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [health, setHealth] = useState('');
  const [traits, setTraits] = useState('');
  const [description, setDescription] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);

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
      setImageUri(result.assets[0].uri);
    }
  };

  const handleAddCat = async () => {
    if (!name || !breed || !age) {
      Alert.alert('Missing Fields', 'Please provide at least a name, breed, and age.');
      return;
    }

    // Process comma-separated traits into array or default list
    const parsedTraits = traits
      ? traits.split(',').map((t) => t.trim()).filter((t) => t.length > 0)
      : ['Friendly', 'Playful'];

    const newCat: CatItem = {
      id: Date.now().toString(),
      name,
      category: 'Breed', // Added missing required property
      type: 'pet',       // Added missing required property
      breed,
      age,
      gender: gender || 'Unknown',
      location: location || 'Cagayan de Oro City',
      price: price || 'Free',
      weight: weight ? `${weight} kg` : '3.0 kg',
      height: height ? `${height} cm` : '25 cm',
      health: health || 'Healthy / Vaccinated',
      traits: parsedTraits,
      description: description || 'A wonderful cat looking for a forever home.',
      imageUri: imageUri || '',
    };

    try {
      console.log('🐾 NEW CAT ADDED VIA APP:', JSON.stringify(newCat, null, 2));

      // 1. Add to top of in-memory array
      CAT_DATA.unshift(newCat);

      // 2. Persist to storage
      await AsyncStorage.setItem('saved_cats', JSON.stringify(CAT_DATA));

      Alert.alert('Success', `${name} has been listed for adoption!`, [
        { text: 'OK', onPress: () => go('main') },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to save the cat.');
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => go('profile')} style={styles.backButton}>
          <AngleLeftIcon width={18} height={18} fill={colors.ink} />
        </Pressable>
        <Text style={styles.headerTitle}>Add New Pet</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Image Picker Area */}
        <Text style={styles.label}>Cat Photo</Text>
        <Pressable style={styles.imagePickerCard} onPress={pickImage}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.previewImage} />
          ) : (
            <View style={styles.imagePickerPlaceholder}>
              <CameraIcon width={32} height={32} fill={colors.ink} />
              <Text style={styles.imagePickerText}>Tap to select photo from gallery</Text>
            </View>
          )}
        </Pressable>

        {/* Basic Info Inputs */}
        <Text style={styles.label}>Cat Name *</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="e.g. Oliver"
        />

        <Text style={styles.label}>Breed *</Text>
        <TextInput
          style={styles.input}
          value={breed}
          onChangeText={setBreed}
          placeholder="e.g. Scottish Fold"
        />

        <View style={styles.row}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Text style={styles.label}>Age *</Text>
            <TextInput
              style={styles.input}
              value={age}
              onChangeText={setAge}
              placeholder="e.g. 3.5 months"
            />
          </View>
          <View style={{ flex: 1, marginLeft: 8 }}>
            <Text style={styles.label}>Gender</Text>
            <TextInput
              style={styles.input}
              value={gender}
              onChangeText={setGender}
              placeholder="e.g. Male"
            />
          </View>
        </View>

        {/* Dynamic Physical & Health Features */}
        <View style={styles.row}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Text style={styles.label}>Weight (kg)</Text>
            <TextInput
              style={styles.input}
              value={weight}
              onChangeText={setWeight}
              placeholder="e.g. 3.3"
              keyboardType="numeric"
            />
          </View>
          <View style={{ flex: 1, marginLeft: 8 }}>
            <Text style={styles.label}>Height (cm)</Text>
            <TextInput
              style={styles.input}
              value={height}
              onChangeText={setHeight}
              placeholder="e.g. 25"
              keyboardType="numeric"
            />
          </View>
        </View>

        <Text style={styles.label}>Health Status</Text>
        <TextInput
          style={styles.input}
          value={health}
          onChangeText={setHealth}
          placeholder="e.g. Healthy / Vaccinated"
        />

        {/* Dynamic Personality Tags Input */}
        <Text style={styles.label}>Personality Traits (comma separated)</Text>
        <TextInput
          style={styles.input}
          value={traits}
          onChangeText={setTraits}
          placeholder="e.g. Friendly, Playful, Gentle"
        />

        {/* Location & Pricing */}
        <Text style={styles.label}>Location</Text>
        <TextInput
          style={styles.input}
          value={location}
          onChangeText={setLocation}
          placeholder="e.g. Cagayan de Oro City"
        />

        <Text style={styles.label}>Price / Adoption Fee</Text>
        <TextInput
          style={styles.input}
          value={price}
          onChangeText={setPrice}
          placeholder="e.g. Free"
        />

        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={description}
          onChangeText={setDescription}
          placeholder="Tell us about this cat..."
          multiline
        />

        <Pressable style={styles.submitButton} onPress={handleAddCat}>
          <Text style={styles.submitButtonText}>Publish Listing</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.mint || '#A8DDD6' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingHorizontal: spacing.md,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { fontSize: 18, fontWeight: '800', color: colors.ink },
  scrollContent: { paddingHorizontal: spacing.md, paddingBottom: 60 },
  label: { fontSize: 13, fontWeight: '700', color: colors.ink, marginBottom: 8, marginTop: 14 },
  row: { flexDirection: 'row' },
  imagePickerCard: {
    width: '100%',
    height: 160,
    backgroundColor: colors.white,
    borderRadius: radii.md,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    borderStyle: 'dashed',
  },
  imagePickerPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  imagePickerText: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(0,0,0,0.5)',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  input: {
    backgroundColor: colors.white,
    borderRadius: radii.md,
    paddingHorizontal: 16,
    height: 50,
    fontSize: 14,
    color: colors.ink,
  },
  textArea: { height: 100, paddingTop: 16, textAlignVertical: 'top' },
  submitButton: {
    backgroundColor: colors.ink,
    paddingVertical: 16,
    borderRadius: radii?.pill || 20,
    alignItems: 'center',
    marginTop: 28,
  },
  submitButtonText: { color: colors.white, fontSize: 16, fontWeight: '800' },
});