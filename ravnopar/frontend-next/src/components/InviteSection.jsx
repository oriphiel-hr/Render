import { useEffect, useState } from 'react';
import { getReferralInfo } from '../api/index.js';
import ShareRavnopar from './ShareRavnopar.jsx';
import { useI18n } from '../lib/i18n/index.jsx';

export default function InviteSection({ token }) {
  const { t } = useI18n();
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
      <h2 className="section-title">{t('invite.title')}</h2>
      <p className="muted">{t('invite.hint')}</p>
      <ShareRavnopar url={info.inviteUrl} compact />
      <p className="muted">
        {t('invite.invitedCount')} <strong>{info.invitedCount ?? 0}</strong>
      </p>
      <div className="invite-link-row">
        <input className="input" readOnly value={info.inviteUrl} aria-label={t('invite.copyLink')} />
        <button type="button" className="button button-secondary" onClick={copyLink}>
          {copied ? t('common.copied') : t('invite.copyLink')}
        </button>
      </div>
      <p className="muted invite-code">
        {t('invite.yourCode')} <code>{info.referralCode}</code>
      </p>
    </section>
  );
}
