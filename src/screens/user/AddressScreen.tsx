import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radii } from '../../constants/theme';
import AngleLeftIcon from '../../images/Icons/angle-left-solid-full.svg';
import LocationIcon from '../../images/Icons/location-dot-solid-full.svg';

interface ScreenProps {
  go: (next: string) => void;
}

export default function AddressScreen({ go }: ScreenProps) {
  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Pressable onPress={() => go('profile')} style={styles.backBtn} hitSlop={10}>
          <AngleLeftIcon width={18} height={18} fill={colors.ink} />
        </Pressable>
        <Text style={styles.headerTitle}>My Address</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.addressCard}>
          <View style={styles.cardHeader}>
            <LocationIcon width={16} height={16} fill={colors.ink} style={{ marginRight: 8 }} />
            <Text style={styles.cardTitle}>Home Address</Text>
            <View style={styles.defaultBadge}>
              <Text style={styles.badgeText}>Default</Text>
            </View>
          </View>
          <Text style={styles.addressName}>Parves Ahamad</Text>
          <Text style={styles.addressText}>
            123 Pawfect Avenue, Block 4{'\n'}
            Cagayan De Oro City{'\n'}
            Northern Mindanao, Philippines 9000
          </Text>
          <Text style={styles.addressPhone}>(+880) 1759263000</Text>
          <Pressable style={styles.editBtn}>
            <Text style={styles.editBtnText}>Edit Address</Text>
          </Pressable>
        </View>

        <Pressable style={styles.addBtn}>
          <Text style={styles.addBtnText}>+ Add New Address</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.mint || '#A8DDD6' },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 60, paddingBottom: 20, paddingHorizontal: 24 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.5)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '900', color: colors.ink || '#000' },
  content: { paddingHorizontal: 24 },
  addressCard: { backgroundColor: colors.white, borderRadius: 24, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 3 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  cardTitle: { fontSize: 14, fontWeight: '900', color: colors.ink, flex: 1 },
  defaultBadge: { backgroundColor: '#E8F5E9', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  badgeText: { color: '#2E7D32', fontSize: 10, fontWeight: '800' },
  addressName: { fontSize: 16, fontWeight: '800', color: colors.ink, marginBottom: 4 },
  addressText: { fontSize: 13, fontWeight: '600', color: 'rgba(0,0,0,0.6)', lineHeight: 20, marginBottom: 8 },
  addressPhone: { fontSize: 13, fontWeight: '700', color: colors.ink, marginBottom: 16 },
  editBtn: { borderWidth: 1, borderColor: colors.ink, borderRadius: radii?.pill || 20, paddingVertical: 10, alignItems: 'center' },
  editBtnText: { color: colors.ink, fontSize: 12, fontWeight: '800' },
  addBtn: { backgroundColor: colors.ink, borderRadius: radii?.pill || 20, paddingVertical: 16, alignItems: 'center', marginTop: 24 },
  addBtnText: { color: colors.white, fontSize: 14, fontWeight: '900' },
});