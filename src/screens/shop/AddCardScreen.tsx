import React, { useState } from 'react';
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { colors, radii, spacing } from '../../constants/theme';

import AngleLeftIcon from '../../images/Icons/angle-left-solid-full.svg';
import CameraIcon from '../../images/Icons/camera-regular-full.svg';

interface ScreenProps {
  go: (next: string) => void;
}

export default function AddCardScreen({ go }: ScreenProps) {
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [name, setName] = useState('');

  const handleSave = () => {
    // Ensure the user actually types something
    if (cardNumber.length < 15 || expiry.length < 4 || cvv.length < 3 || name.length < 3) {
      Alert.alert('Incomplete Details', 'Please fill in all card details correctly.');
      return;
    }
    
    // Modern success modal before redirecting
    Alert.alert(
      'Card Linked Successfully', 
      `Your card ending in ${cardNumber.slice(-4)} has been saved for future payments.`, 
      [{ text: 'Continue to Checkout', onPress: () => go('payment') }]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => go('payment')} hitSlop={10}>
          <AngleLeftIcon width={24} height={24} fill={colors.ink} />
        </Pressable>
        <Text style={styles.headerTitle}>Add New Card</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollPad} showsVerticalScrollIndicator={false}>
        {/* Dynamic Card Preview Container */}
        <View style={styles.modernCardPreview}>
          <Text style={styles.previewName}>{name || 'YOUR NAME'}</Text>
          <Text style={styles.previewNumber}>
            {cardNumber ? cardNumber.replace(/(.{4})/g, '$1 ').trim() : '•••• •••• •••• ••••'}
          </Text>
          <Text style={styles.previewExpiry}>{expiry || 'MM/YY'}</Text>
        </View>

        <View style={styles.fieldGroup}>
          <View style={styles.labelRow}>
            <Text style={styles.fieldLabel}>Card number</Text>
            <View style={styles.cardIconsContainer}>
                <Image source={require('../../images/img/Visa Icon.jpg')} style={styles.miniCardIcon} />
                <Image source={require('../../images/img/Mastercard Icon.webp')} style={styles.miniCardIcon} />
            </View>
          </View>
          <View style={styles.inputBox}>
            <TextInput
              style={styles.textInput}
              placeholder="0000 0000 0000 0000"
              keyboardType="numeric"
              maxLength={19}
              value={cardNumber}
              onChangeText={setCardNumber}
            />
            <CameraIcon width={20} height={20} fill={colors.textMuted} />
          </View>
        </View>

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
            <Text style={styles.fieldLabel}>Security code (CVV)</Text>
            <View style={styles.inputBox}>
              <TextInput
                style={styles.textInput}
                placeholder="123"
                keyboardType="numeric"
                secureTextEntry
                maxLength={4}
                value={cvv}
                onChangeText={setCvv}
              />
            </View>
          </View>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Cardholder name</Text>
          <View style={styles.inputBox}>
            <TextInput
              style={styles.textInput}
              placeholder="Name exactly as it appears on card"
              value={name}
              onChangeText={setName}
            />
          </View>
        </View>

        <Text style={styles.disclaimerText}>
          We keep your card information secure and encrypted. Your card's security code (CVV) will not be stored. You can remove your card at any time.
        </Text>
      </ScrollView>

      <View style={styles.bottomWrapper}>
        <Pressable style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveBtnText}>Save Card Securely</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.mint },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingTop: 50, paddingBottom: 20 },
  headerTitle: { fontSize: 18, fontWeight: '900', color: colors.ink },
  scrollPad: { paddingHorizontal: spacing.lg, paddingTop: 10 },
  modernCardPreview: { backgroundColor: colors.ink, borderRadius: 16, padding: 20, marginBottom: 24, height: 180, justifyContent: 'flex-end', shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 15, elevation: 10 },
  previewName: { color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: '700', textTransform: 'uppercase', marginBottom: 8 },
  previewNumber: { color: colors.white, fontSize: 18, fontWeight: '900', letterSpacing: 2, marginBottom: 8 },
  previewExpiry: { color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: '700' },
  fieldGroup: { marginBottom: 18 },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  fieldLabel: { fontSize: 12, fontWeight: '800', color: colors.ink, marginBottom: 6 },
  cardIconsContainer: { flexDirection: 'row', gap: 4, alignItems: 'center' },
  miniCardIcon: { width: 24, height: 16, resizeMode: 'contain' },
  inputBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, borderRadius: 12, paddingHorizontal: 16, height: 48, borderWidth: 1, borderColor: '#E0E0E0' },
  textInput: { flex: 1, fontSize: 13, color: colors.ink, fontWeight: '600' },
  splitRow: { flexDirection: 'row', gap: 14 },
  disclaimerText: { fontSize: 11, color: colors.textMuted, lineHeight: 16, marginTop: 10 },
  bottomWrapper: { paddingHorizontal: spacing.lg, paddingBottom: 30 },
  saveBtn: { backgroundColor: colors.ink, height: 50, borderRadius: radii.pill, justifyContent: 'center', alignItems: 'center' },
  saveBtnText: { fontSize: 14, fontWeight: '900', color: colors.white },
});