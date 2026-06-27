import { useEffect, useState } from 'react';
import {
  blockUser,
  closePair,
  getFeed,
  getMyState,
  policyCheck,
  rateUser,
  reportUser,
  respondToContact,
  sendContactRequest
} from '../api/index.js';
import DonatePromptBanner from '../components/DonatePromptBanner.jsx';
import { isDonateConfigured } from '../lib/donate-config.js';
import {
  getDonatePrompt,
  markMatchDonateMoment,
  recordMemberSinceIfNeeded
} from '../lib/donate-prompt.js';
import {
  initials,
  labelAvailability,
  labelIdentity,
  labelIntent,
  labelProfileType
} from '../lib/labels.js';

function normalizeList(value) {
  return Array.isArray(value) ? value : [];
}

function ProfileCard({ person, children }) {
  const intents = normalizeList(person.intents);
  return (
    <article className="profile-card">
      <div className="profile-card-head">
        <div className="avatar" aria-hidden="true">{initials(person.displayName)}</div>
        <div>
          <h3>{person.displayName}</h3>
          <p className="muted profile-meta">
            {person.city}, {person.age} god.
          </p>
        </div>
      </div>
      <div className="profile-tags">
        <span className="chip">{labelIdentity(person.identity)}</span>
        <span className="chip">{labelProfileType(person.profileType)}</span>
      </div>
      {intents.length > 0 && (
        <p className="profile-intents muted">
          Traži: {intents.map((item) => labelIntent(item)).join(', ')}
        </p>
      )}
      {typeof person.completeness === 'number' && (
        <div className="progress-block">
          <div className="progress-label">
            <span>Popunjenost profila</span>
            <strong>{person.completeness}%</strong>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${person.completeness}%` }} />
          </div>
        </div>
      )}
      {children}
    </article>
  );
}

export default function UserDashboardPage({ token, profile }) {
  const [feed, setFeed] = useState([]);
  const [myState, setMyState] = useState(null);
  const [status, setStatus] = useState('');
  const [statusKind, setStatusKind] = useState('info');
  const [policyWarnings, setPolicyWarnings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [donatePrompt, setDonatePrompt] = useState({ show: false, reason: null });

  function refreshDonatePrompt() {
    if (!isDonateConfigured()) {
      setDonatePrompt({ show: false, reason: null });
      return;
    }
    setDonatePrompt(getDonatePrompt());
  }

  function setMessage(message, kind = 'info') {
    setStatus(message);
    setStatusKind(kind);
  }

  async function reload() {
    setLoading(true);
    try {
      const [feedData, stateData] = await Promise.all([getFeed(token), getMyState(token)]);
      if (feedData?.success) setFeed(feedData.items || []);
      if (stateData?.success) {
        setMyState(stateData);
        if (stateData.activePair) {
          markMatchDonateMoment();
        }
      }
    } finally {
      setLoading(false);
      refreshDonatePrompt();
    }
  }

  useEffect(() => {
    recordMemberSinceIfNeeded();
    refreshDonatePrompt();
    reload();
  }, [token]);

  useEffect(() => {
    async function runPolicyCheck() {
      const data = await policyCheck(token, {
        ageMin: 25,
        ageMax: 28,
        cities: [profile?.city || 'Zagreb'],
        distanceKm: 8
      });
      if (data?.success) {
        setPolicyWarnings(data.result?.warnings || []);
      }
    }
    runPolicyCheck();
  }, [token, profile?.city]);

  async function contact(id) {
    const data = await sendContactRequest(token, id);
    if (data?.success) {
      setMessage(
        data.warning ? `Zahtjev poslan. Napomena: ${data.warning}` : 'Zahtjev za kontakt je poslan.',
        'success'
      );
    } else {
      setMessage(data?.error || 'Slanje zahtjeva nije uspjelo.', 'error');
    }
    await reload();
  }

  async function block(profileId) {
    const data = await blockUser(token, profileId, 'Korisnička preferenca');
    setMessage(data?.success ? 'Korisnik je blokiran.' : data?.error || 'Blokiranje nije uspjelo.', data?.success ? 'success' : 'error');
    await reload();
  }

  async function report(profileId) {
    const data = await reportUser(token, profileId, 'Neprimjereno ponašanje', 'Prijava iz korisničkog sučelja.');
    setMessage(data?.success ? 'Prijava je zaprimljena. Hvala.' : data?.error || 'Prijava nije uspjela.', data?.success ? 'success' : 'error');
  }

  async function rate(profileId, score) {
    const data = await rateUser(token, profileId, score, 'Ocjena nakon razgovora');
    setMessage(data?.success ? 'Ocjena je spremljena.' : data?.error || 'Ocjenjivanje nije uspjelo.', data?.success ? 'success' : 'error');
  }

  async function respond(contactId, action) {
    const data = await respondToContact(token, contactId, action);
    if (data?.success && action === 'ACCEPT') {
      markMatchDonateMoment();
      refreshDonatePrompt();
    }
    setMessage(
      data?.success
        ? action === 'ACCEPT'
          ? 'Kontakt je prihvaćen.'
          : 'Zahtjev je odbijen.'
        : data?.error || 'Odgovor nije spremljen.',
      data?.success ? 'success' : 'error'
    );
    await reload();
  }

  async function closeCurrentPair() {
    if (!myState?.activePair) return;
    const data = await closePair(token, myState.activePair.id, 'Korisnik je zatvorio kontakt');
    setMessage(
      data?.success ? 'Kontakt zatvoren. Ponovno si dostupan/na u feedu.' : data?.error || 'Zatvaranje nije uspjelo.',
      data?.success ? 'success' : 'error'
    );
    await reload();
  }

  const incoming = myState?.pendingIncoming || [];

  return (
    <main className="page dashboard-page">
      <section className="hero dashboard-hero">
        <h1>Pozdrav, {profile?.displayName}</h1>
        <p className="subtitle">Ovdje pronalaziš profile koji odgovaraju tvojim preferencijama.</p>
      </section>

      {loading && <p className="status-banner status-info">Učitavanje...</p>}
      {status && <p className={`status-banner status-${statusKind}`}>{status}</p>}

      {donatePrompt.show && (
        <DonatePromptBanner
          reason={donatePrompt.reason}
          onDismiss={() => setDonatePrompt({ show: false, reason: null })}
        />
      )}

      {policyWarnings.length > 0 && (
        <section className="card warning">
          <strong>Preuske preference</strong>
          <ul className="compact-list">
            {policyWarnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        </section>
      )}

      <section className="card status-card">
        <h2 className="section-title">Tvoj status</h2>
        <div className="status-grid">
          <div>
            <span className="muted">Dostupnost</span>
            <p><span className="chip">{labelAvailability(myState?.profile?.availability)}</span></p>
          </div>
          <div>
            <span className="muted">Popunjenost profila</span>
            <p><strong>{myState?.completeness ?? 0}%</strong></p>
          </div>
          <div>
            <span className="muted">Prosječna ocjena</span>
            <p>
              <strong>
                {myState?.rating?.average ? myState.rating.average.toFixed(1) : '—'}
              </strong>
              {myState?.rating?.count ? ` (${myState.rating.count})` : ''}
            </p>
          </div>
        </div>
        {myState?.activePair ? (
          <div className="active-contact">
            <p>Trenutno si u aktivnom razgovoru s <strong>{myState.activePair.partnerName}</strong>.</p>
            <button type="button" className="button button-secondary" onClick={closeCurrentPair}>
              Završi razgovor
            </button>
          </div>
        ) : (
          <p className="muted">Trenutno nemaš aktivan razgovor — vidljiv/a si u feedu drugima.</p>
        )}
      </section>

      {incoming.length > 0 && (
        <section>
          <h2 className="section-title">Zahtjevi za kontakt</h2>
          <div className="profile-grid">
            {incoming.map((row) => (
              <ProfileCard key={row.id} person={row.requester || { displayName: 'Korisnik', city: '—', age: '—' }}>
                <div className="card-actions">
                  <button type="button" className="button button-primary" onClick={() => respond(row.id, 'ACCEPT')}>
                    Prihvati
                  </button>
                  <button type="button" className="button button-secondary" onClick={() => respond(row.id, 'DECLINE')}>
                    Odbij
                  </button>
                </div>
              </ProfileCard>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="section-title">Dostupni profili</h2>
        {feed.length === 0 && !loading && (
          <div className="card empty-state">
            <p>Trenutno nema kompatibilnih profila.</p>
            <p className="muted">Vrati se uskoro — sustav ne skriva doseg, nego čeka nove korisnike i promjene preferencija.</p>
          </div>
        )}
        <div className="profile-grid">
          {feed.map((item) => (
            <ProfileCard key={item.id} person={item}>
              <div className="card-actions">
                <button type="button" className="button button-primary" onClick={() => contact(item.id)}>
                  Pošalji zahtjev
                </button>
                <button type="button" className="button button-ghost" onClick={() => rate(item.id, 5)}>
                  Ocijeni
                </button>
                <button type="button" className="button button-ghost" onClick={() => report(item.id)}>
                  Prijavi
                </button>
                <button type="button" className="button button-ghost" onClick={() => block(item.id)}>
                  Blokiraj
                </button>
              </div>
            </ProfileCard>
          ))}
        </div>
      </section>
    </main>
  );
}
