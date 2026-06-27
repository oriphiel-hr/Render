import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { blockUser, getPublicProfile, reportUser, sendContactRequest } from '../api/index.js';
import PageMeta from '../components/PageMeta.jsx';
import PhotoGallery from '../components/PhotoGallery.jsx';
import VideoEmbed from '../components/VideoEmbed.jsx';
import { labelIdentity, labelIntent, labelProfileType } from '../lib/labels.js';

export default function ProfileDetailPage({ token, myProfileId }) {
  const { profileId } = useParams();
  const navigate = useNavigate();
  const [person, setPerson] = useState(null);
  const [status, setStatus] = useState('');
  const isSelf = profileId === myProfileId;

  useEffect(() => {
    getPublicProfile(token, profileId).then((data) => {
      if (data?.success) setPerson(data.profile);
      else setStatus(data?.error || 'Profil nije dostupan.');
    });
  }, [token, profileId]);

  async function contact() {
    const data = await sendContactRequest(token, profileId);
    setStatus(data?.success ? 'Zahtjev poslan.' : data?.error || 'Slanje nije uspjelo.');
  }

  async function block() {
    const data = await blockUser(token, profileId, 'Korisnička preferenca');
    if (data?.success) navigate('/app');
  }

  async function report() {
    const data = await reportUser(token, profileId, 'Neprimjereno ponašanje', 'Prijava s profila.');
    setStatus(data?.success ? 'Prijava zaprimljena.' : data?.error || 'Prijava nije uspjela.');
  }

  if (!person && !status) return <main className="page"><p className="muted">Učitavanje...</p></main>;

  return (
    <main className="page profile-detail-page">
      <PageMeta title={person?.displayName || 'Profil'} />
      <p className="auth-footer"><Link to="/app">← Natrag</Link></p>
      {status && <p className="status-banner status-info">{status}</p>}
      {person && (
        <article className="card profile-detail-card">
          <PhotoGallery photos={person.photos} alt={person.displayName} className="profile-detail-gallery" />
          <div className="profile-detail-head">
            <div>
              <h1>{person.displayName}</h1>
              <p className="muted">
                {person.city}, {person.age} god.
                {person.distanceLabel && <span className="chip chip-distance">{person.distanceLabel}</span>}
              </p>
              <div className="profile-tags">
                {person.photoVerified && <span className="chip chip-verified">Verificiran profil</span>}
                {person.planTier !== 'free' && <span className="chip">Supporter</span>}
                <span className="chip">{labelIdentity(person.identity)}</span>
                <span className="chip">{labelProfileType(person.profileType)}</span>
              </div>
            </div>
          </div>
          {person.bio && <p className="profile-bio">{person.bio}</p>}
          {person.videoUrl && (
            <div className="profile-video-block">
              <h2 className="subsection-title">Video</h2>
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
            Traži: {(person.intents || []).map((i) => labelIntent(i)).join(', ')}
          </p>
          {!isSelf && (
            <div className="card-actions">
              <button type="button" className="button button-primary" onClick={contact}>
                Pošalji zahtjev
              </button>
              <button type="button" className="button button-ghost" onClick={report}>
                Prijavi
              </button>
              <button type="button" className="button button-ghost" onClick={block}>
                Blokiraj
              </button>
            </div>
          )}
        </article>
      )}
    </main>
  );
}
