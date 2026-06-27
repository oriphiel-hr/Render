import { Link } from 'react-router-dom';
import SupportContent from '../components/SupportContent.jsx';

export default function DonatePage() {
  return (
    <main className="page donate-page">
      <p className="auth-footer">
        <Link to="/app">← Natrag na Moj prostor</Link>
        {' · '}
        <Link to="/planovi">Model naplate</Link>
      </p>
      <section className="hero donate-hero donate-hero-warm">
        <p className="eyebrow">Zahvaljujemo se</p>
        <h1>Podrži projekt</h1>
        <p className="landing-lead">
          Ravnopar održavamo s puno truda i malo budžeta. Ako ti platforma znači, možeš
          dobrovoljno pomoći — bez pritiska i bez dodatnih funkcija u zamjenu.
        </p>
      </section>
      <SupportContent />
    </main>
  );
}
