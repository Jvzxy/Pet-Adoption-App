import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { colors, radii } from '../constants/theme';
import AngleLeftIcon from '../images/Icons/angle-left-solid-full.svg';

interface ScreenProps {
  go: (next: string) => void;
}

export default function ChangePasswordScreen({ go }: ScreenProps) {
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');

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

        <Pressable style={styles.saveBtn} onPress={() => go('profile')}>
          <Text style={styles.saveBtnText}>Update Password</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.mint || '#A8DDD6' },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 60, paddingBottom: 20, paddingHorizontal: 24 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.5)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '900', color: colors.ink || '#000' },
  content: { paddingHorizontal: 24, marginTop: 10 },
  formGroup: { backgroundColor: colors.white, borderRadius: 16, paddingHorizontal: 16, paddingVertical: 12, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
  inputLabel: { fontSize: 11, fontWeight: '700', color: 'rgba(0,0,0,0.5)', marginBottom: 4 },
  input: { fontSize: 16, fontWeight: '800', color: colors.ink, padding: 0 },
  saveBtn: { backgroundColor: colors.ink, borderRadius: radii?.pill || 20, paddingVertical: 16, alignItems: 'center', marginTop: 16 },
  saveBtnText: { color: colors.white, fontSize: 14, fontWeight: '900' },
});