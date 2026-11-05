import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppPreferences, type AppColors } from '../services/AppPreferencesContext';

import CartIcon from '../images/Icons/cart-shopping-solid-full.svg';
import CommentIcon from '../images/Icons/comment-solid-full.svg';
import HouseIcon from '../images/Icons/house-solid-full.svg';
import UserIcon from '../images/Icons/user-solid-full.svg';

export type BottomNavigationTab = 'home' | 'chat' | 'cart' | 'profile';

interface BottomNavigationProps {
  activeTab: BottomNavigationTab;
  go: (next: string) => void;
}

const TABS = [
  { key: 'home', Icon: HouseIcon },
  { key: 'chat', Icon: CommentIcon },
  { key: 'cart', Icon: CartIcon },
  { key: 'profile', Icon: UserIcon },
] as const;

export default function BottomNavigation({ activeTab, go }: BottomNavigationProps) {
  const { colors } = useAppPreferences();
  const insets = useSafeAreaInsets();
  const styles = createStyles(colors, insets.bottom);
  
  const animations = useRef(
    Object.fromEntries(
      TABS.map(({ key }) => [key, new Animated.Value(key === activeTab ? 1 : 0)])
    ) as Record<BottomNavigationTab, Animated.Value>
  ).current;

  useEffect(() => {
    // Upgraded spring animation for a more playful, bouncy feel
    const activeAnim = Animated.spring(animations[activeTab], {
      toValue: 1,
      useNativeDriver: true,
      friction: 5,
      tension: 70,
    });

    const inactiveAnims = TABS.filter((t) => t.key !== activeTab).map((t) =>
      Animated.spring(animations[t.key], {
        toValue: 0,
        useNativeDriver: true,
        friction: 6,
        tension: 50,
      })
    );

    Animated.parallel([activeAnim, ...inactiveAnims]).start();
  }, [activeTab, animations]);

  return (
    <View pointerEvents="box-none" style={styles.wrapper}>
      <View style={styles.bar}>
        {TABS.map(({ key, Icon }) => {
          const isActive = activeTab === key;
          const anim = animations[key];

          // Subtly lift the icon
          const iconTranslateY = anim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, -6], 
          });

          // Pop the icon size up slightly when active
          const iconScale = anim.interpolate({
            inputRange: [0, 1],
            outputRange: [1, 1.15],
          });

          // Expand the background bubble
          const circleScale = anim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 1],
          });
          
          // Fade in the bubble smoothly
          const circleOpacity = anim.interpolate({
            inputRange: [0, 0.5, 1],
            outputRange: [0, 0.8, 1],
          });

          return (
            <Pressable
              key={key}
              style={styles.tab}
              onPress={() => go(key)}
            >
              <Animated.View style={[styles.iconContainer, { transform: [{ translateY: iconTranslateY }, { scale: iconScale }] }]}>
                <Animated.View style={[styles.activeBubble, { opacity: circleOpacity, transform: [{ scale: circleScale }] }]} />
                <Icon width={22} height={22} fill={isActive ? colors.ink : colors.textMuted} />
              </Animated.View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const createStyles = (colors: AppColors, bottomInset: number) => StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: bottomInset + 12, // Lifted slightly higher off the bottom edge
    left: 0,
    right: 0,
  },
  bar: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    height: 65,
    marginHorizontal: 24, // Tighter width for a pill-like look
    borderRadius: 35,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 48,
    height: 48,
  },
  activeBubble: {
    position: 'absolute',
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.mint,
  },
});