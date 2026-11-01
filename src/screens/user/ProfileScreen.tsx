import React, { useState, useEffect } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { radii } from '../../constants/theme';
import BottomNavigation from '../../components/BottomNavigation';
import { useAuth } from '../../services/AuthContext';
import { useAppPreferences, type AppColors } from '../../services/AppPreferencesContext';

// SVG & Image Icon Imports
import AngleLeftIcon from '../../images/Icons/angle-left-solid-full.svg';
import LogoutIcon from '../../images/Icons/right-from-bracket-solid-full.svg';
import UserIcon from '../../images/Icons/user-solid-full.svg';
import LocationIcon from '../../images/Icons/location-dot-solid-full.svg';
import AngleRightIcon from '../../images/Icons/angle-right-solid-full (1).svg';
import CircleQuestionIcon from '../../images/Icons/circle-question-regular-full.svg';
import GearIcon from '../../images/Icons/gear-solid-full.svg';
import ClipboardListIcon from '../../images/Icons/clipboard-list-solid-full.svg';
import LockIcon from '../../images/Icons/lock-solid-full.svg';

interface ScreenProps {
  go: (next: string) => void;
}

export default function ProfileScreen({ go }: ScreenProps) {
  const { user, logout, updateProfile } = useAuth();
  const { colors } = useAppPreferences();
  const styles = createStyles(colors);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const [profile, setProfile] = useState({
    fullName: user?.name || user?.username || 'Guest User',
    username: user?.displayUsername || user?.username || '@guest',
    phone: user?.phone || '',
    email: user?.email || 'Not specified',
  });

  const [editForm, setEditForm] = useState(profile);

  useEffect(() => {
    if (user) {
      setProfile((prev) => ({
        ...prev,
        fullName: user.name || user.username || 'Guest User',
        username: user.displayUsername || user.username || '@guest',
        email: user.email || 'Not specified',
        phone: user.phone || '',
      }));
    }
  }, [user]);

  const handleSaveProfile = async () => {
    const fullName = editForm.fullName.trim();
    const username = editForm.username.trim();
    const phone = editForm.phone.trim();
    if (!fullName || !username || !phone) {
      Alert.alert('Required fields', 'Full name, username, and phone number are required.');
      return;
    }

    setIsSavingProfile(true);
    try {
      await updateProfile({
        name: fullName,
        displayUsername: username,
        phone,
      });
      setProfile({ ...editForm, fullName, username, phone });
      setIsEditModalOpen(false);
      Alert.alert('Profile Updated', 'Your profile was saved to your Supabase account.');
    } catch (error) {
      console.error('Profile Save Error:', error);
      Alert.alert(
        'Save Failed',
        error instanceof Error ? error.message : 'Your profile could not be saved. Please try again.',
      );
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleLogout = () => {
    logout(); // Trigger AuthContext logout[cite: 50]
    go('login');
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

        {user?.role === 'admin' && (
          <View style={styles.adminTools}>
            <Text style={styles.adminToolsTitle}>ADMIN TOOLS</Text>
            <Pressable style={styles.adminToolButton} onPress={() => go('adminAddCat')}>
              <Text style={styles.adminToolButtonText}>Add a cat</Text>
              <AngleRightIcon width={12} height={12} fill={colors.ink} />
            </Pressable>
            <Pressable style={styles.adminToolButton} onPress={() => go('adminAddProduct')}>
              <Text style={styles.adminToolButtonText}>Add a product</Text>
              <AngleRightIcon width={12} height={12} fill={colors.ink} />
            </Pressable>
            <Pressable style={styles.adminToolButton} onPress={() => go('adminAdoptions')}>
              <Text style={styles.adminToolButtonText}>Review adoption applications</Text>
              <AngleRightIcon width={12} height={12} fill={colors.ink} />
            </Pressable>
            <Pressable style={styles.adminToolButton} onPress={() => go('adminDeliveries')}>
              <Text style={styles.adminToolButtonText}>Manage deliveries</Text>
              <AngleRightIcon width={12} height={12} fill={colors.ink} />
            </Pressable>
          </View>
        )}
        {user?.role === 'driver' && (
          <View style={styles.adminTools}>
            <Text style={styles.adminToolsTitle}>DRIVER</Text>
            <Text style={styles.availabilityText}>
              Availability: {user.isAvailable ? 'Active and available' : 'Off duty'}
            </Text>
            <Pressable style={styles.adminToolButton} onPress={() => go('driverDeliveries')}>
              <Text style={styles.adminToolButtonText}>My Deliveries / Availability</Text>
              <AngleRightIcon width={12} height={12} fill={colors.ink} />
            </Pressable>
          </View>
        )}

        {/* CLICKABLE MENU OPTIONS */}
        <View style={styles.menuContainer}>
          <Pressable style={styles.menuItem} onPress={() => go('settings')}>
            <GearIcon width={16} height={16} fill={colors.ink} style={styles.svgIcon} />
            <Text style={styles.menuLabel}>Settings</Text>
            <AngleRightIcon width={12} height={12} fill="rgba(0,0,0,0.3)" />
          </Pressable>

          {user?.role === 'user' && (
            <Pressable style={styles.menuItem} onPress={() => go('myOrders')}>
              <ClipboardListIcon width={16} height={16} fill={colors.ink} style={styles.svgIcon} />
              <Text style={styles.menuLabel}>My Orders</Text>
              <AngleRightIcon width={12} height={12} fill="rgba(0,0,0,0.3)" />
            </Pressable>
          )}

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

          <Pressable style={[styles.menuItem, { borderBottomWidth: 0 }]} onPress={handleLogout}>
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

            <View style={styles.formGroup}>
              <Text style={styles.inputLabel}>Phone number</Text>
              <TextInput
                style={styles.input}
                value={editForm.phone}
                onChangeText={(text) => setEditForm({ ...editForm, phone: text })}
                keyboardType="phone-pad"
                placeholder="Required"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.inputLabel}>Account email</Text>
              <TextInput
                style={styles.input}
                value={editForm.email}
                keyboardType="email-address"
                editable={false}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.inputLabel}>User name</Text>
              <TextInput
                style={styles.input}
                value={editForm.username}
                onChangeText={(text) => setEditForm({ ...editForm, username: text })}
                placeholder="Required"
              />
            </View>

            <Pressable style={styles.saveBtn} onPress={() => void handleSaveProfile()} disabled={isSavingProfile}>
              <Text style={styles.saveBtnText}>{isSavingProfile ? 'Saving...' : 'Save'}</Text>
            </Pressable>
          </ScrollView>
        </View>
      </Modal>

      <BottomNavigation activeTab="profile" go={go} />
    </View>
  );
}

