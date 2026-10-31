import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
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
import { colors, radii, spacing } from '../../constants/theme';
import googleIcon from '../../images/Google icon.png';
import { useAuth } from '../../services/AuthContext';

interface ScreenProps {
  go: (next: string) => void;
}

export default function LoginScreen({ go }: ScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Missing Fields', 'Please enter both email and password.');
      return;
    }

    setIsLoading(true);

    // Simulate an API call delay
    await new Promise((resolve) => setTimeout(resolve, 600));

    // Validate credentials using AuthContext
    const isSuccess = login(email, password);
    setIsLoading(false);

    if (isSuccess) {
      go('main'); // Redirect to MainScreen on success
    } else {
      Alert.alert(
        'Authentication Failed',
        'Invalid email or password. Please try again.'
      );
    }
  };

  return (
    <View style={styles.fillMint}>

      <ScrollView 
        contentContainerStyle={styles.scrollPad}
        showsVerticalScrollIndicator={false}
      >
        {/* Brand Header with top padding to prevent top overlap */}
        <View style={styles.headerContainer}>
          <BrandHeader />
        </View>

        {/* Floating White Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>LOGIN</Text>

          <FieldLabel>Email</FieldLabel>
          <FieldInput
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            editable={!isLoading}
          />

          <View style={styles.fieldSpacing} />

          <FieldLabel>Password</FieldLabel>
          <FieldInput
            placeholder="Password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            editable={!isLoading}
          />

          <Pressable style={styles.forgotBtn}>
            <Text style={styles.forgot}>Forgot Password?</Text>
          </Pressable>

          {isLoading ? (
            <ActivityIndicator
              size="large"
              color={colors.ink}
              style={styles.loader}
            />
          ) : (
            <PillButton
              title="LOGIN"
              onPress={handleLogin}
              style={styles.loginBtn}
            />
          )}

          <Pressable
            style={({ pressed }) => [
              styles.googleBtn,
              pressed && { opacity: 0.85 },
            ]}
          >
            <Image
              source={googleIcon}
              style={styles.googleIcon}
              resizeMode="contain"
            />
            <Text style={styles.googleText}>Continue with Google</Text>
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
    backgroundColor: colors.mint 
  },
  scrollPad: { 
    paddingHorizontal: spacing.lg, 
    paddingTop: 50,
    paddingBottom: spacing.xl 
  },
  headerContainer: {
    paddingLeft: spacing.xs,
    marginBottom: 20,
  },
  card: { 
    backgroundColor: colors.white, 
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
  cardTitle: { 
    fontSize: 18, 
    fontWeight: '900', 
    letterSpacing: 0.8, 
    color: colors.ink, 
    marginBottom: 20, 
    textAlign: 'center' 
  },
  fieldSpacing: {
    height: 10,
  },
  forgotBtn: {
    alignSelf: 'flex-end', 
    marginTop: 6, 
    marginBottom: 24 
  },
  forgot: { 
    fontSize: 12, 
    fontWeight: '800', 
    color: colors.ink 
  },
  loader: {
    marginBottom: 16,
  },
  loginBtn: {
    marginBottom: 14,
  },
  googleBtn: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    height: 48, 
    borderRadius: radii.pill, 
    borderWidth: 1.5, 
    borderColor: '#000000',
    backgroundColor: colors.white,
  },
  googleIcon: {
    width: 30,
    height: 30,
    marginRight: 10,
  },
  googleText: { 
    fontSize: 14, 
    fontWeight: '800', 
    color: colors.ink 
  },
  navigationLinkContainer: { 
    marginTop: 18, 
    alignItems: 'center' 
  },
  backLink: { 
    fontSize: 12, 
    color: colors.textMuted, 
    fontWeight: '600' 
  },
});