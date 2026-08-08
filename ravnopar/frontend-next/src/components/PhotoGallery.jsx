import { useCallback, useState } from 'react';
import { useI18n } from '../lib/i18n/index.jsx';

export default function PhotoGallery({ photos = [], alt = '', className = '' }) {
  const { t } = useI18n();
  const list = Array.isArray(photos) ? photos.filter(Boolean) : [];
  const [index, setIndex] = useState(0);
  const [dragX, setDragX] = useState(0);
  const touchStart = { x: 0 };

  const go = useCallback(
    (delta) => {
      if (list.length <= 1) return;
      setIndex((i) => (i + delta + list.length) % list.length);
    },
    [list.length]
  );

  if (list.length === 0) {
    return (
      <div className={`photo-gallery photo-gallery-empty ${className}`}>
        <div className="photo-gallery-placeholder" aria-hidden="true">
          ♥
        </div>
      </div>
    );
  }

  function onTouchStart(e) {
    touchStart.x = e.touches[0].clientX;
    setDragX(0);
  }

  function onTouchMove(e) {
    setDragX(e.touches[0].clientX - touchStart.x);
  }

  function onTouchEnd() {
    if (dragX > 60) go(-1);
    else if (dragX < -60) go(1);
    setDragX(0);
  }

  return (
    <div
      className={`photo-gallery ${className}`}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <img
        src={list[index]}
        alt={alt}
        className="photo-gallery-main"
        style={{ transform: dragX ? `translateX(${dragX * 0.15}px)` : undefined }}
        draggable={false}
      />
      {list.length > 1 && (
        <>
          <div className="photo-gallery-dots" aria-hidden="true">
            {list.map((photo, i) => (
              <button
                key={photo.slice(-20) + i}
                type="button"
                className={`photo-dot ${i === index ? 'active' : ''}`}
                onClick={() => setIndex(i)}
              />
            ))}
          </div>
          <button type="button" className="photo-nav photo-nav-prev" onClick={() => go(-1)} aria-label={t('gallery.prev')}>
            ‹
          </button>
          <button type="button" className="photo-nav photo-nav-next" onClick={() => go(1)} aria-label={t('gallery.next')}>
            ›
          </button>
        </>
      )}
    </div>
  );
}
