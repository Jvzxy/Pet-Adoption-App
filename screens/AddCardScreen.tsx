import React, { useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { colors, radii, spacing } from '../constants/theme';

interface ScreenProps {
  go: (next: string) => void;
}

export default function AddCardScreen({ go }: ScreenProps) {
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [name, setName] = useState('');

  const handleSave = () => {
    if (!cardNumber || !expiry || !cvv || !name) {
      Alert.alert('Incomplete Details', 'Please fill in all card details.');
      return;
    }
    Alert.alert('Card Added', 'Your card details have been saved successfully.', [
      { text: 'OK', onPress: () => go('payment') },
    ]);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => go('payment')} hitSlop={10}>
          <Text style={styles.backArrow}>‹</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Add card</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollPad} showsVerticalScrollIndicator={false}>
        {/* Card Number Input */}
        <View style={styles.fieldGroup}>
          <View style={styles.labelRow}>
            <Text style={styles.fieldLabel}>Card number</Text>
            <Text style={styles.cardLogos}>VISA 🟧 🟦 🟩</Text>
          </View>
          <View style={styles.inputBox}>
            <TextInput
              style={styles.textInput}
              placeholder="Enter card number"
              keyboardType="numeric"
              maxLength={19}
              value={cardNumber}
              onChangeText={setCardNumber}
            />
            <Text style={styles.cameraIcon}>📷</Text>
          </View>
        </View>

        {/* Expiration Date & Security Code */}
        <View style={styles.splitRow}>
          <View style={[styles.fieldGroup, { flex: 1 }]}>
            <Text style={styles.fieldLabel}>Expiration date</Text>
            <View style={styles.inputBox}>
              <TextInput
                style={styles.textInput}
                placeholder="MM/YY"
                maxLength={5}
                value={expiry}
                onChangeText={setExpiry}
              />
            </View>
          </View>

          <View style={[styles.fieldGroup, { flex: 1 }]}>
            <Text style={styles.fieldLabel}>Security code</Text>
            <View style={styles.inputBox}>
              <TextInput
                style={styles.textInput}
                placeholder="CVV"
                keyboardType="numeric"
                secureTextEntry
                maxLength={4}
                value={cvv}
                onChangeText={setCvv}
              />
            </View>
          </View>
        </View>

        {/* Cardholder Name */}
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Cardholder name</Text>
          <View style={styles.inputBox}>
            <TextInput
              style={styles.textInput}
              placeholder="Full name"
              value={name}
              onChangeText={setName}
            />
          </View>
        </View>

        {/* Disclaimer Text */}
        <Text style={styles.disclaimerText}>
          We keep your card information secure and encrypted. Your card's security code (CVV) will not be stored. You can remove your card at any time.
        </Text>
      </ScrollView>

      {/* Save Button */}
      <View style={styles.bottomWrapper}>
        <Pressable style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveBtnText}>Save</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.mint },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: 50,
    paddingBottom: 20,
  },
  backArrow: { fontSize: 28, fontWeight: '800', color: colors.ink },
  headerTitle: { fontSize: 18, fontWeight: '900', color: colors.ink },
  scrollPad: { paddingHorizontal: spacing.lg, paddingTop: 10 },
  fieldGroup: { marginBottom: 18 },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  fieldLabel: { fontSize: 12, fontWeight: '800', color: colors.ink, marginBottom: 6 },
  cardLogos: { fontSize: 10 },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  textInput: { flex: 1, fontSize: 13, color: colors.ink },
  cameraIcon: { fontSize: 16 },
  splitRow: { flexDirection: 'row', gap: 14 },
  disclaimerText: { fontSize: 11, color: colors.textMuted, lineHeight: 16, marginTop: 10 },
  bottomWrapper: { paddingHorizontal: spacing.lg, paddingBottom: 30 },
  saveBtn: { backgroundColor: colors.white, height: 50, borderRadius: radii.pill, justifyContent: 'center', alignItems: 'center' },
  saveBtnText: { fontSize: 14, fontWeight: '900', color: colors.ink },
});