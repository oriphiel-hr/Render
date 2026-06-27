import { useState } from 'react';

const IBAN = import.meta.env.VITE_DONATE_IBAN?.trim() || '';
const RECIPIENT = import.meta.env.VITE_DONATE_RECIPIENT?.trim() || '';
const REFERENCE = import.meta.env.VITE_DONATE_REFERENCE?.trim() || 'Ravnopar donacija';

function copyText(value, onDone) {
  if (!value) return;
  navigator.clipboard?.writeText(value).then(onDone).catch(() => {});
}

export default function DonateSection() {
  const [copied, setCopied] = useState('');

  if (!IBAN) return null;

  function handleCopy(field, value) {
    copyText(value, () => {
      setCopied(field);
      window.setTimeout(() => setCopied(''), 2000);
    });
  }

  return (
    <section className="card donate-section" aria-labelledby="donate-heading">
      <p className="eyebrow">Podrška projektu</p>
      <h2 id="donate-heading" className="section-title">Podrži Ravnopar</h2>
      <p className="muted">
        Ravnopar je besplatan za korištenje. Ako ti platforma znači i želiš pomoći pokrivanje
        servera i održavanja, možeš ostaviti dobrovoljnu donaciju na privatni račun.
      </p>
      <p className="muted donate-note">
        Donacija je potpuno dobrovoljna i ne daje dodatne funkcije u aplikaciji.
      </p>

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
    </section>
  );
}
