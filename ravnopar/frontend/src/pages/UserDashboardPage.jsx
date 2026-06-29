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
import { trackEvent } from '../lib/analytics.js';
import { useI18n } from '../lib/i18n/index.jsx';

export default function UserDashboardPage({ token, profile }) {
  const { t, labels } = useI18n();
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
      setMessage(
        data.warning ? t('dashboard.contactSentWarning', { warning: data.warning }) : t('dashboard.contactSent'),
        'success'
      );
      advanceFeed();
    } else {
      setMessage(data?.error || t('dashboard.contactFailed'), 'error');
    }
    setActionBusy(false);
  }

  async function block(profileId) {
    setActionBusy(true);
    const data = await blockUser(token, profileId, t('dashboard.blockReason'));
    setMessage(
      data?.success ? t('dashboard.blocked') : data?.error || t('dashboard.blockFailed'),
      data?.success ? 'success' : 'error'
    );
    if (data?.success) advanceFeed();
    await reload();
    setActionBusy(false);
  }

  async function report(profileId) {
    const data = await reportUser(token, profileId, t('dashboard.reportReason'), t('dashboard.reportNote'));
    setMessage(
      data?.success ? t('dashboard.reported') : data?.error || t('dashboard.reportFailed'),
      data?.success ? 'success' : 'error'
    );
  }

  async function respond(contactId, action, requesterName) {
    setActionBusy(true);
    const data = await respondToContact(token, contactId, action);
    if (data?.success && action === 'ACCEPT') {
      markMatchDonateMoment();
      refreshDonatePrompt();
      setMatchModal({
        partnerName: data.partnerName || requesterName || t('common.user'),
        pairId: data.pairId
      });
    }
    setMessage(
      data?.success
        ? action === 'ACCEPT'
          ? t('dashboard.accepted')
          : t('dashboard.declined')
        : data?.error || t('dashboard.respondFailed'),
      data?.success ? 'success' : 'error'
    );
    await reload();
    setActionBusy(false);
  }

  async function closeCurrentPair() {
    if (!myState?.activePair) return;
    const data = await closePair(token, myState.activePair.id, t('dashboard.closeReason'));
    setMessage(
      data?.success ? t('dashboard.closed') : data?.error || t('dashboard.closeFailed'),
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
        <h1>{t('dashboard.greeting', { name: profile?.displayName })}</h1>
        <p className="subtitle">{t('dashboard.subtitle')}</p>
        {!loading && feed.length > 0 && (
          <p className="dashboard-feed-count">
            <span className="chip chip-feed-count">{t('dashboard.feedCount', { count: feed.length })}</span>
          </p>
        )}
        {!loading && feed.length === 0 && (
          <p className="muted">{t('dashboard.feedEmpty')}</p>
        )}
        <p className="auth-footer dashboard-links">
          <Link to="/app/postavke">{t('dashboard.settingsLink')}</Link>
        </p>
      </section>

      {loading && <p className="status-banner status-info">{t('dashboard.loading')}</p>}
      {status && <p className={`status-banner status-${statusKind}`}>{status}</p>}

      {donatePrompt.show && (
        <DonatePromptBanner
          reason={donatePrompt.reason}
          onDismiss={() => setDonatePrompt({ show: false, reason: null })}
        />
      )}

      {(myState?.completeness ?? 0) < 80 && feedReady && (
        <section className="card onboarding-hint">
          <p>
            <strong>
              {t('dashboard.incompleteTitle', { percent: myState?.completeness ?? 0 })}
            </strong>
          </p>
          <p className="muted">{t('dashboard.incompleteHint')}</p>
          <Link className="button button-secondary" to="/app/postavke">
            {t('dashboard.completeProfile')}
          </Link>
        </section>
      )}

      {inbox.items.length > 0 && (
        <section>
          <h2 className="section-title">
            {inbox.unreadTotal > 0
              ? t('dashboard.conversationsUnread', { count: inbox.unreadTotal })
              : t('dashboard.conversations')}
          </h2>
          <div className="inbox-list">
            {inbox.items.map((row) => (
              <Link key={row.pairId} className="card inbox-item" to={`/app/chat/${row.pairId}`}>
                <strong>{row.partnerName}</strong>
                {row.unread > 0 ? (
                  <span className="chip inbox-unread">{t('common.unreadCount', { count: row.unread })}</span>
                ) : (
                  <span className="muted">{t('dashboard.openChat')}</span>
                )}
              </Link>
            ))}
          </div>
        </section>
      )}

      {policyWarnings.length > 0 && (
        <section className="card warning">
          <strong>{t('dashboard.policyTitle')}</strong>
          <ul className="compact-list">
            {policyWarnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        </section>
      )}

      <section className="card status-card">
        <h2 className="section-title">{t('dashboard.statusTitle')}</h2>
        <div className="status-grid">
          <div>
            <span className="muted">{t('dashboard.availability')}</span>
            <p>
              <span className="chip">{labels.labelAvailability(myState?.profile?.availability)}</span>
            </p>
          </div>
          <div>
            <span className="muted">{t('dashboard.completeness')}</span>
            <p><strong>{t('common.percent', { percent: myState?.completeness ?? 0 })}</strong></p>
          </div>
          <div>
            <span className="muted">{t('dashboard.rating')}</span>
            <p>
              <strong>{myState?.rating?.average ? myState.rating.average.toFixed(1) : '—'}</strong>
              {myState?.rating?.count ? ` (${myState.rating.count})` : ''}
            </p>
          </div>
        </div>
        {myState?.activePair ? (
          <div className="active-contact">
            <p>{t('dashboard.activeContact', { name: myState.activePair.partnerName })}</p>
            <div className="card-actions">
              <Link className="button button-primary" to={`/app/chat/${myState.activePair.id}`}>
                {t('dashboard.openChatBtn')}
              </Link>
              <button type="button" className="button button-secondary" onClick={closeCurrentPair}>
                {t('dashboard.closeContact')}
              </button>
            </div>
          </div>
        ) : (
          <p className="muted">{t('dashboard.visibleInFeed')}</p>
        )}
      </section>

      {incoming.length > 0 && (
        <section>
          <h2 className="section-title">{t('dashboard.incomingTitle')}</h2>
          <div className="incoming-stack">
            {incoming.map((row) => (
              <article key={row.id} className="card incoming-card">
                <PhotoGallery photos={row.requester?.photos} alt={row.requester?.displayName} />
                <div className="incoming-card-body">
                  <h3>{row.requester?.displayName || t('common.user')}</h3>
                  <p className="muted">
                    {row.requester?.city}, {row.requester?.age} {t('common.yearsShort')}
                  </p>
                  {row.requester?.bio && <p className="profile-bio">{row.requester.bio}</p>}
                  <div className="card-actions">
                    <button
                      type="button"
                      className="button button-primary"
                      disabled={actionBusy}
                      onClick={() => respond(row.id, 'ACCEPT', row.requester?.displayName)}
                    >
                      {t('dashboard.accept')}
                    </button>
                    <button
                      type="button"
                      className="button button-secondary"
                      disabled={actionBusy}
                      onClick={() => respond(row.id, 'DECLINE')}
                    >
                      {t('dashboard.decline')}
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
          {t('dashboard.discoverTitle')}
          {!loading && feed.length > 0 && feedReady && (
            <span className="muted feed-section-count">
              {t('dashboard.discoverCount', { count: feed.length })}
            </span>
          )}
        </h2>

        {!loading && !feedReady && (
          <div className="card empty-state empty-state-rich profile-gate">
            <span className="empty-icon" aria-hidden="true">📷</span>
            <h3>{t('dashboard.gateTitle')}</h3>
            <p className="muted">{t('dashboard.gateHint')}</p>
            <Link className="button button-primary" to="/app/postavke">
              {t('dashboard.completeProfile')}
            </Link>
            <Link className="button button-ghost" to="/app/onboarding">
              {t('dashboard.gateOnboarding')}
            </Link>
          </div>
        )}

        {feedReady && !loading && feed.length === 0 && (
          <div className="card empty-state empty-state-rich">
            <span className="empty-icon" aria-hidden="true">♥</span>
            <h3>{t('dashboard.emptyTitle')}</h3>
            <p className="muted">{t('dashboard.emptyHint')}</p>
            <Link className="button button-primary" to="/app/postavke">
              {t('dashboard.expandPreferences')}
            </Link>
          </div>
        )}
        {feedReady && !loading && feed.length > 0 && feedIndex >= feed.length && (
          <div className="card empty-state empty-state-rich">
            <span className="empty-icon" aria-hidden="true">✨</span>
            <h3>{t('dashboard.seenAllTitle')}</h3>
            <p className="muted">{t('dashboard.seenAllHint')}</p>
            <button type="button" className="button button-secondary" onClick={() => setFeedIndex(0)}>
              {t('dashboard.seenAllAgain')}
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
            {t('dashboard.feedCounter', { current: feedIndex + 1, total: feed.length })}
          </p>
        )}
      </section>
    </main>
  );
}
