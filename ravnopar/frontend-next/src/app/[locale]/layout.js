import { notFound } from 'next/navigation';
import AppProviders from '../../components/AppProviders';
import { isSupportedLocale } from '../../lib/i18n/server';
import { SUPPORTED_LOCALES } from '../../lib/i18n/locale-meta';

export function generateStaticParams() {
  return SUPPORTED_LOCALES.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }) {
  const { locale } = await params;
  if (!isSupportedLocale(locale)) notFound();

  return <AppProviders locale={locale}>{children}</AppProviders>;
}
