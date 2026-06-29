import LegalContentPage from '../components/LegalContentPage.jsx';
import { getTermsSections } from '../lib/legal-content.js';
import { useI18n } from '../lib/i18n/index.jsx';

export default function TermsPage() {
  const { catalog } = useI18n();
  const legal = catalog.legal?.terms ?? {};

  return (
    <LegalContentPage
      title={legal.title}
      description={legal.description}
      sections={getTermsSections(catalog)}
    />
  );
}
