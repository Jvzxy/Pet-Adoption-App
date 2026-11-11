import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, StyleSheet, View, type ViewStyle } from 'react-native';
import { useAppPreferences } from '../services/AppPreferencesContext';

type MotionContextValue = { progress: Animated.Value; reducedMotion: boolean; register: () => () => void };
const MotionContext = createContext<MotionContextValue | null>(null);

/** One native-driver shimmer loop shared by every visible placeholder. */
export function SkeletonProvider({ children }: { children: React.ReactNode }) {
  const progress = useRef(new Animated.Value(0)).current;
  const loop = useRef<Animated.CompositeAnimation | null>(null);
  const activeCount = useRef(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    let mounted = true;
    void AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      if (mounted) setReducedMotion(enabled);
    }).catch(() => undefined);
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReducedMotion);
    return () => { mounted = false; subscription.remove(); };
  }, []);

  const register = useCallback(() => {
    activeCount.current += 1;
    if (!reducedMotion && activeCount.current === 1) {
      progress.setValue(0);
      loop.current = Animated.loop(Animated.timing(progress, {
        toValue: 1,
        duration: 1250,
        useNativeDriver: true,
      }));
      loop.current.start();
    }
    return () => {
      activeCount.current = Math.max(0, activeCount.current - 1);
      if (activeCount.current === 0) {
        loop.current?.stop();
        loop.current = null;
      }
    };
  }, [progress, reducedMotion]);

  useEffect(() => {
    if (reducedMotion) {
      loop.current?.stop();
      loop.current = null;
    } else if (activeCount.current > 0 && !loop.current) {
      progress.setValue(0);
      loop.current = Animated.loop(Animated.timing(progress, { toValue: 1, duration: 1250, useNativeDriver: true }));
      loop.current.start();
    }
  }, [progress, reducedMotion]);

  const value = useMemo(() => ({ progress, reducedMotion, register }), [progress, reducedMotion, register]);
  return <MotionContext.Provider value={value}>{children}</MotionContext.Provider>;
}

/** Prevent a one-frame skeleton flash on fast requests without delaying the request itself. */
export function useSkeletonLoading(isLoading: boolean, delay = 120) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!isLoading) { setVisible(false); return; }
    const timer = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(timer);
  }, [isLoading, delay]);
  return isLoading && visible;
}

type SkeletonProps = { width?: ViewStyle['width']; height?: number; radius?: number; style?: ViewStyle };

export function Skeleton({ width = '100%', height = 14, radius = 8, style }: SkeletonProps) {
  const { colors } = useAppPreferences();
  const motion = useContext(MotionContext);
  useEffect(() => motion?.register(), [motion]);
  const translateX = motion?.progress.interpolate({ inputRange: [0, 1], outputRange: [-120, 240] }) ?? 0;

  return (
    <View accessible={false} accessibilityElementsHidden importantForAccessibility="no" style={[styles.base, { width, height, borderRadius: radius, backgroundColor: colors.border || '#DDE4E2' }, style]}>
      {motion && !motion.reducedMotion && (
        <Animated.View pointerEvents="none" style={[styles.shimmer, { backgroundColor: colors.surface, opacity: 0.5, transform: [{ translateX }] }]} />
      )}
    </View>
  );
}

export const SkeletonText = ({ width = '100%', ...props }: SkeletonProps) => <Skeleton width={width} height={14} {...props} />;
export const SkeletonTitle = (props: Omit<SkeletonProps, 'height'>) => <Skeleton height={24} radius={7} {...props} />;
export const SkeletonAvatar = ({ size = 44 }: { size?: number }) => <Skeleton width={size} height={size} radius={size / 2} />;
export const SkeletonImage = ({ height = 180, ...props }: Omit<SkeletonProps, 'height'> & { height?: number }) => <Skeleton height={height} radius={16} {...props} />;
export const SkeletonButton = (props: Omit<SkeletonProps, 'height'>) => <Skeleton height={48} radius={24} {...props} />;

export function SkeletonPetGrid({ count = 4 }: { count?: number }) {
  const { colors } = useAppPreferences();
  if (!useSkeletonLoading(true)) return null;
  return <View style={styles.grid}>
    {Array.from({ length: count }, (_, i) => <View key={i} style={[styles.petCard, { backgroundColor: colors.surface }]}>
      <SkeletonImage height={116} radius={14} /><SkeletonText width="72%" style={styles.line} />
      <SkeletonText width="48%" height={11} style={styles.shortLine} /><Skeleton width="62%" height={16} style={styles.priceLine} />
    </View>)}
  </View>;
}

