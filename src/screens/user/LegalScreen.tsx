import React from 'react';
import { Pressable, StyleSheet, Text, View, ScrollView } from 'react-native';
import { useAuth } from '../../services/AuthContext';
import { useAppPreferences, type AppColors } from '../../services/AppPreferencesContext';
import AngleLeftIcon from '../../images/Icons/angle-left-solid-full.svg';

interface ScreenProps {
  go: (next: string) => void;
  returnTo?: string;
}

export default function LegalScreen({ go, returnTo = 'settings' }: ScreenProps) {
  // Pull the current user session from AuthContext
  const { user } = useAuth();
  const { colors } = useAppPreferences();
  const styles = createStyles(colors);

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
        
        {/* AGREEMENTS & POLICIES: Always visible (Sign-up & Logged-in) */}
        <Text style={styles.sectionTitle}>AGREEMENTS & POLICIES</Text>
        <View style={styles.card}>
          <Pressable style={styles.menuItem} onPress={() => go('termsOfService')}>
            <Text style={styles.menuLabel}>Terms of Service</Text>
          </Pressable>
          <Pressable style={[styles.menuItem, { borderBottomWidth: 0 }]} onPress={() => go('privacyPolicy')}>
            <Text style={styles.menuLabel}>Privacy Policy</Text>
          </Pressable>
        </View>

        {/* RESTRICTED DETAILS: Only visible after sign-up / login */}
        {user && (
          <>
            <Text style={styles.sectionTitle}>BUSINESS DETAILS</Text>
            <View style={styles.card}>
              <Text style={styles.label}>ENTITY NAME</Text>
              <Text style={styles.value}>Forever Home Pet Adoption LLC</Text>
              <View style={styles.divider} />
              
              <Text style={styles.label}>PRIVACY CONTACT</Text>
              <Text style={styles.value}>privacy@foreverhomeapp.com</Text>
              <View style={styles.divider} />
              
              <Text style={styles.label}>ADDRESS</Text>
              <Text style={styles.value}>123 Rescue Way, Suite 100</Text>
              <Text style={styles.value}>Pet City, PC 90210</Text>
            </View>

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
  card: { backgroundColor: colors.surface, borderRadius: 20, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 3 },
  label: { fontSize: 10, fontWeight: '700', color: colors.textMuted, marginBottom: 4, letterSpacing: 0.5 },
  value: { fontSize: 14, fontWeight: '700', color: colors.ink, marginBottom: 2 },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: 12 },
  menuItem: { paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.border },
  menuLabel: { fontSize: 14, fontWeight: '700', color: colors.ink },
  dangerTitle: { fontSize: 15, fontWeight: '800', color: '#D32F2F', marginBottom: 8 },
  description: { fontSize: 13, color: colors.textMuted, lineHeight: 20, marginBottom: 16, fontWeight: '500' },
  dangerBtn: { backgroundColor: 'rgba(211, 47, 47, 0.1)', paddingVertical: 14, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#D32F2F' },
  dangerBtnText: { color: '#D32F2F', fontSize: 14, fontWeight: '800' }
});