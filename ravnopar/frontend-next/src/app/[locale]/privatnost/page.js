import PrivacyPage from '../../../views/PrivacyPage';
import { createPublicMetadata } from '../../../lib/metadata';
import { isSupportedLocale } from '../../../lib/i18n/server';
import { notFound } from 'next/navigation';

export async function generateMetadata({ params }) {
  const { locale } = await params;
  return createPublicMetadata(locale, '/privatnost', 'privacy', 'privacy');
}

export default async function Page({ params }) {
  const { locale } = await params;
  if (!isSupportedLocale(locale)) notFound();
  return <PrivacyPage />;
}
