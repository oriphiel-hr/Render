import { useI18n } from '../lib/i18n/index.jsx';
import { formatActivityStatus, formatTagLabel } from '../lib/profile-tags.js';

export function ActivityChip({ status }) {
  const { t } = useI18n();
  const label = formatActivityStatus(t, status);
  if (!label) return null;
  const online = status === 'online';
  return <span className={`chip chip-activity ${online ? 'chip-online' : ''}`}>{label}</span>;
}

export function ProfileTagList({ tags = [], scope = 'public', className = '' }) {
  const { t } = useI18n();
  if (!tags?.length) return null;
  return (
    <div className={`profile-tag-list ${className}`.trim()}>
      {tags.map((tag) => (
        <span key={tag} className={`chip chip-tag chip-tag-${scope}`}>
          {formatTagLabel(t, tag, scope)}
        </span>
      ))}
    </div>
  );
}

export function CommonTagsLine({ tags = [] }) {
  const { t } = useI18n();
  if (!tags?.length) return null;
  const labels = tags.map((tag) => formatTagLabel(t, tag, 'public'));
  return <p className="profile-common-tags muted">{t('tags.common', { tags: labels.join(', ') })}</p>;
}

export function LifestyleChipList({ person, labels }) {
  const chips = [];
  if (person?.childrenPref) chips.push({ key: 'children', label: labels.labelChildren(person.childrenPref) });
  if (person?.smoking) chips.push({ key: 'smoking', label: labels.labelSmoking(person.smoking) });
  if (person?.relationshipStatus) {
    chips.push({ key: 'relationship', label: labels.labelRelationship(person.relationshipStatus) });
  }
  if (!chips.length) return null;
  return (
    <div className="profile-tag-list profile-lifestyle-list">
      {chips.map((chip) => (
        <span key={chip.key} className="chip chip-lifestyle">
          {chip.label}
        </span>
      ))}
    </div>
  );
}

export function ProfileSignalChips({ person }) {
  const { t } = useI18n();
  const chips = [];
  if (person?.awaitingContact) {
    chips.push({ key: 'awaiting', label: t('swipe.awaitingContact'), className: 'chip-awaiting' });
  }
  if ((person?.photoCount ?? person?.photos?.length ?? 0) >= 3) {
    chips.push({
      key: 'photos',
      label: t('swipe.multiPhotos', { count: person.photoCount ?? person.photos.length }),
      className: 'chip-photos'
    });
  }
  if (person?.fullProfile || (person?.completeness ?? 0) >= 90) {
    chips.push({ key: 'full', label: t('swipe.fullProfile'), className: 'chip-full-profile' });
  }
  if (!chips.length) return null;
  return (
    <div className="profile-signal-list">
      {chips.map((chip) => (
        <span key={chip.key} className={`chip chip-signal ${chip.className}`}>
          {chip.label}
        </span>
      ))}
    </div>
  );
}
