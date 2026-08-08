import { useEffect } from 'react';
import Link from './/Link.jsx';
import { useI18n } from '../lib/i18n/index.jsx';

export default function MatchModal({ partnerName, pairId, onClose }) {
  const { t } = useI18n();

  useEffect(() => {
    document.body.classList.add('match-modal-open');
    return () => document.body.classList.remove('match-modal-open');
  }, []);

  if (!partnerName) return null;

  return (
    <div className="match-overlay" role="dialog" aria-modal="true" aria-labelledby="match-title">
      <div className="match-confetti" aria-hidden="true">
        {Array.from({ length: 12 }).map((_, i) => (
          <span key={i} className="confetti-piece" style={{ '--i': i }} />
        ))}
      </div>
      <article className="match-modal card">
        <p className="eyebrow match-eyebrow">{t('match.eyebrow')}</p>
        <h2 id="match-title" className="match-title">
          {t('match.title')}
        </h2>
        <p className="match-lead">{t('match.lead', { partner: partnerName })}</p>
        <div className="match-actions">
          {pairId ? (
            <Link className="button button-primary button-lg" to={`/app/chat/${pairId}`} onClick={onClose}>
              {t('match.startChat')}
            </Link>
          ) : (
            <Link className="button button-primary button-lg" to="/app" onClick={onClose}>
              {t('match.backToApp')}
            </Link>
          )}
          <button type="button" className="button button-secondary" onClick={onClose}>
            {t('match.continueBrowsing')}
          </button>
        </div>
      </article>
    </div>
  );
}
