import { Link } from 'react-router-dom';
import PageMeta from './PageMeta.jsx';
import { CONTACT_EMAIL, getLegalDisclaimer } from '../lib/legal-content.js';
import { useI18n } from '../lib/i18n/index.jsx';

export default function LegalContentPage({ title, description, sections, titleKey, descriptionKey, backTo = '/' }) {
  const { t, catalog } = useI18n();
  const resolvedTitle = title ?? (titleKey ? t(titleKey) : '');
  const resolvedDescription = description ?? (descriptionKey ? t(descriptionKey) : '');
  const disclaimer = getLegalDisclaimer(catalog);

  return (
    <main className="page legal-page">
      <PageMeta title={resolvedTitle} description={resolvedDescription} />
      <section className="hero legal-hero">
        <h1>{resolvedTitle}</h1>
        <p className="subtitle">{resolvedDescription}</p>
      </section>
      {disclaimer && <p className="card legal-disclaimer">{disclaimer}</p>}
      <div className="legal-sections">
        {sections.map((section) => (
          <article key={section.title} className="card legal-section">
            <h2 className="section-title">{section.title}</h2>
            <p className="muted">{section.body.replaceAll('{email}', CONTACT_EMAIL)}</p>
          </article>
        ))}
      </div>
      <p className="auth-footer">
        <Link to={backTo}>{t('legal.back')}</Link>
      </p>
    </main>
  );
}
