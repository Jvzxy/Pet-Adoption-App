import React, { useEffect, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { radii, spacing } from '../../constants/theme';
import { useAuth } from '../../services/AuthContext';
import { useAppData } from '../../services/AppDataContext';
import { useAppPreferences, type AppColors } from '../../services/AppPreferencesContext';
import { supabase } from '../../services/supabaseClient';

// SVG Icon Imports
import AngleLeftIcon from '../../images/Icons/angle-left-solid-full.svg';

interface ScreenProps {
  go: (next: string) => void;
  id?: string;
}

export default function AdoptionFormScreen({ go, id }: ScreenProps) {
  const { colors } = useAppPreferences();
  const styles = createStyles(colors);
  const { user } = useAuth();
  const { catalogItems } = useAppData();
  const selectedCat = catalogItems.find((cat) => cat.id === id && cat.type === 'pet');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Fields State
  const [fullName, setFullName] = useState(user?.name ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [email, setEmail] = useState(user?.username ?? '');
  const [address, setAddress] = useState(user?.address ?? '');
  const [deliveryOption, setDeliveryOption] = useState<'delivery' | 'pickup'>('delivery');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    setFullName((value) => value || user?.name || '');
    setPhone((value) => value || user?.phone || '');
    setEmail((value) => value || user?.username || '');
    setAddress((value) => value || user?.address || '');
  }, [user]);

  const handleSubmitAdoption = async () => {
    if (!user) {
      Alert.alert('Sign in required', 'Sign in before submitting an adoption application.');
      return;
    }
    if (!selectedCat) {
      Alert.alert('Pet unavailable', 'This pet is no longer available for adoption.');
      return;
    }
    if (!fullName.trim() || !phone.trim() || !email.trim() || !address.trim()) {
      Alert.alert('Missing Fields', 'Please fill in your full name, phone number, and delivery address.');
      return;
    }

    try {
      setIsSubmitting(true);
      const { error } = await supabase.from('adoption_applications').insert({
        applicant_id: user.id,
        catalog_item_id: selectedCat.id,
        full_name: fullName.trim(),
        phone: phone.trim(),
        email: email.trim(),
        address: address.trim(),
        fulfillment: deliveryOption,
        notes: notes.trim(),
      });

      if (error) throw error;

      Alert.alert(
        'Application Submitted',
        `Thank you ${fullName.trim()}! Your request to ${
          deliveryOption === 'delivery' ? 'deliver' : 'reserve'
        } ${selectedCat.name} has been received.`,
        [{ text: 'Return to Home', onPress: () => go('main') }]
      );
    } catch (error) {
      console.error('Could not submit adoption application:', error);
      Alert.alert(
        'Application not saved',
        error instanceof Error ? error.message : 'Failed to submit the application. Please try again.',
      );
    } finally {
      setIsSubmitting(false);
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
        <Pressable style={styles.submitButton} onPress={handleSubmitAdoption} disabled={isSubmitting || !selectedCat}>
          <Text style={styles.submitButtonText}>
            {isSubmitting ? 'Submitting...' : deliveryOption === 'delivery' ? 'Confirm Delivery Request' : 'Reserve Cat for Pickup'}
          </Text>
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
  summaryCard: {
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: radii.md,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: colors.ink,
  },
  summaryTitle: { fontSize: 16, fontWeight: '900', color: colors.ink },
  summarySubtitle: { fontSize: 13, color: colors.textMuted, marginTop: 4, fontWeight: '600' },
  label: { fontSize: 13, fontWeight: '700', color: colors.ink, marginBottom: 8, marginTop: 14 },
  toggleRow: { flexDirection: 'row', gap: 10, marginBottom: 8 },
  toggleBtn: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  toggleBtnActive: {
    backgroundColor: colors.isDark ? colors.mint : colors.ink,
  },
  toggleText: { fontSize: 13, fontWeight: '700', color: colors.ink },
  toggleTextActive: { color: colors.isDark ? colors.ink : colors.white },
  input: {
    backgroundColor: colors.surface,
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
  submitButtonText: { color: colors.isDark ? colors.background : colors.white, fontSize: 16, fontWeight: '800' },
});