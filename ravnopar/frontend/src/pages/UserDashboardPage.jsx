import { useEffect, useState } from 'react';
import {
  blockUser,
  closePair,
  createBankTransferOrder,
  createStripeCheckout,
  getFeed,
  getMyState,
  getMyOrders,
  policyCheck,
  rateUser,
  reportUser,
  respondToContact,
  sendContactRequest
} from '../api/index.js';

export default function UserDashboardPage({ token, profile, onLogout }) {
  const [feed, setFeed] = useState([]);
  const [myState, setMyState] = useState(null);
  const [status, setStatus] = useState('');
  const [policyWarnings, setPolicyWarnings] = useState([]);
  const [orders, setOrders] = useState([]);
  const [paymentAmount, setPaymentAmount] = useState(990);
  const [paymentDescription, setPaymentDescription] = useState('Ravnopar premium');

  async function reload() {
    const [feedData, stateData, ordersData] = await Promise.all([getFeed(token), getMyState(token), getMyOrders(token)]);
    if (feedData?.success) setFeed(feedData.items || []);
    if (stateData?.success) setMyState(stateData);
    if (ordersData?.success) setOrders(ordersData.items || []);
  }

  useEffect(() => {
    reload();
  }, []);

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
      setStatus(data.warning ? `Poslan zahtjev. Napomena: ${data.warning}` : 'Poslan zahtjev za kontakt.');
    } else {
      setStatus(data?.error || 'Nije uspjelo.');
    }
    await reload();
  }

  async function block(profileId) {
    const data = await blockUser(token, profileId, 'User preference');
    setStatus(data?.success ? 'Korisnik je blokiran.' : data?.error || 'Block nije uspio.');
    await reload();
  }

  async function report(profileId) {
    const data = await reportUser(token, profileId, 'Neprimjereno ponasanje', 'Prijava iz user dashboarda.');
    setStatus(data?.success ? 'Prijava je zaprimljena.' : data?.error || 'Report nije uspio.');
  }

  async function rate(profileId, score) {
    const data = await rateUser(token, profileId, score, 'Ocjena nakon razgovora');
    setStatus(data?.success ? 'Ocjena spremljena.' : data?.error || 'Ocjenjivanje nije uspjelo.');
  }

  async function payStripe() {
    const data = await createStripeCheckout(token, paymentAmount, paymentDescription);
    if (data?.success && data.checkoutUrl) {
      window.open(data.checkoutUrl, '_blank', 'noopener,noreferrer');
      setStatus('Stripe checkout otvoren u novom tabu.');
      await reload();
    } else {
      setStatus(data?.error || 'Stripe checkout nije uspio.');
    }
  }

  async function payBank() {
    const data = await createBankTransferOrder(token, paymentAmount, paymentDescription);
    if (data?.success) {
      setStatus(`Kreirana uplata. Referenca: ${data.bankTransferReference}`);
      await reload();
    } else {
      setStatus(data?.error || 'Bank transfer zahtjev nije uspio.');
    }
  }

  async function respond(contactId, action) {
    const data = await respondToContact(token, contactId, action);
    setStatus(data?.success ? 'Odgovor spremljen.' : data?.error || 'Nije uspjelo.');
    await reload();
  }

  async function closeCurrentPair() {
    if (!myState?.activePair) return;
    const data = await closePair(token, myState.activePair.id, 'User closed contact');
    setStatus(data?.success ? 'Kontakt zatvoren, vraceni ste u dostupne.' : data?.error || 'Nije uspjelo.');
    await reload();
  }

  return (
    <main className="page">
      <section className="hero">
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ marginBottom: 6 }}>Pozdrav, {profile?.displayName}</h1>
            <p className="subtitle" style={{ marginTop: 0 }}>Ovo je tvoj fer feed bez skrivenog smanjenja dosega.</p>
          </div>
          <button type="button" onClick={onLogout}>Odjava</button>
        </div>
      </section>

      {status && <p className={status.includes('Nije') || status.includes('nije') ? 'warning' : 'success-note'}>{status}</p>}
      {policyWarnings.length > 0 && (
        <section className="card warning">
          <strong>Soft upozorenja za preuske preferencije</strong>
          <ul>
            {policyWarnings.map((w) => (
              <li key={w}>{w}</li>
            ))}
          </ul>
        </section>
      )}

      <section className="card">
        <h3 className="section-title">Moj status</h3>
        <p>Dostupnost: <span className="chip">{myState?.profile?.availability || '-'}</span></p>
        <p>Profil completeness: <span className="chip">{myState?.completeness ?? 0}%</span></p>
        <div style={{ width: '100%', background: '#e5e7eb', borderRadius: 999, height: 10, marginBottom: 10 }}>
          <div
            style={{
              width: `${myState?.completeness ?? 0}%`,
              background: '#4f46e5',
              height: '100%',
              borderRadius: 999
            }}
          />
        </div>
        <p>Prosjecna ocjena: {myState?.rating?.average ? myState.rating.average.toFixed(2) : '-'} ({myState?.rating?.count || 0})</p>
        {myState?.activePair ? (
          <>
            <p>Aktivni kontakt: <code>{myState.activePair.id}</code></p>
            <button type="button" onClick={closeCurrentPair}>Zatvori trenutni kontakt</button>
          </>
        ) : (
          <p>Nemate aktivan par.</p>
        )}
      </section>

      <section className="card">
        <h3 className="section-title">Dolazni zahtjevi</h3>
        <ul>
          {(myState?.pendingIncoming || []).map((row) => (
            <li key={row.id}>
              Zahtjev: {row.requesterId}{' '}
              <button type="button" onClick={() => respond(row.id, 'ACCEPT')}>Prihvati</button>{' '}
              <button type="button" onClick={() => respond(row.id, 'DECLINE')}>Odbij</button>
            </li>
          ))}
        </ul>
        {(myState?.pendingIncoming || []).length === 0 && <p className="muted">Nema novih zahtjeva trenutno.</p>}
      </section>

      <section className="card">
        <h3 className="section-title">Feed dostupnih profila</h3>
        <ul>
          {feed.map((item) => (
            <li key={item.id}>
              {item.displayName} ({item.city}, {item.age}) | completeness: {item.completeness || 0}%{' '}
              <button type="button" onClick={() => contact(item.id)}>Posalji kontakt</button>
              <button type="button" onClick={() => report(item.id)} style={{ marginLeft: 6 }}>Report</button>
              <button type="button" onClick={() => block(item.id)} style={{ marginLeft: 6 }}>Block</button>
              <button type="button" onClick={() => rate(item.id, 5)} style={{ marginLeft: 6 }}>Ocijeni 5</button>
            </li>
          ))}
        </ul>
        {feed.length === 0 && (
          <p className="muted">
            Trenutno nema kompatibilnih profila. Sustav ne skriva domet, nego ceka nove ulaske i promjene preferencija.
          </p>
        )}
      </section>

      <section className="card">
        <h3 className="section-title">Placanje</h3>
        <label>Iznos (centi)
          <input type="number" value={paymentAmount} onChange={(e) => setPaymentAmount(Number(e.target.value))} />
        </label>
        <label>Opis
          <input value={paymentDescription} onChange={(e) => setPaymentDescription(e.target.value)} />
        </label>
        <div className="row">
          <button type="button" onClick={payStripe}>Plati karticom (Stripe)</button>
          <button type="button" onClick={payBank}>Bank transfer</button>
        </div>
        <ul className="compact-list">
          {orders.slice(0, 5).map((order) => (
            <li key={order.id}>
              {order.provider} | {order.status} | {(order.amountCents / 100).toFixed(2)} {order.currency}
              {order.bankTransferReference ? ` | ref: ${order.bankTransferReference}` : ''}
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
