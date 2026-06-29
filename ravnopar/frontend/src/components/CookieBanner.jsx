import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '../lib/i18n/index.jsx';

const KEY = 'ravnoparCookieConsent';

export default function CookieBanner() {
  const { t } = useI18n();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(KEY)) setVisible(true);
  }, []);

  if (!visible) return null;

  function accept() {
    localStorage.setItem(KEY, 'accepted');
    window.dispatchEvent(new Event('ravnopar-cookie-consent'));
    setVisible(false);
  }

  return (
    <div className="cookie-banner" role="dialog" aria-label={t('cookie.ariaLabel')}>
      <p>
        {t('cookie.message')}{' '}
        <Link to="/privatnost">{t('cookie.privacyLink')}</Link>.
      </p>
      <button type="button" className="button button-primary button-sm" onClick={accept}>
        {t('cookie.accept')}
      </button>
    </div>
  );
}
