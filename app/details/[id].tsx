import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import ImageHolder from '../../components/ImageHolder';
import PillButton from '../../components/PillButton';
import { colors, radii, spacing } from '../../constants/theme';
import { CAT_DATA } from '../../data/cats';

export default function DetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  
  const item = CAT_DATA.find((c) => c.id === id);

  if (!item) {
    return (
      <View style={[styles.fillMint, styles.center]}>
        <Text style={styles.errorText}>Item not found (ID: {id})</Text>
        <PillButton title="Back to Home" onPress={() => router.back()} style={{ marginTop: 20, width: 200 }} />
      </View>
    );
  }

  return (
    <View style={styles.fillMint}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Back Button */}
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>← Back</Text>
        </Pressable>

        {/* Main Image Holder */}
        <ImageHolder
          uri={item.imageUri}
          containerStyle={styles.imageHolder}
          borderRadius={radii.lg}
        />

        {/* Dynamic Detail Information */}
        <View style={styles.card}>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.breed}>{item.breed}</Text>
            </View>
            <Text style={styles.price}>{item.price}</Text>
          </View>

          <View style={styles.metaBadgeRow}>
            <View style={styles.badge}><Text style={styles.badgeText}>ID: {item.id}</Text></View>
            <View style={styles.badge}><Text style={styles.badgeText}>Age: {item.age}</Text></View>
            <View style={styles.badge}><Text style={styles.badgeText}>Gender: {item.gender}</Text></View>
          </View>

          <Text style={styles.sectionTitle}>Location</Text>
          <Text style={styles.locationText}>📍 {item.location}</Text>

          <Text style={styles.sectionTitle}>About {item.name}</Text>
          <Text style={styles.description}>{item.description}</Text>

          <PillButton
            title="ADOPT ME NOW"
            onPress={() => Alert.alert('Adoption Request Sent!', `Thank you for inquiring about ${item.name}.`)}
            style={{ marginTop: 24 }}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  fillMint: { flex: 1, backgroundColor: colors.mint },
  center: { justifyContent: 'center', alignItems: 'center' },
  container: { padding: spacing.lg, paddingTop: 50 },
  backButton: { marginBottom: 16, paddingVertical: 6, paddingHorizontal: 12, backgroundColor: colors.white, borderRadius: radii.pill, alignSelf: 'flex-start' },
  backButtonText: { fontSize: 12, fontWeight: '800', color: colors.ink },
  imageHolder: { width: '100%', height: 260, marginBottom: spacing.md },
  card: { backgroundColor: colors.white, borderRadius: radii.lg, padding: spacing.lg },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  name: { fontSize: 22, fontWeight: '900', color: colors.ink },
  breed: { fontSize: 13, color: colors.textMuted, fontWeight: '600' },
  price: { fontSize: 20, fontWeight: '900', color: colors.ink },
  metaBadgeRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  badge: { backgroundColor: colors.cream, paddingHorizontal: 10, paddingVertical: 4, borderRadius: radii.sm },
  badgeText: { fontSize: 11, fontWeight: '700', color: colors.ink },
  sectionTitle: { fontSize: 12, fontWeight: '800', color: colors.ink, marginTop: 10, marginBottom: 4 },
  locationText: { fontSize: 12, color: colors.textMuted, fontWeight: '600' },
  description: { fontSize: 13, color: colors.textMuted, lineHeight: 18 },
  errorText: { fontSize: 16, fontWeight: '700', color: colors.ink },
});