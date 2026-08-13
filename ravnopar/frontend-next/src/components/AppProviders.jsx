'use client';

import { Suspense } from 'react';
import { I18nProvider } from '../lib/i18n/index.jsx';
import { AuthProvider, useAuth } from './AuthProvider.jsx';
import Analytics from './Analytics.jsx';
import CookieBanner from './CookieBanner.jsx';
import LocaleProfileSync from './LocaleProfileSync.jsx';
import PublicFooter from './PublicFooter.jsx';
import { MobileDock, Topbar } from './SiteChrome.jsx';
import ServiceWorkerRegister from './ServiceWorkerRegister.jsx';
import PwaInstallBanner from './PwaInstallBanner.jsx';

function ShellInner({ children }) {
  const { token, profile, onProfileLocaleSaved } = useAuth();
  return (
    <>
      <ServiceWorkerRegister />
      <Analytics />
      <CookieBanner />
      <PwaInstallBanner />
      <LocaleProfileSync token={token} profile={profile} onProfileLocaleSaved={onProfileLocaleSaved} />
      <Topbar />
      {children}
      <PublicFooter token={token} />
      <MobileDock />
    </>
  );
}

export default function AppProviders({ children, locale }) {
  return (
    <AuthProvider>
      <I18nProvider initialLocale={locale}>
        <Suspense fallback={null}>
          <ShellInner>{children}</ShellInner>
        </Suspense>
      </I18nProvider>
    </AuthProvider>
  );
}
