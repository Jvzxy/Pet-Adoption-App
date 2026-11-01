import React, { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { radii, spacing } from '../../constants/theme';
import { useAppPreferences, type AppColors } from '../../services/AppPreferencesContext';
import { supabase } from '../../services/supabaseClient';
import AngleLeftIcon from '../../images/Icons/angle-left-solid-full.svg';

interface Application {
  id: string;
  catalog_item_id: string;
  full_name: string;
  phone: string;
  email: string;
  address: string;
  fulfillment: 'delivery' | 'pickup';
  notes: string;
  created_at: string;
  petName: string;
  breed: string;
}

interface ScreenProps {
  go: (next: string) => void;
}

export default function AdminAdoptionsScreen({ go }: ScreenProps) {
  const { colors } = useAppPreferences();
  const styles = createStyles(colors);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadApplications = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    const { data, error } = await supabase
      .from('adoption_applications')
      .select('id, catalog_item_id, full_name, phone, email, address, fulfillment, notes, created_at')
      .eq('status', 'Pending')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Could not load adoption applications:', error.message);
      setLoadError(error.message);
      setLoading(false);
      return;
    }

    const petIds = [...new Set((data ?? []).map((item) => item.catalog_item_id))];
    const { data: pets, error: petsError } = petIds.length
      ? await supabase.from('catalog_items').select('id, name, breed').in('id', petIds)
      : { data: [], error: null };

    if (petsError) {
      console.error('Could not load pets for adoption applications:', petsError.message);
      setLoadError(petsError.message);
      setLoading(false);
      return;
    }

    const petById = new Map((pets ?? []).map((pet) => [pet.id, pet]));
    setApplications((data ?? []).map((item) => {
      const pet = petById.get(item.catalog_item_id);
      return {
        ...item,
        fulfillment: item.fulfillment as Application['fulfillment'],
        petName: pet?.name ?? 'Unavailable pet',
        breed: pet?.breed ?? '',
      };
    }));
    setLoading(false);
  }, []);

  useEffect(() => {
    void loadApplications();
  }, [loadApplications]);

  const review = async (item: Application, status: 'Approved' | 'Rejected') => {
    setBusyId(item.id);
    const { error } = await supabase.rpc('review_adoption_application', {
      p_application_id: item.id,
      p_status: status,
    });
    setBusyId(null);
    if (error) {
      console.error('Could not review adoption application:', error.message);
      Alert.alert('Review failed', error.message);
      return;
    }
    setApplications((previous) => previous.filter((application) => application.id !== item.id));
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => go('profile')} hitSlop={10}>
          <AngleLeftIcon width={20} height={20} fill={colors.ink} />
        </Pressable>
        <Text style={styles.headerTitle}>Adoption Applications</Text>
        <Pressable onPress={() => void loadApplications()}>
          <Text style={styles.refresh}>Refresh</Text>
        </Pressable>
      </View>

      {loading ? (
        <Text style={styles.message}>Loading applications...</Text>
      ) : loadError ? (
        <Text style={styles.error}>{loadError}</Text>
      ) : applications.length === 0 ? (
        <Text style={styles.message}>There are no pending adoption applications.</Text>
      ) : (
        <FlatList
          data={applications}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.petName}>{item.petName}{item.breed ? ` · ${item.breed}` : ''}</Text>
              <Text style={styles.applicant}>{item.full_name}</Text>
              <Text style={styles.detail}>{item.email} · {item.phone}</Text>
              <Text style={styles.detail}>{item.fulfillment === 'delivery' ? 'Delivery' : 'Pickup'} · {item.address}</Text>
              {item.notes ? <Text style={styles.notes}>Notes: {item.notes}</Text> : null}
              <Text style={styles.date}>{new Date(item.created_at).toLocaleString()}</Text>
              <View style={styles.actions}>
                <Pressable
                  style={[styles.actionButton, styles.reject]}
                  disabled={busyId === item.id}
                  onPress={() => void review(item, 'Rejected')}
                >
                  <Text style={styles.actionText}>{busyId === item.id ? 'Saving...' : 'Reject'}</Text>
                </Pressable>
                <Pressable
                  style={[styles.actionButton, styles.approve]}
                  disabled={busyId === item.id}
                  onPress={() => void review(item, 'Approved')}
                >
                  <Text style={styles.actionText}>{busyId === item.id ? 'Saving...' : 'Approve'}</Text>
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
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.lg, paddingBottom: 18 },
  headerTitle: { color: colors.ink, fontSize: 17, fontWeight: '900' },
  refresh: { color: colors.ink, fontSize: 12, fontWeight: '700' },
  list: { paddingHorizontal: spacing.lg, paddingBottom: 32, gap: 12 },
  card: { backgroundColor: colors.surface, borderRadius: radii.md, padding: 16 },
  petName: { color: colors.ink, fontSize: 16, fontWeight: '900', marginBottom: 8 },
  applicant: { color: colors.ink, fontSize: 14, fontWeight: '800' },
  detail: { color: colors.textMuted, fontSize: 12, marginTop: 5, lineHeight: 18 },
  notes: { color: colors.ink, fontSize: 12, marginTop: 8 },
  date: { color: colors.textMuted, fontSize: 10, marginTop: 10 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 14 },
  actionButton: { paddingHorizontal: 18, paddingVertical: 10, borderRadius: radii.pill },
  reject: { backgroundColor: colors.isDark ? '#6A3838' : '#F6D6D6' },
  approve: { backgroundColor: colors.isDark ? '#35635E' : '#B2DFDB' },
  actionText: { color: colors.ink, fontSize: 12, fontWeight: '800' },
  message: { color: colors.textMuted, textAlign: 'center', marginTop: 30, paddingHorizontal: 24 },
  error: { color: colors.red, textAlign: 'center', marginTop: 30, paddingHorizontal: 24 },
});
