import { Link } from 'react-router-dom';
import PricingHeartSection from '../components/PricingHeartSection.jsx';
import SupportContent from '../components/SupportContent.jsx';

export default function PlanoviPage() {
  return (
    <main className="page planovi-page">
      <section className="landing-hero planovi-hero-warm">
        <p className="eyebrow">Fer i otvoreno</p>
        <h1>Planovi s ljudskim licem</h1>
        <p className="landing-lead">
          Ravnopar nije tu da te iscijedi novcem prije prvog razgovora. Ovdje pišemo kako
          platforma danas radi — i kako će raditi kad porastemo, bez iznenađenja.
        </p>
        <div className="landing-chips">
          <span className="chip">♥ Besplatan razgovor</span>
          <span className="chip">Bez skrivenog dosega</span>
          <span className="chip">Obavijest 30 dana unaprijed</span>
        </div>
      </section>

      <PricingHeartSection />

      <SupportContent showDonate={false} />

      <section className="card planovi-cta">
        <h2>Spreman/na za fer upoznavanje?</h2>
        <p className="muted">
          Registracija je besplatna. Ako ti se sviđa pristup — dobrodošao/la si u zajednicu.
        </p>
        <div className="planovi-cta-actions">
          <Link className="button button-primary" to="/auth">
            Kreni besplatno
          </Link>
          <Link className="button button-secondary" to="/">
            Natrag na početnu
          </Link>
        </div>
      </section>
    </main>
  );
}
