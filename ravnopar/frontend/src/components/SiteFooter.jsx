import { Link } from 'react-router-dom';
import { isDonateConfigured } from '../lib/donate-config.js';

export default function SiteFooter() {
  const showDonate = isDonateConfigured();

  return (
    <footer className="site-footer">
      <Link className="footer-link" to="/planovi">
        Planovi
      </Link>
      {showDonate && (
        <>
          <span className="footer-sep" aria-hidden="true">
            ·
          </span>
          <Link className="footer-link" to="/app/podrzi">
            Podrži projekt
          </Link>
        </>
      )}
    </footer>
  );
}
