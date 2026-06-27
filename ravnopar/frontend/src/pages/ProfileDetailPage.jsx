import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { blockUser, getPublicProfile, reportUser, sendContactRequest } from '../api/index.js';
import PageMeta from '../components/PageMeta.jsx';
import ProfileAvatar from '../components/ProfileAvatar.jsx';
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
          <div className="profile-detail-head">
            <ProfileAvatar person={person} size="lg" />
            <div>
              <h1>{person.displayName}</h1>
              <p className="muted">{person.city}, {person.age} god.</p>
              {person.photoVerified && <span className="chip">Verificiran profil</span>}
              {person.planTier !== 'free' && <span className="chip">Supporter</span>}
            </div>
          </div>
          {person.photos?.length > 1 && (
            <div className="photo-gallery">
              {person.photos.slice(1).map((photo) => (
                <img key={photo.slice(-24)} src={photo} alt="" className="photo-thumb" />
              ))}
            </div>
          )}
          {person.bio && <p className="profile-bio">{person.bio}</p>}
          <div className="profile-tags">
            <span className="chip">{labelIdentity(person.identity)}</span>
            <span className="chip">{labelProfileType(person.profileType)}</span>
          </div>
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
