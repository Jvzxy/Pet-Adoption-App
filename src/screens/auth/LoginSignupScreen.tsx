import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import BrandHeader from '../../components/BrandHeader';
import PillButton from '../../components/PillButton';
import { colors, spacing } from '../../constants/theme';

import catTabby from '../../images/Cats/Cat2.png';

interface ScreenProps {
  go: (next: string) => void;
}

export default function LoginSignupScreen({ go }: ScreenProps) {
  return (
    <View style={styles.fillMint}>

      {/* Header aligned top left */}
      <View style={styles.pagePadTop}>
        <BrandHeader />
      </View>

      {/* Cat image kept exactly as is */}
      <View style={styles.catImageWrapper}>
        <Image 
          source={catTabby} 
          style={styles.heroCatPhoto} 
          resizeMode="contain" 
        />
      </View>

      {/* Buttons horizontally centered */}
      <View style={styles.buttonContainer}>
        <PillButton 
          title="LOGIN" 
          variant="dark" 
          onPress={() => go('login')} 
          style={styles.buttonSpacing} 
        />
        <PillButton 
          title="SIGNUP" 
          variant="dark" 
          onPress={() => go('signup')} 
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fillMint: { 
    flex: 1, 
    backgroundColor: colors.mint,
    position: 'relative',
  },
  pagePadTop: { 
    paddingHorizontal: spacing.xl, 
    paddingTop: 50,
    zIndex: 10,
  },
  catImageWrapper: {
    position: 'absolute',
    right: -60,
    bottom: -15,
    width: '130%',
    height: '82%',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    zIndex: 1,
  },
  heroCatPhoto: { 
    width: '100%',
    height: '100%',
  },
  buttonContainer: { 
    position: 'absolute',
    bottom: '15%',       // Keeps the vertical level position
    width: '75%',        // Clean width for centered pill buttons
    alignSelf: 'center', // Centers the buttons horizontally on the screen
    zIndex: 20,
  },
  buttonSpacing: {
    marginBottom: 14,
  },
});