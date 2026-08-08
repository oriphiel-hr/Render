import FaqPage from '../../../views/FaqPage';
import { createPublicMetadata } from '../../../lib/metadata';
import { isSupportedLocale } from '../../../lib/i18n/server';
import { notFound } from 'next/navigation';

export async function generateMetadata({ params }) {
  const { locale } = await params;
  return createPublicMetadata(locale, '/pomoc', 'faq', 'faq');
}

export default async function Page({ params }) {
  const { locale } = await params;
  if (!isSupportedLocale(locale)) notFound();
  return <FaqPage />;
}
