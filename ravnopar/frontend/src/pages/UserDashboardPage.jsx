import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  blockUser,
  closePair,
  getFeed,
  getInboxSummary,
  getMyState,
  policyCheck,
  reportUser,
  respondToContact,
  sendContactRequest
} from '../api/index.js';
import DonatePromptBanner from '../components/DonatePromptBanner.jsx';
import MatchModal from '../components/MatchModal.jsx';
import PhotoGallery from '../components/PhotoGallery.jsx';
import SwipeFeedCard from '../components/SwipeFeedCard.jsx';
import { isDonateConfigured } from '../lib/donate-config.js';
import {
  getDonatePrompt,
  markMatchDonateMoment,
  recordMemberSinceIfNeeded
} from '../lib/donate-prompt.js';
import { labelAvailability } from '../lib/labels.js';
import { trackEvent } from '../lib/analytics.js';

export default function UserDashboardPage({ token, profile }) {
  const [feed, setFeed] = useState([]);
  const [feedIndex, setFeedIndex] = useState(0);
  const [myState, setMyState] = useState(null);
  const [status, setStatus] = useState('');
  const [statusKind, setStatusKind] = useState('info');
  const [policyWarnings, setPolicyWarnings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionBusy, setActionBusy] = useState(false);
  const [donatePrompt, setDonatePrompt] = useState({ show: false, reason: null });
  const [inbox, setInbox] = useState({ unreadTotal: 0, items: [] });
  const [matchModal, setMatchModal] = useState(null);

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
      const [feedData, stateData, inboxData] = await Promise.all([
        getFeed(token),
        getMyState(token),
        getInboxSummary(token)
      ]);
      if (feedData?.success) {
        setFeed(feedData.items || []);
        setFeedIndex(0);
      }
      if (inboxData?.success) {
        setInbox({ unreadTotal: inboxData.unreadTotal || 0, items: inboxData.items || [] });
      }
      if (stateData?.success) {
        setMyState(stateData);
        if (stateData.activePair) markMatchDonateMoment();
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
    trackEvent('Feed View');
  }, [token]);

  useEffect(() => {
    async function runPolicyCheck() {
      const data = await policyCheck(token, {
        ageMin: 25,
        ageMax: 28,
        cities: [profile?.city || 'Zagreb'],
        distanceKm: 8
      });
      if (data?.success) setPolicyWarnings(data.result?.warnings || []);
    }
    runPolicyCheck();
  }, [token, profile?.city]);

  function advanceFeed() {
    setFeedIndex((i) => i + 1);
  }

  async function contact(id) {
    setActionBusy(true);
    const data = await sendContactRequest(token, id);
    if (data?.success) {
      setMessage(data.warning ? `Zahtjev poslan. ${data.warning}` : 'Zahtjev za kontakt je poslan.', 'success');
      advanceFeed();
    } else {
      setMessage(data?.error || 'Slanje zahtjeva nije uspjelo.', 'error');
    }
    setActionBusy(false);
  }

  async function block(profileId) {
    setActionBusy(true);
    const data = await blockUser(token, profileId, 'Korisnička preferenca');
    setMessage(data?.success ? 'Korisnik je blokiran.' : data?.error || 'Blokiranje nije uspjelo.', data?.success ? 'success' : 'error');
    if (data?.success) advanceFeed();
    await reload();
    setActionBusy(false);
  }

  async function report(profileId) {
    const data = await reportUser(token, profileId, 'Neprimjereno ponašanje', 'Prijava iz korisničkog sučelja.');
    setMessage(data?.success ? 'Prijava je zaprimljena. Hvala.' : data?.error || 'Prijava nije uspjela.', data?.success ? 'success' : 'error');
  }

  async function respond(contactId, action, requesterName) {
    setActionBusy(true);
    const data = await respondToContact(token, contactId, action);
    if (data?.success && action === 'ACCEPT') {
      markMatchDonateMoment();
      refreshDonatePrompt();
      setMatchModal({
        partnerName: data.partnerName || requesterName || 'Korisnik',
        pairId: data.pairId
      });
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
    setActionBusy(false);
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
  const currentPerson = feed[feedIndex];
  const feedReady = myState?.feedReady === true;

  return (
    <main className="page dashboard-page">
      {matchModal && (
        <MatchModal
          partnerName={matchModal.partnerName}
          pairId={matchModal.pairId}
          onClose={() => setMatchModal(null)}
        />
      )}

      <section className="hero dashboard-hero">
        <h1>Pozdrav, {profile?.displayName}</h1>
        <p className="subtitle">Swipeaj profile ili koristi gumbe — jedan po jedan, bez žurbe.</p>
        {!loading && feed.length > 0 && (
          <p className="dashboard-feed-count">
            <span className="chip chip-feed-count">{feed.length} profila u tvom feedu</span>
          </p>
        )}
        {!loading && feed.length === 0 && (
          <p className="muted">Trenutno nema kompatibilnih profila u tvom feedu.</p>
        )}
        <p className="auth-footer dashboard-links">
          <Link to="/app/postavke">Postavke profila</Link>
        </p>
      </section>

      {loading && <p className="status-banner status-info">Učitavanje...</p>}
      {status && <p className={`status-banner status-${statusKind}`}>{status}</p>}

      {donatePrompt.show && (
        <DonatePromptBanner
          reason={donatePrompt.reason}
          onDismiss={() => setDonatePrompt({ show: false, reason: null })}
        />
      )}

      {(myState?.completeness ?? 0) < 80 && feedReady && (
        <section className="card onboarding-hint">
          <p><strong>Profil ti još nije kompletan ({myState?.completeness ?? 0}%).</strong></p>
          <p className="muted">Dodaj fotografiju, bio i icebreaker — to povećava šanse za kontakt.</p>
          <Link className="button button-secondary" to="/app/postavke">Dovrši profil</Link>
        </section>
      )}

      {inbox.items.length > 0 && (
        <section>
          <h2 className="section-title">
            Razgovori{inbox.unreadTotal > 0 ? ` (${inbox.unreadTotal} novo)` : ''}
          </h2>
          <div className="inbox-list">
            {inbox.items.map((row) => (
              <Link key={row.pairId} className="card inbox-item" to={`/app/chat/${row.pairId}`}>
                <strong>{row.partnerName}</strong>
                {row.unread > 0 ? (
                  <span className="chip inbox-unread">{row.unread} novo</span>
                ) : (
                  <span className="muted">Otvori chat</span>
                )}
              </Link>
            ))}
          </div>
        </section>
      )}

      {policyWarnings.length > 0 && (
        <section className="card warning">
          <strong>Uz preference</strong>
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
            <span className="muted">Popunjenost</span>
            <p><strong>{myState?.completeness ?? 0}%</strong></p>
          </div>
          <div>
            <span className="muted">Prosječna ocjena</span>
            <p>
              <strong>{myState?.rating?.average ? myState.rating.average.toFixed(1) : '—'}</strong>
              {myState?.rating?.count ? ` (${myState.rating.count})` : ''}
            </p>
          </div>
        </div>
        {myState?.activePair ? (
          <div className="active-contact">
            <p>Trenutno razgovaraš s <strong>{myState.activePair.partnerName}</strong>.</p>
            <div className="card-actions">
              <Link className="button button-primary" to={`/app/chat/${myState.activePair.id}`}>
                Otvori chat
              </Link>
              <button type="button" className="button button-secondary" onClick={closeCurrentPair}>
                Završi razgovor
              </button>
            </div>
          </div>
        ) : (
          <p className="muted">Vidljiv/a si u feedu — swipeaj profile ispod.</p>
        )}
      </section>

      {incoming.length > 0 && (
        <section>
          <h2 className="section-title">Zahtjevi za kontakt</h2>
          <div className="incoming-stack">
            {incoming.map((row) => (
              <article key={row.id} className="card incoming-card">
                <PhotoGallery photos={row.requester?.photos} alt={row.requester?.displayName} />
                <div className="incoming-card-body">
                  <h3>{row.requester?.displayName || 'Korisnik'}</h3>
                  <p className="muted">{row.requester?.city}, {row.requester?.age} god.</p>
                  {row.requester?.bio && <p className="profile-bio">{row.requester.bio}</p>}
                  <div className="card-actions">
                    <button
                      type="button"
                      className="button button-primary"
                      disabled={actionBusy}
                      onClick={() => respond(row.id, 'ACCEPT', row.requester?.displayName)}
                    >
                      Prihvati
                    </button>
                    <button
                      type="button"
                      className="button button-secondary"
                      disabled={actionBusy}
                      onClick={() => respond(row.id, 'DECLINE')}
                    >
                      Odbij
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      <section className="feed-section">
        <h2 className="section-title">
          Otkrij profile
          {!loading && feed.length > 0 && feedReady && (
            <span className="muted feed-section-count"> · {feed.length} za tebe</span>
          )}
        </h2>

        {!loading && !feedReady && (
          <div className="card empty-state empty-state-rich profile-gate">
            <span className="empty-icon" aria-hidden="true">📷</span>
            <h3>Profil nije spreman za feed</h3>
            <p className="muted">
              Dodaj fotografiju i bio (min. 10 znakova) prije slanja zahtjeva i swipea.
            </p>
            <Link className="button button-primary" to="/app/postavke">Dovrši profil</Link>
            <Link className="button button-ghost" to="/app/onboarding">Pogledaj uvod</Link>
          </div>
        )}

        {feedReady && !loading && feed.length === 0 && (
          <div className="card empty-state empty-state-rich">
            <span className="empty-icon" aria-hidden="true">♥</span>
            <h3>Nema novih profila</h3>
            <p className="muted">
              Proširi grad ili preference u Postavkama — ili se vrati uskoro kad se netko novi registrira.
            </p>
            <Link className="button button-primary" to="/app/postavke">Proširi preference</Link>
          </div>
        )}
        {feedReady && !loading && feed.length > 0 && feedIndex >= feed.length && (
          <div className="card empty-state empty-state-rich">
            <span className="empty-icon" aria-hidden="true">✨</span>
            <h3>Pregledao/la si sve</h3>
            <p className="muted">Vrati se kasnije — novi profili se pojavljuju redovito.</p>
            <button type="button" className="button button-secondary" onClick={() => setFeedIndex(0)}>
              Pogledaj ponovo
            </button>
          </div>
        )}
        {feedReady && currentPerson && (
          <SwipeFeedCard
            person={currentPerson}
            myCity={profile?.city}
            busy={actionBusy}
            onLike={() => contact(currentPerson.id)}
            onPass={advanceFeed}
            onBlock={() => block(currentPerson.id)}
            onReport={() => report(currentPerson.id)}
          />
        )}
        {feedReady && feed.length > 0 && feedIndex < feed.length && (
          <p className="muted feed-counter">
            {feedIndex + 1} / {feed.length}
          </p>
        )}
      </section>
    </main>
  );
}
