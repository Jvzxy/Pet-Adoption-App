import React, { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { radii, spacing } from '../../constants/theme';
import { useAppData } from '../../services/AppDataContext';
import { useAppPreferences, type AppColors } from '../../services/AppPreferencesContext';
import { supabase } from '../../services/supabaseClient';
import AngleLeftIcon from '../../images/Icons/angle-left-solid-full.svg';

interface PetListing {
  id: string;
  name: string;
  breed: string | null;
  image_url: string;
  available: boolean;
}

interface ScreenProps {
  go: (next: string) => void;
}

export default function AdminPetsScreen({ go }: ScreenProps) {
  const { colors } = useAppPreferences();
  const styles = createStyles(colors);
  const { refreshCatalog } = useAppData();
  const [pets, setPets] = useState<PetListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const loadPets = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    const { data, error } = await supabase
      .from('catalog_items')
      .select('id, name, breed, image_url, available')
      .eq('type', 'pet')
      .order('created_at', { ascending: false });

    if (error) {
      setLoadError(error.message);
      setLoading(false);
      return;
    }

    setPets(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    void loadPets();
  }, [loadPets]);

  const toggleAvailability = async (pet: PetListing) => {
    const available = !pet.available;
    setBusyId(pet.id);
    const { data, error } = await supabase
      .from('catalog_items')
      .update({ available })
      .eq('id', pet.id)
      .eq('type', 'pet')
      .select('id, name, breed, image_url, available')
      .single();
    setBusyId(null);

    if (error) {
      Alert.alert('Availability not updated', error.message);
      return;
    }

    setPets((previous) => previous.map((item) => item.id === data.id ? data : item));
    try {
      await refreshCatalog();
    } catch (refreshError) {
      console.error(refreshError);
    }
  };

  const deletePet = (id: string, name: string) => {
    Alert.alert('Delete Pet', `Are you sure you want to permanently delete ${name}?`, [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Delete', 
        style: 'destructive', 
        onPress: async () => {
          setBusyId(id);
          const { error } = await supabase.from('catalog_items').delete().eq('id', id);
          setBusyId(null);

          if (error) {
            Alert.alert('Error deleting pet', error.message);
            return;
          }

          setPets((prev) => prev.filter(p => p.id !== id));
          refreshCatalog();
        }
      }
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => go('profile')} hitSlop={10}>
          <AngleLeftIcon width={20} height={20} fill={colors.ink} />
        </Pressable>
        <Text style={styles.headerTitle}>Pet Availability</Text>
        <Pressable onPress={() => void loadPets()}>
          <Text style={styles.refresh}>Refresh</Text>
        </Pressable>
      </View>

      <Text style={styles.helper}>
        Manage pets. Unavailable pets are hidden from customers and can’t receive new adoption applications.
      </Text>

      {loading ? (
        <Text style={styles.message}>Loading pets...</Text>
      ) : loadError ? (
        <View>
          <Text style={styles.error}>{loadError}</Text>
          <Pressable style={styles.retryButton} onPress={() => void loadPets()}>
            <Text style={styles.retryText}>Try again</Text>
          </Pressable>
        </View>
      ) : pets.length === 0 ? (
        <Text style={styles.message}>No pets have been listed yet.</Text>
      ) : (
        <FlatList
          data={pets}
          keyExtractor={(pet) => pet.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardMain}>
                {item.image_url ? (
                  <Image source={{ uri: item.image_url }} style={styles.petImage} />
                ) : (
                  <View style={[styles.petImage, styles.imagePlaceholder]}>
                    <Text style={styles.placeholderText}>No photo</Text>
                  </View>
                )}
                <View style={styles.petInfo}>
                  <Text style={styles.petName} numberOfLines={1}>{item.name}</Text>
                  <Text style={styles.breed} numberOfLines={1}>{item.breed || 'Breed not specified'}</Text>
                  <Text style={[styles.status, item.available ? styles.available : styles.unavailable]}>
                    {item.available ? 'Available' : 'Unavailable'}
                  </Text>
                </View>
              </View>

              <View style={styles.actionRow}>
                <Pressable
                  style={[styles.actionButton, item.available ? styles.markUnavailable : styles.markAvailable]}
                  disabled={busyId === item.id}
                  onPress={() => void toggleAvailability(item)}
                >
                  <Text style={styles.actionText}>
                    {busyId === item.id ? 'Saving...' : item.available ? 'Mark unavailable' : 'Mark available'}
                  </Text>
                </Pressable>

                <Pressable
                  style={[styles.actionButton, styles.deleteBtn]}
                  disabled={busyId === item.id}
                  onPress={() => deletePet(item.id, item.name)}
                >
                  <Text style={[styles.actionText, { color: '#FFFFFF' }]}>Delete</Text>
                </Pressable>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}

const createStyles = (colors: AppColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, paddingTop: 52 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.lg, paddingBottom: 14 },
  headerTitle: { color: colors.ink, fontSize: 17, fontWeight: '900' },
  refresh: { color: colors.ink, fontSize: 12, fontWeight: '700' },
  helper: { color: colors.textMuted, fontSize: 13, lineHeight: 19, paddingHorizontal: spacing.lg, marginBottom: 16 },
  list: { paddingHorizontal: spacing.lg, paddingBottom: 32, gap: 12 },
  card: { backgroundColor: colors.surface, borderRadius: radii.md, padding: 12, gap: 12 },
  cardMain: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  petImage: { width: 64, height: 64, borderRadius: radii.sm },
  imagePlaceholder: { alignItems: 'center', justifyContent: 'center', backgroundColor: colors.cardBg },
  placeholderText: { color: colors.textMuted, fontSize: 10 },
  petInfo: { flex: 1 },
  petName: { color: colors.ink, fontSize: 14, fontWeight: '800' },
  breed: { color: colors.textMuted, fontSize: 12, marginTop: 3 },
  status: { fontSize: 11, fontWeight: '800', marginTop: 5 },
  available: { color: '#2E7D32' },
  unavailable: { color: colors.red },
  actionRow: { flexDirection: 'row', gap: 8, marginTop: 4 },
  actionButton: { flex: 1, paddingVertical: 10, borderRadius: radii.pill, alignItems: 'center' },
  markUnavailable: { backgroundColor: colors.isDark ? '#6A3838' : '#F6D6D6' },
  markAvailable: { backgroundColor: colors.mint },
  deleteBtn: { backgroundColor: '#D32F2F', flex: 0.5 }, // Smaller delete button
  actionText: { color: colors.ink, fontSize: 11, fontWeight: '800' },
  message: { color: colors.textMuted, textAlign: 'center', marginTop: 30, paddingHorizontal: 24 },
  error: { color: colors.red, textAlign: 'center', marginTop: 30, paddingHorizontal: 24 },
  retryButton: { alignSelf: 'center', marginTop: 14, paddingHorizontal: 18, paddingVertical: 10, borderRadius: radii.pill, backgroundColor: colors.surface },
  retryText: { color: colors.ink, fontSize: 12, fontWeight: '800' },
});