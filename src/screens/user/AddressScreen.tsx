import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View, ScrollView, Alert } from 'react-native';
import { colors, radii } from '../../constants/theme';
import AngleLeftIcon from '../../images/Icons/angle-left-solid-full.svg';
import LocationIcon from '../../images/Icons/location-dot-solid-full.svg';
import { useAuth } from '../../services/AuthContext';

interface ScreenProps {
  go: (next: string) => void;
}

export default function AddressScreen({ go }: ScreenProps) {
  const { user, updateProfile } = useAuth();
  
  // State for toggling edit mode
  const [isEditing, setIsEditing] = useState(false);
  
  // Local state for the form, initialized with user's current data if it exists
  const [addressInput, setAddressInput] = useState(user?.address || '');
  const [phoneInput, setPhoneInput] = useState(user?.phone || '');
  const [nameInput, setNameInput] = useState(user?.name || '');

  const handleSave = () => {
    if (!addressInput.trim() || !phoneInput.trim() || !nameInput.trim()) {
      Alert.alert('Incomplete', 'Please fill in all fields (Name, Phone, Address).');
      return;
    }
    
    // Update the AuthContext with the new data
    updateProfile({
      name: nameInput.trim(),
      phone: phoneInput.trim(),
      address: addressInput.trim(),
    });
    
    setIsEditing(false);
    Alert.alert('Success', 'Address updated successfully.');
  };

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Pressable onPress={() => go('payment')} style={styles.backBtn} hitSlop={10}>
          <AngleLeftIcon width={18} height={18} fill={colors.ink} />
        </Pressable>
        <Text style={styles.headerTitle}>{isEditing ? 'Edit Address' : 'My Address'}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {!isEditing ? (
          // Display Mode
          <View style={styles.addressCard}>
            <View style={styles.cardHeader}>
              <LocationIcon width={16} height={16} fill={colors.ink} style={{ marginRight: 8 }} />
              <Text style={styles.cardTitle}>Default Delivery Address</Text>
              <View style={styles.defaultBadge}>
                <Text style={styles.badgeText}>Active</Text>
              </View>
            </View>
            
            {user?.address ? (
              <>
                <Text style={styles.addressName}>{user.name}</Text>
                <Text style={styles.addressText}>{user.address}</Text>
                <Text style={styles.addressPhone}>{user.phone}</Text>
              </>
            ) : (
              <Text style={styles.emptyText}>No address currently saved.</Text>
            )}
            
            <Pressable style={styles.editBtn} onPress={() => setIsEditing(true)}>
              <Text style={styles.editBtnText}>{user?.address ? 'Edit Address' : 'Add Address'}</Text>
            </Pressable>
          </View>
        ) : (
          // Edit/Input Mode
          <View style={styles.formCard}>
            <Text style={styles.inputLabel}>Full Name</Text>
            <TextInput
              style={styles.textInput}
              value={nameInput}
              onChangeText={setNameInput}
              placeholder="Enter your full name"
            />

            <Text style={styles.inputLabel}>Phone Number</Text>
            <TextInput
              style={styles.textInput}
              value={phoneInput}
              onChangeText={setPhoneInput}
              placeholder="e.g. 09171234567"
              keyboardType="phone-pad"
            />

            <Text style={styles.inputLabel}>Complete Address</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={addressInput}
              onChangeText={setAddressInput}
              placeholder="House/Unit No., Street, Subdivision, Barangay, City, Province, Zip Code"
              multiline
              textAlignVertical="top"
            />

            <View style={styles.actionRow}>
              <Pressable 
                style={styles.cancelBtn} 
                onPress={() => {
                  // Reset form to current saved state on cancel
                  setNameInput(user?.name || '');
                  setPhoneInput(user?.phone || '');
                  setAddressInput(user?.address || '');
                  setIsEditing(false);
                }}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </Pressable>
              
              <Pressable style={styles.saveBtn} onPress={handleSave}>
                <Text style={styles.saveBtnText}>Save</Text>
              </Pressable>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.mint || '#A8DDD6' },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 60, paddingBottom: 20, paddingHorizontal: 24 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.5)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '900', color: colors.ink || '#000' },
  content: { paddingHorizontal: 24, paddingBottom: 40 },
  
  // Display Card Styles
  addressCard: { backgroundColor: colors.white, borderRadius: 24, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 3 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  cardTitle: { fontSize: 14, fontWeight: '900', color: colors.ink, flex: 1 },
  defaultBadge: { backgroundColor: '#E8F5E9', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  badgeText: { color: '#2E7D32', fontSize: 10, fontWeight: '800' },
  addressName: { fontSize: 16, fontWeight: '800', color: colors.ink, marginBottom: 4 },
  addressText: { fontSize: 13, fontWeight: '600', color: 'rgba(0,0,0,0.6)', lineHeight: 20, marginBottom: 8 },
  addressPhone: { fontSize: 13, fontWeight: '700', color: colors.ink, marginBottom: 16 },
  emptyText: { fontSize: 13, color: 'rgba(0,0,0,0.5)', fontStyle: 'italic', marginBottom: 16 },
  editBtn: { borderWidth: 1, borderColor: colors.ink, borderRadius: radii?.pill || 20, paddingVertical: 10, alignItems: 'center' },
  editBtnText: { color: colors.ink, fontSize: 12, fontWeight: '800' },
  
  // Form Styles
  formCard: { backgroundColor: colors.white, borderRadius: 24, padding: 20 },
  inputLabel: { fontSize: 12, fontWeight: '800', color: colors.ink, marginBottom: 6, marginTop: 10 },
  textInput: { backgroundColor: '#F5F5F5', borderRadius: 12, paddingHorizontal: 16, height: 48, fontSize: 13, color: colors.ink, borderWidth: 1, borderColor: '#E0E0E0' },
  textArea: { height: 100, paddingTop: 12 },
  actionRow: { flexDirection: 'row', gap: 12, marginTop: 24 },
  cancelBtn: { flex: 1, borderWidth: 1, borderColor: colors.ink, borderRadius: radii?.pill || 20, paddingVertical: 14, alignItems: 'center' },
  cancelBtnText: { color: colors.ink, fontSize: 13, fontWeight: '800' },
  saveBtn: { flex: 1, backgroundColor: colors.ink, borderRadius: radii?.pill || 20, paddingVertical: 14, alignItems: 'center' },
  saveBtnText: { color: colors.white, fontSize: 13, fontWeight: '900' },
});