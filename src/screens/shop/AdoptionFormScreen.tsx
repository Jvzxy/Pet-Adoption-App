import React, { useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, radii, spacing } from '../../constants/theme';
import { CAT_DATA } from '../../data/cats';

// SVG Icon Imports
import AngleLeftIcon from '../../images/Icons/angle-left-solid-full.svg';

interface ScreenProps {
  go: (next: string) => void;
  id?: string;
}

export default function AdoptionFormScreen({ go, id }: ScreenProps) {
  const selectedCat = CAT_DATA.find((cat) => cat.id === id);

  // Form Fields State
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [deliveryOption, setDeliveryOption] = useState<'delivery' | 'pickup'>('delivery');
  const [notes, setNotes] = useState('');

  const handleSubmitAdoption = async () => {
    if (!fullName || !phone || !address) {
      Alert.alert('Missing Fields', 'Please fill in your full name, phone number, and delivery address.');
      return;
    }

    const adoptionData = {
      id: Date.now().toString(),
      catId: selectedCat?.id || id,
      catName: selectedCat?.name || 'Selected Cat',
      fullName,
      phone,
      email,
      address,
      deliveryOption,
      notes,
      status: 'Pending Confirmation',
      createdAt: new Date().toISOString(),
    };

    try {
      console.log('🐾 NEW ADOPTION APPLICATION:', JSON.stringify(adoptionData, null, 2));

      // Get existing adoptions from AsyncStorage
      const existingAdoptionsRaw = await AsyncStorage.getItem('saved_adoptions');
      const existingAdoptions = existingAdoptionsRaw ? JSON.parse(existingAdoptionsRaw) : [];
      
      existingAdoptions.unshift(adoptionData);
      await AsyncStorage.setItem('saved_adoptions', JSON.stringify(existingAdoptions));

      Alert.alert(
        'Application Submitted! 🎉',
        `Thank you ${fullName}! Your request to ${
          deliveryOption === 'delivery' ? 'deliver' : 'reserve'
        } ${selectedCat?.name || 'your cat'} has been received.`,
        [{ text: 'Return to Home', onPress: () => go('main') }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to submit adoption application. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      {/* Header Bar */}
      <View style={styles.header}>
        <Pressable onPress={() => go('details')} style={styles.backButton}>
          <AngleLeftIcon width={18} height={18} fill={colors.ink} />
        </Pressable>
        <Text style={styles.headerTitle}>Adoption Application</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Cat Summary Banner */}
        {selectedCat && (
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Adopting {selectedCat.name}</Text>
            <Text style={styles.summarySubtitle}>
              {selectedCat.breed} • {selectedCat.age} • {selectedCat.price}
            </Text>
          </View>
        )}

        {/* Delivery / Reservation Toggle */}
        <Text style={styles.label}>Fulfillment Method *</Text>
        <View style={styles.toggleRow}>
          <Pressable
            style={[styles.toggleBtn, deliveryOption === 'delivery' && styles.toggleBtnActive]}
            onPress={() => setDeliveryOption('delivery')}
          >
            <Text style={[styles.toggleText, deliveryOption === 'delivery' && styles.toggleTextActive]}>
              Home Delivery
            </Text>
          </Pressable>

          <Pressable
            style={[styles.toggleBtn, deliveryOption === 'pickup' && styles.toggleBtnActive]}
            onPress={() => setDeliveryOption('pickup')}
          >
            <Text style={[styles.toggleText, deliveryOption === 'pickup' && styles.toggleTextActive]}>
              In-Store Pickup
            </Text>
          </Pressable>
        </View>

        {/* Contact & Personal Info Form */}
        <Text style={styles.label}>Full Name *</Text>
        <TextInput
          style={styles.input}
          value={fullName}
          onChangeText={setFullName}
          placeholder="e.g. Juan Dela Cruz"
        />

        <Text style={styles.label}>Phone Number *</Text>
        <TextInput
          style={styles.input}
          value={phone}
          onChangeText={setPhone}
          placeholder="e.g. (+63) 912 345 6789"
          keyboardType="phone-pad"
        />

        <Text style={styles.label}>Email Address</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="e.g. juan@example.com"
          keyboardType="email-address"
        />

        <Text style={styles.label}>
          {deliveryOption === 'delivery' ? 'Home Delivery Address *' : 'Your Contact Address *'}
        </Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={address}
          onChangeText={setAddress}
          placeholder="Street, Barangay, City, Postal Code"
          multiline
        />

        <Text style={styles.label}>Special Instructions / Notes</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={notes}
          onChangeText={setNotes}
          placeholder="Preferred delivery dates, gate codes, pet care experience..."
          multiline
        />

        {/* Submit Button */}
        <Pressable style={styles.submitButton} onPress={handleSubmitAdoption}>
          <Text style={styles.submitButtonText}>
            {deliveryOption === 'delivery' ? 'Confirm Delivery Request' : 'Reserve Cat for Pickup'}
          </Text>
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
  summaryCard: {
    backgroundColor: colors.white,
    padding: 16,
    borderRadius: radii.md,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: colors.ink,
  },
  summaryTitle: { fontSize: 16, fontWeight: '900', color: colors.ink },
  summarySubtitle: { fontSize: 13, color: 'rgba(0,0,0,0.6)', marginTop: 4, fontWeight: '600' },
  label: { fontSize: 13, fontWeight: '700', color: colors.ink, marginBottom: 8, marginTop: 14 },
  toggleRow: { flexDirection: 'row', gap: 10, marginBottom: 8 },
  toggleBtn: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: colors.white,
    borderRadius: radii.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  toggleBtnActive: {
    backgroundColor: colors.ink,
  },
  toggleText: { fontSize: 13, fontWeight: '700', color: colors.ink },
  toggleTextActive: { color: colors.white },
  input: {
    backgroundColor: colors.white,
    borderRadius: radii.md,
    paddingHorizontal: 16,
    height: 50,
    fontSize: 14,
    color: colors.ink,
  },
  textArea: { height: 90, paddingTop: 14, textAlignVertical: 'top' },
  submitButton: {
    backgroundColor: colors.ink,
    paddingVertical: 16,
    borderRadius: radii?.pill || 20,
    alignItems: 'center',
    marginTop: 28,
  },
  submitButtonText: { color: colors.white, fontSize: 16, fontWeight: '800' },
});