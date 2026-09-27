import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import BrandHeader from '../components/BrandHeader';
import FieldInput from '../components/FieldInput';
import FieldLabel from '../components/FieldLabel';
import PillButton from '../components/PillButton';
import { colors, radii, spacing } from '../constants/theme';
import { useAuth } from '../services/AuthContext';

interface LoginScreenProps {
  go: (screen: string) => void;
}

export default function LoginScreen({ go }: LoginScreenProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth(); // Pull in the login function

  const handleLogin = () => {
    if (!username || !password) {
      Alert.alert('Missing Fields', 'Please enter both username and password.');
      return;
    }

    // Mock authentication check
    if (username === 'admin123' && password === '123456') {
      login(username); // Set global user state
      go('main');      // Navigate to home
    } else {
      Alert.alert('Authentication Failed', 'Invalid username or password.');
    }
  };

  return (
    <View style={styles.fillMint}>
      <ScrollView contentContainerStyle={styles.scrollPad}>
        <BrandHeader />
        <View style={styles.card}>
          <Text style={styles.cardTitle}>LOGIN</Text>

          <FieldLabel>Username</FieldLabel>
          <FieldInput placeholder="Username" value={username} onChangeText={setUsername} />

          <FieldLabel>Password</FieldLabel>
          <FieldInput placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} />

          <PillButton title="LOGIN" onPress={handleLogin} style={{ marginTop: 24, marginBottom: 16 }} />

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
  backLink: { fontSize: 11, color: colors.textMuted, fontWeight: '600' },
});