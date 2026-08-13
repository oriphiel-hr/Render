'use client';

import { useEffect, useState } from 'react';
import { useI18n } from '../lib/i18n/index.jsx';

const DISMISS_KEY = 'ravnoparPwaInstallDismissed';

export default function PwaInstallBanner() {
  const { t } = useI18n();
  const [deferred, setDeferred] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    if (window.matchMedia('(display-mode: standalone)').matches) return undefined;
    if (localStorage.getItem(DISMISS_KEY) === '1') return undefined;

    function onBeforeInstall(event) {
      event.preventDefault();
      setDeferred(event);
      setVisible(true);
    }

    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', onBeforeInstall);
  }, []);

  if (!visible || !deferred) return null;

  async function install() {
    deferred.prompt();
    const choice = await deferred.userChoice;
    setDeferred(null);
    setVisible(false);
    if (choice?.outcome !== 'accepted') {
      localStorage.setItem(DISMISS_KEY, '1');
    }
  }

  function dismiss() {
    localStorage.setItem(DISMISS_KEY, '1');
    setVisible(false);
  }

  return (
    <div className="pwa-install-banner" role="dialog" aria-label={t('pwa.installTitle')}>
      <div>
        <strong>{t('pwa.installTitle')}</strong>
        <p className="muted">{t('pwa.installHint')}</p>
      </div>
      <div className="pwa-install-actions">
        <button type="button" className="button button-primary button-sm" onClick={install}>
          {t('pwa.install')}
        </button>
        <button type="button" className="button button-ghost button-sm" onClick={dismiss}>
          {t('pwa.later')}
        </button>
      </div>
    </div>
  );
}
