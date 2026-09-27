import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import BrandHeader from '../components/BrandHeader';
import FieldInput from '../components/FieldInput';
import FieldLabel from '../components/FieldLabel';
import PillButton from '../components/PillButton';
import ScreenLabel from '../components/ScreenLabel';
import { colors, radii, spacing } from '../constants/theme';

interface ScreenProps {
  go: (next: string) => void;
}

export default function SignUpScreen({ go }: ScreenProps) {
  return (
    <View style={styles.fillMint}>
      <ScreenLabel>Sign-up</ScreenLabel>
      <ScrollView contentContainerStyle={styles.scrollPad}>
        <BrandHeader />
        <View style={styles.card}>
          <Text style={styles.cardTitle}>CREATE YOUR ACCOUNT</Text>

          <FieldLabel>First name</FieldLabel>
          <FieldInput placeholder="First name" />

          <FieldLabel>Last name</FieldLabel>
          <FieldInput placeholder="Last name" />

          <FieldLabel>Phone Number</FieldLabel>
          <FieldInput placeholder="Phone Number" keyboardType="phone-pad" />

          <FieldLabel>Password</FieldLabel>
          <FieldInput placeholder="Password" secureTextEntry />

          <FieldLabel>Confirm Password</FieldLabel>
          <FieldInput placeholder="Confirm Password" secureTextEntry />

          <View style={{ marginTop: 24, marginBottom: 12 }}>
            <PillButton title="SIGNUP" onPress={() => go('login')} />
          </View>

          <Pressable onPress={() => go('login')} style={styles.navigationLinkContainer}>
            <Text style={styles.switchLink}>Already have an account? Log in</Text>
          </Pressable>

          <Pressable onPress={() => go('loginSignup')} style={styles.navigationLinkContainer}>
            <Text style={styles.backLink}>← Back to Welcome Screen</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  fillMint: { flex: 1, backgroundColor: colors.mint },
  scrollPad: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xl },
  card: { backgroundColor: colors.white, borderRadius: radii.lg, padding: spacing.lg, marginTop: spacing.sm },
  cardTitle: { fontSize: 13, fontWeight: '800', letterSpacing: 0.5, color: colors.ink, marginBottom: 16, textAlign: 'center' },
  navigationLinkContainer: { marginTop: 12, alignItems: 'center' },
  switchLink: { fontSize: 12, color: colors.ink, fontWeight: '700', textDecorationLine: 'underline' },
  backLink: { fontSize: 11, color: colors.textMuted, fontWeight: '600' },
});