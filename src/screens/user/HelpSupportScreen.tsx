import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, radii } from '../../constants/theme';
import AngleLeftIcon from '../../images/Icons/angle-left-solid-full.svg';
import CommentIcon from '../../images/Icons/comment-solid-full.svg';

interface ScreenProps {
  go: (next: string) => void;
}

const FAQS = [
  { q: "How do I adopt a cat?", a: "Navigate to the home screen, select your favorite cat, and click 'Adopt Now' to start the application process." },
  { q: "What are the adoption fees?", a: "Fees vary by breed and age, covering vaccinations and microchipping. Exact fees are shown on the cat's profile." },
  { q: "Can I return a cat?", a: "We have a 30-day grace period to ensure the safety and happiness of both you and the pet. Please contact support." },
];

export default function HelpSupportScreen({ go }: ScreenProps) {
  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Pressable onPress={() => go('profile')} style={styles.backBtn} hitSlop={10}>
          <AngleLeftIcon width={18} height={18} fill={colors.ink} />
        </Pressable>
        <Text style={styles.headerTitle}>Help & Support</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Pressable style={styles.contactCard} onPress={() => go('chat')}>
          <View style={styles.iconCircle}>
            <CommentIcon width={24} height={24} fill={colors.white} />
          </View>
          <View style={styles.contactTextWrapper}>
            <Text style={styles.contactTitle}>Live Chat Support</Text>
            <Text style={styles.contactSub}>Usually responds in 5 minutes</Text>
          </View>
        </Pressable>

        <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
        
        {FAQS.map((faq, index) => (
          <View key={index} style={styles.faqCard}>
            <Text style={styles.faqQ}>{faq.q}</Text>
            <Text style={styles.faqA}>{faq.a}</Text>
          </View>
        ))}
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
  contactCard: { flexDirection: 'row', backgroundColor: colors.ink, borderRadius: 24, padding: 20, alignItems: 'center', marginBottom: 32 },
  iconCircle: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  contactTextWrapper: { flex: 1 },
  contactTitle: { fontSize: 16, fontWeight: '900', color: colors.white, marginBottom: 4 },
  contactSub: { fontSize: 12, fontWeight: '600', color: 'rgba(255,255,255,0.7)' },
  sectionTitle: { fontSize: 16, fontWeight: '900', color: colors.ink, marginBottom: 16, marginLeft: 4 },
  faqCard: { backgroundColor: colors.white, borderRadius: 16, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
  faqQ: { fontSize: 14, fontWeight: '800', color: colors.ink, marginBottom: 8 },
  faqA: { fontSize: 13, fontWeight: '600', color: 'rgba(0,0,0,0.6)', lineHeight: 20 },
});