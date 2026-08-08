import fs from 'fs';
import path from 'path';

const files = [
  'src/pages/ContactPage.jsx',
  'src/pages/FaqPage.jsx',
  'src/pages/PlanoviPage.jsx',
  'src/pages/FairFeedPage.jsx',
  'src/pages/GuidelinesPage.jsx',
  'src/pages/PrivacyPage.jsx',
  'src/pages/TermsPage.jsx',
  'src/pages/AuthPage.jsx',
  'src/pages/AdminPage.jsx',
  'src/pages/ChatPage.jsx',
  'src/pages/DonatePage.jsx',
  'src/pages/OnboardingPage.jsx',
  'src/pages/ProfileDetailPage.jsx',
  'src/pages/SettingsPage.jsx',
  'src/pages/UserDashboardPage.jsx',
  'src/components/LegalContentPage.jsx',
  'src/components/LandingShowcase.jsx',
  'src/components/PublicFooter.jsx',
  'src/components/StructuredData.jsx',
  'src/components/FaqStructuredData.jsx',
  'src/components/PricingHeartSection.jsx',
  'src/components/SupportContent.jsx',
  'src/components/VoluntarySupportTeaser.jsx',
  'src/components/ThemeToggle.jsx',
  'src/components/CookieBanner.jsx',
  'src/components/LocaleProfileSync.jsx',
  'src/components/PricingPlans.jsx',
  'src/components/PricingPolicySection.jsx',
  'src/components/DonateSection.jsx',
  'src/components/NotificationCenter.jsx',
  'src/lib/i18n/index.jsx'
];

for (const f of files) {
  if (!fs.existsSync(f)) continue;
  let c = fs.readFileSync(f, 'utf8');
  if (/^['"]use client['"]/.test(c.trimStart())) continue;
  fs.writeFileSync(f, `'use client';\n\n${c}`);
  console.log('added', f);
}
