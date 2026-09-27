import React, { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import BrandHeader from '../components/BrandHeader';
import FieldInput from '../components/FieldInput';
import FieldLabel from '../components/FieldLabel';
import PillButton from '../components/PillButton';
import ScreenLabel from '../components/ScreenLabel';
import { useAuth } from '../services/AuthContext';
import { colors, radii, spacing } from '../constants/theme';

interface ScreenProps {
  go: (next: string) => void;
}

export default function LoginScreen({ go }: ScreenProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('Missing Fields', 'Please enter both username and password.');
      return;
    }

    setIsLoading(true);

    // Simulate an API call delay
    await new Promise((resolve) => setTimeout(resolve, 600));

    // Validate credentials using AuthContext
    const isSuccess = login(username, password);
    setIsLoading(false);

    if (isSuccess) {
      go('main'); // Redirect to MainScreen on success
    } else {
      Alert.alert('Authentication Failed', 'Invalid username or password. Please try again.');
    }
  };

  return (
    <View style={styles.fillMint}>
      <ScreenLabel>Login</ScreenLabel>
      <ScrollView contentContainerStyle={styles.scrollPad}>
        <BrandHeader />

        <View style={styles.card}>
          <Text style={styles.cardTitle}>LOGIN</Text>

          <FieldLabel>Username</FieldLabel>
          <FieldInput
            placeholder="Username"
            value={username}
            onChangeText={setUsername}
            editable={!isLoading}
          />

          <FieldLabel>Password</FieldLabel>
          <FieldInput
            placeholder="Password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            editable={!isLoading}
          />

          <Pressable style={{ alignSelf: 'flex-end', marginTop: 6, marginBottom: 20 }}>
            <Text style={styles.forgot}>Forgot Password?</Text>
          </Pressable>

          {isLoading ? (
            <ActivityIndicator size="large" color={colors.ink} style={{ marginBottom: 16 }} />
          ) : (
            <PillButton title="LOGIN" onPress={handleLogin} style={{ marginBottom: 16 }} />
          )}

          <Pressable style={({ pressed }) => [styles.googleBtn, pressed && { opacity: 0.85 }]}>
            <Text style={styles.googleG}>G</Text>
            <Text style={styles.googleText}>Continue with Google</Text>
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
  forgot: { fontSize: 11, fontWeight: '700', color: colors.ink },
  googleBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 48, borderRadius: radii.pill, borderWidth: 1, borderColor: '#E0E0E0' },
  googleG: { fontWeight: '800', color: '#4285F4', fontSize: 16, marginRight: 8 },
  googleText: { fontSize: 13, fontWeight: '700', color: colors.ink },
  navigationLinkContainer: { marginTop: 12, alignItems: 'center' },
  backLink: { fontSize: 11, color: colors.textMuted, fontWeight: '600' },
});