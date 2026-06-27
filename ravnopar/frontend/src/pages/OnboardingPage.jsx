import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getProfile, updateProfile } from '../api/index.js';
import PageMeta from '../components/PageMeta.jsx';
import { trackEvent } from '../lib/analytics.js';

function hasPhoto(profile) {
  return Array.isArray(profile?.photos) && profile.photos.length > 0;
}

function hasBio(profile) {
  return typeof profile?.bio === 'string' && profile.bio.trim().length >= 10;
}

export default function OnboardingPage({ token, onDone }) {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [status, setStatus] = useState('');

  useEffect(() => {
    trackEvent('Onboarding View');
    getProfile(token).then((data) => {
      if (data?.success) setProfile(data.profile);
    });
  }, [token]);

  const photoOk = hasPhoto(profile);
  const bioOk = hasBio(profile);
  const canFinish = photoOk && bioOk;

  async function finish() {
    if (!canFinish) {
      setStatus('Dodaj fotografiju i bio (min. 10 znakova) u Postavkama prije nastavka.');
      return;
    }
    const data = await updateProfile(token, { onboardingDone: true });
    if (!data?.success) {
      setStatus(data?.error || 'Spremanje nije uspjelo.');
      return;
    }
    trackEvent('Onboarding Complete');
    onDone?.();
    navigate('/app');
  }

  return (
    <main className="page onboarding-page">
      <PageMeta title="Dobrodošao/la" description="Brzi vodič kroz Ravnopar." />
      <section className="landing-hero planovi-hero-warm">
        <p className="eyebrow">Dobrodošao/la</p>
        <h1>Profil koji privlači pažnju</h1>
        <p className="landing-lead">
          Prije nego kreneš u feed, dodaj fotografiju i kratki opis — to je obavezno za slanje zahtjeva.
        </p>
      </section>

      {status && <p className="status-banner status-error">{status}</p>}

      <div className="onboarding-checklist">
        <article className={`card onboarding-check ${photoOk ? 'done' : ''}`}>
          <h2 className="section-title">1. Fotografija {photoOk ? '✓' : ''}</h2>
          <p className="muted">Profili s fotkom dobivaju više odgovora.</p>
          <Link className="button button-secondary" to="/app/postavke">
            {photoOk ? 'Promijeni fotku' : 'Dodaj fotografiju'}
          </Link>
        </article>
        <article className={`card onboarding-check ${bioOk ? 'done' : ''}`}>
          <h2 className="section-title">2. Bio (min. 10 znakova) {bioOk ? '✓' : ''}</h2>
          <p className="muted">Kratko reci tko si i što tražiš.</p>
          <Link className="button button-secondary" to="/app/postavke">
            {bioOk ? 'Uredi bio' : 'Napiši bio'}
          </Link>
        </article>
        <article className="card onboarding-check">
          <h2 className="section-title">3. Feed</h2>
          <p className="muted">Kad profil bude spreman, swipeaj i pošalji prvi zahtjev.</p>
        </article>
      </div>

      <button
        type="button"
        className="button button-primary button-lg"
        onClick={finish}
        disabled={!canFinish}
        title={!canFinish ? 'Prvo dovrši fotografiju i bio' : undefined}
      >
        {canFinish ? 'Završi uvod i otvori feed' : 'Dovrši profil u Postavkama'}
      </button>
    </main>
  );
}
