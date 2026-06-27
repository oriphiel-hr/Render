import { Link } from 'react-router-dom';
import { dismissDonateForever, dismissDonatePrompt } from '../lib/donate-prompt.js';

const COPY = {
  match: {
    title: 'Čestitamo na kontaktu!',
    text: 'Ako ti Ravnopar pomaže u upoznavanju, možeš dobrovoljno podržati održavanje platforme.'
  },
  milestone: {
    title: 'Hvala što koristiš Ravnopar',
    text: 'Već neko vrijeme si s nama. Ako želiš pomoći pokrivanje servera, donacija je dobrodošla — ali nije obavezna.'
  }
};

export default function DonatePromptBanner({ reason, onDismiss }) {
  if (!reason || !COPY[reason]) return null;
  const copy = COPY[reason];

  function close() {
    dismissDonatePrompt(reason);
    onDismiss?.();
  }

  function neverAgain() {
    dismissDonateForever();
    onDismiss?.();
  }

  return (
    <section className="card donate-prompt" aria-live="polite">
      <h2 className="section-title">{copy.title}</h2>
      <p className="muted">{copy.text}</p>
      <div className="donate-prompt-actions">
        <Link className="button button-primary" to="/app/podrzi" onClick={close}>
          Podrži projekt
        </Link>
        <button type="button" className="button button-secondary" onClick={close}>
          Ne sada
        </button>
        <button type="button" className="button button-ghost" onClick={neverAgain}>
          Ne prikazuj ponovo
        </button>
      </div>
    </section>
  );
}
