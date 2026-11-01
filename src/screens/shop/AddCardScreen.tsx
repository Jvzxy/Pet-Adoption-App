import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { spacing } from '../../constants/theme';
import { useAppPreferences, type AppColors } from '../../services/AppPreferencesContext';
import AngleLeftIcon from '../../images/Icons/angle-left-solid-full.svg';

interface ScreenProps {
  go: (next: string) => void;
}

export default function AddCardScreen({ go }: ScreenProps) {
  const { colors } = useAppPreferences();
  const styles = createStyles(colors);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => go('payment')} hitSlop={10}>
          <AngleLeftIcon width={24} height={24} fill={colors.ink} />
        </Pressable>
        <Text style={styles.title}>Set up secure PayMongo checkout</Text>
        <View style={{ width: 24 }} />
      </View>
      <Text style={styles.message}>
        PayMongo is not enabled for this app yet. Create and verify a PayMongo account, then configure its secret key and webhook in Supabase. Once enabled, card, GCash, and Maya details are entered on PayMongo’s hosted checkout page—not stored by this app.
      </Text>
      <Pressable style={styles.button} onPress={() => go('payment')}>
        <Text style={styles.buttonText}>Return to checkout</Text>
      </Pressable>
    </View>
  );
}

const createStyles = (colors: AppColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, paddingTop: 52, paddingHorizontal: spacing.lg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { color: colors.ink, fontSize: 16, fontWeight: '900' },
  message: { color: colors.textMuted, fontSize: 14, lineHeight: 21, marginTop: 32 },
  button: { marginTop: 24, backgroundColor: colors.ink, borderRadius: 24, padding: 14, alignItems: 'center' },
  buttonText: { color: colors.white, fontWeight: '800' },
});
