import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { colors } from '../constants/theme';

// Import your official black logo from the images folder
import appLogo from '../images/Logo.png';

export default function BrandHeader() {
  return (
    <View style={styles.container}>
      <Text style={styles.subText}>CAT SHOP</Text>
      <Text style={styles.mainTitle}>PAWFECT</Text>
      
      {/* Row for CATS text and the Logo side-by-side */}
      <View style={styles.row}>
        <Text style={styles.mainTitle}>CATS </Text>
        <Image 
          source={appLogo} 
          style={styles.logo} 
          resizeMode="contain" 
        />
      </View>
      
      <Text style={styles.subText}>CAGAYAN DE ORO CITY</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'flex-start',
  },
  subText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
    color: colors.ink,
    marginTop: 4,
    marginBottom: 2,
  },
  mainTitle: {
    fontSize: 38,
    fontWeight: '900',
    color: colors.ink,
    lineHeight: 40,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 38,
    height: 38,
    marginLeft: 6,
    marginBottom: 4, // Adjusts the paw to sit perfectly inline with the text
  },
});