import { Link } from 'react-router-dom';
import { isDonateConfigured } from '../lib/donate-config.js';

export default function PublicFooter({ token }) {
  const showDonate = token && isDonateConfigured();

  return (
    <footer className="public-footer">
      <nav className="public-footer-nav" aria-label="Podnožje">
        <Link to="/planovi">Planovi</Link>
        <Link to="/pomoc">Pomoć</Link>
        <Link to="/pravila">Pravila</Link>
        <Link to="/privatnost">Privatnost</Link>
        <Link to="/uvjeti">Uvjeti</Link>
        <Link to="/kontakt">Kontakt</Link>
        {showDonate && <Link to="/app/podrzi">Podrži projekt</Link>}
        {token && <Link to="/app/postavke">Postavke</Link>}
      </nav>
      <p className="public-footer-copy">© {new Date().getFullYear()} Ravnopar · 18+ · Fer upoznavanje</p>
    </footer>
  );
}
