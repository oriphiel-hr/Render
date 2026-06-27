import { Link } from 'react-router-dom';
import PageMeta from '../components/PageMeta.jsx';
import { CONTACT_EMAIL } from '../lib/legal-content.js';

export default function ContactPage() {
  return (
    <main className="page contact-page">
      <PageMeta title="Kontakt" description="Kontaktiraj Ravnopar tim za podršku, privatnost i prijave." />
      <section className="hero legal-hero">
        <h1>Kontakt</h1>
        <p className="subtitle">Tu smo za pitanja, prijave i zahtjeve vezane uz privatnost.</p>
      </section>
      <article className="card">
        <h2 className="section-title">Email</h2>
        <p className="muted">
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
        </p>
        <p className="muted">Odgovaramo u razumnom roku — obično unutar nekoliko radnih dana.</p>
      </article>
      <article className="card">
        <h2 className="section-title">Hitne situacije</h2>
        <p className="muted">
          Ravnopar nije hitna služba. U opasnosti kontaktiraj lokalnu policiju ili hitnu pomoć (112).
        </p>
      </article>
      <p className="auth-footer">
        <Link to="/pomoc">FAQ</Link>
        {' · '}
        <Link to="/">Početna</Link>
      </p>
    </main>
  );
}
