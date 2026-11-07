import React, { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppPreferences, type AppColors } from '../services/AppPreferencesContext';

type ConsentChoice = 'all' | 'essential';

interface ConsentBannerProps {
  onOpenPolicies: () => void;
  forceVisible?: boolean;
  onChoiceSaved?: () => void;
}

const CONSENT_STORAGE_KEY = '@pawfect/privacy-consent:v1';

export default function ConsentBanner({
  onOpenPolicies,
  forceVisible = false,
  onChoiceSaved,
}: ConsentBannerProps) {
  const { colors } = useAppPreferences();
  const styles = createStyles(colors);
  const insets = useSafeAreaInsets();
  const [choice, setChoice] = useState<ConsentChoice | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let active = true;

    AsyncStorage.getItem(CONSENT_STORAGE_KEY)
      .then((storedChoice) => {
        if (!active) return;
        if (storedChoice === 'all' || storedChoice === 'essential') {
          setChoice(storedChoice);
        } else if (storedChoice !== null) {
          console.warn('Stored privacy choice is invalid; showing consent choices again.');
        }
        setIsReady(true);
      })
      .catch((error: unknown) => {
        console.error('Could not load privacy choices:', error);
        if (active) setIsReady(true);
      });

    return () => {
      active = false;
    };
  }, []);

  const saveChoice = async (nextChoice: ConsentChoice) => {
    if (isSaving) return;

    setIsSaving(true);
    try {
      await AsyncStorage.setItem(CONSENT_STORAGE_KEY, nextChoice);
      setChoice(nextChoice);
      onChoiceSaved?.();
    } catch (error) {
      console.error('Could not save privacy choice:', error);
      Alert.alert('Choice not saved', 'We could not save your privacy choice. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isReady || (!forceVisible && choice !== null)) return null;

  return (
    <View
      style={[styles.positioner, { bottom: Math.max(insets.bottom, 12) }]}
      accessibilityViewIsModal
    >
      <View style={styles.card}>
        <Text style={styles.title}>Privacy and cookie choices</Text>
        <Text style={styles.message}>
          Essential storage supports core app features. If optional cookies or similar technologies are used, choose whether to allow them. Your choice is saved on this device; you can change it later in Settings.
        </Text>

        <Pressable
          onPress={onOpenPolicies}
          style={styles.policyLink}
          accessibilityRole="link"
          accessibilityLabel="Review the privacy policy and cookie policy"
        >
          <Text style={styles.policyLinkText}>Review Privacy and Cookie Policies</Text>
        </Pressable>

        <View style={styles.actions}>
          <Pressable
            style={[styles.choiceButton, styles.essentialButton]}
            onPress={() => void saveChoice('essential')}
            disabled={isSaving}
            accessibilityRole="button"
            accessibilityLabel="Use only essential storage"
          >
            <Text style={styles.essentialButtonText}>Only Necessary</Text>
          </Pressable>
          <Pressable
            style={[styles.choiceButton, styles.acceptButton]}
            onPress={() => void saveChoice('all')}
            disabled={isSaving}
            accessibilityRole="button"
            accessibilityLabel="Allow optional cookies and similar technologies"
          >
            <Text style={styles.acceptButtonText}>{isSaving ? 'Saving...' : 'Allow Optional'}</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const createStyles = (colors: AppColors) => StyleSheet.create({
  positioner: { position: 'absolute', left: 16, right: 16, zIndex: 1000, elevation: 12 },
  card: { padding: 18, borderRadius: 20, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.18, shadowRadius: 12 },
  title: { color: colors.ink, fontSize: 16, fontWeight: '900', marginBottom: 8 },
  message: { color: colors.textMuted, fontSize: 13, lineHeight: 19 },
  policyLink: { alignSelf: 'flex-start', marginTop: 10, paddingVertical: 4 },
  policyLinkText: { color: colors.ink, fontSize: 13, fontWeight: '800', textDecorationLine: 'underline' },
  actions: { flexDirection: 'row', gap: 10, marginTop: 14 },
  choiceButton: { flex: 1, minHeight: 44, paddingHorizontal: 10, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  essentialButton: { borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  essentialButtonText: { color: colors.ink, fontSize: 13, fontWeight: '800' },
  acceptButton: { backgroundColor: colors.ink },
  acceptButtonText: { color: colors.isDark ? colors.background : colors.white, fontSize: 13, fontWeight: '800' },
});
