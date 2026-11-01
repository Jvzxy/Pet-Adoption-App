import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { radii, spacing } from '../../constants/theme';
import { useAppPreferences, type AppColors } from '../../services/AppPreferencesContext';
import BottomNavigation from '../../components/BottomNavigation';
import { useAuth } from '../../services/AuthContext';
import { supabase } from '../../services/supabaseClient';

import AngleLeftIcon from '../../images/Icons/angle-left-solid-full.svg';

interface ScreenProps {
  go: (next: string) => void;
}

interface Conversation {
  id: string;
  owner_id: string;
  displayName: string;
  preview: string;
  updated_at: string;
}

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string;
  created_at: string;
}

interface SupportContact {
  id: string;
  name: string;
  username: string;
}

export default function ChatScreen({ go }: ScreenProps) {
  const { colors } = useAppPreferences();
  const styles = createStyles(colors);
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [contacts, setContacts] = useState<SupportContact[]>([]);
  const [showContacts, setShowContacts] = useState(false);
  const [loadingContacts, setLoadingContacts] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshConversations = useCallback(async () => {
    if (!user || user.role !== 'admin') return;

    setError(null);
    const { data: rawConversations, error: conversationError } = await supabase
      .from('conversations')
      .select('id, owner_id, updated_at')
      .order('updated_at', { ascending: false });
    if (conversationError) throw conversationError;

    const ownerIds = [...new Set((rawConversations ?? []).map((item) => item.owner_id))];
    const [profileResult, messageResult] = ownerIds.length
      ? await Promise.all([
          supabase.from('users').select('id, name, username').in('id', ownerIds),
          supabase.from('messages').select('conversation_id, body, created_at')
            .order('created_at', { ascending: false }).limit(200),
        ])
      : [{ data: [], error: null }, { data: [], error: null }];

    if (profileResult.error) throw profileResult.error;
    if (messageResult.error) throw messageResult.error;

    const profiles = new Map((profileResult.data ?? []).map((profile) => [
      profile.id,
      profile.name || profile.username || profile.id,
    ]));
    const previews = new Map<string, string>();
    for (const message of messageResult.data ?? []) {
      if (!previews.has(message.conversation_id)) previews.set(message.conversation_id, message.body);
    }

    setConversations((rawConversations ?? []).map((item) => ({
      ...item,
      displayName: profiles.get(item.owner_id) ?? `Customer ${item.owner_id.slice(0, 8)}`,
      preview: previews.get(item.id) ?? 'No messages yet',
    })));
  }, [user]);

  const loadContacts = async () => {
    setLoadingContacts(true);
    setError(null);
    const { data, error: contactsError } = await supabase
      .from('users')
      .select('id, name, username')
      .eq('role', 'user')
      .order('name', { ascending: true });

    if (contactsError) {
      console.error('Could not load support contacts:', contactsError.message);
      setError(contactsError.message);
    } else {
      setContacts((data ?? []) as SupportContact[]);
      setShowContacts(true);
    }
    setLoadingContacts(false);
  };

  const startConversation = async (contact: SupportContact) => {
    setLoadingContacts(true);
    setError(null);
    const { data, error: startError } = await supabase.rpc(
      'admin_get_or_create_support_conversation',
      { p_owner_id: contact.id },
    );

    if (startError) {
      console.error('Could not start support conversation:', startError.message);
      setError(startError.message);
      setLoadingContacts(false);
      return;
    }

    setSelectedConversation({
      id: data,
      owner_id: contact.id,
      displayName: contact.name || contact.username,
      preview: '',
      updated_at: new Date().toISOString(),
    });
    setShowContacts(false);
    setLoadingContacts(false);
  };

  useEffect(() => {
    let active = true;
    const initialize = async () => {
      if (!user) {
        setError('Sign in to use support chat.');
        setLoading(false);
        return;
      }

      try {
        if (user.role === 'admin') {
          await refreshConversations();
        } else {
          const { data, error: conversationError } = await supabase.rpc('get_or_create_support_conversation');
          if (conversationError) throw conversationError;
          if (active) {
            setSelectedConversation({
              id: data,
              owner_id: user.id,
              displayName: 'Pawfect Support',
              preview: '',
              updated_at: new Date().toISOString(),
            });
          }
        }
      } catch (loadError) {
        console.error('Could not initialize support chat:', loadError);
        if (active) setError(loadError instanceof Error ? loadError.message : 'Could not load support chat.');
      } finally {
        if (active) setLoading(false);
      }
    };

    setLoading(true);
    void initialize();
    return () => {
      active = false;
    };
  }, [refreshConversations, user]);

  useEffect(() => {
    if (!user || user.role !== 'admin') return;
    const channel = supabase
      .channel(`admin-conversations-${user.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'conversations' }, () => {
        void refreshConversations().catch((refreshError: unknown) => {
          console.error('Could not refresh support conversations:', refreshError);
        });
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, () => {
        void refreshConversations().catch((refreshError: unknown) => {
          console.error('Could not refresh support messages:', refreshError);
        });
      })
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [refreshConversations, user]);

  useEffect(() => {
    const conversationId = selectedConversation?.id;
    if (!conversationId) {
      setMessages([]);
      return;
    }

    let active = true;
    const loadMessages = async () => {
      const { data, error: messageError } = await supabase
        .from('messages')
        .select('id, conversation_id, sender_id, body, created_at')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (messageError) throw messageError;
      if (active) setMessages((data ?? []) as Message[]);
    };

    void loadMessages().catch((loadError: unknown) => {
      console.error('Could not load support messages:', loadError);
      if (active) setError(loadError instanceof Error ? loadError.message : 'Could not load messages.');
    });

    const channel = supabase
      .channel(`conversation-messages-${conversationId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`,
      }, () => {
        void loadMessages().catch((loadError: unknown) => {
          console.error('Could not refresh support messages:', loadError);
        });
      })
      .subscribe();

    return () => {
      active = false;
      void supabase.removeChannel(channel);
    };
  }, [selectedConversation?.id]);

  const sendMessage = async () => {
    const body = draft.trim();
    if (!body || !selectedConversation || sending) return;

    setSending(true);
    const { error: sendError } = await supabase.rpc('send_support_message', {
      p_conversation_id: selectedConversation.id,
      p_body: body,
    });
    setSending(false);
    if (sendError) {
      console.error('Could not send support message:', sendError.message);
      Alert.alert('Message not sent', sendError.message);
      return;
    }
    setDraft('');
  };

  const isAdmin = user?.role === 'admin';
  const showingThread = !isAdmin || selectedConversation !== null;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={12}
    >
      <View style={styles.topBar}>
        {isAdmin && selectedConversation ? (
          <Pressable onPress={() => setSelectedConversation(null)} hitSlop={10}>
            <AngleLeftIcon width={20} height={20} fill={colors.ink} />
          </Pressable>
        ) : null}
        <Text style={[styles.title, isAdmin && !selectedConversation && styles.inboxTitle]}>
          {isAdmin ? selectedConversation?.displayName ?? 'Support conversations' : 'Pawfect Support'}
        </Text>
        {isAdmin && !selectedConversation ? (
          <View style={styles.headerActions}>
            <Pressable
              style={styles.headerButton}
              onPress={() => void refreshConversations().catch((refreshError: unknown) => {
                console.error('Could not refresh support conversations:', refreshError);
                setError(refreshError instanceof Error ? refreshError.message : 'Could not refresh conversations.');
              })}
            >
              <Text style={styles.headerButtonText}>Refresh</Text>
            </Pressable>
            <Pressable
              style={styles.headerButton}
              onPress={() => void loadContacts()}
              disabled={loadingContacts}
            >
              <Text style={styles.headerButtonText}>
                {loadingContacts ? 'Loading...' : 'New'}
              </Text>
            </Pressable>
          </View>
        ) : null}
      </View>

      <View style={styles.contentArea}>
        {error ? (
          <View style={styles.stateContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <Text style={styles.stateHint}>Check that the latest supabase/schema.sql has been run, then refresh.</Text>
          </View>
        ) : loading ? (
          <Text style={styles.statusText}>Loading messages...</Text>
        ) : showingThread ? (
          <>
            <ScrollView style={styles.messageScroll} contentContainerStyle={styles.messageList}>
              {messages.length === 0 ? (
                <Text style={styles.statusText}>Send a message to start a conversation with support.</Text>
              ) : messages.map((message) => {
                const ownMessage = message.sender_id === user?.id;
                return (
                  <View key={message.id} style={[styles.messageBubble, ownMessage ? styles.ownMessage : styles.otherMessage]}>
                    <Text style={[styles.messageText, ownMessage && styles.ownMessageText]}>{message.body}</Text>
                    <Text style={[styles.messageTime, ownMessage && styles.ownMessageText]}>
                      {new Date(message.created_at).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                    </Text>
                  </View>
                );
              })}
            </ScrollView>
            <View style={styles.composer}>
              <TextInput
                style={styles.input}
                value={draft}
                onChangeText={setDraft}
                placeholder="Write a message..."
                multiline
                maxLength={4000}
              />
              <Pressable style={[styles.sendButton, (!draft.trim() || sending) && styles.disabled]} onPress={() => void sendMessage()} disabled={!draft.trim() || sending}>
                <Text style={styles.sendText}>{sending ? '...' : 'Send'}</Text>
              </Pressable>
            </View>
          </>
        ) : showContacts ? (
          <ScrollView style={styles.messageScroll} contentContainerStyle={styles.conversationList}>
            <Text style={styles.stateHint}>Choose a customer to start a support conversation.</Text>
            {contacts.length === 0 ? (
              <Text style={styles.statusText}>No customer accounts were found.</Text>
            ) : contacts.map((contact) => (
              <Pressable
                key={contact.id}
                style={styles.conversationRow}
                disabled={loadingContacts}
                onPress={() => void startConversation(contact)}
              >
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{(contact.name || contact.username).slice(0, 1).toUpperCase()}</Text>
                </View>
                <View style={styles.conversationInfo}>
                  <Text style={styles.conversationName}>{contact.name || contact.username}</Text>
                  <Text style={styles.preview}>{contact.username}</Text>
                </View>
              </Pressable>
            ))}
          </ScrollView>
        ) : conversations.length === 0 ? (
          <View style={[styles.emptyState, styles.messageScroll]}>
            <Text style={styles.statusText}>No support conversations yet.</Text>
            <Text style={styles.stateHint}>
              Start a conversation with a customer using New, or ask a customer to open Chat and send a message.
            </Text>
          </View>
        ) : (
          <ScrollView style={styles.messageScroll} contentContainerStyle={styles.conversationList}>
            {conversations.map((conversation) => (
              <Pressable key={conversation.id} style={styles.conversationRow} onPress={() => setSelectedConversation(conversation)}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{conversation.displayName.slice(0, 1).toUpperCase()}</Text>
                </View>
                <View style={styles.conversationInfo}>
                  <Text style={styles.conversationName}>{conversation.displayName}</Text>
                  <Text style={styles.preview} numberOfLines={1}>{conversation.preview}</Text>
                </View>
                <Text style={styles.messageTime}>{new Date(conversation.updated_at).toLocaleDateString()}</Text>
              </Pressable>
            ))}
          </ScrollView>
        )}
      </View>

      <BottomNavigation activeTab="chat" go={go} />
    </KeyboardAvoidingView>
  );
}

const createStyles = (colors: AppColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  topBar: { minHeight: 84, paddingTop: 48, paddingHorizontal: spacing.lg, paddingBottom: 14, flexDirection: 'row', alignItems: 'center', gap: 12 },
  contentArea: { flex: 1, paddingBottom: 105 },
  title: { color: colors.ink, fontSize: 20, fontWeight: '900' },
  inboxTitle: { flexShrink: 1, fontSize: 18 },
  headerActions: { marginLeft: 'auto', flexDirection: 'row', gap: 8 },
  headerButton: { backgroundColor: colors.white, borderRadius: radii.pill, paddingVertical: 8, paddingHorizontal: 12 },
  headerButtonText: { color: colors.ink, fontSize: 11, fontWeight: '800' },
  statusText: { color: colors.textMuted, textAlign: 'center', marginTop: 28, paddingHorizontal: 24 },
  errorText: { color: '#A12626', textAlign: 'center', marginTop: 28, paddingHorizontal: 24 },
  stateContainer: { alignItems: 'center', paddingHorizontal: spacing.lg },
  stateHint: { color: colors.textMuted, textAlign: 'center', paddingHorizontal: 24, marginTop: 10, marginBottom: 12, fontSize: 12, lineHeight: 18 },
  emptyState: { alignItems: 'center', paddingTop: 24 },
  messageScroll: { flex: 1 },
  messageList: { flexGrow: 1, paddingHorizontal: spacing.lg, paddingVertical: 16, gap: 10 },
  messageBubble: { maxWidth: '84%', borderRadius: 16, paddingHorizontal: 14, paddingVertical: 10 },
  ownMessage: { alignSelf: 'flex-end', backgroundColor: colors.isDark ? '#35635E' : colors.ink },
  otherMessage: { alignSelf: 'flex-start', backgroundColor: colors.white },
  messageText: { color: colors.ink, fontSize: 13, lineHeight: 19 },
  ownMessageText: { color: '#FFFFFF' },
  messageTime: { color: colors.textMuted, fontSize: 9, marginTop: 5 },
  composer: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, padding: 12, backgroundColor: colors.white },
  input: { flex: 1, maxHeight: 110, minHeight: 42, borderRadius: radii.md, backgroundColor: colors.cardBg, paddingHorizontal: 12, paddingVertical: 10, color: colors.ink },
  sendButton: { backgroundColor: colors.ink, borderRadius: radii.pill, paddingHorizontal: 18, paddingVertical: 12 },
  disabled: { opacity: 0.5 },
  sendText: { color: colors.white, fontWeight: '800', fontSize: 12 },
  conversationList: { paddingHorizontal: spacing.lg, paddingBottom: 16, gap: 8 },
  conversationRow: { flexDirection: 'row', alignItems: 'center', padding: 13, backgroundColor: colors.white, borderRadius: radii.md, gap: 11 },
  avatar: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', backgroundColor: '#B2DFDB' },
  avatarText: { color: colors.ink, fontSize: 17, fontWeight: '900' },
  conversationInfo: { flex: 1 },
  conversationName: { color: colors.ink, fontSize: 13, fontWeight: '800', marginBottom: 4 },
  preview: { color: colors.textMuted, fontSize: 11 },
});
