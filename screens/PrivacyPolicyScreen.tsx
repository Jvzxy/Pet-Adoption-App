import React from 'react';
import { Pressable, StyleSheet, Text, View, ScrollView } from 'react-native';
import { colors } from '../constants/theme';
import AngleLeftIcon from '../images/Icons/angle-left-solid-full.svg';

interface ScreenProps {
  go: (next: string) => void;
}

export default function PrivacyPolicyScreen({ go }: ScreenProps) {
  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Pressable onPress={() => go('settings')} style={styles.backBtn} hitSlop={10}>
          <AngleLeftIcon width={18} height={18} fill={colors.ink} />
        </Pressable>
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.sheetContainer}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.lastUpdated}>Last Updated: October 30, 2026</Text>
          
          <View style={styles.section}>
            <Text style={styles.heading}>1. Information We Collect</Text>
            <Text style={styles.paragraph}>
              We collect information you provide directly to us, such as when you create or modify your account, request services, contact customer support, or otherwise communicate with us.
            </Text>
          </View>
          
          <View style={styles.section}>
            <Text style={styles.heading}>2. How We Use Information</Text>
            <Text style={styles.paragraph}>
              We may use the information we collect about you to provide, maintain, and improve our services, including facilitating adoptions and enhancing your user experience.
            </Text>
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.mint || '#A8DDD6' },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 60, paddingBottom: 24, paddingHorizontal: 24 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.5)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '900', color: colors.ink || '#000' },
  
  // Minimalist White Sheet Design for Readability
  sheetContainer: { 
    flex: 1, 
    backgroundColor: '#FFFFFF', 
    borderTopLeftRadius: 32, 
    borderTopRightRadius: 32, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: -4 }, 
    shadowOpacity: 0.05, 
    shadowRadius: 10, 
    elevation: 5 
  },
  content: { paddingHorizontal: 28, paddingTop: 32, paddingBottom: 60 },
  lastUpdated: { fontSize: 12, fontWeight: '700', color: 'rgba(0,0,0,0.3)', marginBottom: 28, textTransform: 'uppercase', letterSpacing: 0.5 },
  section: { marginBottom: 28 },
  heading: { fontSize: 16, fontWeight: '900', color: colors.ink, marginBottom: 10 },
  paragraph: { fontSize: 14, color: 'rgba(0,0,0,0.6)', lineHeight: 24, fontWeight: '500' },
});