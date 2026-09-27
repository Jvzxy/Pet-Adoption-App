import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import BrandHeader from '../components/BrandHeader';
import PillButton from '../components/PillButton';
import ScreenLabel from '../components/ScreenLabel';
import { colors, spacing } from '../constants/theme';
import catOrange from '../images/cat1.png';

interface ScreenProps {
  go: (next: string) => void;
}

export default function GetStartedScreen({ go }: ScreenProps) {
  return (
    <View style={styles.fillMint}>
      <ScreenLabel>Get Start Page</ScreenLabel>
      
      <View style={styles.pagePadTop}>
        <BrandHeader />
      </View>
      
      <View style={styles.imageContainer}>
        <Image 
          source={catOrange} 
          style={styles.heroCatPhoto} 
          resizeMode="cover" 
        />
      </View>
      
      <View style={styles.overlayButton}>
        <PillButton title="GET START" onPress={() => go('loginSignup')} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fillMint: { 
    flex: 1, 
    backgroundColor: colors.mint 
  },
  pagePadTop: { 
    paddingHorizontal: spacing.xl, 
    paddingTop: 80, // Increased to push the header further down from the top edge
    zIndex: 2, 
  },
  imageContainer: {
    flex: 1,
    width: '100%',
    justifyContent: 'flex-end',
  },
  heroCatPhoto: { 
    width: '100%', 
    height: '105%', 
    marginTop: -20,
  },
  overlayButton: { 
    position: 'absolute',
    bottom: 160, // Increased heavily to push the button up into the red targeted area
    left: spacing.xl,
    right: spacing.xl,
    paddingHorizontal: 20, // Adds inner padding to make the button slightly narrower
    zIndex: 10,
  },
});