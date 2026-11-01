/**
 * PLACEHOLDER LEGAL TEXT — written to reflect UK GDPR / Data Protection Act 2018
 * principles, but it must be reviewed by a qualified solicitor and completed
 * with your real business details (marked [IN BRACKETS]) before launch.
 */

export const LEGAL_LAST_UPDATED = '1 November 2026';

export const CHAT_DISCLAIMER =
  'Advice provided in this chat is for general informational purposes only and does not constitute personal training, medical, or nutritional advice tailored to your individual circumstances. Always consult a qualified health professional before making changes to your diet or exercise programme.';

export const ICO_NOTICE = 'ProjectBuilt is registered with the ICO under the UK Data Protection Act 2018.';

export interface LegalSection {
  heading: string;
  body: string;
}

export const PRIVACY_POLICY: LegalSection[] = [
  {
    heading: '1. Who we are',
    body:
      'ProjectBuilt ("we", "us", "our") is operated by [BUSINESS NAME], [REGISTERED ADDRESS], United Kingdom. We are the data controller for the personal data processed through the ProjectBuilt app. We are registered with the Information Commissioner\'s Office (ICO) under registration number [ICO NUMBER]. Contact us at [PRIVACY EMAIL].',
  },
  {
    heading: '2. The data we collect',
    body:
      '• Account data: email address, username, and authentication identifiers if you sign in with Apple or Google.\n• Profile and questionnaire answers: fitness goal, training days, fitness level, equipment, biological sex, age and body weight (all optional).\n• Health screening: your PAR-Q completion status and whether you were advised to consult a GP. We store only the outcome, not your individual answers.\n• Training data: workout templates, workout logs, ratings and notes.\n• Body weight logs.\n• Chat messages you send to our coach (Premium).\n• Subscription status provided by our payments processor (we never receive your card details).',
  },
  {
    heading: '3. Special category data',
    body:
      'Some information you provide (such as health screening outcomes, body weight and biological sex) may be considered health data, which is "special category data" under UK GDPR. We process this only with your explicit consent, which you give when you choose to provide it. You can withdraw consent at any time by deleting the data or your account.',
  },
  {
    heading: '4. Why we use your data and our lawful basis',
    body:
      '• To provide the app and your account (performance of a contract).\n• To personalise recommendations and content (consent, which you can withdraw).\n• To process and manage subscriptions (performance of a contract).\n• To respond to Premium chat messages (performance of a contract).\n• To keep the service secure and fix problems (legitimate interests).\n• To meet legal obligations, e.g. tax records for purchases (legal obligation).',
  },
  {
    heading: '5. Who we share data with',
    body:
      'We do not sell your data. We share it only with processors who help us run the service, under data processing agreements:\n• Supabase — database, authentication and hosting (data stored in the EU).\n• RevenueCat — subscription management (receives an anonymous user ID and purchase receipts).\n• Apple / Google — if you choose to sign in with them or purchase through their stores.\nWe do not use third-party advertising or analytics trackers.',
  },
  {
    heading: '6. International transfers',
    body:
      'Our primary data is stored in the European Economic Area, which the UK recognises as providing adequate protection. Where a processor transfers data outside the UK/EEA (e.g. RevenueCat in the USA), we rely on the UK International Data Transfer Addendum or the UK–US Data Bridge.',
  },
  {
    heading: '7. How long we keep it',
    body:
      'We keep your data for as long as your account is active. When you delete your account, all your personal data is permanently deleted from our database immediately. Backups are overwritten within [30] days. Purchase records may be retained by Apple/Google/RevenueCat as required by law.',
  },
  {
    heading: '8. Your rights',
    body:
      'Under UK GDPR you have the right to: access your data; rectify inaccurate data; erasure ("right to be forgotten") — available instantly via Profile → Delete account; restrict or object to processing; data portability; and withdraw consent at any time. To exercise any right, email [PRIVACY EMAIL]. We will respond within one month.',
  },
  {
    heading: '9. Children',
    body: 'ProjectBuilt is intended for users aged 16 and over. We do not knowingly collect data from children under 16.',
  },
  {
    heading: '10. Security',
    body:
      'Your session is stored in your device\'s encrypted secure storage. All data is sent over encrypted connections, and row-level security ensures you can only access your own records.',
  },
  {
    heading: '11. Complaints',
    body:
      'If you are unhappy with how we handle your data, please contact us first. You also have the right to complain to the Information Commissioner\'s Office (ICO): ico.org.uk/make-a-complaint or 0303 123 1113.',
  },
  {
    heading: '12. Changes to this policy',
    body: 'We will notify you in the app of any material changes to this policy.',
  },
];