export function SkeletonCard() {
  const { colors } = useAppPreferences();
  if (!useSkeletonLoading(true)) return null;
  return <View style={[styles.card, { backgroundColor: colors.surface }]}><SkeletonImage height={144} />
    <SkeletonTitle width="68%" style={styles.line} /><SkeletonText width="92%" style={styles.shortLine} />
    <SkeletonText width="74%" style={styles.shortLine} /><SkeletonButton width="42%" style={styles.priceLine} />
  </View>;
}

export function SkeletonList({ count = 3 }: { count?: number }) {
  const { colors } = useAppPreferences();
  if (!useSkeletonLoading(true)) return null;
  return <View style={styles.rows}>{Array.from({ length: count }, (_, i) => <View key={i} style={[styles.rowCard, { backgroundColor: colors.surface }]}>
    <SkeletonAvatar /><View style={styles.rowCopy}><SkeletonText width="68%" /><SkeletonText width="46%" height={11} style={styles.shortLine} /></View>
    <Skeleton width={68} height={23} radius={12} />
  </View>)}</View>;
}
export const SkeletonRows = SkeletonList;

export function SkeletonTable({ rows = 4, columns = 3 }: { rows?: number; columns?: number }) {
  const { colors } = useAppPreferences();
  return <View style={[styles.table, { backgroundColor: colors.surface }]}>
    <View style={styles.tableRow}>{Array.from({ length: columns }, (_, i) => <Skeleton key={`h${i}`} width={`${80 / columns}%`} height={12} />)}</View>
    {Array.from({ length: rows }, (_, row) => <View key={row} style={[styles.tableRow, styles.tableBodyRow]}>{Array.from({ length: columns }, (_, col) => <Skeleton key={col} width={`${70 + ((row + col) % 3) * 10}%`} height={13} />)}</View>)}
  </View>;
}

export function SkeletonProfile() {
  return <View style={styles.profile}><SkeletonAvatar size={76} /><SkeletonTitle width="52%" style={styles.line} />
    <SkeletonText width="38%" style={styles.shortLine} /><SkeletonList count={3} />
  </View>;
}
export function SkeletonDashboard() { return <View style={styles.dashboard}><View style={styles.dashboardTiles}>{Array.from({ length: 3 }, (_, i) => <SkeletonCard key={i} />)}</View><SkeletonChart /><SkeletonTable rows={3} /></View>; }
export function SkeletonSidebar() { return <View style={styles.sidebar}>{Array.from({ length: 6 }, (_, i) => <View key={i} style={styles.sidebarRow}><SkeletonAvatar size={28} /><SkeletonText width="64%" /></View>)}</View>; }
export function SkeletonNavbar() { return <View style={styles.navbar}><SkeletonAvatar size={34} /><SkeletonText width="34%" /><SkeletonAvatar size={34} /></View>; }
export function SkeletonForm({ fields = 4 }: { fields?: number }) { return <View style={styles.form}>{Array.from({ length: fields }, (_, i) => <View key={i}><SkeletonText width="28%" height={12} /><Skeleton height={48} radius={12} style={styles.line} /></View>)}<SkeletonButton style={styles.priceLine} /></View>; }
export function SkeletonChart() { return <View style={styles.chart}>{Array.from({ length: 7 }, (_, i) => <Skeleton key={i} width="9%" height={36 + (i % 4) * 24} radius={6} style={styles.chartBar} />)}</View>; }
export function SkeletonPage() { return <View style={styles.page}><SkeletonNavbar /><SkeletonTitle width="46%" style={styles.line} /><SkeletonText width="68%" style={styles.shortLine} /><SkeletonList count={4} /></View>; }

const styles = StyleSheet.create({
  base: { overflow: 'hidden' }, shimmer: { position: 'absolute', left: 0, top: 0, bottom: 0, width: '42%' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 10 },
  petCard: { width: '48%', borderRadius: 20, padding: 10, marginBottom: 16 }, card: { borderRadius: 18, padding: 16, marginBottom: 16 },
  line: { marginTop: 12 }, shortLine: { marginTop: 8 }, priceLine: { marginTop: 16 },
  rows: { paddingHorizontal: 24, paddingTop: 8 }, rowCard: { minHeight: 74, borderRadius: 18, padding: 16, marginBottom: 14, flexDirection: 'row', alignItems: 'center' },
  rowCopy: { flex: 1, marginHorizontal: 12 }, table: { borderRadius: 16, padding: 16, margin: 16 }, tableRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 14, gap: 10 }, tableBodyRow: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#DDE4E2' },
  profile: { alignItems: 'center', padding: 24 }, dashboard: { padding: 16 }, dashboardTiles: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  sidebar: { padding: 16 }, sidebarRow: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 12 }, navbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  form: { padding: 20, gap: 18 }, chart: { height: 180, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-around', padding: 18, borderRadius: 16 }, chartBar: { alignSelf: 'flex-end' }, page: { flex: 1, paddingTop: 10 },
});
