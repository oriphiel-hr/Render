import { initials } from '../lib/labels.js';

export default function ProfileAvatar({ person, size = 'md' }) {
  const photo = Array.isArray(person?.photos) ? person.photos[0] : null;
  const name = person?.displayName || '?';

  if (photo) {
    return (
      <img
        className={`avatar avatar-photo avatar-${size}`}
        src={photo}
        alt={`Profilna fotografija: ${name}`}
      />
    );
  }

  return (
    <div className={`avatar avatar-${size}`} aria-hidden="true">
      {initials(name)}
    </div>
  );
}
