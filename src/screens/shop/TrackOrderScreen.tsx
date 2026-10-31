import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radii } from '../../constants/theme';

// Icons
import AngleLeftIcon from '../../images/Icons/angle-left-solid-full.svg';
import TruckIcon from '../../images/Icons/truck-fast-solid-full.svg';
import CircleCheckIcon from '../../images/Icons/circle-check-solid-full.svg';
import LocationIcon from '../../images/Icons/location-dot-solid-full.svg';

interface ScreenProps {
  go: (next: string) => void;
}

export default function TrackOrderScreen({ go }: ScreenProps) {
  // Animation Value: 0 = Placed, 1 = Processing, 2 = Out for Delivery, 3 = Delivered
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Simulate real-time tracking animation to stage 2 (Out for Delivery)
    Animated.timing(progress, {
      toValue: 2, 
      duration: 2500,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: false, // False because we animate layout heights
    }).start();
  }, [progress]);

  // Interpolations for the tracking line and truck position
  const progressHeight = progress.interpolate({
    inputRange: [0, 3],
    outputRange: ['0%', '100%']
  });

  const truckTop = progress.interpolate({
    inputRange: [0, 1, 2, 3],
    outputRange: [0, 80, 160, 240] // Distances between timeline dots
  });

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Pressable onPress={() => go('orderConfirmation')} style={styles.backBtn} hitSlop={10}>
          <AngleLeftIcon width={18} height={18} fill={colors.ink} />
        </Pressable>
        <Text style={styles.headerTitle}>Track Order</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.mapMockup}>
          <LocationIcon width={40} height={40} fill="#E65100" style={styles.mapMarker} />
          <Text style={styles.mapText}>Driver is heading to your location...</Text>
        </View>

        <View style={styles.timelineContainer}>
          {/* Animated Background Line */}
          <View style={styles.timelineTrack}>
            <Animated.View style={[styles.timelineFill, { height: progressHeight }]} />
          </View>

          {/* Animated Truck Indicator */}
          <Animated.View style={[styles.truckIndicator, { top: truckTop }]}>
            <TruckIcon width={16} height={16} fill={colors.white} />
          </Animated.View>

          {/* Timeline Steps */}
          <View style={styles.step}>
            <CircleCheckIcon width={24} height={24} fill="#2E7D32" style={styles.stepIcon} />
            <View style={styles.stepTextContainer}>
              <Text style={styles.stepTitle}>Order Placed</Text>
              <Text style={styles.stepTime}>09:30 AM</Text>
            </View>
          </View>

          <View style={styles.step}>
            <CircleCheckIcon width={24} height={24} fill="#2E7D32" style={styles.stepIcon} />
            <View style={styles.stepTextContainer}>
              <Text style={styles.stepTitle}>Processing</Text>
              <Text style={styles.stepTime}>10:15 AM</Text>
            </View>
          </View>

          <View style={styles.step}>
            <View style={styles.activeDot} />
            <View style={styles.stepTextContainer}>
              <Text style={[styles.stepTitle, styles.activeTitle]}>Out for Delivery</Text>
              <Text style={styles.stepTime}>Estimated Arrival: 1:30 PM</Text>
            </View>
          </View>

          <View style={styles.step}>
            <View style={styles.inactiveDot} />
            <View style={styles.stepTextContainer}>
              <Text style={styles.stepTitleInactive}>Delivered</Text>
              <Text style={styles.stepTimeInactive}>Pending</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.mint || '#A8DDD6' },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 60, paddingBottom: 20, paddingHorizontal: 24 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.5)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '900', color: colors.ink || '#000' },
  content: { flex: 1, paddingHorizontal: 24, paddingTop: 10 },
  mapMockup: { backgroundColor: colors.white, borderRadius: 24, height: 160, justifyContent: 'center', alignItems: 'center', marginBottom: 30, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 3 },
  mapMarker: { marginBottom: 12 },
  mapText: { fontSize: 13, fontWeight: '700', color: colors.ink },
  timelineContainer: { paddingLeft: 20, position: 'relative', height: 280 },
  timelineTrack: { position: 'absolute', left: 31, top: 20, bottom: 20, width: 3, backgroundColor: '#E0E0E0', borderRadius: 2 },
  timelineFill: { width: '100%', backgroundColor: '#2E7D32', borderRadius: 2 },
  truckIndicator: { position: 'absolute', left: 16, width: 32, height: 32, borderRadius: 16, backgroundColor: colors.ink, justifyContent: 'center', alignItems: 'center', zIndex: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 5 },
  step: { flexDirection: 'row', alignItems: 'flex-start', height: 80, zIndex: 1 },
  stepIcon: { marginTop: -2 },
  activeDot: { width: 20, height: 20, borderRadius: 10, backgroundColor: colors.white, borderWidth: 5, borderColor: '#E65100', marginLeft: 2 },
  inactiveDot: { width: 16, height: 16, borderRadius: 8, backgroundColor: '#E0E0E0', marginLeft: 4, marginTop: 4 },
  stepTextContainer: { marginLeft: 24 },
  stepTitle: { fontSize: 15, fontWeight: '800', color: colors.ink, marginBottom: 4 },
  stepTime: { fontSize: 12, fontWeight: '600', color: 'rgba(0,0,0,0.5)' },
  activeTitle: { color: '#E65100' },
  stepTitleInactive: { fontSize: 15, fontWeight: '700', color: 'rgba(0,0,0,0.3)', marginBottom: 4 },
  stepTimeInactive: { fontSize: 12, fontWeight: '600', color: 'rgba(0,0,0,0.3)' },
});