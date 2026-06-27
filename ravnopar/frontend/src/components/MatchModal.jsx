import { useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function MatchModal({ partnerName, pairId, onClose }) {
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
        <p className="eyebrow match-eyebrow">Obostrani kontakt</p>
        <h2 id="match-title" className="match-title">
          Imate match!
        </h2>
        <p className="match-lead">
          Ti i <strong>{partnerName}</strong> ste spremni za razgovor.
        </p>
        <div className="match-actions">
          {pairId ? (
            <Link className="button button-primary button-lg" to={`/app/chat/${pairId}`} onClick={onClose}>
              Počni razgovor
            </Link>
          ) : (
            <Link className="button button-primary button-lg" to="/app" onClick={onClose}>
              Natrag u app
            </Link>
          )}
          <button type="button" className="button button-secondary" onClick={onClose}>
            Nastavi pregled
          </button>
        </div>
      </article>
    </div>
  );
}
