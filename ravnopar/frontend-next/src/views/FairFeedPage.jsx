'use client';

import Link from '../components/Link.jsx';
import { useI18n } from '../lib/i18n/index.jsx';

const PRINCIPLE_KEYS = [
  'compatibility_filter',
  'no_plan_boost',
  'fair_waiting_boost',
  'interest_lifestyle_points',
  'completeness_verification',
  'active_pairs_hidden'
];

export default function FairFeedPage() {
  const { t, catalog } = useI18n();
  const neverItems = catalog.fairFeed?.neverItems ?? [];

  return (
    <main className="page fair-feed-page">
      <section className="hero legal-hero">
        <h1>{t('fairFeed.title')}</h1>
        <p className="subtitle">{t('fairFeed.subtitle')}</p>
        <p className="muted">{t('fairFeed.intro')}</p>
      </section>
      <article className="card">
        <h2 className="section-title">{t('fairFeed.neverTitle')}</h2>
        <ul className="contact-topics">
          {neverItems.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </article>
      <article className="card">
        <h2 className="section-title">{t('fairFeed.principlesTitle')}</h2>
        <ul className="contact-topics">
          {PRINCIPLE_KEYS.map((key) => (
            <li key={key}>{t(`fairFeed.principles.${key}`)}</li>
          ))}
        </ul>
      </article>
      <p className="auth-footer">
        <Link to="/fer-izvjestaj">{t('fairFeed.explainLink')}</Link>
        {' · '}
        <Link to="/pomoc">{t('fairFeed.faqLink')}</Link>
        {' · '}
        <Link to="/">{t('common.backHome')}</Link>
      </p>
    </main>
  );
}
