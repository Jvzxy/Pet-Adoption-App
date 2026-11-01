import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { useAppPreferences, type AppColors } from '../services/AppPreferencesContext';

// Assuming you have a colors file, adjust the import path if needed
// import { colors } from '../constants/theme'; 

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
  { key: 'home', label: 'Home', Icon: HouseIcon },
  { key: 'chat', label: 'Chat', Icon: CommentIcon },
  { key: 'cart', label: 'Cart', Icon: CartIcon },
  { key: 'profile', label: 'Profile', Icon: UserIcon },
] as const;

export default function BottomNavigation({ activeTab, go }: BottomNavigationProps) {
  const { colors } = useAppPreferences();
  const styles = createStyles(colors);
  const animations = useRef(
    Object.fromEntries(
      TABS.map(({ key }) => [key, new Animated.Value(key === activeTab ? 1 : 0)])
    ) as Record<BottomNavigationTab, Animated.Value>
  ).current;

  useEffect(() => {
    const activeAnim = Animated.spring(animations[activeTab], {
      toValue: 1,
      useNativeDriver: true,
      friction: 6,
      tension: 60,
    });

    const inactiveAnims = TABS.filter((t) => t.key !== activeTab).map((t) =>
      Animated.spring(animations[t.key], {
        toValue: 0,
        useNativeDriver: true,
        friction: 6,
        tension: 60,
      })
    );

    Animated.parallel([activeAnim, ...inactiveAnims]).start();
  }, [activeTab, animations]);

  return (
    <View pointerEvents="box-none" style={styles.wrapper}>
      <View style={styles.bar}>
        {TABS.map(({ key, label, Icon }) => {
          const isActive = activeTab === key;
          const anim = animations[key];

          const iconTranslateY = anim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, -14],
          });

          const labelOpacity = anim.interpolate({
            inputRange: [0.3, 1],
            outputRange: [0, 1],
          });

          const labelTranslateY = anim.interpolate({
            inputRange: [0, 1],
            outputRange: [10, 0],
          });

          const circleScale = anim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 1],
          });

          return (
            <Pressable
              key={key}
              style={styles.tab}
              onPress={() => go(key)}
            >
              <Animated.View style={[styles.iconContainer, { transform: [{ translateY: iconTranslateY }] }]}>
                <Animated.View style={[styles.activeBubble, { transform: [{ scale: circleScale }] }]} />
                <Icon width={24} height={24} fill={isActive ? colors.ink : colors.textMuted} />
              </Animated.View>
              
              <Animated.Text 
                style={[
                  styles.label, 
                  { 
                    opacity: labelOpacity,
                    transform: [{ translateY: labelTranslateY }]
                  }
                ]}
              >
                {label}
              </Animated.Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const createStyles = (colors: AppColors) => StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: 20, 
  },
  bar: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    height: 65,
    marginHorizontal: 20,
    borderRadius: 35,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    justifyContent: 'space-around',
    alignItems: 'center',
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
    width: 45,
    height: 45,
  },
  activeBubble: {
    position: 'absolute',
    width: 45,
    height: 45,
    borderRadius: 25,
    backgroundColor: colors.mint,
  },
  label: {
    position: 'absolute',
    bottom: -15,
    fontSize: 12,
    fontWeight: '600',
    color: colors.ink,
  },
});