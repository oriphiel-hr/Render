import LegalContentPage from '../components/LegalContentPage.jsx';
import { GUIDELINES_SECTIONS } from '../lib/legal-content.js';

export default function GuidelinesPage() {
  return (
    <LegalContentPage
      title="Pravila zajednice"
      description="Što je dozvoljeno, što nije i kako ostati siguran/na na Ravnoparu."
      sections={GUIDELINES_SECTIONS}
    />
  );
}
