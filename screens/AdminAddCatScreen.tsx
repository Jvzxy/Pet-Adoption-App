import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, radii, spacing } from '../constants/theme';
import { CAT_DATA, CatItem } from '../data/cats';

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
  const [description, setDescription] = useState('');

  const handleAddCat = async () => {
    if (!name || !breed || !age) {
      Alert.alert('Missing Fields', 'Please provide at least a name, breed, and age.');
      return;
    }

    const newCat: CatItem = {
      id: Date.now().toString(),
      name,
      breed,
      age,
      gender: gender || 'Unknown',
      location: location || 'Cagayan de Oro City',
      price: price || 'Free', 
      weight: 'TBD',
      height: 'TBD',
      health: 'Pending Checkup',
      description: description || 'A wonderful cat looking for a forever home.',
      imageUri: '', 
    };

    try {
      // Print the newly created cat to the VS Code terminal
      console.log("🐾 NEW CAT ADDED VIA APP:", JSON.stringify(newCat, null, 2));

      // 1. Add to top of in-memory array
      CAT_DATA.unshift(newCat);

      // 2. Persist to storage
      await AsyncStorage.setItem('saved_cats', JSON.stringify(CAT_DATA));

      Alert.alert('Success', `${name} has been listed for adoption!`, [
        { text: 'OK', onPress: () => go('main') }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to save the cat.');
    }

    try {
      CAT_DATA.unshift(newCat);
      await AsyncStorage.setItem('saved_cats', JSON.stringify(CAT_DATA));

      Alert.alert('Success', `${name} has been listed for adoption!`, [
        { text: 'OK', onPress: () => go('main') }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to save the cat.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => go('main')} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={colors.ink} />
        </Pressable>
        <Text style={styles.headerTitle}>Add New Pet</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.label}>Cat Name *</Text>
        <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="e.g. Luna" />

        <Text style={styles.label}>Breed *</Text>
        <TextInput style={styles.input} value={breed} onChangeText={setBreed} placeholder="e.g. Persian" />

        <Text style={styles.label}>Age *</Text>
        <TextInput style={styles.input} value={age} onChangeText={setAge} placeholder="e.g. 2 months" />

        <Text style={styles.label}>Gender</Text>
        <TextInput style={styles.input} value={gender} onChangeText={setGender} placeholder="e.g. Female" />

        <Text style={styles.label}>Location</Text>
        <TextInput style={styles.input} value={location} onChangeText={setLocation} placeholder="e.g. Downtown CDO" />
        
        <Text style={styles.label}>Price / Adoption Fee</Text>
        <TextInput style={styles.input} value={price} onChangeText={setPrice} placeholder="e.g. $180 or Free" />

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
  container: { flex: 1, backgroundColor: colors.mint },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 50, paddingHorizontal: spacing.md, paddingBottom: 20 },
  backButton: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: colors.ink },
  scrollContent: { paddingHorizontal: spacing.md, paddingBottom: 40 },
  label: { fontSize: 13, fontWeight: '700', color: colors.ink, marginBottom: 8, marginTop: 16 },
  input: { backgroundColor: colors.white, borderRadius: radii.md, paddingHorizontal: 16, height: 50, fontSize: 14, color: colors.ink },
  textArea: { height: 100, paddingTop: 16, textAlignVertical: 'top' },
  submitButton: { backgroundColor: colors.ink, paddingVertical: 16, borderRadius: radii.pill, alignItems: 'center', marginTop: 32 },
  submitButtonText: { color: colors.white, fontSize: 16, fontWeight: '800' }
});