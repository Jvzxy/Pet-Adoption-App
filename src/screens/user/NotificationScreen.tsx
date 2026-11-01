import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { radii } from '../../constants/theme';
import { useAppPreferences, type AppColors } from '../../services/AppPreferencesContext';
import BottomNavigation from '../../components/BottomNavigation';
import { useAuth } from '../../services/AuthContext';
import { supabase } from '../../services/supabaseClient';

import ArrowLeftIcon from '../../images/Icons/arrow-left-solid-full.svg';
import CommentIcon from '../../images/Icons/comment-solid-full.svg';
import BoxIcon from '../../images/Icons/box-solid-full.svg';
import TagIcon from '../../images/Icons/tag-solid-full.svg';

interface ScreenProps {
  go: (next: string) => void;
}

interface NotificationItem {
  id: string;
  kind: string;
  title: string;
  message: string;
  created_at: string;
  read_at: string | null;
}

export default function NotificationScreen({ go }: ScreenProps) {
  const { colors } = useAppPreferences();
  const styles = createStyles(colors);
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadNotifications = useCallback(async () => {
    if (!user) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('notifications')
      .select('id, kind, title, message, created_at, read_at')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Could not load notifications:', error.message);
      setLoadError(error.message);
    } else {
      setLoadError(null);
      setNotifications((data ?? []) as NotificationItem[]);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    setLoading(true);
    void loadNotifications();
    if (!user) return;

    const channel = supabase
      .channel(`notifications-${user.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${user.id}`,
      }, () => void loadNotifications())
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [loadNotifications, user]);

  const markRead = async (id?: string) => {
    const previous = notifications;
    setNotifications((current) => current.map((item) =>
      !id || item.id === id ? { ...item, read_at: item.read_at ?? new Date().toISOString() } : item,
    ));
    const { error } = await supabase.rpc('mark_notifications_read', {
      p_notification_id: id ?? null,
    });
    if (error) {
      console.error('Could not mark notifications as read:', error.message);
      setNotifications(previous);
      Alert.alert('Update failed', error.message);
    }
  };

  const renderIcon = (kind: string) => {
    const iconProps = { width: 22, height: 22, fill: colors.ink };
    if (kind === 'order') return <BoxIcon {...iconProps} />;
    if (kind === 'adoption') return <TagIcon {...iconProps} />;
    if (kind === 'message') return <CommentIcon {...iconProps} />;
    return <Image source={require('../../images/Logo.png')} style={styles.logoIcon} resizeMode="contain" />;
  };

  return (
    <View style={styles.container}>
      <View style={styles.blackBanner}>
        <Pressable onPress={() => go('main')} style={styles.backBtn} hitSlop={10}>
          <ArrowLeftIcon width={20} height={20} fill={colors.ink} />
        </Pressable>
        <View style={styles.bannerCenter}>
          <Text style={styles.bannerTitle}>Notifications</Text>
          <Text style={styles.bannerSubtitle}>Recent updates & alerts</Text>
        </View>
        <Pressable style={styles.editBtn} onPress={() => void markRead()}>
          <Text style={styles.editText}>Read All</Text>
        </Pressable>
      </View>

      <ScrollView style={styles.scrollArea} contentContainerStyle={styles.scrollContent}>
        {loading ? <Text style={styles.emptyText}>Loading notifications...</Text> : null}
        {!loading && loadError ? <Text style={styles.errorText}>{loadError}</Text> : null}
        {!loading && !loadError && notifications.length === 0 ? (
          <Text style={styles.emptyText}>You do not have any notifications yet.</Text>
        ) : null}
        {notifications.map((item) => {
          const unread = !item.read_at;
          return (
            <Pressable
              key={item.id}
              style={[styles.notificationRow, unread && styles.notificationRowUnread]}
              onPress={() => unread && void markRead(item.id)}
            >
              <View style={[styles.iconCard, unread ? styles.iconCardUnread : styles.iconCardRead]}>
                {renderIcon(item.kind)}
              </View>
              <View style={styles.itemInfo}>
                <Text style={styles.itemTitle}>{item.title}</Text>
                <Text style={styles.itemMessage} numberOfLines={2}>{item.message}</Text>
                <Text style={styles.itemTime}>{new Date(item.created_at).toLocaleString()}</Text>
              </View>
              {unread ? <View style={styles.unreadDot} /> : null}
            </Pressable>
          );
        })}
      </ScrollView>

      <BottomNavigation activeTab="home" go={go} />
    </View>
  );
}

const createStyles = (colors: AppColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  blackBanner: { backgroundColor: colors.surface, paddingTop: 50, paddingBottom: 14, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', position: 'relative' },
  backBtn: { position: 'absolute', left: 16, bottom: 22, zIndex: 10 },
  bannerCenter: { alignItems: 'center' },
  bannerTitle: { color: colors.ink, fontSize: 16, fontWeight: '900', marginBottom: 4 },
  bannerSubtitle: { color: colors.textMuted, fontSize: 10, fontWeight: '600' },
  editBtn: { position: 'absolute', right: 16, bottom: 14 },
  editText: { color: colors.ink, fontSize: 11, fontWeight: '700' },
  scrollArea: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 112, gap: 10 },
  notificationRow: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: radii.md, backgroundColor: colors.cardBg, gap: 12 },
  notificationRowUnread: { backgroundColor: colors.white },
  iconCard: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  iconCardUnread: { backgroundColor: colors.mint },
  iconCardRead: { backgroundColor: colors.cardBg },
  logoIcon: { width: 26, height: 26, tintColor: colors.ink },
  itemInfo: { flex: 1 },
  itemTitle: { color: colors.ink, fontSize: 13, fontWeight: '800', marginBottom: 3 },
  itemMessage: { color: colors.textMuted, fontSize: 11, lineHeight: 16 },
  itemTime: { color: colors.textMuted, fontSize: 9, marginTop: 5 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.ink },
  emptyText: { color: colors.textMuted, textAlign: 'center', marginTop: 28 },
  errorText: { color: colors.red, textAlign: 'center', marginTop: 28 },
});
