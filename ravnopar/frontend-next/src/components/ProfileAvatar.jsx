import { initials } from '../lib/labels.js';
import { useI18n } from '../lib/i18n/index.jsx';

export default function ProfileAvatar({ person, size = 'md' }) {
  const { t } = useI18n();
  const photo = Array.isArray(person?.photos) ? person.photos[0] : null;
  const name = person?.displayName || '?';

  if (photo) {
    return (
      <img
        className={`avatar avatar-photo avatar-${size}`}
        src={photo}
        alt={t('avatar.alt', { name })}
      />
    );
  }

  return (
    <div className={`avatar avatar-${size}`} aria-hidden="true">
      {initials(name)}
    </div>
  );
}
