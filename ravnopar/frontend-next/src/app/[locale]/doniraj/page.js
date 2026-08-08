import PublicDonatePage from '../../../views/PublicDonatePage';
import { createPublicMetadata } from '../../../lib/metadata';
import { fetchDonateImpact } from '../../../lib/server-api';
import { isSupportedLocale } from '../../../lib/i18n/server';
import { notFound } from 'next/navigation';

export async function generateMetadata({ params }) {
  const { locale } = await params;
  return createPublicMetadata(locale, '/doniraj', 'donatePublic', 'donate');
}

export default async function Page({ params, searchParams }) {
  const { locale } = await params;
  if (!isSupportedLocale(locale)) notFound();
  const sp = await searchParams;
  const impactStats = await fetchDonateImpact();
  return <PublicDonatePage impactStats={impactStats} thanks={sp?.donate === 'thanks'} />;
}
