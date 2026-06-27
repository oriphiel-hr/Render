import LegalContentPage from '../components/LegalContentPage.jsx';
import { TERMS_SECTIONS } from '../lib/legal-content.js';

export default function TermsPage() {
  return (
    <LegalContentPage
      title="Uvjeti korištenja"
      description="Pravila korištenja Ravnopar platforme."
      sections={TERMS_SECTIONS}
    />
  );
}
