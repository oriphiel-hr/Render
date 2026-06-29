import { useState } from 'react';
import { Link } from 'react-router-dom';
import PhotoGallery from './PhotoGallery.jsx';
import { useI18n } from '../lib/i18n/index.jsx';

export default function SwipeFeedCard({ person, myCity, onLike, onPass, onBlock, onReport, busy }) {
  const { t, labels } = useI18n();
  const { labelIdentity, labelProfileType, labelIntent } = labels;
  const [offsetX, setOffsetX] = useState(0);
  const [swiping, setSwiping] = useState(false);
  const touchStart = { x: 0, y: 0 };
  const intents = Array.isArray(person.intents) ? person.intents : [];
  const sameCity = myCity && person.city && myCity.toLowerCase() === person.city.toLowerCase();

  function onTouchStart(e) {
    touchStart.x = e.touches[0].clientX;
    touchStart.y = e.touches[0].clientY;
    setSwiping(true);
  }

  function onTouchMove(e) {
    const dx = e.touches[0].clientX - touchStart.x;
    const dy = e.touches[0].clientY - touchStart.y;
    if (Math.abs(dx) > Math.abs(dy)) setOffsetX(dx);
  }

  function onTouchEnd() {
    setSwiping(false);
    if (offsetX > 90) onPass?.();
    else if (offsetX < -90) onLike?.();
    setOffsetX(0);
  }

  const rotate = offsetX * 0.04;
  const likeHint = offsetX < -40;
  const passHint = offsetX > 40;

  return (
    <article
      className={`swipe-card ${swiping ? 'swiping' : ''}`}
      style={{ transform: `translateX(${offsetX}px) rotate(${rotate}deg)` }}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {likeHint && <span className="swipe-stamp swipe-stamp-like">{t('swipe.stampLike')}</span>}
      {passHint && <span className="swipe-stamp swipe-stamp-pass">{t('swipe.stampPass')}</span>}

      <PhotoGallery photos={person.photos} alt={person.displayName} className="swipe-card-gallery" />

      <div className="swipe-card-body">
        <div className="swipe-card-title">
          <h3>
            <Link to={`/app/profile/${person.id}`}>{person.displayName}</Link>
            {person.photoVerified && <span className="chip chip-verified">✓</span>}
          </h3>
          <p className="muted">
            {person.city}, {person.age} {t('common.yearsShort')}
            {person.distanceLabel && <span className="chip chip-distance">{person.distanceLabel}</span>}
            {!person.distanceLabel && sameCity && <span className="chip chip-near">{t('swipe.sameCity')}</span>}
          </p>
        </div>

        {person.bio && <p className="profile-bio">{person.bio}</p>}

        {person.icebreakers?.length > 0 && (
          <ul className="icebreaker-list">
            {person.icebreakers.map((item) => (
              <li key={item.question}>
                <strong>{item.question}</strong>
                <span>{item.answer}</span>
              </li>
            ))}
          </ul>
        )}

        <div className="profile-tags">
          <span className="chip">{labelIdentity(person.identity)}</span>
          <span className="chip">{labelProfileType(person.profileType)}</span>
        </div>
        {intents.length > 0 && (
          <p className="profile-intents muted">
            {t('swipe.seeking')} {intents.map((i) => labelIntent(i)).join(', ')}
          </p>
        )}
      </div>

      <div className="swipe-actions">
        <button type="button" className="swipe-btn swipe-btn-pass" disabled={busy} onClick={onPass} aria-label={t('swipe.ariaPass')}>
          ✕
        </button>
        <button type="button" className="swipe-btn swipe-btn-like" disabled={busy} onClick={onLike} aria-label={t('swipe.ariaLike')}>
          ♥
        </button>
      </div>
      <div className="swipe-secondary-actions">
        <button type="button" className="button button-ghost button-sm" disabled={busy} onClick={onReport}>
          {t('swipe.report')}
        </button>
        <button type="button" className="button button-ghost button-sm" disabled={busy} onClick={onBlock}>
          {t('swipe.block')}
        </button>
      </div>
    </article>
  );
}
