
import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import {
  useAppPreferences,
  type AppColors,
} from '../services/AppPreferencesContext';

import appLogo from '../images/Logo.png';

export default function BrandHeader() {
  const { colors } = useAppPreferences();
  const styles = createStyles(colors);

  return (
    <View style={styles.container}>
      <Text style={styles.subText}>CAT SHOP</Text>

      <View style={styles.titleContainer}>
        <Text style={styles.mainTitle}>PAWFECT</Text>

        <View style={styles.bottomRow}>
          <Text style={styles.mainTitle}>CATS</Text>

          <Image
            source={appLogo}
            style={styles.logo}
            resizeMode="contain"
            accessibilityLabel="Pawfect Cats logo"
          />
        </View>
      </View>

      <View style={styles.locationContainer}>
        <View style={styles.divider} />
        <Text style={styles.locationText}>CAGAYAN DE ORO CITY</Text>
      </View>
    </View>
  );
}

const createStyles = (colors: AppColors) =>
  StyleSheet.create({
    container: {
      alignItems: 'flex-start',
    },
    subText: {
      fontSize: 11,
      fontWeight: '800',
      letterSpacing: 3,
      color: colors.ink,
      marginBottom: 5,
    },
    titleContainer: {
      alignItems: 'flex-start',
    },
    mainTitle: {
      fontSize: 40,
      fontWeight: '900',
      letterSpacing: -1.5,
      color: colors.ink,
      lineHeight: 42,
    },
    bottomRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: -2,
    },
    logo: {
      width: 36,
      height: 36,
      marginLeft: 8,
    },
    locationContainer: {
      marginTop: 10,
      flexDirection: 'row',
      alignItems: 'center',
    },
    divider: {
      width: 22,
      height: 2,
      backgroundColor: colors.ink,
      marginRight: 8,
    },
    locationText: {
      fontSize: 9,
      fontWeight: '700',
      letterSpacing: 1.8,
      color: colors.textMuted,
    },
  });
