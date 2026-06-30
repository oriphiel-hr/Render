import { useI18n } from '../lib/i18n/index.jsx';

export default function SupporterBadge({ person }) {
  const { t } = useI18n();
  if (!person) return null;

  if (person.isDonorSupporter) {
    return <span className="chip chip-donor">{t('profile.donorSupporter')}</span>;
  }
  if (person.planTier === 'plus') {
    return <span className="chip chip-plan-plus">{t('profile.planPlus')}</span>;
  }
  if (person.planTier === 'supporter') {
    return <span className="chip chip-plan-supporter">{t('profile.supporter')}</span>;
  }
  return null;
}
