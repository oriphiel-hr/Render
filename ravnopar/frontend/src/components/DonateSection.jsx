import { useEffect, useState } from 'react';
import { createDonateCheckout, getDonateStatus } from '../api/index.js';
import {
  getDonateIban,
  getDonateRecipient,
  getDonateRevolutUrl,
  getDonateStripeUrl,
  hasIban,
  hasRevolut
} from '../lib/donate-config.js';
import { useI18n } from '../lib/i18n/index.jsx';

const IBAN = getDonateIban();
const RECIPIENT = getDonateRecipient();
const REVOLUT_URL = getDonateRevolutUrl();
const STRIPE_PAYMENT_LINK = getDonateStripeUrl();

function copyText(value, onDone) {
  if (!value) return;
  navigator.clipboard?.writeText(value).then(onDone).catch(() => {});
}

export default function DonateSection() {
  const { t } = useI18n();
  const reference = import.meta.env.VITE_DONATE_REFERENCE?.trim() || t('donate.defaultReference');
  const [copied, setCopied] = useState('');
  const [stripeEnabled, setStripeEnabled] = useState(false);
  const [amountsEur, setAmountsEur] = useState([3, 5, 10, 20]);
  const [busyAmount, setBusyAmount] = useState(null);
  const [cardError, setCardError] = useState('');

  const hasBank = hasIban();
  const hasRevolutLink = hasRevolut();
  const hasStripe = stripeEnabled || Boolean(STRIPE_PAYMENT_LINK);

  useEffect(() => {
    async function load() {
      const data = await getDonateStatus();
      if (data?.success && data.stripeEnabled) {
        setStripeEnabled(true);
        if (Array.isArray(data.amountsEur) && data.amountsEur.length > 0) {
          setAmountsEur(data.amountsEur);
        }
      }
    }
    load();
  }, []);

  if (!hasBank && !hasRevolutLink && !hasStripe) return null;

  function handleCopy(field, value) {
    copyText(value, () => {
      setCopied(field);
      window.setTimeout(() => setCopied(''), 2000);
    });
  }

  async function donateWithStripe(amountEur) {
    if (STRIPE_PAYMENT_LINK) {
      window.open(STRIPE_PAYMENT_LINK, '_blank', 'noopener,noreferrer');
      return;
    }

    setCardError('');
    setBusyAmount(amountEur);
    try {
      const data = await createDonateCheckout(amountEur * 100);
      if (data?.success && data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
        return;
      }
      setCardError(data?.error || t('donate.stripeFailed'));
    } finally {
      setBusyAmount(null);
    }
  }

  return (
    <section className="card donate-section" aria-labelledby="donate-heading">
      <p className="eyebrow">{t('donate.sectionEyebrow')}</p>
      <h2 id="donate-heading" className="section-title">{t('donate.sectionTitle')}</h2>
      <p className="muted">{t('donate.sectionLead')}</p>
      <p className="muted donate-note">{t('donate.note')}</p>

      {hasRevolutLink && (
        <div className="donate-card-block">
          <h3 className="subsection-title">{t('donate.revolutTitle')}</h3>
          <p className="muted">{t('donate.revolutHint')}</p>
          <a
            className="button button-primary"
            href={REVOLUT_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            {t('donate.revolutBtn')}
          </a>
        </div>
      )}

      {hasStripe && (
        <div className="donate-card-block">
          <h3 className="subsection-title">{t('donate.stripeTitle')}</h3>
          <div className="donate-amounts">
            {amountsEur.map((amount) => (
              <button
                key={amount}
                type="button"
                className="button button-primary"
                disabled={busyAmount !== null}
                onClick={() => donateWithStripe(amount)}
              >
                {busyAmount === amount ? t('donate.stripeRedirecting') : `${amount} €`}
              </button>
            ))}
          </div>
          {cardError && <p className="status-banner status-error">{cardError}</p>}
          <p className="muted donate-note">{t('donate.stripeNote')}</p>
        </div>
      )}

      {hasBank && (
        <>
          {(hasRevolutLink || hasStripe) && <h3 className="subsection-title">{t('donate.bankTitle')}</h3>}
          <dl className="donate-details">
            {RECIPIENT && (
              <div className="donate-row">
                <dt>{t('donate.recipient')}</dt>
                <dd>{RECIPIENT}</dd>
              </div>
            )}
            <div className="donate-row">
              <dt>{t('donate.iban')}</dt>
              <dd>
                <code className="donate-code">{IBAN}</code>
                <button
                  type="button"
                  className="button button-ghost button-sm"
                  onClick={() => handleCopy('iban', IBAN.replace(/\s+/g, ''))}
                >
                  {copied === 'iban' ? t('common.copied') : t('donate.copyIban')}
                </button>
              </dd>
            </div>
            <div className="donate-row">
              <dt>{t('donate.reference')}</dt>
              <dd>
                <code className="donate-code">{reference}</code>
                <button
                  type="button"
                  className="button button-ghost button-sm"
                  onClick={() => handleCopy('ref', reference)}
                >
                  {copied === 'ref' ? t('common.copied') : t('donate.copyRef')}
                </button>
              </dd>
            </div>
          </dl>
        </>
      )}
    </section>
  );
}
