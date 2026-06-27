import { useEffect, useState } from 'react';
import { getReferralInfo } from '../api/index.js';

export default function InviteSection({ token }) {
  const [info, setInfo] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    getReferralInfo(token).then((data) => {
      if (data?.success) setInfo(data);
    });
  }, [token]);

  if (!info?.inviteUrl) return null;

  function copyLink() {
    navigator.clipboard?.writeText(info.inviteUrl).then(() => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <section className="card invite-section">
      <h2 className="section-title">Pozovi prijatelja</h2>
      <p className="muted">
        Podijeli link — besplatno je, bez nagrada za sada, ali pomaže maloj zajednici da raste.
      </p>
      <p className="muted">
        Pozvanih registracija: <strong>{info.invitedCount ?? 0}</strong>
      </p>
      <div className="invite-link-row">
        <input className="input" readOnly value={info.inviteUrl} aria-label="Referral link" />
        <button type="button" className="button button-secondary" onClick={copyLink}>
          {copied ? 'Kopirano' : 'Kopiraj link'}
        </button>
      </div>
      <p className="muted invite-code">Tvoj kod: <code>{info.referralCode}</code></p>
    </section>
  );
}
