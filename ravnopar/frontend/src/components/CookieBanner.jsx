import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const KEY = 'ravnoparCookieConsent';

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(KEY)) setVisible(true);
  }, []);

  if (!visible) return null;

  function accept() {
    localStorage.setItem(KEY, 'accepted');
    setVisible(false);
  }

  return (
    <div className="cookie-banner" role="dialog" aria-label="Kolačići">
      <p>
        Koristimo nužne kolačiće za prijavu i analitiku samo ako je uključena. Više u{' '}
        <Link to="/privatnost">politici privatnosti</Link>.
      </p>
      <button type="button" className="button button-primary button-sm" onClick={accept}>
        Razumijem
      </button>
    </div>
  );
}
