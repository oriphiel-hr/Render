import Link from './/Link.jsx';
import { dismissDonateForever, dismissDonatePrompt } from '../lib/donate-prompt.js';
import { useI18n } from '../lib/i18n/index.jsx';

export default function DonatePromptBanner({ reason, onDismiss }) {
  const { catalog } = useI18n();
  const copy = catalog?.donatePrompt?.[reason];

  if (!reason || !copy) return null;

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
          {catalog.donatePrompt.support}
        </Link>
        <button type="button" className="button button-secondary" onClick={close}>
          {catalog.donatePrompt.notNow}
        </button>
        <button type="button" className="button button-ghost" onClick={neverAgain}>
          {catalog.donatePrompt.neverAgain}
        </button>
      </div>
    </section>
  );
}
