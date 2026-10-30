import React, { useState } from 'react';
import {
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { colors, radii, spacing } from '../constants/theme';

// SVG & Image Icon Imports
import AngleLeftIcon from '../images/Icons/angle-left-solid-full.svg';
import CartIcon from '../images/Icons/cart-shopping-solid-full.svg';
import CommentIcon from '../images/Icons/comment-solid-full.svg';
import HouseIcon from '../images/Icons/house-solid-full.svg';
import LogoutIcon from '../images/Icons/right-from-bracket-solid-full.svg';
import UserIcon from '../images/Icons/user-solid-full.svg';
import LocationIcon from '../images/Icons/location-dot-solid-full.svg';
import AngleRightIcon from '../images/Icons/angle-right-solid-full (1).svg';
import CircleQuestionIcon from '../images/Icons/circle-question-regular-full.svg';
import GearIcon from '../images/Icons/gear-solid-full.svg';
import ClipboardListIcon from '../images/Icons/clipboard-list-solid-full.svg';
import LockIcon from '../images/Icons/lock-solid-full.svg';

interface ScreenProps {
  go: (next: string) => void;
}

const NAV_ITEMS = [
  { key: 'main', Icon: HouseIcon, label: 'Home', active: false },
  { key: 'chat', Icon: CommentIcon, label: 'Chat', active: false },
  { key: 'cart', Icon: CartIcon, label: 'Cart', active: false },
  { key: 'profile', Icon: UserIcon, label: 'Profile', active: true },
];

export default function ProfileScreen({ go }: ScreenProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [profile, setProfile] = useState({
    fullName: 'Parves Ahamad',
    username: '@parvesahamad',
    gender: 'Male',
    birthday: '05-01-2001',
    phone: '(+880) 1759263000',
    email: 'nirobparvesahammad@gmail.com',
  });

  const [editForm, setEditForm] = useState(profile);

  const handleSaveProfile = () => {
    setProfile(editForm);
    setIsEditModalOpen(false);
  };

  return (
    <View style={styles.fillMint}>
      <View style={styles.topBar}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.profileHeader}>
          <View style={styles.avatarWrapper}>
            <View style={styles.avatarPlaceholder}>
              <UserIcon width={36} height={36} fill={colors.ink} />
            </View>
          </View>
          <Text style={styles.userName}>{profile.fullName}</Text>
          <Text style={styles.userHandle}>{profile.username}</Text>

          <Pressable style={styles.editProfileBtn} onPress={() => { setEditForm(profile); setIsEditModalOpen(true); }}>
            <Text style={styles.editProfileBtnText}>Edit Profile</Text>
          </Pressable>
        </View>

        {/* CLICKABLE MENU OPTIONS */}
        <View style={styles.menuContainer}>
          <Pressable style={styles.menuItem} onPress={() => go('settings')}>
            <GearIcon width={16} height={16} fill={colors.ink} style={styles.svgIcon} />
            <Text style={styles.menuLabel}>Settings</Text>
            <AngleRightIcon width={12} height={12} fill="rgba(0,0,0,0.3)" />
          </Pressable>

          <Pressable style={styles.menuItem} onPress={() => go('myOrders')}>
            <ClipboardListIcon width={16} height={16} fill={colors.ink} style={styles.svgIcon} />
            <Text style={styles.menuLabel}>My Orders</Text>
            <AngleRightIcon width={12} height={12} fill="rgba(0,0,0,0.3)" />
          </Pressable>

          <Pressable style={styles.menuItem} onPress={() => go('address')}>
            <LocationIcon width={16} height={16} fill={colors.ink} style={styles.svgIcon} />
            <Text style={styles.menuLabel}>Address</Text>
            <AngleRightIcon width={12} height={12} fill="rgba(0,0,0,0.3)" />
          </Pressable>

          <Pressable style={styles.menuItem} onPress={() => go('changePassword')}>
            <LockIcon width={16} height={16} fill={colors.ink} style={styles.svgIcon} />
            <Text style={styles.menuLabel}>Change Password</Text>
            <AngleRightIcon width={12} height={12} fill="rgba(0,0,0,0.3)" />
          </Pressable>

          <View style={styles.divider} />

          <Pressable style={styles.menuItem} onPress={() => go('helpSupport')}>
            <CircleQuestionIcon width={16} height={16} fill={colors.ink} style={styles.svgIcon} />
            <Text style={styles.menuLabel}>Help & Support</Text>
            <AngleRightIcon width={12} height={12} fill="rgba(0,0,0,0.3)" />
          </Pressable>

          <Pressable style={styles.menuItem} onPress={() => go('adminAddCat')}>
            <Image
              source={require('../images/Logo.png')}
              style={styles.adminLogoIcon}
              resizeMode="contain"
            />
            <Text style={[styles.menuLabel, { color: colors.ink }]}>Admin: Add New Cat</Text>
            <AngleRightIcon width={12} height={12} fill="rgba(0,0,0,0.3)" />
          </Pressable>

          <Pressable style={[styles.menuItem, { borderBottomWidth: 0 }]} onPress={() => go('login')}>
            <LogoutIcon width={18} height={18} fill="#D32F2F" style={{ marginRight: 12, marginLeft: 2 }} />
            <Text style={[styles.menuLabel, { color: '#D32F2F' }]}>Log out</Text>
          </Pressable>
        </View>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal visible={isEditModalOpen} animationType="slide" transparent={false}>
        <View style={styles.modalContainer}>
          <View style={styles.modalTopBar}>
            <Pressable onPress={() => setIsEditModalOpen(false)} style={styles.backBtn} hitSlop={10}>
              <AngleLeftIcon width={18} height={18} fill={colors.ink} />
            </Pressable>
            <Text style={styles.headerTitle}>Edit Profile</Text>
            <View style={{ width: 40 }} />
          </View>

          <ScrollView contentContainerStyle={styles.modalScroll} showsVerticalScrollIndicator={false}>
            <View style={styles.profileHeader}>
              <View style={styles.avatarWrapper}>
                <View style={styles.avatarPlaceholder}>
                  <UserIcon width={36} height={36} fill={colors.ink} />
                </View>
                <View style={styles.cameraBadge}>
                  <Text style={{ fontSize: 10 }}>📷</Text>
                </View>
              </View>
              <Text style={styles.userName}>{editForm.fullName}</Text>
              <Text style={styles.userHandle}>{editForm.username}</Text>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.inputLabel}>Full name</Text>
              <TextInput
                style={styles.input}
                value={editForm.fullName}
                onChangeText={(text) => setEditForm({ ...editForm, fullName: text })}
              />
            </View>

            <View style={styles.rowFields}>
              <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.inputLabel}>Gender</Text>
                <TextInput
                  style={styles.input}
                  value={editForm.gender}
                  onChangeText={(text) => setEditForm({ ...editForm, gender: text })}
                />
              </View>
              <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.inputLabel}>Birthday</Text>
                <TextInput
                  style={styles.input}
                  value={editForm.birthday}
                  onChangeText={(text) => setEditForm({ ...editForm, birthday: text })}
                />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.inputLabel}>Phone number</Text>
              <TextInput
                style={styles.input}
                value={editForm.phone}
                onChangeText={(text) => setEditForm({ ...editForm, phone: text })}
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={styles.input}
                value={editForm.email}
                onChangeText={(text) => setEditForm({ ...editForm, email: text })}
                keyboardType="email-address"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.inputLabel}>User name</Text>
              <TextInput
                style={styles.input}
                value={editForm.username}
                onChangeText={(text) => setEditForm({ ...editForm, username: text })}
              />
            </View>

            <Pressable style={styles.saveBtn} onPress={handleSaveProfile}>
              <Text style={styles.saveBtnText}>Save</Text>
            </Pressable>
          </ScrollView>
        </View>
      </Modal>

      {/* Floating Bottom Nav */}
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
  fillMint: { flex: 1, backgroundColor: colors.mint || '#A8DDD6' },
  topBar: { alignItems: 'center', justifyContent: 'center', paddingTop: 60, paddingBottom: 20, paddingHorizontal: 24 },
  modalTopBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 60, paddingBottom: 20, paddingHorizontal: 24 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.5)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '900', color: colors.ink || '#000' },
  scrollContent: { paddingHorizontal: 24, paddingBottom: 120 },
  profileHeader: { alignItems: 'center', marginVertical: 16 },
  avatarWrapper: { position: 'relative', marginBottom: 12 },
  avatarPlaceholder: { width: 80, height: 80, borderRadius: 40, backgroundColor: colors.white, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: colors.ink },
  cameraBadge: { position: 'absolute', bottom: 0, right: 0, backgroundColor: colors.white, borderRadius: 12, width: 24, height: 24, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: colors.ink },
  userName: { fontSize: 18, fontWeight: '900', color: colors.ink },
  userHandle: { fontSize: 12, fontWeight: '600', color: 'rgba(0,0,0,0.5)', marginTop: 2 },
  editProfileBtn: { backgroundColor: colors.ink, paddingHorizontal: 28, paddingVertical: 10, borderRadius: radii?.pill || 20, marginTop: 14 },
  editProfileBtnText: { color: colors.white, fontSize: 12, fontWeight: '800' },
  menuContainer: { backgroundColor: colors.white, borderRadius: 24, paddingVertical: 10, paddingHorizontal: 16, marginTop: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 3 },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  svgIcon: { marginRight: 12, marginLeft: 2 },
  adminLogoIcon: { width: 18, height: 18, marginRight: 10, marginLeft: 1 },
  menuLabel: { flex: 1, fontSize: 14, fontWeight: '700', color: colors.ink },
  divider: { height: 1, backgroundColor: '#EEEEEE', marginVertical: 4 },
  modalContainer: { flex: 1, backgroundColor: colors.mint || '#A8DDD6' },
  modalScroll: { paddingHorizontal: 24, paddingBottom: 40 },
  formGroup: { backgroundColor: colors.white, borderRadius: 16, paddingHorizontal: 16, paddingVertical: 10, marginBottom: 12 },
  rowFields: { flexDirection: 'row' },
  inputLabel: { fontSize: 10, fontWeight: '700', color: 'rgba(0,0,0,0.4)', marginBottom: 2 },
  input: { fontSize: 14, fontWeight: '800', color: colors.ink, padding: 0 },
  saveBtn: { backgroundColor: colors.ink, borderRadius: radii?.pill || 20, paddingVertical: 16, alignItems: 'center', marginTop: 16 },
  saveBtnText: { color: colors.white, fontSize: 14, fontWeight: '900' },
  bottomNavWrapper: { position: 'absolute', bottom: 35, left: 0, right: 0, alignItems: 'center' },
  bottomNav: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', backgroundColor: colors.white, width: '85%', borderRadius: 100, height: 65, paddingHorizontal: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 20, elevation: 10 },
  navItem: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingVertical: 10, borderRadius: radii?.pill || 20 },
  navItemActive: { backgroundColor: colors.mint || '#A8DDD6' },
  navLabel: { fontSize: 14, fontWeight: '900', color: colors.ink },
});