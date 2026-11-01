import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import BrandHeader from '../../components/BrandHeader';
import FieldInput from '../../components/FieldInput';
import FieldLabel from '../../components/FieldLabel';
import PillButton from '../../components/PillButton';
import { spacing } from '../../constants/theme';
import { supabase } from '../../services/supabaseClient';
import { useAppPreferences, type AppColors } from '../../services/AppPreferencesContext';

interface ScreenProps {
  go: (next: string) => void;
}

export default function ForgotPasswordScreen({ go }: ScreenProps) {
  const { colors } = useAppPreferences();
  const styles = createStyles(colors);
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Step 1: Send the recovery email
  const handleSendCode = async () => {
    if (!email) {
      Alert.alert('Missing Field', 'Please enter your registered email address.');
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim());

      if (error) {
        Alert.alert('Error', error.message);
      } else {
        Alert.alert('Check Your Email', 'We sent a 6-digit reset code to your email. (Ignore the link)');
        setStep(2);
      }
    } catch (err) {
      Alert.alert('Error', 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify the 6-digit code and update the password
  const handleVerifyAndUpdate = async () => {
    if (!code || !newPassword) {
      Alert.alert('Missing Fields', 'Please enter both the reset code and your new password.');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Weak Password', 'Password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);
    try {
      // First, verify the OTP code sent to the email
      const { error: verifyError } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token: code.trim(),
        type: 'recovery',
      });

      if (verifyError) {
        Alert.alert('Invalid Code', verifyError.message);
        setIsLoading(false);
        return;
      }

      // If code is valid, update to the new password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        Alert.alert('Error', updateError.message);
      } else {
        Alert.alert('Success', 'Your password has been successfully reset!');
        go('login');
      }
    } catch (err) {
      Alert.alert('Error', 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
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
          <Text style={styles.cardTitle}>RESET PASSWORD</Text>
          
          {step === 1 ? (
            <>
              <Text style={styles.instructions}>
                Enter your email address and we'll send you a 6-digit code to reset your password.
              </Text>

              <FieldLabel>Email</FieldLabel>
              <FieldInput
                placeholder="Enter your email"
                value={email}
                onChangeText={setEmail}
                editable={!isLoading}
                autoCapitalize="none"
              />

              <View style={styles.buttonSpacing} />

              {isLoading ? (
                <ActivityIndicator size="large" color={colors.ink} style={styles.loader} />
              ) : (
                <PillButton title="SEND CODE" onPress={handleSendCode} />
              )}
            </>
          ) : (
            <>
              <Text style={styles.instructions}>
                Enter the 6-digit code sent to your email and choose a new password.
              </Text>

              <FieldLabel>6-Digit Code</FieldLabel>
              <FieldInput
                placeholder="Enter reset code"
                value={code}
                onChangeText={setCode}
                editable={!isLoading}
                keyboardType="number-pad"
              />
              
              <View style={styles.fieldSpacing} />

              <FieldLabel>New Password</FieldLabel>
              <FieldInput
                placeholder="Enter new password"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
                editable={!isLoading}
              />

              <View style={styles.buttonSpacing} />

              {isLoading ? (
                <ActivityIndicator size="large" color={colors.ink} style={styles.loader} />
              ) : (
                <PillButton title="RESET PASSWORD" onPress={handleVerifyAndUpdate} />
              )}
            </>
          )}

          <Pressable
            onPress={() => go('login')}
            style={styles.navigationLinkContainer}
          >
            <Text style={styles.backLink}>← Back to Login</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const createStyles = (colors: AppColors) => StyleSheet.create({
  fillMint: { flex: 1, backgroundColor: colors.background },
  scrollPad: { paddingHorizontal: spacing.lg, paddingTop: 50, paddingBottom: spacing.xl },
  headerContainer: { paddingLeft: spacing.xs, marginBottom: 20 },
  card: { 
    backgroundColor: colors.surface, 
    borderRadius: 24, 
    paddingHorizontal: 20,
    paddingVertical: 24,
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  cardTitle: { fontSize: 18, fontWeight: '900', letterSpacing: 0.8, color: colors.ink, marginBottom: 10, textAlign: 'center' },
  instructions: { fontSize: 14, color: colors.textMuted, textAlign: 'center', marginBottom: 20, lineHeight: 20 },
  fieldSpacing: { height: 16 },
  buttonSpacing: { height: 24 },
  loader: { marginVertical: 10 },
  navigationLinkContainer: { marginTop: 24, alignItems: 'center' },
  backLink: { fontSize: 14, color: colors.textMuted, fontWeight: '600' },
});