'use client';

import { useI18n } from '../lib/i18n/index.jsx';

const PEOPLE = [
  { name: 'Ana', city: 'Zagreb', color: '#fbcfe8' },
  { name: 'Marko', city: 'Split', color: '#ddd6fe' },
  { name: 'Iva', city: 'Rijeka', color: '#fde68a' }
];

export default function LandingShowcase() {
  const { t } = useI18n();

  return (
    <section className="landing-showcase" aria-label={t('home.showcaseTitle')}>
      <div className="landing-showcase-copy">
        <p className="eyebrow">{t('home.showcaseEyebrow')}</p>
        <h2 className="landing-heading">{t('home.showcaseTitle')}</h2>
        <p className="muted">{t('home.showcaseText')}</p>
      </div>
      <div className="phone-mockup-wrap">
        <div className="phone-mockup parallax-float">
          <div className="phone-notch" aria-hidden="true" />
          <div className="phone-screen">
            <div className="mock-card">
              <div className="mock-photo" />
              <p className="mock-name">{t('home.showcaseMockName')}</p>
              <p className="mock-bio">{t('home.showcaseMockBio')}</p>
              <div className="mock-actions">
                <span className="mock-btn mock-pass">✕</span>
                <span className="mock-btn mock-like">♥</span>
              </div>
            </div>
          </div>
        </div>
        <div className="showcase-avatars">
          {PEOPLE.map((person, index) => (
            <div
              key={person.name}
              className="showcase-avatar parallax-float-delayed"
              style={{ '--delay': index, background: person.color }}
            >
              <span>{person.name[0]}</span>
              <small>{person.city}</small>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
