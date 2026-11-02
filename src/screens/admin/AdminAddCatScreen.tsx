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

const PERSONALITY_OPTIONS = [
  'Friendly',
  'Playful',
  'Gentle',
  'Affectionate',
  'Curious',
  'Energetic',
  'Calm',
  'Independent',
  'Social',
  'Shy',
  'Cuddly',
];

interface ScreenProps {
  go: (next: string) => void;
}

export default function AdminAddCatScreen({ go }: ScreenProps) {
  const { colors } = useAppPreferences();
  const styles = createStyles(colors);
  const { user } = useAuth();
  const { refreshCatalog } = useAppData();
  const [isSaving, setIsSaving] = useState(false);
  const [name, setName] = useState('');
  const [breed, setBreed] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [location, setLocation] = useState('');
  const [price, setPrice] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [health, setHealth] = useState('Vaccinated');
  const [selectedTraits, setSelectedTraits] = useState<string[]>(['Friendly', 'Playful']);
  const [customTraits, setCustomTraits] = useState('');
  const [description, setDescription] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);

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
      setImageUri(result.assets[0].uri);
      setImageBase64(result.assets[0].base64 ?? null);
    }
  };

  const handleAddCat = async () => {
    if (!name.trim() || !breed.trim() || !age.trim()) {
      Alert.alert('Missing Fields', 'Please provide at least a name, breed, and age.');
      return;
    }

    const parsedTraits = [...selectedTraits, ...customTraits.split(',')]
      .map((trait) => trait.trim())
      .filter((trait, index, allTraits) =>
        trait.length > 0 && allTraits.findIndex((item) => item.toLowerCase() === trait.toLowerCase()) === index,
      );

    const adoptionFee = price.trim().toLowerCase() === 'free' || !price.trim()
      ? 0
      : Number(price.replace(/[^\d.]/g, ''));
    if (!Number.isFinite(adoptionFee) || adoptionFee < 0) {
      Alert.alert('Invalid fee', 'Enter a valid non-negative adoption fee, or leave it blank for free adoption.');
      return;
    }

    if (!user) {
      Alert.alert('Sign in required', 'Sign in with an admin account before publishing a pet.');
      return;
    }

    try {
      setIsSaving(true);
      if (imageUri && !imageBase64) {
        throw new Error('The photo picker did not provide image data. Choose the photo again and retry.');
      }
      const imageUrl = imageBase64 ? await uploadCatalogImage(imageBase64, user.id) : '';
      const { error } = await supabase.from('catalog_items').insert({
        type: 'pet',
        category: 'Pet',
        name: name.trim(),
        breed: breed.trim(),
        age: age.trim(),
        gender: gender.trim() || 'Unknown',
        location: location.trim() || 'Cagayan de Oro City',
        price: adoptionFee,
        weight: weight.trim() ? `${weight.trim()} kg` : null,
        height: height.trim() ? `${height.trim()} cm` : null,
        health: health.trim() || 'Healthy / Vaccinated',
        traits: parsedTraits,
        description: description.trim() || 'A wonderful cat looking for a forever home.',
        image_url: imageUrl,
        created_by: user.id,
      });

      if (error) throw error;
      await refreshCatalog();
      Alert.alert('Success', `${name.trim()} has been listed for adoption.`, [
        { text: 'OK', onPress: () => go('explorePets') },
      ]);
    } catch (error) {
      console.error('Could not publish pet:', error);
      Alert.alert('Could not publish pet', error instanceof Error ? error.message : 'Please try again.');
    } finally {
      setIsSaving(false);
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
            <View style={styles.choiceGroup}>
              {['Male', 'Female'].map((option) => (
                <Pressable
                  key={option}
                  accessibilityRole="button"
                  accessibilityState={{ selected: gender === option }}
                  style={[styles.choiceChip, gender === option && styles.choiceChipSelected]}
                  onPress={() => setGender(option)}
                >
                  <Text style={[styles.choiceText, gender === option && styles.choiceTextSelected]}>{option}</Text>
                </Pressable>
              ))}
            </View>
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
        <View style={styles.choiceGroup}>
          {['Vaccinated', 'Not Vaccinated'].map((option) => (
            <Pressable
              key={option}
              accessibilityRole="button"
              accessibilityState={{ selected: health === option }}
              style={[styles.choiceChip, health === option && styles.choiceChipSelected]}
              onPress={() => setHealth(option)}
            >
              <Text style={[styles.choiceText, health === option && styles.choiceTextSelected]}>{option}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.label}>Personality Traits</Text>
        <View style={styles.traitOptions}>
          {PERSONALITY_OPTIONS.map((trait) => {
            const selected = selectedTraits.includes(trait);
            return (
              <Pressable
                key={trait}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                style={[styles.choiceChip, selected && styles.choiceChipSelected]}
                onPress={() => setSelectedTraits((current) =>
                  selected ? current.filter((item) => item !== trait) : [...current, trait],
                )}
              >
                <Text style={[styles.choiceText, selected && styles.choiceTextSelected]}>{trait}</Text>
              </Pressable>
            );
          })}
        </View>
        <Text style={styles.helperText}>Select all that apply, or add your own below.</Text>
        <TextInput
          style={styles.input}
          value={customTraits}
          onChangeText={setCustomTraits}
          placeholder="Other traits, separated by commas"
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

        <Pressable style={styles.submitButton} onPress={handleAddCat} disabled={isSaving}>
          <Text style={styles.submitButtonText}>{isSaving ? 'Publishing...' : 'Publish Listing'}</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const createStyles = (colors: AppColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
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
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
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
    color: colors.textMuted,
  },
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    paddingHorizontal: 16,
    height: 50,
    fontSize: 14,
    color: colors.ink,
  },
  choiceGroup: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  traitOptions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  choiceChip: {
    backgroundColor: colors.surface,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  choiceChipSelected: { backgroundColor: colors.ink, borderColor: colors.ink },
  choiceText: { color: colors.ink, fontSize: 12, fontWeight: '700' },
  choiceTextSelected: { color: colors.white },
  helperText: { color: colors.textMuted, fontSize: 12, marginTop: 8 },
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