import LegalContentPage from '../components/LegalContentPage.jsx';
import { PRIVACY_SECTIONS } from '../lib/legal-content.js';

export default function PrivacyPage() {
  return (
    <LegalContentPage
      title="Politika privatnosti"
      description="Kako Ravnopar prikuplja, koristi i štiti tvoje podatke."
      sections={PRIVACY_SECTIONS}
    />
  );
}
