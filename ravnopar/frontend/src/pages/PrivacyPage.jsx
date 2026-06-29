import LegalContentPage from '../components/LegalContentPage.jsx';
import { getPrivacySections } from '../lib/legal-content.js';
import { useI18n } from '../lib/i18n/index.jsx';

export default function PrivacyPage() {
  const { catalog } = useI18n();
  const legal = catalog.legal?.privacy ?? {};

  return (
    <LegalContentPage
      title={legal.title}
      description={legal.description}
      sections={getPrivacySections(catalog)}
    />
  );
}
