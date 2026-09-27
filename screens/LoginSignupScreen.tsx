import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import BrandHeader from '../components/BrandHeader';
import PillButton from '../components/PillButton';
import ScreenLabel from '../components/ScreenLabel';
import { colors, spacing } from '../constants/theme';


import catTabby from '../images/cat2.png';

interface ScreenProps {
  go: (next: string) => void;
}

export default function LoginSignupScreen({ go }: ScreenProps) {
  return (
    <View style={styles.fillMint}>
      <ScreenLabel>Login/Signup</ScreenLabel>
      <View style={styles.pagePadTop}>
        <BrandHeader />
      </View>
      
      <Image source={catTabby} style={styles.heroCatPhoto} resizeMode="contain" />
      
      <View style={styles.bottomPad}>
        <PillButton title="LOGIN" onPress={() => go('login')} style={{ marginBottom: 12 }} />
        <PillButton title="SIGNUP" variant="dark" onPress={() => go('signup')} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fillMint: { flex: 1, backgroundColor: colors.mint },
  pagePadTop: { paddingHorizontal: spacing.xl, paddingTop: spacing.xl },
  bottomPad: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xl },
  heroCatPhoto: { flex: 1, width: '100%', alignSelf: 'center', marginTop: -20 },
});