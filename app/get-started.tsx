import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import BrandHeader from '../components/BrandHeader';
import ImageHolder from '../components/ImageHolder';
import PillButton from '../components/PillButton';
import { colors, spacing } from '../constants/theme';

export default function GetStartedScreen() {
  const router = useRouter();

  return (
    <View style={styles.fillMint}>
      <Text style={styles.screenLabel}>Get Start Page</Text>
      <View style={styles.pagePadTop}>
        <BrandHeader />
      </View>
      
      <ImageHolder
        uri="https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=900&q=80"
        containerStyle={styles.heroCatPhoto}
      />

      <View style={styles.bottomPad}>
        <PillButton title="GET START" onPress={() => router.push('/login-signup')} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fillMint: { flex: 1, backgroundColor: colors.mint },
  screenLabel: { position: 'absolute', top: 40, left: 16, fontSize: 12, color: colors.textMuted, opacity: 0.5, zIndex: 10 },
  pagePadTop: { paddingHorizontal: spacing.xl, paddingTop: spacing.xl },
  bottomPad: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xl },
  heroCatPhoto: { flex: 1, width: '100%', alignSelf: 'center', backgroundColor: 'transparent' },
});