import { useEffect, useState } from 'react';
import { createDonateCheckout, getDonateStatus } from '../api/index.js';

const IBAN = import.meta.env.VITE_DONATE_IBAN?.trim() || '';
const RECIPIENT = import.meta.env.VITE_DONATE_RECIPIENT?.trim() || '';
const REFERENCE = import.meta.env.VITE_DONATE_REFERENCE?.trim() || 'Ravnopar donacija';
const STRIPE_PAYMENT_LINK = import.meta.env.VITE_DONATE_STRIPE_URL?.trim() || '';

function copyText(value, onDone) {
  if (!value) return;
  navigator.clipboard?.writeText(value).then(onDone).catch(() => {});
}

export default function DonateSection() {
  const [copied, setCopied] = useState('');
  const [cardEnabled, setCardEnabled] = useState(false);
  const [amountsEur, setAmountsEur] = useState([3, 5, 10, 20]);
  const [busyAmount, setBusyAmount] = useState(null);
  const [cardError, setCardError] = useState('');

  const hasBank = Boolean(IBAN);
  const hasCard = cardEnabled || Boolean(STRIPE_PAYMENT_LINK);

  useEffect(() => {
    async function load() {
      const data = await getDonateStatus();
      if (data?.success && data.stripeEnabled) {
        setCardEnabled(true);
        if (Array.isArray(data.amountsEur) && data.amountsEur.length > 0) {
          setAmountsEur(data.amountsEur);
        }
      }
    }
    load();
  }, []);

  if (!hasBank && !hasCard) return null;

  function handleCopy(field, value) {
    copyText(value, () => {
      setCopied(field);
      window.setTimeout(() => setCopied(''), 2000);
    });
  }

  async function donateWithCard(amountEur) {
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
      setCardError(data?.error || 'Plaćanje karticom trenutno nije dostupno.');
    } finally {
      setBusyAmount(null);
    }
  }

  return (
    <section className="card donate-section" aria-labelledby="donate-heading">
      <p className="eyebrow">Podrška projektu</p>
      <h2 id="donate-heading" className="section-title">Podrži Ravnopar</h2>
      <p className="muted">
        Ravnopar je besplatan za korištenje. Ako ti platforma znači, možeš dobrovoljno pomoći
        pokrivanje servera i održavanja — karticom ili bankovnom uplatom.
      </p>
      <p className="muted donate-note">
        Donacija je potpuno dobrovoljna i ne daje dodatne funkcije u aplikaciji.
      </p>

      {hasCard && (
        <div className="donate-card-block">
          <h3 className="subsection-title">Kartica (Visa, Mastercard…)</h3>
          <div className="donate-amounts">
            {amountsEur.map((amount) => (
              <button
                key={amount}
                type="button"
                className="button button-primary"
                disabled={busyAmount !== null}
                onClick={() => donateWithCard(amount)}
              >
                {busyAmount === amount ? 'Preusmjeravanje...' : `${amount} €`}
              </button>
            ))}
          </div>
          {cardError && <p className="status-banner status-error">{cardError}</p>}
          <p className="muted donate-note">Plaćanje obrađuje Stripe. Ne spremamo podatke o kartici.</p>
        </div>
      )}

      {hasBank && (
        <>
          {hasCard && <h3 className="subsection-title">Bankovna uplata</h3>}
          <dl className="donate-details">
            {RECIPIENT && (
              <div className="donate-row">
                <dt>Primatelj</dt>
                <dd>{RECIPIENT}</dd>
              </div>
            )}
            <div className="donate-row">
              <dt>IBAN</dt>
              <dd>
                <code className="donate-code">{IBAN}</code>
                <button
                  type="button"
                  className="button button-ghost button-sm"
                  onClick={() => handleCopy('iban', IBAN.replace(/\s+/g, ''))}
                >
                  {copied === 'iban' ? 'Kopirano' : 'Kopiraj IBAN'}
                </button>
              </dd>
            </div>
            <div className="donate-row">
              <dt>Poziv na broj / opis</dt>
              <dd>
                <code className="donate-code">{REFERENCE}</code>
                <button
                  type="button"
                  className="button button-ghost button-sm"
                  onClick={() => handleCopy('ref', REFERENCE)}
                >
                  {copied === 'ref' ? 'Kopirano' : 'Kopiraj'}
                </button>
              </dd>
            </div>
          </dl>
        </>
      )}
    </section>
  );
}
