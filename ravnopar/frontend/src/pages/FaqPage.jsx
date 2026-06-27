import { Link } from 'react-router-dom';
import PageMeta from '../components/PageMeta.jsx';
import { FAQ_ITEMS } from '../lib/faq.js';

export default function FaqPage() {
  return (
    <main className="page faq-page">
      <PageMeta
        title="Pomoć i FAQ"
        description="Česta pitanja o Ravnoparu — besplatno korištenje, match, chat, sigurnost i postavke."
      />
      <section className="hero legal-hero">
        <h1>Pomoć i FAQ</h1>
        <p className="subtitle">Odgovori na najčešća pitanja o Ravnoparu.</p>
      </section>
      <div className="faq-list">
        {FAQ_ITEMS.map((item) => (
          <article key={item.q} className="card faq-item">
            <h2 className="section-title">{item.q}</h2>
            <p className="muted">{item.a}</p>
          </article>
        ))}
      </div>
      <p className="auth-footer">
        <Link to="/">← Natrag na početnu</Link>
        {' · '}
        <Link to="/kontakt">Kontakt</Link>
      </p>
    </main>
  );
}
