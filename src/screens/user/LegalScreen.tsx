import React, { useState, useEffect } from 'react';
import { Pressable, StyleSheet, Text, View, ScrollView, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useAuth } from '../../services/AuthContext';
import { useAppPreferences, type AppColors } from '../../services/AppPreferencesContext';
import AngleLeftIcon from '../../images/Icons/angle-left-solid-full.svg';
import { supabase } from '../../services/supabaseClient';

interface ScreenProps {
  go: (next: string) => void;
  returnTo?: string;
}

interface BusinessDetails {
  entity_name: string;
  privacy_contact: string;
  address: string;
}

export default function LegalScreen({ go, returnTo = 'settings' }: ScreenProps) {
  const { user } = useAuth();
  const { colors } = useAppPreferences();
  const styles = createStyles(colors);

  const [details, setDetails] = useState<BusinessDetails>({
    entity_name: 'Loading...',
    privacy_contact: 'Loading...',
    address: 'Loading...'
  });
  
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [editName, setEditName] = useState('');
  const [editContact, setEditContact] = useState('');
  const [editAddress, setEditAddress] = useState('');

  useEffect(() => {
    fetchDetails();
  }, []);

  const fetchDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('business_details')
        .select('*')
        .eq('id', 1)
        .single();

      if (error) throw error;
      
      if (data) {
        setDetails(data);
        setEditName(data.entity_name);
        setEditContact(data.privacy_contact);
        setEditAddress(data.address);
      }
    } catch (err) {
      console.error('Error fetching business details:', err);
      // Fallback in case the table isn't created yet
      const fallback = {
        entity_name: 'Forever Home Pet Adoption LLC',
        privacy_contact: 'privacy@foreverhomeapp.com',
        address: '123 Rescue Way, Suite 100\nPet City, PC 90210'
      };
      setDetails(fallback);
      setEditName(fallback.entity_name);
      setEditContact(fallback.privacy_contact);
      setEditAddress(fallback.address);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!editName.trim() || !editContact.trim() || !editAddress.trim()) {
      Alert.alert('Incomplete', 'Please fill in all business details.');
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('business_details')
        .update({
          entity_name: editName.trim(),
          privacy_contact: editContact.trim(),
          address: editAddress.trim(),
        })
        .eq('id', 1);

      if (error) throw error;

      setDetails({
        entity_name: editName.trim(),
        privacy_contact: editContact.trim(),
        address: editAddress.trim(),
      });
      setIsEditing(false);
      Alert.alert('Success', 'Business details updated successfully.');
    } catch (err) {
      console.error('Error updating business details:', err);
      Alert.alert('Save Failed', 'Ensure you have run the business_details SQL schema.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditName(details.entity_name);
    setEditContact(details.privacy_contact);
    setEditAddress(details.address);
    setIsEditing(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Pressable onPress={() => go(returnTo)} style={styles.backBtn} hitSlop={10}>
          <AngleLeftIcon width={18} height={18} fill={colors.ink} />
        </Pressable>
        <Text style={styles.headerTitle}>Legal & Compliance</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* AGREEMENTS & POLICIES */}
        <Text style={styles.sectionTitle}>AGREEMENTS & POLICIES</Text>
        <View style={styles.card}>
          <Pressable style={styles.menuItem} onPress={() => go('termsOfService')}>
            <Text style={styles.menuLabel}>Terms of Service</Text>
          </Pressable>
          <Pressable style={[styles.menuItem, { borderBottomWidth: 0 }]} onPress={() => go('privacyPolicy')}>
            <Text style={styles.menuLabel}>Privacy Policy</Text>
          </Pressable>
        </View>

        {/* RESTRICTED DETAILS */}
        {user && (
          <>
            <Text style={styles.sectionTitle}>BUSINESS DETAILS</Text>
            
            {isEditing && user.role === 'admin' ? (
              <View style={styles.formCard}>
                <Text style={styles.inputLabel}>Entity Name</Text>
                <TextInput
                  style={styles.textInput}
                  value={editName}
                  onChangeText={setEditName}
                  placeholder="e.g. Forever Home LLC"
                />

                <Text style={styles.inputLabel}>Privacy Contact Email</Text>
                <TextInput
                  style={styles.textInput}
                  value={editContact}
                  onChangeText={setEditContact}
                  placeholder="e.g. privacy@domain.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />

                <Text style={styles.inputLabel}>Business Address</Text>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  value={editAddress}
                  onChangeText={setEditAddress}
                  placeholder="Complete Business Address"
                  multiline
                  textAlignVertical="top"
                />

                <View style={styles.actionRow}>
                  <Pressable style={styles.cancelBtn} onPress={handleCancel}>
                    <Text style={styles.cancelBtnText}>Cancel</Text>
                  </Pressable>
                  <Pressable style={styles.saveBtn} onPress={handleSave} disabled={isSaving}>
                    {isSaving ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Text style={styles.saveBtnText}>Save</Text>
                    )}
                  </Pressable>
                </View>
              </View>
            ) : (
              <View style={styles.card}>
                <Text style={styles.label}>ENTITY NAME</Text>
                <Text style={styles.value}>{details.entity_name}</Text>
                <View style={styles.divider} />
                
                <Text style={styles.label}>PRIVACY CONTACT</Text>
                <Text style={styles.value}>{details.privacy_contact}</Text>
                <View style={styles.divider} />
                
                <Text style={styles.label}>ADDRESS</Text>
                <Text style={styles.value}>{details.address}</Text>

                {user.role === 'admin' && (
                  <Pressable style={styles.editBtn} onPress={() => setIsEditing(true)}>
                    <Text style={styles.editBtnText}>Edit Business Details</Text>
                  </Pressable>
                )}
              </View>
            )}

            <Text style={styles.sectionTitle}>DATA RIGHTS & PRIVACY</Text>
            <View style={styles.card}>
              <Text style={styles.dangerTitle}>Account Deletion</Text>
              <Text style={styles.description}>
                Under the GDPR and CCPA, you have the right to request the permanent deletion of your personal data and adoption history.
              </Text>
              <Pressable style={styles.dangerBtn}>
                <Text style={styles.dangerBtnText}>Request Data Deletion</Text>
              </Pressable>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const createStyles = (colors: AppColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 60, paddingBottom: 20, paddingHorizontal: 24 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.5)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '900', color: colors.ink || '#000' },
  content: { paddingHorizontal: 24, paddingBottom: 60 },
  sectionTitle: { fontSize: 12, fontWeight: '800', color: colors.textMuted, marginTop: 24, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 },
  
  // Display Styles
  card: { backgroundColor: colors.surface, borderRadius: 20, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 3 },
  label: { fontSize: 10, fontWeight: '700', color: colors.textMuted, marginBottom: 4, letterSpacing: 0.5 },
  value: { fontSize: 14, fontWeight: '700', color: colors.ink, marginBottom: 2 },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: 12 },
  menuItem: { paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.border },
  menuLabel: { fontSize: 14, fontWeight: '700', color: colors.ink },
  
  // Danger Section
  dangerTitle: { fontSize: 15, fontWeight: '800', color: '#D32F2F', marginBottom: 8 },
  description: { fontSize: 13, color: colors.textMuted, lineHeight: 20, marginBottom: 16, fontWeight: '500' },
  dangerBtn: { backgroundColor: 'rgba(211, 47, 47, 0.1)', paddingVertical: 14, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#D32F2F' },
  dangerBtnText: { color: '#D32F2F', fontSize: 14, fontWeight: '800' },

  // Admin Edit Form Styles
  formCard: { backgroundColor: colors.surface, borderRadius: 24, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 3 },
  editBtn: { borderWidth: 1, borderColor: colors.ink, borderRadius: 20, paddingVertical: 10, alignItems: 'center', marginTop: 16 },
  editBtnText: { color: colors.ink, fontSize: 12, fontWeight: '800' },
  inputLabel: { fontSize: 12, fontWeight: '800', color: colors.ink, marginBottom: 6, marginTop: 10 },
  textInput: { backgroundColor: colors.background, borderRadius: 12, paddingHorizontal: 16, height: 48, fontSize: 13, color: colors.ink, borderWidth: 1, borderColor: colors.border },
  textArea: { height: 100, paddingTop: 12 },
  actionRow: { flexDirection: 'row', gap: 12, marginTop: 24 },
  cancelBtn: { flex: 1, borderWidth: 1, borderColor: colors.ink, borderRadius: 20, paddingVertical: 14, alignItems: 'center' },
  cancelBtnText: { color: colors.ink, fontSize: 13, fontWeight: '800' },
  saveBtn: { flex: 1, backgroundColor: colors.ink, borderRadius: 20, paddingVertical: 14, alignItems: 'center', justifyContent: 'center' },
  saveBtnText: { color: '#fff', fontSize: 13, fontWeight: '900' },
});