export const TERMS: LegalSection[] = [
  {
    heading: '1. About these terms',
    body:
      'These terms apply to your use of the ProjectBuilt app, operated by [BUSINESS NAME] ("we", "us"). By creating an account you agree to these terms. If you do not agree, please do not use the app.',
  },
  {
    heading: '2. Eligibility',
    body: 'You must be at least 16 years old to use ProjectBuilt.',
  },
  {
    heading: '3. Health and safety',
    body:
      'ProjectBuilt provides general fitness tracking tools and general information. It is not medical advice and does not replace advice from your GP or a qualified health professional. You must complete the PAR-Q health screening before logging workouts. If you answer "Yes" to any PAR-Q question, you should obtain medical clearance before exercising. Stop exercising immediately and seek medical help if you experience chest pain, dizziness, severe breathlessness or any other concerning symptoms. You exercise at your own risk.',
  },
  {
    heading: '4. Your account',
    body:
      'You are responsible for keeping your login details secure and for activity on your account. Usernames must not be offensive, impersonate others or infringe anyone\'s rights. We may suspend accounts that breach these terms.',
  },
  {
    heading: '5. Premium subscription',
    body:
      'Premium is an auto-renewing subscription at £1.99 per month or £14.99 per year (or local equivalent). New subscribers may be eligible for a 7-day free trial. Payment is charged to your Apple ID or Google Play account at confirmation of purchase (or at the end of the trial). Subscriptions renew automatically unless cancelled at least 24 hours before the end of the current period. You can manage or cancel your subscription in your App Store or Google Play account settings. Any unused portion of a free trial is forfeited when you purchase a subscription. Refunds are handled by Apple or Google under their policies.',
  },
  {
    heading: '6. Chat with Admin',
    body:
      'Premium members can send questions to our coach. Responses are general information only and do not constitute personal training, medical or nutritional advice tailored to your individual circumstances. We aim to reply within [2 working days] but cannot guarantee response times. Please do not send medical emergencies via chat — call 999 or NHS 111.',
  },
  {
    heading: '7. Acceptable use',
    body:
      'You must not misuse the app, attempt to access other users\' data, reverse-engineer the service, or send abusive or unlawful content through chat.',
  },
  {
    heading: '8. Intellectual property',
    body:
      'All content in the app, including exercise instructions and nutrition copy, belongs to us or our licensors. You may use it for personal, non-commercial purposes only. Your workout data belongs to you.',
  },
  {
    heading: '9. Liability',
    body:
      'Nothing in these terms limits our liability for death or personal injury caused by our negligence, fraud, or anything that cannot be limited by law. Otherwise, we are not liable for any indirect or consequential loss, and our total liability is limited to the amount you paid us in the 12 months before the claim. Your statutory rights as a consumer are not affected.',
  },
  {
    heading: '10. Ending your account',
    body:
      'You can delete your account at any time from Profile → Delete account. This permanently deletes your data. Deleting your account does not cancel an App Store / Google Play subscription — please cancel it in your store settings.',
  },
  {
    heading: '11. Governing law',
    body:
      'These terms are governed by the laws of England and Wales. You may bring proceedings in the courts of England and Wales, or in Scotland or Northern Ireland if you live there.',
  },
  {
    heading: '12. Contact',
    body: 'Questions about these terms? Email [SUPPORT EMAIL].',
  },
];
