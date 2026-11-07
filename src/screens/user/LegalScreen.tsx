import React from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useAppPreferences, type AppColors } from '../../services/AppPreferencesContext';
import AngleLeftIcon from '../../images/Icons/angle-left-solid-full.svg';

interface ScreenProps {
  go: (next: string) => void;
  returnTo?: string;
}

const APP_NAME = 'Pet Adoption App';
const SUPPORT_EMAIL = 'support@yourdomain.com';

const POLICIES = [
  {
    title: 'Privacy Policy',
    sections: [
      {
        heading: 'Information we collect',
        body: `Depending on the features you use, ${APP_NAME} may collect account and contact details, adoption applications and communications, transaction records, and information you choose to provide. Device, diagnostic, and approximate location information may also be processed when needed for a feature and when you grant permission. Before publishing, list the exact data collected by the app and its service providers.`,
      },
      {
        heading: 'How we use information',
        body: 'We use information to operate accounts, facilitate pet adoption inquiries, provide customer support, process payments through the selected payment provider, protect the service, and meet legal obligations. Identify any additional purposes and obtain consent where required by law.',
      },
      {
        heading: 'Sharing and service providers',
        body: 'Information may be shared with participating shelters, rescues, or other adoption partners when needed to process an inquiry, and with contracted providers that support hosting, communications, analytics, or payments. Name the actual partners and providers before publication. Describe whether personal information is sold or shared for targeted advertising and list the choices available under applicable law.',
      },
      {
        heading: 'Location, photos, and permissions',
        body: 'Location or photo access should be requested only for a feature the user chooses to use. You can manage device permissions in your operating-system settings. Explain whether data is stored, how long it is retained, and whether it is shared.',
      },
      {
        heading: 'Retention, security, and your choices',
        body: 'State the retention periods and safeguards actually used, subject to legal and operational requirements. No method of storage or transmission is completely secure. Depending on your location, you may have rights to access, correct, delete, or restrict certain information. Contact us to make a request; identity verification may be required.',
      },
      {
        heading: 'Children and contact',
        body: 'This service is not intended for children to create accounts or submit personal information without any consent required by applicable law. Add the age threshold and parental-consent process that apply in your jurisdiction. Privacy questions and requests: ' + SUPPORT_EMAIL + '.',
      },
    ],
  },
  {
    title: 'Terms of Service',
    sections: [
      {
        heading: 'Using the service',
        body: `By using ${APP_NAME}, you agree to these terms and applicable law. You must provide accurate information, protect your account credentials, and use the app lawfully. Insert any minimum-age requirement and the legal name of the service operator before publication.`,
      },
      {
        heading: 'Adoption inquiries and decisions',
        body: 'The app helps users discover pets and communicate with adoption organizations. Submitting an inquiry or application does not guarantee approval or adoption. The shelter, rescue, or other responsible organization makes its own eligibility and placement decisions and may require interviews, references, home checks, or additional agreements. The final adoption agreement is between the adopter and the responsible organization.',
      },
      {
        heading: 'Pet information and fees',
        body: 'Pet descriptions, availability, health, and behavior information are provided by the relevant organization and may change. Confirm important details directly before adopting; the app is not a substitute for veterinary advice. Any adoption fee, product price, taxes, and other charges must be shown before payment and are subject to the applicable refund policy and law.',
      },
      {
        heading: 'Acceptable use and content',
        body: 'Do not submit false, unlawful, abusive, or misleading information; interfere with the service; or misuse another person’s information. You are responsible for content you submit and must have permission to share it. Describe how reports, moderation, and account restrictions are handled.',
      },
      {
        heading: 'Availability, disclaimers, and liability',
        body: 'The service is provided subject to applicable consumer-protection laws. To the extent permitted by law, we do not guarantee uninterrupted availability or the accuracy of third-party pet listings, and we disclaim implied warranties that may lawfully be excluded. State the operator’s liability limits and governing law here only after jurisdiction-specific legal review.',
      },
      {
        heading: 'Changes and contact',
        body: 'We may update these terms and will provide notice when required. Continued use after an effective update constitutes acceptance only where permitted by law. Questions: ' + SUPPORT_EMAIL + '.',
      },
    ],
  },
  {
    title: 'Cookie Policy',
    sections: [
      {
        heading: 'Cookies and similar technologies',
        body: 'Native mobile apps do not necessarily use browser cookies. Cookies or similar technologies may be used on our website, in web-based content, or by embedded services. Verify what this app and each SDK actually use before publishing this policy.',
      },
      {
        heading: 'Purposes and choices',
        body: 'Where used, strictly necessary technologies may support core functionality; optional analytics or advertising technologies should be described separately. Explain how users can accept, reject, or change optional preferences, and how browser or device settings affect them. Obtain consent before setting non-essential cookies where required by law.',
      },
      {
        heading: 'Third parties and contact',
        body: 'List the actual third-party providers, their purposes, and links to their notices. Do not list technologies that are not in use. Questions: ' + SUPPORT_EMAIL + '.',
      },
    ],
  },
  {
    title: 'Refund Policy',
    sections: [
      {
        heading: 'Adoption-related fees',
        body: 'Any adoption fee is set by the responsible shelter, rescue, or adoption partner. Before payment, show who receives the fee, what it covers, and whether it is refundable or transferable. Do not describe a fee as non-refundable if that would conflict with applicable law or the agreement with the adoption partner.',
      },
      {
        heading: 'Products and other payments',
        body: 'For products or other paid services, display the applicable cancellation, return, and refund terms before checkout. Explain how to report a duplicate or unauthorized charge and how payment-provider processing times may affect a refund.',
      },
      {
        heading: 'How to request help',
        body: `Contact ${SUPPORT_EMAIL} with your order or application reference and a description of the issue. We will direct the request to the responsible organization or payment provider when appropriate. Nothing in this policy limits consumer rights that cannot be waived under applicable law.`,
      },
    ],
  },
];

