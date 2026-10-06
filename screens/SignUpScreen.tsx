import React, { useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import BrandHeader from '../components/BrandHeader';
import FieldInput from '../components/FieldInput';
import FieldLabel from '../components/FieldLabel';
import PillButton from '../components/PillButton';
import { colors, radii, spacing } from '../constants/theme';
import { useAuth } from '../services/AuthContext';

interface ScreenProps {
  go: (next: string) => void;
}

export default function SignUpScreen({ go }: ScreenProps) {
  const { signup } = useAuth();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSignUp = () => {
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      Alert.alert('Missing Fields', 'Please fill in all fields.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Password Mismatch', 'Passwords do not match.');
      return;
    }

    const fullName = `${firstName.trim()} ${lastName.trim()}`;
    const success = signup(email, password, fullName);

    if (success) {
      // Changed to redirect to 'login' instead of 'home'
      Alert.alert('Success', 'Account created successfully! Please log in.', [
        { text: 'OK', onPress: () => go('login') },
      ]);
    } else {
      Alert.alert('Sign Up Failed', 'An account with this email already exists.');
    }
  };

  return (
    <View style={styles.fillMint}>
      <ScrollView
        contentContainerStyle={styles.scrollPad}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerContainer}>
          <BrandHeader />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>CREATE YOUR ACCOUNT</Text>

          <View style={styles.fieldGroup}>
            <FieldLabel>First name </FieldLabel>
            <FieldInput
              placeholder="First name"
              value={firstName}
              onChangeText={setFirstName}
            />
          </View>

          <View style={styles.fieldGroup}>
            <FieldLabel>Last name </FieldLabel>
            <FieldInput
              placeholder="Last name"
              value={lastName}
              onChangeText={setLastName}
            />
          </View>

          <View style={styles.fieldGroup}>
            <FieldLabel>Email </FieldLabel>
            <FieldInput
              placeholder="Email"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <View style={styles.fieldGroup}>
            <FieldLabel>Password </FieldLabel>
            <FieldInput
              placeholder="Password"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          <View style={styles.fieldGroup}>
            <FieldLabel>Confirm Password </FieldLabel>
            <FieldInput
              placeholder="Confirm Password"
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
          </View>

          <View style={styles.buttonContainer}>
            <PillButton title="SIGNUP" onPress={handleSignUp} />
          </View>

          <Pressable
            onPress={() => go('login')}
            style={styles.navigationLinkContainer}
          >
            <Text style={styles.switchLink}>Already have an account? Log in</Text>
          </Pressable>

          <Pressable
            onPress={() => go('loginSignup')}
            style={styles.navigationLinkContainer}
          >
            <Text style={styles.backLink}>← Back to Welcome Screen</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  fillMint: {
    flex: 1,
    backgroundColor: colors.mint,
  },
  scrollPad: {
    paddingHorizontal: spacing.lg,
    paddingTop: 50,
    paddingBottom: spacing.xl,
  },
  headerContainer: {
    paddingLeft: spacing.xs,
    marginBottom: 16,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 24,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0.5,
    color: colors.ink,
    marginBottom: 18,
    textAlign: 'center',
  },
  fieldGroup: {
    marginBottom: 12,
  },
  buttonContainer: {
    marginTop: 16,
    marginBottom: 14,
  },
  navigationLinkContainer: {
    marginTop: 10,
    alignItems: 'center',
  },
  switchLink: {
    fontSize: 12,
    color: colors.ink,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  backLink: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '600',
  },
});