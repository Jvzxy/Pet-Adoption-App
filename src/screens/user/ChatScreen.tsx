import React, { useState } from 'react';
import {
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { colors, radii, spacing } from '../../constants/theme';

// SVG Icon Imports
import CartIcon from '../../images/Icons/cart-shopping-solid-full.svg';
import CommentIcon from '../../images/Icons/comment-solid-full.svg';
import HouseIcon from '../../images/Icons/house-solid-full.svg';
import UserIcon from '../../images/Icons/user-solid-full.svg';

interface ScreenProps {
  go: (next: string) => void;
}

interface ChatItem {
  id: string;
  name: string;
  message: string;
  time: string;
  unreadCount?: number;
  avatar: string;
}

const CHATS_DATA: ChatItem[] = [
  {
    id: '1',
    name: 'Jussy Jay Durain',
    message: "Hello Good morning. I'm interested to adopt Whisper I rea...",
    time: '2:20',
    unreadCount: 2,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
  },
  {
    id: '2',
    name: 'Marilex Rabosa',
    message: 'Sent 12 mins',
    time: '3:10',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
  },
  {
    id: '3',
    name: 'Andree Sanlayan',
    message: 'Sent 12 mins',
    time: '3:10',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
  },
  {
    id: '4',
    name: 'Abigail Lapinid',
    message: 'Sent 12 mins',
    time: '1:10',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
  },
  {
    id: '5',
    name: 'Maui Tangarorang',
    message: 'Sent 12 mins',
    time: '10:40',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
  },
];

const NAV_ITEMS = [
  { key: 'main', Icon: HouseIcon, label: 'Home', active: false },
  { key: 'chat', Icon: CommentIcon, label: 'Chat', active: true },
  { key: 'cart', Icon: CartIcon, label: 'Cart', active: false },
  { key: 'profile', Icon: UserIcon, label: 'Profile', active: false },
];

export default function ChatScreen({ go }: ScreenProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [chatFilter, setChatFilter] = useState<'recent' | 'old'>('recent');

  const displayedChats = chatFilter === 'recent' ? CHATS_DATA : [...CHATS_DATA].reverse();

  const renderChatItem = ({ item }: { item: ChatItem }) => (
    <Pressable style={styles.chatRow}>
      <Image source={{ uri: item.avatar }} style={styles.avatar} />
      <View style={styles.chatDetails}>
        <Text style={styles.chatName} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.chatMessage} numberOfLines={1}>
          {item.message}
        </Text>
      </View>
      <View style={styles.chatMeta}>
        <Text style={styles.chatTime}>{item.time}</Text>
        {item.unreadCount ? (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadText}>{item.unreadCount}</Text>
          </View>
        ) : null}
      </View>
    </Pressable>
  );

  return (
    <View style={styles.fillMint}>
      {/* Top Header Bar */}
      <View style={styles.topBar}>
        <Text style={styles.title}>Messages</Text>
      </View>

      {/* Sub Header: "Chats" & Dropdown Options */}
      <View style={styles.subHeader}>
        <Text style={styles.sectionTitle}>
          {chatFilter === 'recent' ? 'Recent Chats' : 'Old Chats'}
        </Text>
        
        <View style={styles.dropdownContainer}>
          <Pressable 
            onPress={() => setShowDropdown(!showDropdown)} 
            hitSlop={15}
            style={styles.moreOptionsHitbox}
          >
            <Text style={styles.moreOptions}>⋮</Text>
          </Pressable>

          {showDropdown && (
            <View style={styles.dropdownMenu}>
              <Pressable 
                style={[styles.dropdownItem, chatFilter === 'recent' && styles.activeDropdownItem]} 
                onPress={() => {
                  setChatFilter('recent');
                  setShowDropdown(false);
                }}
              >
                <Text style={[styles.dropdownItemText, chatFilter === 'recent' && styles.activeDropdownText]}>
                  Recent Chat
                </Text>
              </Pressable>
              
              <View style={styles.dropdownDivider} />
              
              <Pressable 
                style={[styles.dropdownItem, chatFilter === 'old' && styles.activeDropdownItem]} 
                onPress={() => {
                  setChatFilter('old');
                  setShowDropdown(false);
                }}
              >
                <Text style={[styles.dropdownItemText, chatFilter === 'old' && styles.activeDropdownText]}>
                  Old Chat
                </Text>
              </Pressable>
            </View>
          )}
        </View>
      </View>

      {/* Chat List */}
      <FlatList
        data={displayedChats}
        keyExtractor={(item) => item.id}
        renderItem={renderChatItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {/* Floating Bottom Navigation */}
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
  );
}

const styles = StyleSheet.create({
  fillMint: {
    flex: 1,
    backgroundColor: colors.mint,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: 55,
    paddingBottom: 15,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.ink,
  },
  subHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginTop: 10,
    marginBottom: 16,
    zIndex: 20,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.ink,
  },
  dropdownContainer: {
    position: 'relative',
  },
  moreOptionsHitbox: {
    paddingHorizontal: 8,
  },
  moreOptions: {
    fontSize: 20,
    fontWeight: '900',
    color: colors.ink,
  },
  dropdownMenu: {
    position: 'absolute',
    top: 25,
    right: 0,
    backgroundColor: colors.white,
    borderRadius: radii.md || 12,
    width: 140,
    paddingVertical: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
    zIndex: 100,
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  activeDropdownItem: {
    backgroundColor: 'rgba(168, 221, 214, 0.3)',
  },
  dropdownItemText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.ink,
  },
  activeDropdownText: {
    fontWeight: '900',
  },
  dropdownDivider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 120,
  },
  chatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    marginRight: 14,
    backgroundColor: '#D1E5E1',
  },
  chatDetails: {
    flex: 1,
    marginRight: 10,
  },
  chatName: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.ink,
    marginBottom: 3,
  },
  chatMessage: {
    fontSize: 12,
    color: colors.ink,
    opacity: 0.8,
    fontWeight: '500',
  },
  chatMeta: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  chatTime: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.ink,
    marginBottom: 4,
  },
  unreadBadge: {
    backgroundColor: colors.ink,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unreadText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: '900',
  },
  bottomNavWrapper: {
    position: 'absolute',
    bottom: 35,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: colors.white,
    width: '85%',
    borderRadius: 100,
    height: 65,
    paddingHorizontal: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: radii.pill,
  },
  navItemActive: {
    backgroundColor: colors.mint,
  },
  navLabel: {
    fontSize: 14,
    fontWeight: '900',
    color: colors.ink,
  },
});