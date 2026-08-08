import HomePage from '../../views/HomePage';
import { createPublicMetadata } from '../../lib/metadata';
import { fetchPublicStats } from '../../lib/server-api';
import { isSupportedLocale } from '../../lib/i18n/server';
import { notFound } from 'next/navigation';

export async function generateMetadata({ params }) {
  const { locale } = await params;
  return createPublicMetadata(locale, '/', 'home', 'home');
}

export default async function Page({ params, searchParams }) {
  const { locale } = await params;
  if (!isSupportedLocale(locale)) notFound();
  const sp = await searchParams;
  const stats = await fetchPublicStats();
  const donateThanks = sp?.donate === 'thanks';

  return <HomePage stats={stats} donateThanks={donateThanks} />;
}
