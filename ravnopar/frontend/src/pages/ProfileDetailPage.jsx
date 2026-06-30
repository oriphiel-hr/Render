import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { blockUser, getPublicProfile, reportUser, sendContactRequest } from '../api/index.js';
import SupporterBadge from '../components/SupporterBadge.jsx';
import PhotoGallery from '../components/PhotoGallery.jsx';
import { ActivityChip, CommonTagsLine, LifestyleChipList, ProfileSignalChips, ProfileTagList } from '../components/ProfileTagList.jsx';
import VideoEmbed from '../components/VideoEmbed.jsx';
import { useI18n } from '../lib/i18n/index.jsx';

export default function ProfileDetailPage({ token, myProfileId }) {
  const { t, labels } = useI18n();
  const { profileId } = useParams();
  const navigate = useNavigate();
  const [person, setPerson] = useState(null);
  const [canViewPrivate, setCanViewPrivate] = useState(false);
  const [status, setStatus] = useState('');
  const isSelf = profileId === myProfileId;

  useEffect(() => {
    getPublicProfile(token, profileId).then((data) => {
      if (data?.success) {
        setPerson(data.profile);
        setCanViewPrivate(Boolean(data.canViewPrivateTags));
      } else setStatus(data?.error || t('profile.unavailable'));
    });
  }, [token, profileId, t]);

  async function contact() {
    const data = await sendContactRequest(token, profileId);
    setStatus(data?.success ? t('profile.requestSent') : data?.error || t('profile.requestFailed'));
  }

  async function block() {
    const data = await blockUser(token, profileId, t('profile.blockReason'));
    if (data?.success) navigate('/app');
  }

  async function report() {
    const data = await reportUser(token, profileId, t('profile.reportReason'), t('profile.reportNote'));
    setStatus(data?.success ? t('profile.reportDone') : data?.error || t('profile.reportFailed'));
  }

  if (!person && !status) {
    return (
      <main className="page">
        <p className="muted">{t('profile.loading')}</p>
      </main>
    );
  }

  return (
    <main className="page profile-detail-page">
      <PageMeta title={person?.displayName || t('meta.titles.profile')} />
      <p className="auth-footer"><Link to="/app">{t('profile.back')}</Link></p>
      {status && <p className="status-banner status-info">{status}</p>}
      {person && (
        <article className="card profile-detail-card">
          <PhotoGallery photos={person.photos} alt={person.displayName} className="profile-detail-gallery" />
          <div className="profile-detail-head">
            <div>
              <h1>{person.displayName}</h1>
              <p className="muted">
                {person.city}, {person.age} {t('common.yearsShort')}
                <ActivityChip status={person.activityStatus} />
                <ProfileSignalChips person={person} />
                {person.distanceLabel && <span className="chip chip-distance">{person.distanceLabel}</span>}
              </p>
              <div className="profile-tags">
                {person.photoVerified && <span className="chip chip-verified">{t('profile.verified')}</span>}
                <SupporterBadge person={person} />
                <span className="chip">{labels.labelIdentity(person.identity)}</span>
                <span className="chip">{labels.labelProfileType(person.profileType)}</span>
              </div>
            </div>
          </div>
          {person.bio && <p className="profile-bio">{person.bio}</p>}
          {(person.publicTags?.length > 0 || person.commonTags?.length > 0) && (
            <section className="profile-tags-section">
              <h2 className="subsection-title">{t('profile.interests')}</h2>
              <ProfileTagList tags={person.publicTags} scope="public" />
              <CommonTagsLine tags={person.commonTags} />
            </section>
          )}
          {(person.childrenPref || person.smoking || person.relationshipStatus) && (
            <section className="profile-tags-section">
              <h2 className="subsection-title">{t('profile.lifestyle')}</h2>
              <LifestyleChipList person={person} labels={labels} />
            </section>
          )}
          <section className="profile-tags-section profile-tags-private">
            <h2 className="subsection-title">{t('profile.privatePreferences')}</h2>
            {canViewPrivate || isSelf ? (
              person.privateTags?.length > 0 ? (
                <ProfileTagList tags={person.privateTags} scope="private" />
              ) : (
                <p className="muted">{t('profile.noPrivateTags')}</p>
              )
            ) : (
              <p className="muted">{t('profile.privateLocked')}</p>
            )}
          </section>
          {person.videoUrl && (
            <div className="profile-video-block">
              <h2 className="subsection-title">{t('profile.video')}</h2>
              <VideoEmbed url={person.videoUrl} />
            </div>
          )}
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
          <p className="muted">
            {t('profile.seeking')} {(person.intents || []).map((i) => labels.labelIntent(i)).join(', ')}
          </p>
          {!isSelf && (
            <div className="card-actions">
              <button type="button" className="button button-primary" onClick={contact}>
                {t('profile.sendRequest')}
              </button>
              <button type="button" className="button button-ghost" onClick={report}>
                {t('profile.report')}
              </button>
              <button type="button" className="button button-ghost" onClick={block}>
                {t('profile.block')}
              </button>
            </div>
          )}
        </article>
      )}
    </main>
  );
}
