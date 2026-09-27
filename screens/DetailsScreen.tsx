import React from 'react';
import { Alert, Dimensions, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; 

// FIXED: Changed '../../' to '../'
import { colors, radii, spacing } from '../constants/theme';
import { CAT_DATA } from '../data/cats';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface DetailsProps {
  go: (next: string) => void;
  id: string;
}

export default function DetailsScreen({ go, id }: DetailsProps) {
  const item = CAT_DATA.find((c) => c.id === id);

  if (!item) {
    return (
      <View style={[styles.fill, styles.center]}>
        <Text style={styles.errorText}>Item not found (ID: {id})</Text>
        <Pressable style={styles.adoptButton} onPress={() => go('main')}>
           <Text style={styles.adoptButtonText}>Back to Home</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.fill}>
      {/* Background Cover Image Placeholder */}
      <View style={[styles.imageContainer, { backgroundColor: '#D3D3D3', justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: '#888', fontWeight: 'bold' }}>IMAGE PLACEHOLDER</Text>
      </View>

      {/* Floating Back Button */}
      <Pressable style={styles.backButton} onPress={() => go('main')}>
        <Ionicons name="chevron-back" size={24} color="#fff" />
      </Pressable>

      {/* Scrollable Details Card */}
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.card}>
          {/* Drag Handle Indicator */}
          <View style={styles.dragHandle} />

          {/* Header Row: Name & Status */}
          <View style={styles.headerRow}>
            <Text style={styles.name}>{item.name}</Text>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>Available</Text>
            </View>
          </View>

          {/* Subtitle & Location */}
          <Text style={styles.subtitle}>
            {item.breed} • {item.age} • {item.gender}
          </Text>
          <View style={styles.locationRow}>
            <Ionicons name="location-sharp" size={14} color={colors.ink} />
            <Text style={styles.locationText}>{item.location}</Text>
          </View>

          {/* Stats Row (Weight, Height, Health) */}
          <View style={styles.statsContainer}>
            <View style={styles.statBox}>
              <Ionicons name="scale-outline" size={20} color={colors.ink} />
              <View style={styles.statTextContainer}>
                <Text style={styles.statValue}>{item.weight || '3.3 kg'}</Text>
                <Text style={styles.statLabel}>Weight</Text>
              </View>
            </View>
            <View style={styles.statBox}>
              <Ionicons name="resize-outline" size={20} color={colors.ink} />
              <View style={styles.statTextContainer}>
                <Text style={styles.statValue}>{item.height || '25 cm'}</Text>
                <Text style={styles.statLabel}>Height</Text>
              </View>
            </View>
            <View style={styles.statBox}>
              <Ionicons name="medkit-outline" size={20} color={colors.ink} />
              <View style={styles.statTextContainer}>
                <Text style={styles.statValue}>{item.health || 'Healthy'}</Text>
                <Text style={styles.statLabel}>Vaccinated</Text>
              </View>
            </View>
          </View>

          {/* About Section */}
          <Text style={styles.sectionTitle}>About {item.name}</Text>
          <Text style={styles.description}>{item.description}</Text>

          {/* Traits Row */}
          <View style={styles.traitsContainer}>
            {['Friendly', 'Playful', 'Gentle'].map((trait, index) => (
              <View key={index} style={styles.traitBox}>
                <Ionicons name="happy-outline" size={16} color={colors.ink} />
                <Text style={styles.traitText}>{trait}</Text>
              </View>
            ))}
          </View>

          {/* Action Button */}
          <Pressable 
            style={styles.adoptButton}
            onPress={() => Alert.alert('Adoption Request Sent!', `Thank you for inquiring about ${item.name}.`)}
          >
            <Ionicons name="paw" size={20} color={colors.ink} />
            <Text style={styles.adoptButtonText}>Adopt {item.name}</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { 
    flex: 1, 
    backgroundColor: '#F2F2F2' 
  },
  center: { 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  imageContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: SCREEN_HEIGHT * 0.45,
  },
  backButton: { 
    position: 'absolute',
    top: 50, 
    left: 20,
    width: 40,
    height: 40,
    backgroundColor: 'rgba(0,0,0,0.6)', 
    borderRadius: 20, 
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  scrollContent: {
    paddingTop: SCREEN_HEIGHT * 0.38, 
    paddingBottom: 40,
  },
  card: { 
    backgroundColor: '#FAFAFA', 
    borderTopLeftRadius: 36, 
    borderTopRightRadius: 36, 
    padding: spacing.lg,
    minHeight: SCREEN_HEIGHT * 0.65,
  },
  dragHandle: {
    width: 50,
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 24,
  },
  headerRow: { 
    flexDirection: 'row', 
    justifyContent: 'flex-start', 
    alignItems: 'center', 
    marginBottom: 8,
    gap: 12,
  },
  name: { 
    fontSize: 28, 
    fontWeight: '900', 
    color: colors.ink 
  },
  statusBadge: {
    backgroundColor: '#E8F5E9', 
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2E7D32',
  },
  subtitle: { 
    fontSize: 14, 
    color: '#757575', 
    fontWeight: '600',
    marginBottom: 8,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    gap: 4,
  },
  locationText: { 
    fontSize: 13, 
    color: '#757575', 
    fontWeight: '600' 
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 16,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    gap: 8,
  },
  statTextContainer: {
    flex: 1,
  },
  statValue: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.ink,
  },
  statLabel: {
    fontSize: 11,
    color: '#9E9E9E',
    fontWeight: '500',
  },
  sectionTitle: { 
    fontSize: 16, 
    fontWeight: '800', 
    color: colors.ink, 
    marginBottom: 12 
  },
  description: { 
    fontSize: 14, 
    color: '#616161', 
    lineHeight: 22,
    marginBottom: 24,
  },
  traitsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  traitBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    borderRadius: 12,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    gap: 6,
  },
  traitText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.ink,
  },
  adoptButton: { 
    flexDirection: 'row',
    backgroundColor: '#A7E2D6', 
    paddingVertical: 16, 
    borderRadius: 30, 
    justifyContent: 'center', 
    alignItems: 'center',
    gap: 8,
  },
  adoptButtonText: { 
    fontSize: 16, 
    fontWeight: '800', 
    color: colors.ink 
  },
  errorText: { 
    fontSize: 16, 
    fontWeight: '700', 
    color: colors.ink,
    marginBottom: 20
  },
});