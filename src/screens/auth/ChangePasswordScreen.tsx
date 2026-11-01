import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { radii } from '../../constants/theme';
import AngleLeftIcon from '../../images/Icons/angle-left-solid-full.svg';
import { useAuth } from '../../services/AuthContext';
import { useAppPreferences, type AppColors } from '../../services/AppPreferencesContext';
import { supabase } from '../../services/supabaseClient';

interface ScreenProps {
  go: (next: string) => void;
}

export default function ChangePasswordScreen({ go }: ScreenProps) {
  const { colors } = useAppPreferences();
  const styles = createStyles(colors);
  const { user } = useAuth();
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleUpdatePassword = async () => {
    if (!currentPass || !newPass || !confirmPass) {
      Alert.alert('Missing Fields', 'Please fill in all password fields.');
      return;
    }

    if (newPass.length < 6) {
      Alert.alert('Weak Password', 'Your new password must be at least 6 characters long.');
      return;
    }

    if (newPass !== confirmPass) {
      Alert.alert('Password Mismatch', 'The new passwords do not match.');
      return;
    }

    if (!user?.username) {
      Alert.alert('Account Error', 'Could not find the email address for this account. Please log in again.');
      return;
    }

    setIsSaving(true);
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.username,
        password: currentPass,
      });

      if (signInError) {
        Alert.alert('Current Password Incorrect', 'Check your current password and try again.');
        return;
      }

      const { error: updateError } = await supabase.auth.updateUser({ password: newPass });
      if (updateError) {
        Alert.alert('Update Failed', updateError.message);
        return;
      }

      setCurrentPass('');
      setNewPass('');
      setConfirmPass('');
      Alert.alert('Password Updated', 'Your Supabase account password has been changed.', [
        { text: 'OK', onPress: () => go('profile') },
      ]);
    } catch (error) {
      console.error('Password Update Error:', error);
      Alert.alert('Update Failed', 'Could not update your password. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Pressable onPress={() => go('profile')} style={styles.backBtn} hitSlop={10}>
          <AngleLeftIcon width={18} height={18} fill={colors.ink} />
        </Pressable>
        <Text style={styles.headerTitle}>Change Password</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.formGroup}>
          <Text style={styles.inputLabel}>Current Password</Text>
          <TextInput
            style={styles.input}
            value={currentPass}
            onChangeText={setCurrentPass}
            secureTextEntry
            placeholder="••••••••"
            placeholderTextColor="rgba(0,0,0,0.2)"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.inputLabel}>New Password</Text>
          <TextInput
            style={styles.input}
            value={newPass}
            onChangeText={setNewPass}
            secureTextEntry
            placeholder="••••••••"
            placeholderTextColor="rgba(0,0,0,0.2)"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.inputLabel}>Confirm New Password</Text>
          <TextInput
            style={styles.input}
            value={confirmPass}
            onChangeText={setConfirmPass}
            secureTextEntry
            placeholder="••••••••"
            placeholderTextColor="rgba(0,0,0,0.2)"
          />
        </View>

        <Pressable style={styles.saveBtn} onPress={handleUpdatePassword} disabled={isSaving}>
          <Text style={styles.saveBtnText}>{isSaving ? 'Updating...' : 'Update Password'}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const createStyles = (colors: AppColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 60, paddingBottom: 20, paddingHorizontal: 24 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.5)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '900', color: colors.ink },
  content: { paddingHorizontal: 24, marginTop: 10 },
  formGroup: { backgroundColor: colors.surface, borderRadius: 16, paddingHorizontal: 16, paddingVertical: 12, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
  inputLabel: { fontSize: 11, fontWeight: '700', color: colors.textMuted, marginBottom: 4 },
  input: { fontSize: 16, fontWeight: '800', color: colors.ink, padding: 0 },
  saveBtn: { backgroundColor: colors.ink, borderRadius: radii?.pill || 20, paddingVertical: 16, alignItems: 'center', marginTop: 16 },
  saveBtnText: { color: colors.white, fontSize: 14, fontWeight: '900' },
});