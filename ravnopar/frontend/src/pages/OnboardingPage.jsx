import { Link, useNavigate } from 'react-router-dom';
import { updateProfile } from '../api/index.js';
import PageMeta from '../components/PageMeta.jsx';

const STEPS = [
  {
    title: 'Dodaj fotografiju',
    text: 'Profili s fotografijom dobivaju više odgovora. Možeš je dodati u Postavkama.',
    action: '/app/postavke',
    actionLabel: 'Otvori postavke'
  },
  {
    title: 'Napiši bio',
    text: 'Kratko reci tko si i što tražiš — iskrenost privlači prave ljude.',
    action: '/app/postavke',
    actionLabel: 'Uredi profil'
  },
  {
    title: 'Pronađi prvi kontakt',
    text: 'Pregledaj feed i pošalji jedan kvalitetan zahtjev.',
    action: '/app',
    actionLabel: 'Idi u feed'
  }
];

export default function OnboardingPage({ token, onDone }) {
  const navigate = useNavigate();

  async function finish() {
    await updateProfile(token, { onboardingDone: true });
    onDone?.();
    navigate('/app');
  }

  return (
    <main className="page onboarding-page">
      <PageMeta title="Dobrodošao/la" description="Brzi vodič kroz Ravnopar." />
      <section className="landing-hero planovi-hero-warm">
        <p className="eyebrow">Dobrodošao/la</p>
        <h1>Krenimo polako</h1>
        <p className="landing-lead">Tri kratka koraka pomažu ti da brže upoznaš prave ljude.</p>
      </section>
      <div className="steps-grid">
        {STEPS.map((step, index) => (
          <article key={step.title} className="card step-card">
            <span className="step-number">{index + 1}</span>
            <h2 className="section-title">{step.title}</h2>
            <p className="muted">{step.text}</p>
            <Link className="button button-secondary" to={step.action}>
              {step.actionLabel}
            </Link>
          </article>
        ))}
      </div>
      <button type="button" className="button button-primary button-lg" onClick={finish}>
        Završi uvod i otvori feed
      </button>
    </main>
  );
}
