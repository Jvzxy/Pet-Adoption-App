import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View, LayoutAnimation, Platform, UIManager } from 'react-native';
import { useAppPreferences, type AppColors } from '../../services/AppPreferencesContext';
import AngleLeftIcon from '../../images/Icons/angle-left-solid-full.svg';
import AngleRightIcon from '../../images/Icons/angle-right-solid-full (1).svg';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface ScreenProps {
  go: (next: string) => void;
  returnTo?: string;
}

const APP_NAME = 'Forever Home Pet Adoption';
const SUPPORT_EMAIL = 'privacy@foreverhomeapp.com';

const POLICIES = [
  {
    title: 'Privacy Policy',
    body: `1. Information We Collect\nWe collect account details, adoption application data (including housing and lifestyle information), and communications between you and partner shelters. We may also collect approximate location data to show nearby pets if you grant permission.\n\n2. How We Use Your Information\nYour data is used strictly to facilitate pet adoptions, process adoption fees, and coordinate with verified animal rescues. We do not sell your personal data.\n\n3. Data Sharing\nWhen you apply to adopt, your application details are securely shared only with the specific shelter or rescue evaluating your application.`,
  },
  {
    title: 'Terms of Service',
    body: `1. Acceptance of Terms\nBy using ${APP_NAME}, you agree to these terms. You must be at least 18 years old to submit an adoption application.\n\n2. Adoption Decisions\n${APP_NAME} provides a platform for shelters to list pets. We do not make adoption decisions. The respective shelter retains full discretion over application approvals, home checks, and final placements.\n\n3. User Conduct\nYou agree to provide accurate information on all adoption applications. Falsifying housing or pet history may result in a permanent ban from the platform.`,
  },
  {
    title: 'Cookie Policy',
    body: `1. App Technologies\nAs a native mobile application, we do not use traditional web cookies. However, we use essential SDKs (like Supabase for authentication) that store secure tokens locally on your device to keep you logged in.\n\n2. Third-Party Analytics\nWe use anonymized crash reporting to improve app stability. You can opt out of non-essential usage data tracking in the Privacy Choices menu.`,
  },
  {
    title: 'Refund Policy',
    body: `1. Adoption Fees\nAdoption fees are set and collected directly on behalf of the partner rescue. Because these fees often cover prior medical care and vaccinations, they are generally non-refundable once an adoption is finalized, subject to the specific shelter's individual return policy.\n\n2. Platform Donations\nAny optional donations made directly to ${APP_NAME} to support our platform development are non-refundable.`,
  },
];