const createStyles = (colors: AppColors) => StyleSheet.create({
  fillMint: { flex: 1, backgroundColor: colors.background },
  topBar: { alignItems: 'center', justifyContent: 'center', paddingTop: 60, paddingBottom: 20, paddingHorizontal: 24 },
  modalTopBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 60, paddingBottom: 20, paddingHorizontal: 24 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.5)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '900', color: colors.ink || '#000' },
  scrollContent: { paddingHorizontal: 24, paddingBottom: 120 },
  profileHeader: { alignItems: 'center', marginVertical: 16 },
  avatarWrapper: { position: 'relative', marginBottom: 12 },
  avatarPlaceholder: { width: 80, height: 80, borderRadius: 40, backgroundColor: colors.surface, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: colors.ink },
  cameraBadge: { position: 'absolute', bottom: 0, right: 0, backgroundColor: colors.surface, borderRadius: 12, width: 24, height: 24, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: colors.ink },
  userName: { fontSize: 18, fontWeight: '900', color: colors.ink },
  userHandle: { fontSize: 12, fontWeight: '600', color: 'rgba(0,0,0,0.5)', marginTop: 2 },
  editProfileBtn: { backgroundColor: colors.ink, paddingHorizontal: 28, paddingVertical: 10, borderRadius: radii?.pill || 20, marginTop: 14 },
  editProfileBtnText: { color: colors.white, fontSize: 12, fontWeight: '800' },
  adminTools: { backgroundColor: colors.surface, borderRadius: 20, paddingHorizontal: 16, paddingTop: 14, paddingBottom: 6, marginBottom: 8, borderWidth: 1, borderColor: colors.border },
  adminToolsTitle: { marginBottom: 6, color: colors.ink, fontSize: 11, fontWeight: '900', letterSpacing: 1 },
  availabilityText: { color: colors.ink, fontSize: 13, fontWeight: '800', paddingVertical: 8 },
  adminToolButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, borderTopWidth: 1, borderTopColor: colors.border },
  adminToolButtonText: { color: colors.ink, fontSize: 14, fontWeight: '800' },
  menuContainer: { backgroundColor: colors.surface, borderRadius: 24, paddingVertical: 10, paddingHorizontal: 16, marginTop: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 3 },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.border },
  svgIcon: { marginRight: 12, marginLeft: 2 },
  menuLabel: { flex: 1, fontSize: 14, fontWeight: '700', color: colors.ink },
  divider: { height: 1, backgroundColor: '#EEEEEE', marginVertical: 4 },
  modalContainer: { flex: 1, backgroundColor: colors.background },
  modalScroll: { paddingHorizontal: 24, paddingBottom: 40 },
  formGroup: { backgroundColor: colors.surface, borderRadius: 16, paddingHorizontal: 16, paddingVertical: 10, marginBottom: 12 },
  inputLabel: { fontSize: 10, fontWeight: '700', color: colors.textMuted, marginBottom: 2 },
  input: { fontSize: 14, fontWeight: '800', color: colors.ink, padding: 0 },
  saveBtn: { backgroundColor: colors.ink, borderRadius: radii?.pill || 20, paddingVertical: 16, alignItems: 'center', marginTop: 16 },
  saveBtnText: { color: colors.white, fontSize: 14, fontWeight: '900' },
});