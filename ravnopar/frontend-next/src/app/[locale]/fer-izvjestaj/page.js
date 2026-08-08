import FairnessReportPage from '../../../views/FairnessReportPage';
import { createPublicMetadata } from '../../../lib/metadata';
import { fetchFairnessReport } from '../../../lib/server-api';
import { isSupportedLocale } from '../../../lib/i18n/server';
import { notFound } from 'next/navigation';

export async function generateMetadata({ params }) {
  const { locale } = await params;
  return createPublicMetadata(locale, '/fer-izvjestaj', 'fairnessReport', 'fairnessReport');
}

export default async function Page({ params }) {
  const { locale } = await params;
  if (!isSupportedLocale(locale)) notFound();
  const report = await fetchFairnessReport();
  return <FairnessReportPage report={report} />;
}
