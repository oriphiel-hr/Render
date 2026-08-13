import { useCallback, useRef, useState } from 'react';
import { useI18n } from '../lib/i18n/index.jsx';

export default function PhotoGallery({ photos = [], alt = '', className = '' }) {
  const { t } = useI18n();
  const list = Array.isArray(photos) ? photos.filter(Boolean) : [];
  const [index, setIndex] = useState(0);
  const [dragX, setDragX] = useState(0);
  const touchStart = useRef({ x: 0 });
  const dragRef = useRef(0);
  const locked = useRef(false);

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
    touchStart.current = { x: e.touches[0].clientX };
    dragRef.current = 0;
    locked.current = false;
    setDragX(0);
  }

  function onTouchMove(e) {
    const dx = e.touches[0].clientX - touchStart.current.x;
    if (Math.abs(dx) > 10) {
      locked.current = true;
      e.stopPropagation();
    }
    dragRef.current = dx;
    setDragX(dx);
  }

  function onTouchEnd(e) {
    if (locked.current) e.stopPropagation();
    const dx = dragRef.current;
    if (dx > 60) go(-1);
    else if (dx < -60) go(1);
    dragRef.current = 0;
    locked.current = false;
    setDragX(0);
  }

  return (
    <div
      className={`photo-gallery ${className}`}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onTouchCancel={onTouchEnd}
    >
      <img
        src={list[index]}
        alt={alt}
        className="photo-gallery-main"
        style={{ transform: dragX ? `translateX(${dragX * 0.15}px)` : undefined }}
        draggable={false}
        loading="lazy"
        decoding="async"
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
