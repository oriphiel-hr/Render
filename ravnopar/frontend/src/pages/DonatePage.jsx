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
      <section className="hero donate-hero">
        <h1>Podrži projekt</h1>
        <p className="subtitle">Dobrovoljna podrška za server i održavanje — bez dodatnih funkcija.</p>
      </section>
      <SupportContent />
    </main>
  );
}
