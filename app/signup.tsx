import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import BrandHeader from '../components/BrandHeader';
import FieldInput from '../components/FieldInput';
import FieldLabel from '../components/FieldLabel';
import PillButton from '../components/PillButton';
import { colors, radii, spacing } from '../constants/theme';

export default function SignUpScreen() {
  const router = useRouter();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSignup = () => {
    if (!firstName || !lastName || !phone || !password || !confirmPassword) {
      Alert.alert('Missing Fields', 'Please fill out all fields.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Password Mismatch', 'Passwords do not match.');
      return;
    }
    Alert.alert('Success', 'Account created successfully!', [
      { text: 'OK', onPress: () => router.push('/login') }
    ]);
  };

  return (
    <View style={styles.fillMint}>
      <Text style={styles.screenLabel}>Sign-up</Text>
      <ScrollView contentContainerStyle={styles.scrollPad}>
        <BrandHeader />
        <View style={styles.card}>
          <Text style={styles.cardTitle}>CREATE YOUR ACCOUNT</Text>

          <FieldLabel>First name</FieldLabel>
          <FieldInput placeholder="First name" value={firstName} onChangeText={setFirstName} />

          <FieldLabel>Last name</FieldLabel>
          <FieldInput placeholder="Last name" value={lastName} onChangeText={setLastName} />

          <FieldLabel>Phone Number</FieldLabel>
          <FieldInput placeholder="Phone Number" keyboardType="phone-pad" value={phone} onChangeText={setPhone} />

          <FieldLabel>Password</FieldLabel>
          <FieldInput placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} />

          <FieldLabel>Confirm Password</FieldLabel>
          <FieldInput placeholder="Confirm Password" secureTextEntry value={confirmPassword} onChangeText={setConfirmPassword} />

          <View style={{ marginTop: 24, marginBottom: 12 }}>
            <PillButton title="SIGNUP" onPress={handleSignup} />
          </View>

          <Pressable onPress={() => router.push('/login')} style={styles.navigationLinkContainer}>
            <Text style={styles.switchLink}>Already have an account? Log in</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  fillMint: { flex: 1, backgroundColor: colors.mint },
  screenLabel: { position: 'absolute', top: 40, left: 16, fontSize: 12, color: colors.textMuted, opacity: 0.5, zIndex: 10 },
  scrollPad: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xl },
  card: { backgroundColor: colors.white, borderRadius: radii.lg, padding: spacing.lg, marginTop: spacing.sm },
  cardTitle: { fontSize: 13, fontWeight: '800', letterSpacing: 0.5, color: colors.ink, marginBottom: 16, textAlign: 'center' },
  navigationLinkContainer: { marginTop: 12, alignItems: 'center' },
  switchLink: { fontSize: 12, color: colors.ink, fontWeight: '700', textDecorationLine: 'underline' },
});