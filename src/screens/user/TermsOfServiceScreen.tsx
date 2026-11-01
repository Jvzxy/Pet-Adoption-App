import React from 'react';
import { Pressable, StyleSheet, Text, View, ScrollView } from 'react-native';
import { useAppPreferences, type AppColors } from '../../services/AppPreferencesContext';
import AngleLeftIcon from '../../images/Icons/angle-left-solid-full.svg';

interface ScreenProps {
  go: (next: string) => void;
}

export default function TermsOfServiceScreen({ go }: ScreenProps) {
  const { colors } = useAppPreferences();
  const styles = createStyles(colors);

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Pressable onPress={() => go('settings')} style={styles.backBtn} hitSlop={10}>
          <AngleLeftIcon width={18} height={18} fill={colors.ink} />
        </Pressable>
        <Text style={styles.headerTitle}>Terms of Service</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.sheetContainer}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.lastUpdated}>Last Updated: October 30, 2026</Text>
          
          <View style={styles.section}>
            <Text style={styles.heading}>1. Acceptance of Terms</Text>
            <Text style={styles.paragraph}>
              By accessing or using our application, you agree to be bound by these Terms of Service and all applicable laws and regulations.
            </Text>
          </View>
          
          <View style={styles.section}>
            <Text style={styles.heading}>2. User Conduct</Text>
            <Text style={styles.paragraph}>
              You agree not to use the app in any way that causes, or may cause, damage to the app or impairment of the availability or accessibility of the service.
            </Text>
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const createStyles = (colors: AppColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 60, paddingBottom: 24, paddingHorizontal: 24 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.5)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '900', color: colors.ink || '#000' },
  
  // Minimalist White Sheet Design for Readability
  sheetContainer: { 
    flex: 1, 
    backgroundColor: colors.surface,
    borderTopLeftRadius: 32, 
    borderTopRightRadius: 32, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: -4 }, 
    shadowOpacity: 0.05, 
    shadowRadius: 10, 
    elevation: 5 
  },
  content: { paddingHorizontal: 28, paddingTop: 32, paddingBottom: 60 },
  lastUpdated: { fontSize: 12, fontWeight: '700', color: colors.textMuted, marginBottom: 28, textTransform: 'uppercase', letterSpacing: 0.5 },
  section: { marginBottom: 28 },
  heading: { fontSize: 16, fontWeight: '900', color: colors.ink, marginBottom: 10 },
  paragraph: { fontSize: 14, color: colors.textMuted, lineHeight: 24, fontWeight: '500' },
});