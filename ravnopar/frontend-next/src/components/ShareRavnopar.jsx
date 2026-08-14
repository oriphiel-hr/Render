import { useState } from 'react';
import { trackEvent } from '../lib/analytics.js';
import { SITE_URL } from '../lib/env.js';
import { useI18n } from '../lib/i18n/index.jsx';

export function publicSiteUrl(locale = 'hr') {
  const lang = locale || 'hr';
  return `${SITE_URL}/${lang}`;
}

export default function ShareRavnopar({ url, compact = false }) {
  const { t, locale } = useI18n();
  const shareUrl = url || publicSiteUrl(locale);
  const [copied, setCopied] = useState(false);
  const canNativeShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function';

  async function copyLink() {
    try {
      await navigator.clipboard?.writeText(shareUrl);
      setCopied(true);
      trackEvent('share_copy');
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  async function nativeShare() {
    try {
      await navigator.share({
        title: 'Ravnopar',
        text: t('share.text'),
        url: shareUrl
      });
      trackEvent('share_native');
    } catch (err) {
      if (err?.name !== 'AbortError') copyLink();
    }
  }

  return (
    <div className={compact ? 'share-ravnopar share-ravnopar-compact' : 'share-ravnopar'}>
      {canNativeShare && (
        <button type="button" className="button button-primary" onClick={nativeShare}>
          {t('share.cta')}
        </button>
      )}
      <button type="button" className="button button-secondary" onClick={copyLink}>
        {copied ? t('common.copied') : t('share.copyLink')}
      </button>
    </div>
  );
}
