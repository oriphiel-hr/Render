import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import PageMeta from '../components/PageMeta.jsx';
import { getPublicStats } from '../api/index.js';

const STEPS = [
  {
    title: 'Registriraj se',
    text: 'Napravi profil, dodaj fotografiju i bio, odaberi koga tražiš.'
  },
  {
    title: 'Upoznaj ljude',
    text: 'Pregledaj feed dostupnih profila bez skrivenog smanjenja dosega.'
  },
  {
    title: 'Razgovaraj fer',
    text: 'Kad se uspostavi obostrani kontakt, otvori chat i razgovaraj u aplikaciji.'
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

const SAFETY_ITEMS = [
  {
    icon: '🛡️',
    title: 'Blokiraj i prijavi',
    text: 'Neugodan profil možeš blokirati ili prijaviti admin timu.'
  },
  {
    icon: '✉️',
    title: 'Verificiran email',
    text: 'Registracija zahtijeva potvrdu emaila — manje lažnih profila.'
  },
  {
    icon: '🤝',
    title: 'Pravila zajednice',
    text: 'Jasna pravila ponašanja i poštivanje granica drugih korisnika.'
  },
  {
    icon: '⏸️',
    title: 'Kontrola vidljivosti',
    text: 'Pauziraj profil ili obriši račun kad god želiš — u Postavkama.'
  }
];

export default function HomePage() {
  const [searchParams] = useSearchParams();
  const donateThanks = searchParams.get('donate') === 'thanks';
  const [stats, setStats] = useState(null);

  useEffect(() => {
    getPublicStats().then((data) => {
      if (data?.success) setStats(data.stats);
    });
  }, []);

  return (
    <main className="page landing-page">
      <PageMeta
        title="Početna"
        description="Ravnopar — fer dating platforma za Hrvatsku. Bez paywalla za razgovor, s chatom nakon matcha i transparentnim pravilima."
      />
      {donateThanks && (
        <p className="status-banner status-success">
          Hvala na donaciji! Tvoja podrška pomaže održavanju Ravnopara.
        </p>
      )}
      <section className="landing-hero">
        <p className="eyebrow">Dating bez manipulacije dosega</p>
        <h1>Ravnopar</h1>
        <p className="landing-lead">
          Fer platforma za upoznavanje: profili s fotografijom, chat nakon matcha i pravila koja su jasna unaprijed.
        </p>
        {stats && (
          <div className="social-proof">
            <span className="chip">{stats.memberCount}+ članova</span>
            <span className="chip">{stats.contactsLast30Days} kontakata (30 dana)</span>
            {stats.topCities?.[0] && (
              <span className="chip">Aktivno: {stats.topCities[0].city}</span>
            )}
          </div>
        )}
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
          <span className="chip">Chat nakon matcha</span>
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
        <h2 className="landing-heading">Sigurnost i zajednica</h2>
        <div className="safety-grid">
          {SAFETY_ITEMS.map((item) => (
            <article key={item.title} className="card safety-card">
              <span className="safety-icon" aria-hidden="true">{item.icon}</span>
              <h3 className="section-title">{item.title}</h3>
              <p className="muted">{item.text}</p>
            </article>
          ))}
        </div>
        <p className="landing-section-link">
          <Link to="/pravila">Pročitaj pravila zajednice →</Link>
        </p>
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
          <p className="eyebrow">Bez iznenađenja</p>
          <p className="pricing-teaser-lead">
            Ravnopar je besplatan za razgovor — i to ostaje temelj. Premium će doći tek kad
            platforma bude stabilna, a ti ćeš znati unaprijed.
          </p>
          <div className="landing-chips">
            <span className="chip">♥ Bez paywalla</span>
            <span className="chip">Fer vidljivost</span>
          </div>
          <Link className="button button-secondary" to="/planovi">
            Pročitaj model naplate
          </Link>
        </article>
      </section>

      <section className="landing-section">
        <h2 className="landing-heading">Pitanja?</h2>
        <article className="card">
          <p className="muted">
            Kako radi match, chat, pauza profila i email obavijesti — sve na jednom mjestu.
          </p>
          <Link className="button button-secondary" to="/pomoc">
            Pomoć i FAQ
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
