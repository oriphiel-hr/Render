import { Link } from 'react-router-dom';
import SupportContent from '../components/SupportContent.jsx';

export default function PlanoviPage() {
  return (
    <main className="page planovi-page">
      <section className="hero planovi-hero">
        <h1>Planovi i model naplate</h1>
        <p className="subtitle">
          Sve unaprijed — bez iznenađenja. Danas je osnovno korištenje besplatno.
        </p>
      </section>
      <SupportContent showDonate={false} />
      <p className="auth-footer">
        <Link to="/">← Natrag na početnu</Link>
        {' · '}
        <Link to="/auth">Prijava</Link>
      </p>
    </main>
  );
}