export default function LegalScreen({ go, returnTo = 'settings' }: ScreenProps) {
  const { colors } = useAppPreferences();
  const styles = createStyles(colors);
  const [expandedPolicy, setExpandedPolicy] = useState<string | null>(null);

  const togglePolicy = (title: string) => {
    LayoutAnimation.configureNext(
      LayoutAnimation.create(200, LayoutAnimation.Types.easeInEaseOut, LayoutAnimation.Properties.opacity)
    );
    setExpandedPolicy(expandedPolicy === title ? null : title);
  };

  const handleDataDeletion = () => {
    Alert.alert(
      'Request Data Deletion',
      `Are you sure you want to request the deletion of your account and all associated adoption data? \n\nThis will send a formal request to ${SUPPORT_EMAIL} and cannot be undone once processed.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Request Deletion', 
          style: 'destructive',
          onPress: () => {
            Alert.alert('Request Submitted', 'Our privacy team will process your deletion request within 30 days.');
          }
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Pressable
          onPress={() => go(returnTo)}
          style={({ pressed }) => [styles.backBtn, pressed && styles.backBtnPressed]}
          hitSlop={15}
          accessibilityRole="button"
          accessibilityLabel="Go back to previous screen"
        >
          <AngleLeftIcon width={20} height={20} fill={colors.ink} />
        </Pressable>
        <Text style={styles.headerTitle}>Legal & Compliance</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.sheetContainer}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          
          <Text style={styles.sectionHeader}>Agreements & Policies</Text>
          <View style={styles.cardGroup}>
            {POLICIES.map((policy, index) => {
              const isExpanded = expandedPolicy === policy.title;
              return (
                <View key={policy.title}>
                  <Pressable 
                    style={[
                      styles.menuItem, 
                      index === POLICIES.length - 1 && styles.lastMenuItem,
                      isExpanded && styles.menuItemExpanded
                    ]} 
                    onPress={() => togglePolicy(policy.title)}
                    accessibilityRole="button"
                    accessibilityState={{ expanded: isExpanded }}
                  >
                    <Text style={[styles.menuLabel, isExpanded && styles.menuLabelActive]}>
                      {policy.title}
                    </Text>
                    <View style={[styles.iconContainer, { transform: [{ rotate: isExpanded ? '90deg' : '0deg' }] }]}>
                      <AngleRightIcon width={14} height={14} fill={isExpanded ? colors.ink : colors.textMuted} />
                    </View>
                  </Pressable>
                  {isExpanded && (
                    <View style={styles.policyBodyContainer}>
                      <Text style={styles.policyText}>{policy.body}</Text>
                    </View>
                  )}
                </View>
              );
            })}
          </View>

          <Text style={styles.sectionHeader}>Business Details</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Entity Name</Text>
              <Text style={styles.infoValue}>{APP_NAME} LLC</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Privacy Contact</Text>
              <Text style={styles.infoValue}>{SUPPORT_EMAIL}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Address</Text>
              <Text style={styles.infoValue}>123 Rescue Way, Suite 100{'\n'}Pet City, PC 90210</Text>
            </View>
          </View>

          <Text style={styles.sectionHeader}>Data Rights & Privacy</Text>
          <View style={styles.dangerCard}>
            <Text style={styles.dangerTitle}>Account Deletion</Text>
            <Text style={styles.dangerNotice}>
              Under the GDPR and CCPA, you have the right to request the permanent deletion of your personal data and adoption history.
            </Text>
            <Pressable
              style={({ pressed }) => [styles.dangerButton, pressed && styles.dangerButtonPressed]}
              onPress={handleDataDeletion}
              accessibilityRole="button"
              accessibilityLabel="Request account and data deletion"
            >
              <Text style={styles.dangerButtonText}>Request Data Deletion</Text>
            </Pressable>
          </View>

        </ScrollView>
      </View>
    </View>
  );
}

const createStyles = (colors: AppColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 60, paddingBottom: 20, paddingHorizontal: 24 },
  backBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  backBtnPressed: { opacity: 0.7, transform: [{ scale: 0.96 }] },
  headerTitle: { fontSize: 18, fontWeight: '800', color: colors.ink, letterSpacing: -0.5 },
  headerSpacer: { width: 44 },
  
  sheetContainer: { flex: 1, backgroundColor: colors.surface, borderTopLeftRadius: 32, borderTopRightRadius: 32, shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.04, shadowRadius: 12, elevation: 10 },
  content: { paddingHorizontal: 24, paddingTop: 28, paddingBottom: 80 },
  sectionHeader: { fontSize: 13, fontWeight: '800', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 12, marginTop: 32, marginLeft: 4 },
  
  cardGroup: { backgroundColor: colors.background, borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: colors.border },
  menuItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 18, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: colors.border, backgroundColor: colors.background },
  menuItemExpanded: { backgroundColor: colors.surface },
  lastMenuItem: { borderBottomWidth: 0 },
  menuLabel: { fontSize: 15, fontWeight: '600', color: colors.ink },
  menuLabelActive: { fontWeight: '800' },
  iconContainer: { width: 24, height: 24, alignItems: 'center', justifyContent: 'center' },
  policyBodyContainer: { paddingHorizontal: 20, paddingBottom: 20, paddingTop: 4, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border },
  policyText: { fontSize: 14, color: colors.textMuted, lineHeight: 22, fontWeight: '400' },

  infoCard: { backgroundColor: colors.background, borderRadius: 20, padding: 20, borderWidth: 1, borderColor: colors.border },
  infoRow: { flexDirection: 'column', marginVertical: 4 },
  infoLabel: { fontSize: 12, fontWeight: '700', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  infoValue: { fontSize: 15, color: colors.ink, fontWeight: '500', lineHeight: 22 },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: 12 },

  dangerCard: { backgroundColor: colors.background, borderRadius: 20, padding: 20, borderWidth: 1, borderColor: 'rgba(255, 59, 48, 0.2)' },
  dangerTitle: { fontSize: 16, fontWeight: '800', color: colors.red || '#FF3B30', marginBottom: 8 },
  dangerNotice: { fontSize: 14, color: colors.textMuted, lineHeight: 22, marginBottom: 20 },
  dangerButton: { paddingVertical: 16, borderRadius: 14, backgroundColor: 'rgba(255, 59, 48, 0.1)', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255, 59, 48, 0.3)' },
  dangerButtonPressed: { backgroundColor: 'rgba(255, 59, 48, 0.2)' },
  dangerButtonText: { color: colors.red || '#FF3B30', fontSize: 15, fontWeight: '800' },
});