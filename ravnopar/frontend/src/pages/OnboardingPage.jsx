import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getProfile, updateProfile } from '../api/index.js';
import PageMeta from '../components/PageMeta.jsx';
import { trackEvent } from '../lib/analytics.js';
import { useI18n } from '../lib/i18n/index.jsx';

function hasPhoto(profile) {
  return Array.isArray(profile?.photos) && profile.photos.length > 0;
}

function hasBio(profile) {
  return typeof profile?.bio === 'string' && profile.bio.trim().length >= 10;
}

export default function OnboardingPage({ token, onDone }) {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [status, setStatus] = useState('');

  useEffect(() => {
    trackEvent('Onboarding View');
    getProfile(token).then((data) => {
      if (data?.success) setProfile(data.profile);
    });
  }, [token]);

  const photoOk = hasPhoto(profile);
  const bioOk = hasBio(profile);
  const canFinish = photoOk && bioOk;

  async function finish() {
    if (!canFinish) {
      setStatus(t('onboarding.incompleteError'));
      return;
    }
    const data = await updateProfile(token, { onboardingDone: true });
    if (!data?.success) {
      setStatus(data?.error || t('onboarding.saveFailed'));
      return;
    }
    trackEvent('Onboarding Complete');
    onDone?.();
    navigate('/app');
  }

  return (
    <main className="page onboarding-page">
      <PageMeta titleKey="onboarding" descriptionKey="onboarding" />
      <section className="landing-hero planovi-hero-warm">
        <p className="eyebrow">{t('onboarding.eyebrow')}</p>
        <h1>{t('onboarding.title')}</h1>
        <p className="landing-lead">{t('onboarding.lead')}</p>
      </section>

      {status && <p className="status-banner status-error">{status}</p>}

      <div className="onboarding-checklist">
        <article className={`card onboarding-check ${photoOk ? 'done' : ''}`}>
          <h2 className="section-title">
            {t('onboarding.stepPhoto')} {photoOk ? '✓' : ''}
          </h2>
          <p className="muted">{t('onboarding.stepPhotoHint')}</p>
          <Link className="button button-secondary" to="/app/postavke">
            {photoOk ? t('onboarding.changePhoto') : t('onboarding.addPhoto')}
          </Link>
        </article>
        <article className={`card onboarding-check ${bioOk ? 'done' : ''}`}>
          <h2 className="section-title">
            {t('onboarding.stepBio')} {bioOk ? '✓' : ''}
          </h2>
          <p className="muted">{t('onboarding.stepBioHint')}</p>
          <Link className="button button-secondary" to="/app/postavke">
            {bioOk ? t('onboarding.editBio') : t('onboarding.writeBio')}
          </Link>
        </article>
        <article className="card onboarding-check">
          <h2 className="section-title">{t('onboarding.stepFeed')}</h2>
          <p className="muted">{t('onboarding.stepFeedHint')}</p>
        </article>
      </div>

      <button
        type="button"
        className="button button-primary button-lg"
        onClick={finish}
        disabled={!canFinish}
        title={!canFinish ? t('onboarding.finishHint') : undefined}
      >
        {canFinish ? t('onboarding.finishReady') : t('onboarding.finishIncomplete')}
      </button>
    </main>
  );
}
