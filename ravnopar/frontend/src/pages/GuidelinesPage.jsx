import LegalContentPage from '../components/LegalContentPage.jsx';
import { getGuidelinesSections } from '../lib/legal-content.js';
import { useI18n } from '../lib/i18n/index.jsx';

export default function GuidelinesPage() {
  const { catalog } = useI18n();
  const legal = catalog.legal?.guidelines ?? {};

  return (
    <LegalContentPage
      title={legal.title}
      description={legal.description}
      sections={getGuidelinesSections(catalog)}
    />
  );
}
