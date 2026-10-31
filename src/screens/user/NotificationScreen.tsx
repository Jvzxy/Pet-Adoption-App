import React, { useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { colors, radii, spacing } from "../../constants/theme";

// SVG Icon Imports
import ArrowLeftIcon from "../../images/Icons/arrow-left-solid-full.svg";
import CartIcon from "../../images/Icons/cart-shopping-solid-full.svg";
import CommentIcon from "../../images/Icons/comment-solid-full.svg";
import HouseIcon from "../../images/Icons/house-solid-full.svg";
import UserIcon from "../../images/Icons/user-solid-full.svg";
import BoxIcon from "../../images/Icons/box-solid-full.svg";
import TagIcon from "../../images/Icons/tag-solid-full.svg";

interface ScreenProps {
  go: (next: string) => void;
}

interface NotificationItem {
  id: number;
  iconType: "box" | "tag" | "logo" | "comment";
  title: string;
  message: string;
  time: string;
  unread: boolean;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 1,
    iconType: "box",
    title: "Order Shipped!",
    message: "Your order for Whiskas Ocean Fish has been shipped and is on its way to Bulua.",
    time: "2 hours ago",
    unread: true,
  },
  {
    id: 2,
    iconType: "tag",
    title: "Flash Sale on Accessories",
    message: "Get up to 50% off on cute pink collars and toys today only!",
    time: "5 hours ago",
    unread: true,
  },
  {
    id: 3,
    iconType: "logo",
    title: "Welcome to Pawfect Cats",
    message: "Thank you for joining us! Complete your profile to get personalized recommendations.",
    time: "1 day ago",
    unread: false,
  },
  {
    id: 4,
    iconType: "comment",
    title: "New Message",
    message: "The seller has replied to your inquiry regarding the scratching post.",
    time: "2 days ago",
    unread: false,
  },
];

const NAV_ITEMS = [
  { key: "main", Icon: HouseIcon, label: "Home", active: false },
  { key: "chat", Icon: CommentIcon, label: "Chat", active: false },
  { key: "cart", Icon: CartIcon, label: "Cart", active: false },
  { key: "profile", Icon: UserIcon, label: "Profile", active: false },
];

export default function NotificationScreen({ go }: ScreenProps) {
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const markAsRead = (id: number) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread: false } : n))
    );
  };

  const renderIcon = (type: string) => {
    const iconProps = { width: 22, height: 22, fill: colors.ink || "#000" };
    switch (type) {
      case "box":
        return <BoxIcon {...iconProps} />;
      case "tag":
        return <TagIcon {...iconProps} />;
      case "logo":
        return (
          <Image 
            source={require("../../images/Logo.png")} 
            style={{ width: 26, height: 26, tintColor: colors.ink || "#000" }} 
            resizeMode="contain" 
          />
        );
      case "comment":
        return <CommentIcon {...iconProps} />;
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {/* 1. Fixed Top Black Banner */}
      <View style={styles.blackBanner}>
        <Pressable onPress={() => go("main")} style={styles.backBtn} hitSlop={10}>
          <ArrowLeftIcon width={20} height={20} fill={colors.white || "#FFF"} />
        </Pressable>
        <View style={styles.bannerCenter}>
          <Text style={styles.bannerTitle}>Notifications</Text>
          <Text style={styles.bannerSubtitle}>Recent updates & alerts</Text>
        </View>
        <Pressable style={styles.editBtn} onPress={markAllAsRead}>
          <Text style={styles.editText}>Read All</Text>
        </Pressable>
      </View>

      {/* 2. Flexible Scrollable Notification List */}
      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {notifications.map((item) => (
          <Pressable 
            key={item.id} 
            style={[styles.notificationRow, item.unread && styles.notificationRowUnread]}
            onPress={() => markAsRead(item.id)}
          >
            {/* Icon Card */}
            <View style={[styles.iconCard, item.unread ? styles.iconCardUnread : styles.iconCardRead]}>
              {renderIcon(item.iconType)}
            </View>

            {/* Notification Info */}
            <View style={styles.itemInfo}>
              <Text style={styles.itemTitle}>{item.title}</Text>
              <Text style={styles.itemMessage} numberOfLines={2}>{item.message}</Text>
              <Text style={styles.itemTime}>{item.time}</Text>
            </View>

            {/* Unread Indicator */}
            {item.unread && <View style={styles.unreadDot} />}
          </Pressable>
        ))}
      </ScrollView>

      {/* 3. Fixed Bottom Area (Navigation Bar) */}
      <View style={styles.bottomSection}>
        {/* Floating Navigation Pill */}
        <View style={styles.bottomNavWrapper}>
          <View style={styles.bottomNav}>
            {NAV_ITEMS.map(({ key, Icon, label, active }) => (
              <Pressable
                key={key}
                onPress={() => !active && go(key)}
                style={[styles.navItem, active && styles.navItemActive]}
              >
                <Icon width={20} height={20} fill={colors.ink} />
                {active && <Text style={styles.navLabel}>{label}</Text>}
              </Pressable>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.mint || "#A8DDD6",
  },
  blackBanner: {
    backgroundColor: colors.ink || "#000",
    paddingTop: 50, 
    paddingBottom: 14,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center", 
    position: "relative",
  },
  backBtn: {
    position: "absolute",
    left: 16,
    bottom: 22,
    zIndex: 10,
  },
  bannerCenter: {
    alignItems: "center",
  },
  bannerTitle: {
    color: colors.white || "#FFF",
    fontSize: 16,
    fontWeight: "900",
    marginBottom: 4,
  },
  bannerSubtitle: {
    color: colors.white || "#FFF",
    fontSize: 10,
    fontWeight: "600",
  },
  editBtn: {
    position: "absolute",
    right: 16,
    bottom: 14,
  },
  editText: {
    color: colors.white || "#FFF",
    fontSize: 12,
    fontWeight: "700",
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 8,
    paddingBottom: 16,
  },
  notificationRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.85)",
  },
  notificationRowUnread: {
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  iconCard: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  iconCardUnread: {
    backgroundColor: colors.white || "#FFF",
  },
  iconCardRead: {
    backgroundColor: "rgba(255,255,255,0.4)",
  },
  itemInfo: {
    flex: 1,
    paddingRight: 10,
  },
  itemTitle: {
    fontSize: 13,
    fontWeight: "900",
    color: colors.ink || "#000",
  },
  itemMessage: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.ink || "#000",
    marginTop: 4,
    lineHeight: 16,
  },
  itemTime: {
    fontSize: 10,
    fontWeight: "800",
    color: "rgba(0,0,0,0.5)",
    marginTop: 6,
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#FF2D55",
  },
  bottomSection: {
    backgroundColor: colors.mint || "#A8DDD6",
  },
  bottomNavWrapper: {
    paddingVertical: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: colors.white || "#FFF",
    width: "85%",
    borderRadius: 100,
    height: 55,
    paddingHorizontal: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 8,
  },
  navItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radii?.pill || 20,
  },
  navItemActive: {
    backgroundColor: colors.mint || "#A8DDD6",
  },
  navLabel: {
    fontSize: 13,
    fontWeight: "900",
    color: colors.ink || "#000",
  },
});