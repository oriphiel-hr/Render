import { useI18n } from '../lib/i18n/index.jsx';

export default function FeedExplainHint({ signals = [] }) {
  const { t } = useI18n();
  const keys = Array.isArray(signals) ? signals.filter(Boolean) : [];
  if (keys.length === 0) return null;

  return (
    <div className="feed-explain-hint">
      <p className="feed-explain-title">{t('feedSignals.whyTitle')}</p>
      <ul className="feed-explain-list">
        {keys.map((key) => (
          <li key={key} className="chip chip-feed-signal">
            {t(`feedSignals.${key}`)}
          </li>
        ))}
      </ul>
    </div>
  );
}