export default function LegalScreen({ go, returnTo = 'settings' }: ScreenProps) {
  const { colors } = useAppPreferences();
  const styles = createStyles(colors);

  const requestDataDeletion = () => {
    Alert.alert(
      'Request data deletion?',
      `This app does not submit deletion requests or delete data automatically. To submit a request, contact ${SUPPORT_EMAIL}. Continuing will not send a request or delete data.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Understood' },
      ],
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Pressable
          onPress={() => go(returnTo)}
          style={styles.backBtn}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="Back to settings"
        >
          <AngleLeftIcon width={18} height={18} fill={colors.ink} />
        </Pressable>
        <Text style={styles.headerTitle}>Legal & Policies</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.sheetContainer}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.notice}>
            Draft templates only. Replace placeholders, confirm every statement matches your actual data practices and partner agreements, and obtain legal review for the countries where you operate before publishing.
          </Text>

          {POLICIES.map((policy) => (
            <View key={policy.title} style={styles.policy}>
              <Text style={styles.policyTitle}>{policy.title}</Text>
              <Text style={styles.lastUpdated}>Effective date: [insert publication date]</Text>
              {policy.sections.map((section) => (
                <View key={section.heading} style={styles.section}>
                  <Text style={styles.heading}>{section.heading}</Text>
                  <Text style={styles.paragraph}>{section.body}</Text>
                </View>
              ))}
            </View>
          ))}

          <View style={styles.businessSection}>
            <Text style={styles.policyTitle}>Business Details</Text>
            <Text style={styles.businessLabel}>App name</Text>
            <Text style={styles.paragraph}>{APP_NAME}</Text>
            <Text style={styles.businessLabel}>Contact email</Text>
            <Text style={styles.paragraph}>
              {SUPPORT_EMAIL} (replace with your monitored business email before publishing)
            </Text>
            <Text style={styles.businessLabel}>Legal business / charity name</Text>
            <Text style={styles.paragraph}>[Insert the operator’s registered name and business address]</Text>
          </View>

          <View style={styles.deletionSection}>
            <Text style={styles.heading}>Your data</Text>
            <Text style={styles.paragraph}>
              Use the button below for instructions on how to submit an account and personal-data deletion request.
            </Text>
            <Pressable
              style={styles.deletionButton}
              onPress={requestDataDeletion}
              accessibilityRole="button"
              accessibilityLabel="Request account and data deletion"
            >
              <Text style={styles.deletionButtonText}>Request Data Deletion</Text>
            </Pressable>
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const createStyles = (colors: AppColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 60, paddingBottom: 24, paddingHorizontal: 24 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.5)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '900', color: colors.ink },
  headerSpacer: { width: 40 },
  sheetContainer: { flex: 1, backgroundColor: colors.surface, borderTopLeftRadius: 32, borderTopRightRadius: 32, shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 5 },
  content: { paddingHorizontal: 28, paddingTop: 28, paddingBottom: 60 },
  notice: { fontSize: 13, color: colors.ink, lineHeight: 21, padding: 16, marginBottom: 28, borderRadius: 16, backgroundColor: colors.background },
  policy: { marginBottom: 24 },
  policyTitle: { fontSize: 20, fontWeight: '900', color: colors.ink, marginBottom: 8 },
  lastUpdated: { fontSize: 12, fontWeight: '700', color: colors.textMuted, marginBottom: 20, textTransform: 'uppercase', letterSpacing: 0.5 },
  section: { marginBottom: 20 },
  heading: { fontSize: 16, fontWeight: '900', color: colors.ink, marginBottom: 8 },
  paragraph: { fontSize: 14, color: colors.textMuted, lineHeight: 23, fontWeight: '500' },
  businessSection: { paddingTop: 24, marginBottom: 28, borderTopWidth: 1, borderTopColor: colors.border },
  businessLabel: { fontSize: 13, fontWeight: '800', color: colors.ink, marginTop: 12, marginBottom: 4 },
  deletionSection: { padding: 18, borderRadius: 18, backgroundColor: colors.background },
  deletionButton: { marginTop: 16, paddingVertical: 14, paddingHorizontal: 18, borderRadius: 14, backgroundColor: colors.red, alignItems: 'center' },
  deletionButtonText: { color: colors.white, fontSize: 14, fontWeight: '900' },
});
