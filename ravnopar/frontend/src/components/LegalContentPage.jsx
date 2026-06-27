import { Link } from 'react-router-dom';
import PageMeta from './PageMeta.jsx';

export default function LegalContentPage({ title, description, sections, backTo = '/' }) {
  return (
    <main className="page legal-page">
      <PageMeta title={title} description={description} />
      <section className="hero legal-hero">
        <h1>{title}</h1>
        <p className="subtitle">{description}</p>
      </section>
      <div className="legal-sections">
        {sections.map((section) => (
          <article key={section.title} className="card legal-section">
            <h2 className="section-title">{section.title}</h2>
            <p className="muted">{section.body}</p>
          </article>
        ))}
      </div>
      <p className="auth-footer">
        <Link to={backTo}>← Natrag</Link>
      </p>
    </main>
  );
}
