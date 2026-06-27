import { Link, useSearchParams } from 'react-router-dom';

const STEPS = [
  {
    title: 'Registriraj se',
    text: 'Napravi profil, odaberi koga tražiš i što želiš od platforme.'
  },
  {
    title: 'Upoznaj ljude',
    text: 'Pregledaj feed dostupnih profila bez skrivenog smanjenja dosega.'
  },
  {
    title: 'Razgovaraj fer',
    text: 'Kad se uspostavi obostrani kontakt, oboje ste fokusirani na razgovor.'
  }
];

const VALUES = [
  {
    title: 'Bez paywalla za razgovor',
    text: 'Osnovna komunikacija je dostupna svima — bez umjetnih barijera.'
  },
  {
    title: 'Poštena vidljivost',
    text: 'Aktivni parovi privremeno izlaze iz feeda kako bi ostali dobili priliku.'
  },
  {
    title: 'Zaštita i kontrola',
    text: 'Blokiranje, prijave i anti-spam limiti čuvaju kvalitetu zajednice.'
  }
];

export default function HomePage() {
  const [searchParams] = useSearchParams();
  const donateThanks = searchParams.get('donate') === 'thanks';

  return (
    <main className="page landing-page">
      {donateThanks && (
        <p className="status-banner status-success">
          Hvala na donaciji! Tvoja podrška pomaže održavanju Ravnopara.
        </p>
      )}
      <section className="landing-hero">
        <p className="eyebrow">Dating bez manipulacije dosega</p>
        <h1>Ravnopar</h1>
        <p className="landing-lead">
          Fer platforma za upoznavanje: svatko ima priliku za razgovor, a pravila su jasna i transparentna.
        </p>
        <div className="landing-actions">
          <Link className="button button-primary button-lg" to="/auth">
            Kreni
          </Link>
          <Link className="button button-secondary button-lg" to="/auth">
            Već imam račun
          </Link>
        </div>
        <div className="landing-chips">
          <span className="chip">Bez skrivanja dosega</span>
          <span className="chip">Suglasnost na prvom mjestu</span>
          <span className="chip">Zaštita od spama</span>
        </div>
      </section>

      <section className="landing-section">
        <h2 className="landing-heading">Kako funkcionira</h2>
        <div className="steps-grid">
          {STEPS.map((step, index) => (
            <article key={step.title} className="card step-card">
              <span className="step-number">{index + 1}</span>
              <h3>{step.title}</h3>
              <p className="muted">{step.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="landing-section">
        <h2 className="landing-heading">Zašto Ravnopar</h2>
        <div className="grid-2">
          {VALUES.map((item) => (
            <article key={item.title} className="card">
              <h3 className="section-title">{item.title}</h3>
              <p className="muted">{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="landing-section">
        <h2 className="landing-heading">Model naplate</h2>
        <article className="card pricing-teaser">
          <p className="muted">
            Danas je Ravnopar besplatan za razgovor. Premium paketi bit će opcionalni i uključeni tek kad
            proizvod bude stabilan i zajednica aktivna — obavijest unaprijed, bez paywalla za kontakt.
          </p>
          <Link className="button button-secondary" to="/planovi">
            Pogledaj planove unaprijed
          </Link>
        </article>
      </section>

      <section className="landing-cta card">
        <h2>Spreman/na za fer upoznavanje?</h2>
        <p className="muted">Registracija traje nekoliko minuta. Potrebno je imati 18+ godina.</p>
        <Link className="button button-primary" to="/auth">
          Kreni besplatno
        </Link>
      </section>
    </main>
  );
}
